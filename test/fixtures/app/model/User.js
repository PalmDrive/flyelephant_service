'use strict';

const crypto = require('crypto');

const randomStr = () => crypto.randomBytes(20).toString('hex');

module.exports = ctx => {
  const User = ctx.model.User;

  const create = async (options = {}) => {
    const data = {
      email: `${randomStr()}@gmail.com`,
      authCode: randomStr(),
      inviteCode: randomStr(),
    };
    Object.assign(data, options);
    return await User.create(data);
  };

  const createBalance = async (userId, options) => {
    const data = {
      userId,
      currency: 'USD',
      available: 100,
      pending: 0,
    };
    Object.assign(data, options);
    return await ctx.model.Balance.create(data);
  };

  return {
    create,
    createBalance,
  };
};
