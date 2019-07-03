'use strict';

const { app, mock, assert } = require('egg-mock/bootstrap');

describe('test/app/graphql/trade', () => {
  let ctx;
  let user;
  let key;
  let jwt;
  let trade;

  before(async () => {
    ctx = app.mockContext();

    await ctx.model.User.deleteMany({});
    await ctx.model.Trade.deleteMany({});
    await ctx.model.QbitPayEvent.deleteMany({});
    await ctx.model.Asset.deleteMany({});
    await ctx.model.ApiKey.deleteMany({});

    const userFixtures = require('../../fixtures/app/model/User')(ctx);
    const tradeFixtures = require('../../fixtures/app/model/Trade')(ctx);

    user = await userFixtures.create();
    key = await user.createApiKey();
    trade = await tradeFixtures.create(user, {
      externalOrderId: 'aaa',
      autoHedge: true,
      apiKeyId: key._id,
    });
    jwt = ctx.service.user.getJwtToken(user);
  });

  afterEach(async () => {
    await ctx.model.HedgeAction.deleteMany({});
  });

  it('should update trade status, send event notification', async () => {
  // it('should update trade status, send event notification and create hedgeAction automatically', async () => {
    const status = 'sellerConfirmed';

    const payload = {
      operationName: null,
      query: `
        mutation m($data: JSON) {
          updateTrade(data: $data) { code, message }
        }
      `,
      variables: {
        data: {
          _id: trade.id,
          status,
        },
      },
    };

    const resp = await app.httpRequest()
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send(payload);

    const data = resp.body.data;

    // console.log('resp:', data);

    assert.equal(data.updateTrade.message, 'success');

    await ctx.service.common.setDelay(1500);

    trade = await ctx.model.Trade.findById(trade.id);
    const event = await ctx.model.QbitPayEvent.findOne();
    // let asset = await ctx.model.Asset.findOne({
    //   userId: user._id,
    //   currency: trade.currency,
    //   exchange: trade.exchange,
    // });
    // assert.equal(asset.total, trade.amount);
    assert.equal(event.type, 'charge.succeeded');
    assert.equal(event.pendingWebhooks, 0);

    // console.log('event data:', event.data);

    assert.equal(event.data.id, trade.id);
    assert.equal(event.data.paid, true);

    assert.equal(trade.status, 'closed');

    // await ctx.service.common.setDelay(8500);

    // Asset reduced to 0 when HedgeAction is created
    // asset = await ctx.model.Asset.findOne({
    //   userId: user._id,
    //   currency: trade.currency,
    //   exchange: trade.exchange,
    // });
    //
    // assert.equal(asset.total, 0);
    //
    // const ha = await ctx.model.HedgeAction.findOne({
    //   tradeId: trade._id,
    // });
    // // console.log('hedge action:', ha.toJSON());
    // assert.notEqual(ha.depositAddr, null);
    // assert.notEqual(ha.initialPrice, null);
  });
});
