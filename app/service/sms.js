'use strict';

const Service = require('egg').Service;

class SmsService extends Service {
  async send(mobile, text) {
    const ctx = this.ctx;
    const url = 'https://sms.yunpian.com/v2/sms/single_send.json';
    const data = {
      apikey: ctx.app.config.sendYunpianSmsInfo.apiKey,
      mobile,
      text,
    };
    const result = await ctx.curl(url, {
      method: 'POST',
      data,
      dataType: 'json',
    });
    return result;
  }
}
module.exports = SmsService;
