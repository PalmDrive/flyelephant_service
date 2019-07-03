/**
 * Created by Gec on 2018/9/30.
 */
/**
 * Created by Gec on 2018/9/3.
 */
'use strict';
const Controller = require('egg').Controller;

class AdminController extends Controller {
  async auth() {
    const ctx = this.ctx;
    const username = ctx.request.body.username;
    const password = ctx.request.body.password;
    if (username === 'admin' && password === '123456') {
      ctx.body = JSON.stringify({ accessToken: ctx.app.jwt.sign({ authCode: 'admin' }, ctx.app.config.jwt.secret, { expiresIn: '30d' }) });
    } else {
      const error = new Error();
      error.message = { code: 1008, message: 'password' };
      throw error;
    }
  }
}

module.exports = AdminController;
