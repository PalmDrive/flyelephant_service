'use strict';

const getContent = (data, lang = 'en') => {
  const texts = {
    en: {
      activated: `Your account ${data.email} has been activated successfully at ${data.time}.`,
      fund: `Your QBIT TRIAL FUND of ${data.total} USDT
      is available now. This fund will expire in 7 days. Start investing and get the earnings now!`,
      options: 'There are 2 options for you to take advantage of the fund (both you can choose):<br>Option 1: Invest in cryptocurrencies;<br>Option 2: Invest in fixed income product based on USDT;<br>The earnings you have gained by investing will be transferred to your account automatically after the fund expires. If there is any loss, we will bear it for you.',
      support: 'Thanks for your trust and support always! Please feel free to contact us if you have any questions.<br>Telegram: <a href="http://t.me/qbitinvest" target="_blank"> t.me/qbitinvest</a><br>Email:<a href="javascript:;">  info@qbitinvest.co</a>',
    },
    zh: {
      activated: `你的账户${data.email}已经于2019-01-14 10:56:38成功激活。`,
      fund: `你的${data.total} USDT体验金现在已经可以使用了。体验金将于7天后到期。现在就开始你的投资并赚取收益吧！`,
      options: '关于如何使用体验金，你有两个途径（两个途径都可以选择）：<br>途径1：在快速交易中，闪兑兑入数字货币，赚取收益<br>途径2：在固收理财中，购买USDT本位的固收理财产品，赚取收益<br><br>体验金到期后，你所获得的收益将自动转入你的个人账户。如果你有任何亏损，Qbit Invest平台将为你承担。',
      support: '感谢你一直以来的信任和支持！如果有任何问题，请随时联系我们。<br>电报群: <a href="http://t.me/qbitinvest" target="_blank"> t.me/qbitinvest</a><br>邮箱:<a href="javascript:;">  info@qbitinvest.co</a>',
    },
  };
  const t = texts[lang];

  const html = `
  <p>${t.activated}</p>
  <p>${t.fund}</p>
  <p>${t.options}</p>
  <p>${t.support}</p>
  `;

  return html;
};

const getTitle = lang => {
  const texts = {
    en: '[Qbit Invest]Your QBit Invest account has been activated.',
    zh: '[Qbit Invest]你的Qbit Invest体验金已激活',
  };

  return texts[lang];
};

module.exports = {
  getContent,
  getTitle,
};
