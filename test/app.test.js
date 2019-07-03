'use strict';

const { app, mock, assert } = require('egg-mock/bootstrap');

describe('test/app', () => {
  let ctx;
  let user;
  let key;
  let trade;
  let tradeFixtures;

  before(async () => {
    ctx = app.mockContext();

    await ctx.model.User.deleteMany({});
    await ctx.model.ApiKey.deleteMany({});
    const userFixtures = require('./fixtures/app/model/User')(ctx);
    tradeFixtures = require('./fixtures/app/model/Trade')(ctx);

    user = await userFixtures.create();
    key = await user.createApiKey();
  });

  beforeEach(async () => {
    await ctx.model.QbitPayEvent.deleteMany({});
    await ctx.model.Trade.deleteMany({});
    trade = await tradeFixtures.create(user, {
      externalOrderId: 'aaa',
      status: 'buyerPaid',
      apiKeyId: key._id,
    });
  });

  afterEach(async () => {
    await ctx.model.Balance.deleteMany({});
    await ctx.model.BalanceTransaction.deleteMany({});
  });

  it('listen to qbitPayEvent and ping up to 5 times until getting 200 response', async () => {
    trade.cbUrl = 'https://matrix-content-s.ailingual.cn/qbitpay/fake-notifications';
    await trade.setSellerConfirmed();

    await ctx.service.common.setDelay(10000);
    const count = await ctx.model.QbitPayEvent.count();
    assert.equal(count, 5);
  });

  it('liten to qbitPayEvent and stop ping when getting 200 response', async () => {
    let count = await ctx.model.QbitPayEvent.count();
    assert.equal(count, 0);

    trade.cbUrl = 'https://matrix-content-s.ailingual.cn/qbitpay/notifications';
    await trade.setSellerConfirmed();

    await ctx.service.common.setDelay(10000);
    count = await ctx.model.QbitPayEvent.count();
    assert.equal(count, 1);
  });
});
