'use strict';

const getContent = (data, lang = 'en') => {
  const texts = {
    en: {
      cong: `Congratulations! You got ${data.money} as your free fund for the trial.`,
      howToUnlock: `How to unlock your fund?<br>You need to invite 3 successfully registered friends to unlock ${data.money} USDT in your account, within the next 24 hours.`,
      share: 'Just share the link:',
      checkInvitations: 'You can see how many friends have accepted your invitation here:',
      sendScreenshot: 'Please send the screenshot to Amanda at WeChat: zhidekan123, and she will help you to unlock your fund.',
    },
    zh: {
      cong: `恭喜！您免费获得了${data.money}USDT的体验金。`,
      howToUnlock: `如何解锁您的资金？<br>在24小时内邀请3位成功注册的朋友，便可解锁${data.money}USDT。`,
      share: '只需分享链接：',
      checkInvitations: '您可以在这里看到有多少朋友接受了你的邀请:',
      sendScreenshot: '请将截图发送到Amanda(微信：zhidekan123)，她将帮助您解锁体验金。',
    },
  };

  const t = texts[lang];

  const html = `
  <p>${t.cong}</p>
  <p>${t.howToUnlock}</p>
  <p>${t.share}<br><a href="${data.url}" target="_blank">${data.url}</a></p>
  <p>${t.checkInvitations}<br><a href="${data.homePageUrl}" target="_blank">${data.homePageUrl}</a></p>
  <p>${t.sendScreenshot}</p>
  `;

  return html;
};

const getTitle = lang => {
  const texts = {
    en: '[Qbit Invest] Welcome to Qbit Invest',
    zh: '[Qbit Invest]欢迎来到Qbit Invest',
  };

  return texts[lang];
};

module.exports = {
  getContent, getTitle,
};
