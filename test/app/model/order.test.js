'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/model/trade', () => {
  let ctx;
  let user;
  let orderFixtures;

  before(async () => {
    ctx = app.mockContext();
    await ctx.model.Asset.deleteMany({});

    const userFixtures = require('../../fixtures/app/model/User')(ctx);
    orderFixtures = require('../../fixtures/app/model/Order')(ctx);
    user = await userFixtures.create();

    // Create asset
    await ctx.model.Asset.create({
      userId: user._id,
      currency: 'BTC',
      available: 20,
    });
    await ctx.model.Asset.create({
      userId: user._id,
      currency: 'USDT',
      available: 0,
    });
  });

  after(async () => {
    await ctx.model.User.deleteMany({});
    await ctx.model.Asset.deleteMany({});
    await ctx.model.AssetTransaction.deleteMany({});
    await ctx.model.Order.deleteMany({});
    await app.redis.get('master').flushdb();
  });

  it('save order in cache after order creation', async () => {
    const order1 = await orderFixtures.create(user);
    await ctx.service.common.setDelay(250);
    const order2 = await ctx.service.cache.findOrderById(order1.id);

    assert.equal(order1.id, order2.id);
  });

  it('updates order in cache after order changes', async () => {
    const order1 = await orderFixtures.create(user);
    const pledgeAmount = order1.pledgeAmount;
    order1.pledgeAmount = pledgeAmount / 2;
    await order1.save();

    await ctx.service.common.setDelay(250);

    const order2 = await ctx.service.cache.findOrderById(order1.id);
    assert.equal(order2.pledgeAmount, pledgeAmount / 2);
  });

  it('order that margin closeout is not cached', async () => {
    const order1 = await orderFixtures.create(user);
    const now = new Date();
    order1.marginCloseoutAt = now;
    order1.marginCloseout = true;
    await order1.save();

    await ctx.service.common.setDelay(250);

    const order2 = await ctx.service.cache.findOrderById(order1.id);
    assert.equal(order2, null);
  });
});
