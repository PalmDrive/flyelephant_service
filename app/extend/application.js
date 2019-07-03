'use strict';
const Client = require('coinbase').Client;
const Gdax = require('gdax');

const ccxt = require('ccxt');
const env = require('process').env.NODE_ENV;
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

module.exports = {
  get coinbaseClient() {
    const info = this.config.walletInfo.coinbase;

    return new Client({
      apiKey: info.key,
      apiSecret: info.secret,
    });
  },

  get coinbaseproClient() {
    const info = this.config.exchangeInfo.coinbasepro;

    return new Gdax.AuthenticatedClient(info.apiKey, info.secret, info.password);
  },

  get paypalClient() {
    // const mode = 'sandbox';
    const mode = 'prod';
    const clientId = this.config.paypal[mode].clientId;
    const secret = this.config.paypal[mode].secret;

    const environment = mode === 'sandbox' ? new checkoutNodeJssdk.core.SandboxEnvironment(clientId, secret) : new checkoutNodeJssdk.core.ProductionEnvironment(clientId, secret);

    return new checkoutNodeJssdk.core.PayPalHttpClient(environment);
  },

  exchange(id) {
    const info = this.config.exchangeInfo[id];
    const options = {
      apiKey: info.apiKey,
      secret: info.secret,
      options: {
        // huobipro market buy order requires price argument to calculate cost (total amount of quote currency to spend for buying, amount * price). To switch off this warning exception and specify cost in the amount argument, set .options['createMarketBuyOrderRequiresPrice'] = false.
        createMarketBuyOrderRequiresPrice: false,
      },
    };
    if (info.password) options.password = info.password;

    // 本地没有代理的话，如huobipro, 无法访问其api接口
    if (env === 'development' || env === 'test') {
      // console.log('Using local proxy...');
      const Agent = require('https-proxy-agent');
      // 需要本地有ss client，使用1087端口（Mac上的默认配置）
      const proxy = 'http://127.0.0.1:1087';
      const agent = new Agent(proxy);
      // console.log('agent:', agent);
      options.httpsAgent = agent;
      options.httpAgent = agent;
      // options.agent = agent;
    }

    return new ccxt[id](options);
  },
};
