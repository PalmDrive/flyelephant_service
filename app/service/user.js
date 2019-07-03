'use strict';
// 用户相关通用业务逻辑service
const Service = require('egg').Service;
class UserService extends Service {
  // 校验验证码
  async verifyCode(code, identifier, type = 'signup') {
    const ctx = this.ctx;
    const phoneCodePrefix = ctx.app.config.phoneCodePrefix;
    const key = `${phoneCodePrefix}${identifier}_${type}`;
    const cachedCode = await ctx.service.redis.get(key);

    return code === String(cachedCode);
  }

  async clearVerificationCode(identifier, type = 'signup') {
    const phoneCodePrefix = this.ctx.app.config.phoneCodePrefix;
    const key = `${phoneCodePrefix}${identifier}_${type}`;

    return await this.app.redis.get('master').del(key);
  }

  async authWithSecretKey(secret) {
    const ctx = this.ctx;
    const key = await ctx.model.ApiKey.findOne({
      secret,
    });

    if (!key) {
      return null;
    }

    key.lastUsedAt = new Date();
    key.save();

    const user = await ctx.model.User.findById(key.userId);
    if (user) user.apiKeyId = key._id;

    return user;
  }

  // 生成6位新邀请码
  async createInviteCode(inviteCodeBasePrefix) {
    if (!inviteCodeBasePrefix) inviteCodeBasePrefix = this.app.config.inviteCodeBasePrefix;
    const ctx = this.ctx;
    const inviteCodeBase = await ctx.app.redis.get('master').get(inviteCodeBasePrefix);
    if (!inviteCodeBase) {
      await ctx.app.redis.get('master').set(inviteCodeBasePrefix, 100);
    }
    const preInviteCode = await ctx.app.redis.get('master').incr(inviteCodeBasePrefix);
    return String(preInviteCode) + String(ctx._.random(100, 999));
  }

  // DO 获取某一个人的token
  async getPersonTotalTokens(userid) {
    const result = await this.ctx.connector.user.searchOneByFilter({
      _id: userid,
    });
    if (!result) {
      throw '暂无此用户';
    }
    return result.tokens || 0;
  }

  // 检查用户是否登录
  async checkUserLoginState() {
    const ctx = this.ctx;
    const error = new Error();
    error.message = { code: 1004, message: 'Forbidden' };
    const user = ctx.state.user;
    if (!user || !user._id) {
      throw error;
    }

    if (user.secondAuthType && ctx.state.user.authGrade < 2) {
      throw error;
    }
    return user;
  }

  // 根据userId 查找对应的推荐人Id
  async searchInviteUserByUserId(userId) {
    const ctx = this.ctx;
    const user = await ctx.connector.user.searchOneByFilter({
      _id: userId,
    });
    if (user && user.inviteId) {
      return await ctx.connector.user.searchOneByFilter({
        _id: user.inviteId,
      });
    }
    return null;
  }

  // 获取用户JWT
  getJwtToken(user, authGrade, isRestricted = false) {
    const ctx = this.ctx;
    let expires = '15d';
    if (isRestricted) {
      expires = '30m';
    }
    if (!user._id) {
      return null;
    }
    const data = {
      _id: user._id,
      isAdmin: user.isAdmin,
      isRestricted,
    };

    if (user.authCode) {
      data.authCode = user.authCode;
    } else {
      data.authCode = ctx.app.config.commonAuthCode;
    }
    if (authGrade !== null && typeof authCode !== 'undefined') {
      data.authGrade = authGrade;
    }
    return ctx.app.jwt.sign(data, ctx.app.config.jwt.secret, { expiresIn: expires });
  }

