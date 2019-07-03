'use strict';

const products = [
  {
    type: 'loan',
    dailyInterest: 0.1,
    marginCallPosition: 85,
    marginCloseoutPosition: 90,
    maxPledgeRate: 75,
    fee: 0,
    feeRate: 0.1, // apply wehn repaying
    period: 15,
    repayment: '随时还款',
  },
];

const Service = require('egg').Service;
class ProductService extends Service {
  find(filter) {
    return this.ctx._.where(products, filter);
  }
}
module.exports = ProductService;
