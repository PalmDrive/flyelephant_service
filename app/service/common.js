'use strict';

const cheerio = require('cheerio');

// 通用业务逻辑处理服务
const Service = require('egg').Service;
class CommonService extends Service {
  /**
   * 用云片发送验证码
   * @param {string} phone Phone number
   * @param {string} phoneCode The code sent to the user
   * @param {string} type Type could be one of the phoneCodeType. The text content should vary base on the type
   * @return {json} res Result
   */
  async sendSmsByYunpian(phone, phoneCode, type) {
    const ctx = this.ctx;
    let content = `【QBit】Hi, your code is: ${phoneCode}.  For security reasons, this code will expire in 5 minutes.`; // 国外手机模板
    if (phone.indexOf('+') === -1) {
      content = `【Qbit】您的验证码是${phoneCode}，为了您的安全考虑，此验证码的有效期为5分钟。`;
    }

    const result = await ctx.service.sms.send(phone, content);

    return {
      code: result.data.code,
      message: result.data.msg,
    };
  }

  async getExchangeRate2(symbol) {
    const ctx = this.ctx;
    const apiKey = '8db24f7a7cf7d2fec67f';
    const key = `${ctx.app.config.exchangeRateCacheKey}_${symbol}`;
    let exchangeRate = await ctx.app.redis.get('master').get(key);
    if (!exchangeRate) {
      const result = await ctx.curl(`http://free.currencyconverterapi.com/api/v5/convert?q=${symbol}&compact=y&apiKey=${apiKey}`, { dataType: 'json' });
      exchangeRate = result.data[symbol].val;
      await ctx.app.redis.get('master').set(key, exchangeRate, 'EX', 5 * 60);
    }
    return Number(exchangeRate);
  }

  async getExchangeRate(symbol = 'USD_CNY', side = 'buy') {
    const ctx = this.ctx;
    const key = `${ctx.app.config.exchangeRateCacheKey}_${symbol}_${side}`;
    let exchangeRate = await ctx.app.redis.get('master').get(key);
    if (!exchangeRate) {
      exchangeRate = await this.fetchExchangeRate(symbol, side);

      if (exchangeRate) {
        await ctx.app.redis.get('master').set(key, exchangeRate, 'EX', 60 * 60); // 1 hour cache
      }
    }
    return Number(exchangeRate);
  }

  async fetchExchangeRate(symbol = 'USD_CNY', side = 'buy') {
    // const url = 'http://forex.hexun.com/rmbhl/#zkRate';
    const url = `https://www.huilv.cc/${symbol}`;
    // const url = 'http://www.currencydo.com';
    const filters = {
      buy: {
        bank: '中国银行',
        type: '现汇卖出价',
      },
      sell: {
        bank: '中国银行',
        type: '现汇买入价',
      },
    };
    const filter = filters[side];
    const ctx = this.ctx;

    ctx.logger.info('Crawl data from %s', url);
    // const res = await ctx.axios.get(url, {
    //   headers: {
    //     'content-type': 'text/html;charset=utf-8',
    //   },
    //   responseType: 'text',
    // });
    const res = await ctx.axios.get(url);
    const headers = [];
    const data = [];
    const $ = cheerio.load(res.data);
    const $trs = $('.hangqing_content tbody tr');

    $trs.each((i, tr) => {
      // console.log(`row ${i + 1}`);
      const $tds = $(tr).find('td');
      const obj = {};
      $tds.each((j, td) => {
        const text = $(td).text().trim();
        // console.log('td:', text);
        if (i === 0) {
          headers.push(text);
        } else {
          const key = headers[j];
          obj[key] = text;
        }
      });
      if (!ctx._.isEmpty(obj)) {
        data.push(obj);
      }
    });

    // console.log(data);

    // Get exchange rate value
    let rate = data.filter(d => d['银行'] === filter.bank);

    if (rate.length === 0) return null;

    rate = Number(rate[0][filter.type]) / 100;
    rate = ctx.fixNumber(rate, 4);

    ctx.logger.info('Exchange rate: %s', rate);
    return rate;
  }