  // 验证google auth code
  verifyGoogleCode(user, code) {
    const ctx = this.ctx;
    const speakeasy = ctx.speakeasy;
    const secret = user.googleAuthSecret;
    if (!secret) {
      return false;
    }
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
    });
  }
  // 判断用户是否进行一次登录验证
  checkOneAuth() {
    const ctx = this.ctx;
    const error = new Error();
    error.message = { code: 1004, message: 'Forbidden' };
    if (!ctx.state.user || !ctx.state.user._id || !ctx.state.user.authGrade || ctx.state.user.authGrade < 1) {
      throw error;
    }
  }
  // 二次验证
  async secondCheck(user, type, phoneCode, googleCode, bindPhone) { // type: 1为绑定手机号，2为解绑手机号，3为绑定谷歌， 4为解绑谷歌
    const ctx = this.ctx;
    const secondAuthType = user.secondAuthType;
    const phoneTypes = [ 'bindPhone', 'untiePhone', 'bindGoogleAuth', 'untieGoogleAuth' ];
    if (((type === 1 || type === 2) && !phoneCode) || ((type === 3 || type === 4) && !googleCode)) {
      return false;
    }
    const authPhoneCode = async () => {
      const phone = user.phone || bindPhone;
      const phoneCodePrefix = ctx.app.config.phoneCodePrefix;
      const key = `${phoneCodePrefix}${phone}_${phoneTypes[type - 1]}`;
      const rightPhoneCode = String(await ctx.app.redis.get('master').get(key));
      await ctx.app.redis.get('master').del(key);
      return rightPhoneCode === phoneCode;
    };

    if ((type === 1 || type === 2) && (secondAuthType !== 2 && secondAuthType !== 3)) { // 只有手机号验证
      return await authPhoneCode();
    }
    if ((type === 3 || type === 4) && (secondAuthType !== 1 && secondAuthType !== 3)) { // 只有google验证
      return this.verifyGoogleCode(user, googleCode);
    }
    const phoneCodeAuthResult = await authPhoneCode();
    const googleAuthResult = this.verifyGoogleCode(user, googleCode);
    return phoneCodeAuthResult && googleAuthResult;
  }

  // 获取用户ip
  getClientIp(ctx) {
    const req = ctx.req;
    return req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress;
  }
  // 添加ip记录
  async saveIpRecord(user, type, ctx) {
    const ip = this.getClientIp(ctx);
    let ua = null;
    if (ctx.req.headers) {
      ua = ctx.req.headers['user-agent'];
    }
    const ipData = {
      userId: user._id,
      address: ip,
      type,
    };
    if (ua) {
      ipData.ua = ua;
    }
    await ctx.model.IpRecord.create(ipData);
  }

  async restfulCheckUserState() {
    const ctx = this.ctx;
    if (!ctx.state.user || !ctx.state.user._id) {
      return { code: 1004, message: 'Forbidden', data: {} };
    }
    const userId = ctx.state.user._id;
    const user = await ctx.connector.user.searchOneByFilter({ _id: userId });
    if (user.secondAuthType && ctx.state.user.authGrade < 2) {
      return { code: 1004, message: 'Forbidden', data: {} };
    }
    return { code: 0, user };
  }

  encryptPasswd(password) {
    const md5 = this.ctx.crypto.createHash('md5');
    const newPasswd = md5.update(password).digest('hex');
    return newPasswd;
  }

  verifyPaymentPassword(user, pw) {
    const encrypted = this.encryptPasswd(pw);
    return user.paymentPassword === encrypted;
  }

  /**
   * create user
   * create apiKey
   *
   * @param {Dict} data user data
   * @param {Dict} options { apiKey<boolean>, inviteCode<String> }
   * @return {Doc} user Mongoose db user doc
   */
  async signup(data, options = {}) {
    const ctx = this.ctx;
    const opts = {
      apiKey: data.role === 300, // 商户创建apiKey
    };
    Object.assign(opts, options);
    data.password = ctx.service.user.encryptPasswd(data.password);
    data.status = 'Complete';

    if (opts.inviteCode) {
      const referrer = await ctx.model.User.findOne({
        inviteCode: opts.inviteCode,
      });
      if (referrer) {
        data.inviteId = referrer._id;

        if (referrer.isAgent && referrer.feeRates) {
          data.feeRates = {
            pay: referrer.feeRates.nextPay,
            referral: referrer.feeRates.nextPay - referrer.feeRates.pay,
            // nexPay
          };
        }
      } else {
        ctx.logger.error('%s is invalid.', opts.inviteCode);
      }
    }

    const user = await ctx.model.User.create(data);

    if (opts.apiKey) {
      await user.createApiKey();
    }

    return user;
  }

  async totalLendAmount(user) {
    const filter = {
      userId: user._id,
      type: 'lendOrder',
      repaymentAt: null,
      marginCloseout: false,
    };
    const res = await this.ctx.model.Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: '$lendAmount' },
        },
      },
    ]);
    return res.length > 0 ? res[0].total : 0;
  }

  // Deposit to the wallet
  async deposit(user, amount, currency, status = 'pending') {
    const ctx = this.ctx;
    const tx = await ctx.service.assetTransaction.updateAssetsOnDeposit(user, amount, currency, status);
  }
}
module.exports = UserService;
