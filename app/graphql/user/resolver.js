'use strict';
const mailCodePrefix = 'BKS_AUTHCODE_';

module.exports = {
  Query: {
    // 用户信息查询
    async users(root, { filter, order, page }, ctx) {
      const model = ctx.model.User;
      order = Object.assign({ createdAt: -1 }, order);
      page = Object.assign({ num: 1, size: 10 }, page);
      const user = ctx.state.user;
      // await ctx.service.user.checkUserLoginState();
      filter = filter || {};
      if (!user.isAdmin && !user.isAgent) filter._id = user._id;

      if (filter.inviteId) {
        if (user.isAgent || user.isAdmin) {
          filter.inviteId = ctx.app.mongoose.Types.ObjectId(filter.inviteId);
        } else {
          throw new Error('Forbidden');
        }
      }

      // filter._id = admin.id;

      return await model.find(filter)
        .sort(order)
        .skip((page.num - 1) * page.size)
        .limit(page.size);
    },
  },
  Mutation: {
    async user(root, { data }, ctx) {
      const whitelist = [
        'lastOpenedAt',
        'jpushRegistrationId',
        'lang',
        'appVersion',
        'profilePicUrl',
        'nickname',
        'phone',
        'email',
        'description',
      ];
      const user = await ctx.state.user;
      ctx._.omit(data, (val, key) => whitelist.indexOf(key) === -1);

      if (data.lastOpenedAt === 'string' || data.lastOpenedAt === 'number') {
        data.lastOpenedAt = new Date(data.lastOpenedAt);
      }

      if (data.paymentPassword) {
        data.paymentPassword = ctx.service.user.encryptPasswd(data.paymentPassword);
      }

      Object.assign(user, data);

      await user.save();

      return user;
    },

    // 登录
    async login(root, { identifier, password, identifierType }, ctx) {
      const error = new Error();
      const filter = {
        [identifierType]: identifier,
      };
      const existUser = await ctx.connector.user.searchOneByFilter(filter);

      const encryptPassword = ctx.service.user.encryptPasswd(password);

      if (encryptPassword !== existUser.password) {
        error.status = 400;
        error.message = '密码错误';
        throw error;
      }
      return existUser;
    },

    // 发送验证码
    async sendsms(root, { phone, type }, ctx) {
      const phoneCodeType = ctx.app.config.phoneCodeType;
      const phoneCodePrefix = ctx.app.config.phoneCodePrefix;
      if (!phone) {
        return { code: 1016, message: 'phone number is missing' };
      }

      if (!ctx._.contains([ phoneCodeType.bindPhone, phoneCodeType.loginAuth, phoneCodeType.updatePassword, phoneCodeType.bindGoogleAuth, phoneCodeType.untiePhone, phoneCodeType.untieGoogleAuth, phoneCodeType.signup, phoneCodeType.forgetPassword ], type)) {
        return { code: 1001, message: 'params wrong' };
      }

      const key = `${phoneCodePrefix}${phone}_${type}`;
      const expireTime = 5 * 60;
      let phoneCode = '';
      for (let i = 0; i < 6; i++) {
        phoneCode += Math.floor(Math.random() * 10);
      }
      ctx.logger.info('key: %s, code: %s', key, phoneCode);
      await ctx.service.redis.set(key, phoneCode, 'EX', expireTime);
      return await ctx.service.common.sendSmsByYunpian(phone, phoneCode, 'signup');
    },

    // 注册
    async signup(root, { code, inviteCode, password, identifier, identifierType = 'phone', source, lang = 'en' }, ctx) {
      const data = {};
      const err = new Error();
      data[identifierType] = identifier;

      const isValidCode = await ctx.service.user.verifyCode(code, identifier, 'signup');

      if (!isValidCode) {
        err.status = 400;
        err.message = '验证码错误';
        throw err;
      }

      ctx.service.user.clearVerificationCode(identifier, 'signup');

      let user = await ctx.model.User.findOne(data);
      if (user) {
        err.status = 400;
        err.message = `${data[identifierType]}已被使用`;
        throw err;
      }

      data.password = password;
      data.source = source;
      data.lang = lang;

      const options = {};
      if (inviteCode) {
        options.inviteCode = inviteCode;
      }

      user = await ctx.service.user.signup(data, options);

      ctx.service.user.saveIpRecord(user, 1, ctx);

      // Create assets
      ctx.model.Asset.create({
        currency: 'BTC', userId: user._id,
      });
      ctx.model.Asset.create({
        currency: 'USDT', userId: user._id,
      });

      return user;
    },

    // 忘记密码
    async forgetPassword(root, { newPassword, code, identifier, identifierType = 'phone' }, ctx) {
      const phoneCodeType = ctx.app.config.phoneCodeType;
      const type = phoneCodeType.forgetPassword;
      const err = new Error();
      const isValidCode = await ctx.service.user.verifyCode(code, identifier, type);

      if (!isValidCode) {
        err.status = 400;
        err.message = '验证码错误';
        throw err;
      }
      ctx.service.user.clearVerificationCode(identifier, type);

      const filter = {
        [identifierType]: identifier,
      };
      const existUser = await ctx.connector.user.searchOneByFilter(filter);
      if (!existUser) {
        err.status = 400;
        err.message = `${identifierType}错误`;
        throw err;
      }

      existUser.password = ctx.service.user.encryptPasswd(newPassword);
      await existUser.save();

      return {
        code: 0,
        message: '密码修改成功',
      };
    },

    // 更换手机号
    async updatephone(root, { phone, newPhone, phoneCode }, ctx) {
      const userId = ctx.state.user._id;
      const phoneCodeType = ctx.app.config.phoneCodeType;
      const phoneCodePrefix = ctx.app.config.phoneCodePrefix;
      const existUser = await ctx.connector.user.searchOneByFilter({ phone: newPhone });
      if (existUser) {
        return { code: 1007, message: 'phone wrong' };
      }
      const key = `${phoneCodePrefix}${newPhone}_${phoneCodeType.updatePhone}`;
      const rightPhoneCode = String(await ctx.app.redis.get('master').get(key));
      if (rightPhoneCode !== phoneCode) {
        return { code: 1002, message: 'code wrong' };
      }
      const user = await ctx.connector.user.searchOneByFilter({ _id: userId });
      if (!user) {
        return { code: 1001, message: 'params wrong' };
      }
      console.log(`user updatePhone: userId: ${userId} and oldPhone: ${user.phone} and newPhone: ${newPhone}`);
      user.phone = newPhone;
      await user.save();
      // 删除验证码记录
      await ctx.app.redis.get('master').del(key);
      return {
        code: 0,
        message: 'success',
      };
    },

    // 修改密码
    async updatePassword(root, { password, newPassword }, ctx) {
      const existUser = await ctx.service.user.checkUserLoginState();
      if (!existUser) {
        return { code: 1001, message: 'params wrong' };
      }
      if (existUser.password !== ctx.service.user.encryptPasswd(password)) {
        return { code: 1008, message: 'password wrong' };
      }
      existUser.password = ctx.service.user.encryptPasswd(newPassword);
      await existUser.save();
      return {
        code: 0,
        message: 'success',
      };
    },

    // 绑定手机号
    async bindPhone(root, { phone, phoneCode, googleAuthCode, password }, ctx) {
      const error = new Error();
      const existUser = await ctx.service.user.checkUserLoginState();
      if (!existUser) {
        error.message = { code: 1001, message: 'params wrong' };
        throw error;
      }
      if (existUser.phone) {
        error.message = { code: 1007, message: 'already exist phone' };
        throw error;
      }
      const checkResult = await ctx.service.user.secondCheck(existUser, 1, phoneCode, googleAuthCode, phone);
      if (!checkResult) {
        error.message = { code: 1002, message: 'code wrong' };
        throw error;
      }
      if (ctx.service.user.encryptPasswd(password) !== existUser.password) {
        error.message = { code: 1008, message: 'password wrong' };
        throw error;
      }
      existUser.phone = phone;
      existUser.secondAuthType = existUser.secondAuthType === 2 ? 3 : 1;
      await existUser.save();
      return existUser;
    },

    // 解绑手机号
    async untiePhone(root, { phoneCode, googleAuthCode, password }, ctx) {
      const error = new Error();
      const user = await ctx.service.user.checkUserLoginState();
      if (!user || (user.secondAuthType !== 1 && user.secondAuthType !== 3)) {
        error.message = { code: 1001, message: 'params wrong' };
        throw error;
      }
      const checkResult = await ctx.service.user.secondCheck(user, 2, phoneCode, googleAuthCode);
      if (!checkResult) {
        error.message = { code: 1002, message: 'code wrong' };
        throw error;
      }
      if (ctx.service.user.encryptPasswd(password) !== user.password) {
        error.message = { code: 1008, message: 'password wrong' };
        throw error;
      }
      user.phone = '';
      user.secondAuthType = user.secondAuthType === 1 ? 0 : 2;
      user.lateUntieTime = new Date();
      await user.save();
      return user;
    },

    // 发送验证码到邮箱
    async sendCodeToMail(root, { email, type }, ctx) {
      email = email.toLowerCase();
      if (!ctx.service.mail.checkMailVaild(email)) {
        return { code: 1019, message: 'email wrong' };
      }
      const phoneCodeType = ctx.app.config.phoneCodeType;
      if (!ctx._.contains([ phoneCodeType.signup, phoneCodeType.forgetPassword ], type)) {
        return { code: 1001, message: 'params wrong' };
      }
      if (ctx._.contains([ phoneCodeType.forgetPassword ], type)) {
        const existUser = await ctx.connector.user.searchOneByFilter({ email, isLocked: false });
        if (!existUser) {
          return { code: 1017, message: 'email wrong' };
        }
      }
      const key = `${mailCodePrefix}${email}_${type}`;
      const expireTime = 30 * 60;
      const activeCode = ctx.service.mail.createActiveCode();
      if (type === phoneCodeType.signup) {
        await ctx.service.mail.sendSignupAuthMail(email, activeCode);
      } else {
        await ctx.service.mail.sendResetPasswordMail(email, activeCode);
      }
      await ctx.app.redis.get('master').set(key, activeCode, 'EX', expireTime);
      return { code: 0, message: 'success' };
    },

    // 校验验证码
    async verifyCode(root, { code, identifier, type }, ctx) {
      const isValid = await ctx.service.user.verifyCode(code, identifier, type);
      const res = { code: 0 };
      if (isValid) res.code = 1;

      return res;
    },

    // 退出
    async logout(root, args, ctx) {
      const user = await ctx.service.user.checkUserLoginState();
      if (user && user.authCode) {
        return ctx.app.jwt.sign({ authCode: user.authCode }, ctx.app.config.jwt.secret);
      }
      return null;
    },
  },

  User: {
    async accessToken(user, args, ctx) {
      const type = user.secondAuthType === 0 ? 1 : 2;
      return ctx.service.user.getJwtToken(user, type);
    },
  },
};
