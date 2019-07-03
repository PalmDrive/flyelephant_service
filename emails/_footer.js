'use strict';

module.exports = (data, lang = 'en') => {
  const texts = {
    en: {
      contact: 'Contact us',
    },
    zh: {
      contact: '联系我们',
    },
  };
  const t = texts[lang];
  const html = `<div style="display: flex; align-items: center; margin: 60px auto 0; width: 86%;">
    <div style="font-size: 20px; font-weight: bold; margin-right: 60px;">
      ${t.contact}
    </div>
    <div>
      <span style="width: 31px; height: 31px; margin-right: 12px; border: 1px dashed  #ccc; display: inline-block">
        <a href="https://t.me/joinchat/JySAIxJZd9NdCU4I6LAioA" target="_blank" style="width: 100%; height: 100%; display: block; background: #F6FBFF;">
          <img src="http://matrix-content-s.ailingual.cn/img/home_icon1.png" alt="" style="width: 100%; height: 100%; max-width: auto; max-height: auto;">
        </a>
      </span>
      <span style="width: 31px; height: 31px; margin-right: 12px; border: 1px dashed  #ccc; display: inline-block">
        <a href="https://www.facebook.com/Qbitinvest/" target="_blank" style="width: 100%; height: 100%; display: block; background: #F6FBFF;">
          <img src="http://matrix-content-s.ailingual.cn/img/home_icon2.png" alt="" style="width: 100%; height: 100%; max-width: auto; max-height: auto;">
        </a>
      </span>
      <span style="width: 31px; height: 31px; margin-right: 12px; border: 1px dashed  #ccc; display: inline-block">
        <a href="https://twitter.com/QbitInvest" target="_blank" style="width: 100%; height: 100%; display: block; background: #F6FBFF;">
          <img src="http://matrix-content-s.ailingual.cn/img/home_icon3.png" alt="" style="width: 100%; height: 100%; max-width: auto; max-height: auto;">
        </a>
      </span>
      <span style="width: 31px; height: 31px; margin-right: 12px; border: 1px dashed  #ccc; display: inline-block">
        <a href="https://medium.com/@QbitInvest" target="_blank" style="width: 100%; height: 100%; display: block; background: #F6FBFF;">
          <img src="http://matrix-content-s.ailingual.cn/img/home_icon4.png" alt="" style="width: 100%; height: 100%; max-width: auto; max-height: auto;">
        </a>
      </span>
      <span style="width: 31px; height: 31px; margin-right: 12px; border: 1px dashed  #ccc; display: inline-block">
        <a href="https://www.linkedin.com/company/qbitinvest/" target="_blank" style="width: 100%; height: 100%; display: block; background: #F6FBFF;">
          <img src="http://matrix-content-s.ailingual.cn/img/home_icon5.png" alt="" style="width: 100%; height: 100%; max-width: auto; max-height: auto;">
        </a>
      </span>
    </div>
  </div>
  `;

  return html;
};