  async checkSign(params, sign) {
    const ctx = this.ctx;
    const timestamp = params.timestamp;
    if (ctx.moment.utc().valueOf() - timestamp > 30 * 1000) { // 请求超过30秒视为无效
      return false;
    }
    const keys = Object.keys(params);
    keys.sort();
    let str = '';
    for (let i = 0; i < keys.length; i++) {
      str += str.length === 0 ? `${keys[i]}=${params[keys[i]]}` : `&${keys[i]}=${params[keys[i]]}`;
    }
    const md5 = ctx.crypto.createHash('md5');
    md5.update(str);
    return md5.digest('hex').toUpperCase() === sign;
  }
  setDelay(delay) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, delay);
    });
  }

  getPrecision(num) {
    const s = String(num).split('.')[1];
    return s ? s.length : 0;
  }

  random(min, max, precision = 0) {
    if (precision === null || typeof precision === 'undefined') precision = Math.max(this.getPrecision(min), this.getPrecision(max));

    let r;

    if (precision === 0) {
      r = Math.floor(Math.random() * (max - min)) + min;
    } else {
      const m = Math.pow(10, precision);
      r = this.random(min * m, max * m);
      r = r / m;
      r = Number(r.toFixed(precision));
    }

    return r;
  }

  randomStr() {
    return this.ctx.crypto.randomBytes(16).toString('hex');
  }

  // 给日志加颜色区分
  addColors(str, style) {
    switch (style) {
      case 'yellow':
        return '\u001b[33m' + str + '\u001b[39m';
      case 'red':
        return '\u001b[31m' + str + '\u001b[39m';
      case 'green':
        return '\u001b[32m' + str + '\u001b[39m';
      case 'cyan':
        return '\u001b[36m' + str + '\u001b[39m';
      default :
        return str;
    }
  }

  jsonParse(string) {
    let json;

    try {
      json = JSON.parse(string);
    } catch (err) {
      json = {};
    }

    return json;
  }

  // @param {Dict} options { retries <Number>, context <Object>, wait <Number> }
  async try(fn, args, options) {
    const wait = options.wait || 1000;
    const context = options.context || this;
    if (options.retries < 1) {
      this.ctx.logger.error('Still failed after retries');
      const e = options.err || new Error('Still failed after retries');
      throw e;
    }

    try {
      const res = await fn.apply(context, args);
      return res;
    } catch (err) {
      this.ctx.logger.info('Failed:', err);

      options.retries -= 1;
      options.err = err;
      await this.setDelay(wait);

      this.ctx.logger.info('Start to retry after wait %s ...', wait);

      return await this.try(fn, args, options);
    }
  }

  sum(data, field, count) {
    if (!count) count = data.length;
    return data.slice(0, count).reduce((memo, d) => {
      // console.log('price:', d[field]);
      return memo + d[field];
    }, 0);
  }

  average(data, field, count) {
    if (!count) count = data.length;

    return this.sum(data, field, count) / count;
  }

  async genUniqNum(originalNum, namespace, delta = 0.1, decimal = 2, expires = 1800) {
    const ctx = this.ctx;
    const maxTries = Math.pow(10, decimal) * 0.5;
    let tryCount = 0;

    const numbersMap = {};
    const pattern = `${namespace}:*`;
    const keys = await this.app.redis.get('master').keys(pattern);
    for (const key of keys) {
      const num = await ctx.service.redis.get(key);
      numbersMap[num] = true;
    }

    const _genUniqNum = async n => {
      if (numbersMap[n]) {
        if (tryCount >= maxTries) {
          ctx.logger.error('Computed %s times but failed to compute an uniq number.', tryCount);
          return null;
        }

        n = this.random(originalNum - delta, originalNum + delta, decimal);

        tryCount += 1;

        return await _genUniqNum(n);
      }

      // Add originalNum to redis, cache [expires] seconds
      const key = `${namespace}:${n}`;
      await ctx.service.redis.set(key, n, 'EX', expires);
      return n;
    };

    return _genUniqNum(originalNum);
  }

  capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  equal(a, b, decimal = 6) {
    const delta = Math.abs(a - b);
    const m = Math.pow(10, decimal);
    return delta * m < 1;
  }
}
module.exports = CommonService;
