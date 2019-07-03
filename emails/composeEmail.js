'use strict';

const getHead = require('./_head');
const getHeader = require('./_header');
const getFooter = require('./_footer');
const getRegarding = require('./_regarding');

module.exports = (name, data, lang = 'en') => {
  const { getContent, getTitle } = require(`./${name}`);

  const content = `<!DOCTYPE html>
  <html lang="en">
  ${getHead(data)}
  <body>
    <div style="margin: 0 auto; width: 95%; background: #fff">
      ${getHeader(data, lang)}

      <div style="margin: 0 auto; width: 86%;">
        <div style="font-weight: bold; color: #000; font-size: 30px;">Hi,</div>
        <div class="title-content">
          ${getContent(data, lang)}
        </div>

        ${getRegarding(data, lang)}
      </div>

      ${getFooter(data, lang)}

    </div>
  </body>
  </html>`;

  return { content, title: getTitle(lang) };
};
