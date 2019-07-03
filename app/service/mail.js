'use strict';

/**
 * Created by Gec on 2018/9/11.
 */
const Service = require('egg').Service;
const composeEmail = require('../../emails/composeEmail');

class MailService extends Service {
  init() {
    const ctx = this.ctx;
    const mailer = ctx.nodemailer;
    const mailInfo = ctx.app.config.mailInfo;
    return mailer.createTransport({
      host: mailInfo.host,
      secure: true, // use SSL
      port: mailInfo.port,
      auth: {
        user: mailInfo.authUser,
        pass: mailInfo.password,
      },
    });
  }
  async sendMail(address, title, content, opts = {}, forced = false) {
    const transporter = this.init();
    const ctx = this.ctx;
    const mailInfo = ctx.app.config.mailInfo;
    const options = {
      from: mailInfo.from,
      to: address,
      subject: title,
      html: content,
    };
    Object.assign(options, opts);

    if (ctx.app.config.env === 'unittest' && !forced) {
      console.log(`Mock sent email: ${address} success`);
      return;
    }

    transporter.sendMail(options, (err, info) => {
      if (err) {
        ctx.logger.error(`sendMail error: ${err}`);
        ctx.logger.error(`address: ${address}`);
        return;
      }
      ctx.logger.info(`Sent email: ${address} success`);
    });
  }

  async sendPayoutRequestNotification(payout, user, card) {
    const ctx = this.ctx;
    const email = user.email;
    const adminEmail = ctx.app.config.adminEmail;
    const title = '您的提现请求正在被处理';
    const content = `
    我们正在处理您的提现请求，将${payout.amount} ${payout.currency}转账到银行账户${card.nickname}。\n\n
    交易号: ${payout.id} \n\n
    若您未发起过此请求，请立刻联系我们。
    `;

    const contentForAdmin = `
      ${user.companyName || user.nickname}, ${user.email} request withdraw ${payout.amount} ${payout.currency} to: \n
      ${JSON.stringify(card.toJSON())} \n
      payout id: ${payout.id}, status: ${payout.status}
    `;
    await ctx.service.mail.sendMail(adminEmail, title, contentForAdmin);

    if (!payout.tradeId) {
      await ctx.service.mail.sendMail(email, title, content, {
        bcc: adminEmail,
      });
    }
  }

  async sendPaymentSmsMatchNotification(trades, txAmount) {
    const ctx = this.ctx;
    const count = trades.length;
    const admin = ctx.app.config.adminEmail;
    const email = `
      txAmount: ${txAmount},
      ${trades.map(t => {
        return JSON.stringify({
          id: t.id,
          createdAt: t.createdAt.toString(),
          totalCost: t.totalCost,
          symbol: t.symbol,
          status: t.status,
        });
      })}
    `;
    await ctx.service.mail.sendMail(admin, `[Qbit Pay]支付短信确认: 匹配到了${count}订单`, email);
  }

  async sendOtcTradeNotification(trade) {
    const host = 'https://insurance.blockscape.co';
    const status = trade.status;
    const admin = [ this.ctx.app.config.adminEmail ];
    const admin2 = 'yurousong0404@gmail.com';
    const user = await this.ctx.model.User.findById(trade.userId);
    let content;

    const base = trade.currency;
    const quote = trade.symbol.replace(`${base}/`, '');

    if (status === 'buyerPaid') { // 买家确认付款
      content = `用户${user.email} ${trade.payerName}已确认为订单${trade._id}付款${trade.totalCost} ${quote}, 购买${trade.amount} ${base}。请尽快确认。\n${trade.amount} + 0.0005 = ${trade.amount + 0.0005}\n${host}/?zh#/admin/trades/edit?id=${trade.id}`;
      if (quote === 'PHP') admin.push(admin2);
      await this.sendMail(admin, '[OTC Express]买家确认付款', content);
    } else if (status === 'sellerConfirmed') { // 商家确认收到款，放币
      content = `商家已确认收到您的订单${trade._id}付款。 系统已自动将您所购买的${trade.amount} ${base}转到您的账户，预计15分钟内到账，请注意查收。`;
      if (trade.amount >= 100) {
        await this.sendMail(user.email, '[OTC Express]商家确认收到付款', content, {
          bcc: admin,
        });
      }
    } else if (status === 'closed') { // 币到账
      content = `您所购买的${trade.amount} ${base}已转到您的账户并成功到账，请注意查收。`;
      await this.sendMail(user.email, '[OTC Express]BTC已到账', content, {
        bcc: admin,
      });
    }
  }

