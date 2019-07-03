'use strict';

const Service = require('egg').Service;

class RedisService extends Service {
  async get(key) {
    let val = await this.app.redis.get('master').get(key);
    try {
      val = JSON.parse(val);
    } catch (err) {
      // do nothing
    }
    return val;
  }

  async set(key, value, optName, optVal) {
    const _ = this.ctx._;
    if (value !== null && typeof value !== 'undefined') {
      if (typeof value === 'object' && !_.isEmpty(value)) {
        value = JSON.stringify(value);
      }
      if (optName && optVal) {
        await this.app.redis.get('master').set(key, value, optName, optVal);
      } else {
        await this.app.redis.get('master').set(key, value);
      }
    }
  }

  async hget(key, field) {
    let val = await this.app.redis.get('master').hget(key, field);
    try {
      val = JSON.parse(val);
    } catch (err) {
      // do nothing
    }
    return val;
  }

  async hset(key, field, value) {
    const _ = this.ctx._;
    if (value !== null && typeof value !== 'undefined') {
      if (typeof value === 'object' && !_.isEmpty(value)) {
        value = JSON.stringify(value);
      }
      await this.app.redis.get('master').hset(key, field, value);
    }
  }
}

module.exports = RedisService;
