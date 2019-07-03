'use strict';

module.exports = (data, lang = 'en') => {
  const texts = {
    en: {
      sincerely: 'Sincerely,',
      team: 'Qbit Invest',
    },
    zh: {
      sincerely: '此致',
      team: 'Qbit Invest团队',
    },
  };

  const t = texts[lang];

  const html = `<div style="margin-top: 50px; color: #21222A; font-size: 16px;">
    <span style="display: block;">${t.sincerely}</span>
    <span style="display: block;">${t.team}</span>
  </div>
  `;

  return html;
};