  /*
  *  发送邮箱验证邮件
  * */
  async sendSignupAuthMail(email, code) {
    const title = '[Qbit Invest] Security Verification';
    const content = this.getHtml(email, code).registerHtml;
    await this.sendMail(email, title, content);
  }

  // 发送邮箱活动邮件 type=1 为用户输入邮箱的验证, 2为注册成功的欢迎邮件，3为收到邀请人注册邮件
  async sendCampaignMail(address, type, options = {}) {
    const lang = options.lang || 'en';
    let email;
    let url;

    if (type === 1) {
      url = `https://www.qbitinvest.co/#/sign-up?email=${address}&code=${options.code}&accessToken=${options.accessToken}`;
      if (options.inviteCode) {
        url += `&inviteCode=${options.inviteCode}`;
      }
      email = composeEmail('trialFundEmailVerification', {
        url,
      }, lang);
      // content = this.getHtml(email, null, { url, concatUsUrl }).sendCampaignHtml;
    } else if (type === 2) {
      url = `https://www.qbitinvest.co/#/?code=${options.inviteCode}`;
      const homePageUrl = 'https://www.qbitinvest.co/#/trial-funds/user';
      email = composeEmail('welcome', {
        url, homePageUrl, money: options.money,
      }, lang);
      // content = this.getHtml(email, null, { url, homePageUrl, money: options.money, rank: options.rank }).welcomeHtml;
    } else {
      url = 'https://www.qbitinvest.co/#/trial-funds/user';
      email = composeEmail('friendSignUpSuccess', { email: options.email, total: options.total, url }, lang);
      // content = this.getHtml(email, null, { email: options.email, total: options.total, url }).friendSignUpSuccessHtml;
    }
    await this.sendMail(address, email.title, email.content);
  }
  // 发送重置密码邮件
  async sendResetPasswordMail(email, code) {
    const title = '[Qbit] Password Reset';
    const content = this.getHtml(email, code).resetPasswordHtml;
    await this.sendMail(email, title, content);
  }
  // 发送通知用户成为内测用户
  async sendAuthCodeMail(email, authCode) {
    const title = '[Qbit Invest]Congratulations on being Qbit Invest beta user!';
    const content = this.getHtml(email, authCode).sendAuthCodeHtml;
    await this.sendMail(email, title, content);
  }
  // 发送首次登录邮件
  async sendFirstLoginMail(user) {
    const ctx = this.ctx;
    const total = ctx.service.user.getRewardBalance(user);
    const time = ctx.moment().utcOffset(480).format('YYYY-MM-DD HH:mm:ss');

    const email = composeEmail('accountActivated', {
      email: user.email,
      time, total,
    }, user.lang);

    await this.sendMail(user.email, email.title, email.content);
  }
  // 发送体验金即将过期邮件
  async sendReawrdExpireMail(user) {
    const email = composeEmail('trialFundExpired', {}, user.lang);
    await this.sendMail(user.email, email.title, email.content);
  }
  // 发送udid邮件
  async sendUdidMail(email) {
    const title = '[Qbit Invest]Congratulations on being Qbit Invest beta user!';
    const content = this.getHtml(email).sendUdidHtml;
    await this.sendMail(email, title, content);
  }
  /*
  *  生成验证邮箱激活码
  * */
  createActiveCode() {
    const timeStr = String(new Date().getTime());
    const str = timeStr.slice(-3);
    let randomStr = '';
    for (let i = 0; i < 3; i++) {
      randomStr += Math.floor(Math.random() * 10);
    }
    return `${str}${randomStr}`;
  }

  checkMailVaild(email) {
    return email.match(/^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/);
  }
}

module.exports = MailService;
