'use strict';
module.exports = app => {
  const ctx = app.createAnonymousContext();
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const feeRatesSchema = new Schema(
    {
      pay: {
        type: Number, // 支付手续费
        default: 0,
      },
      payout: {
        type: Number, // 分发手续费
        default: 0,
      },
      withdrawFiat: {
        type: Number, // 结算提现手续费
        default: 0,
      },
      withdrawToken: {
        type: Number, // 提币手续费
        default: 0,
      },
      trade: {
        type: Number, // 交易手续费
        default: 0,
      },
      referral: {
        type: Number, // 佣金, 他的上级所获得的，等于pay - 上一级的pay
        default: 0,
      },
      nextPay: { // 代理商下面的商家的支付手续费pay
        type: Number,
        default: 0,
      },
    }
  );

  const UserSchema = new Schema({
    phone: {
      type: String,
      index: true,
    },
    password: {
      type: String,
    },
    paymentPassword: {
      type: String,
    },
    nickname: {
      type: String,
    },
    role: { // 用户身份 0为普通用户 1为老师 100:admin, 200: OTC vendor 300: merchant 400: agent
      type: Number,
      index: true,
      default: 0,
    },
    email: {
      type: String,
      index: true,
      // unique: true,
    },
    status: { // 状态, 'Verifying' or 'Complete'
      type: String,
      index: true,
    },
    inviteNumber: { // 邀请人数
      type: Number,
      index: true,
      default: 0,
    },
    totalReward: { // 已经解锁的，实际可以用的总的奖励
      type: Number,
      default: 0,
    },
    lockedTotalReward: { // 未解锁的总的奖励
      type: Number,
      default: 0,
    },
    profilePicUrl: {
      type: String,
    },
    isSubscribedWX: {
      type: Boolean,
      default: false,
    },
    inviteCode: { // 个人邀请码
      type: String,
      index: true,
    },
    inviteId: { // 邀请人id
      type: Schema.ObjectId,
      index: true,
      ref: 'User',
    },
    tokens: { // Token 数量
      type: Number,
      default: 0,
      index: true,
    },
    description: { // 商户：公司业务介绍
      type: String,
    },
    authCode: { // 访问权限码
      type: String,
    },
    isLocked: { // 是否解锁用户。如果是vendor，true 代表当前并不工作
      type: Boolean,
      default: false,
    },
    googleAuthSecret: { // 谷歌验证密钥
      type: String,
    },
    secondAuthType: { // 0表示未绑定，1为手机验证方式，2为google验证, 3为支持全部方式
      type: Number,
      default: 0,
    },
    lateUntieTime: { // 最近解绑时间
      type: Date,
    },
    isVirtual: { // 是否为虚拟用户
      type: Boolean,
      default: false,
      index: true,
    },
    source: { // 用户来源，1为web，2为app
      type: Number,
      index: true,
    },
    firstLoginTime: { // 首次登录时间
      type: Date,
      index: true,
    },
    kycLevel: { // kyc 等级 0 代表无kyc, 1为level1审核中, 2为已认证level1, 3为level2审核中, 4为已认证level2
      type: Number,
      default: 0,
    },
    lang: {
      type: String, // 'zh', 'en'
      default: 'en',
    },
    appVersion: {
      type: String,
      index: true,
    },
    appPlatform: { // android, ios-china, ios-oversea
      type: String,
      index: true,
    },
  }, {
    timestamps: true,
  });

  UserSchema.virtual('isAdmin')
    .get(function() {
      return this.role === 100;
    });

  UserSchema.virtual('isMerchant')
    .get(function() {
      return this.role === 300;
    });

  UserSchema.virtual('isAgent')
    .get(function() {
      return this.role === 400;
    });

  UserSchema.virtual('hasPaymentPassword')
    .get(function() {
      return this.paymentPassword !== null && typeof this.paymentPassword !== 'undefined';
    });

  // UserSchema.pre('validate', function(next) {
  //   if (!this.inviteCode) this.inviteCode = ctx.service.user.createInviteCode();
  //
  //   next();
  // });

  UserSchema.pre('validate', async function() {
    if (!this.inviteCode) this.inviteCode = await ctx.service.user.createInviteCode();
  });

  UserSchema.methods.createApiKey = async function() {
    return await mongoose.model('ApiKey').create({
      userId: this._id,
      status: 'active',
    });
  };

  UserSchema.methods.getAssets = async function(currency) {
    const filter = {
      userId: this._id,
    };
    if (currency) filter.currency = currency;

    return await mongoose.model('Asset').find(filter);
  };

  // Not used
  UserSchema.methods.getBalances = async function(currency) {
    const filter = {
      userId: this._id,
    };
    if (currency) filter.currency = currency;

    return await mongoose.model('Balance').find(filter);
  };

  // Not used
  UserSchema.methods.getBalance = async function(currency) {
    const data = await this.getBalances(currency);
    return data[0];
  };

  // Not used
  UserSchema.methods.initBalance = async function(currency = 'USD') {
    await mongoose.model('Balance').create({
      userId: this._id,
      currency,
    });
  };

  UserSchema.methods.getFeeRate = function(feeName, paymentType) {
    const config = app.config.feeRates;
    const feeRateFromConfig = config[feeName] || 0;
    let feeRate = this.feeRates ? this.feeRates[feeName] : 0;

    if (feeRate === null || typeof feeRate === 'undefined') {
      feeRate = feeRateFromConfig;
    }

    if (paymentType === 'card') {
      feeRate = config.depositFiatWithNonUSCard;
    }

    return feeRate;
  };

  // UserSchema.index({ inviteNumber: 1, createdAt: 1 });

  return mongoose.model('User', UserSchema);
};
