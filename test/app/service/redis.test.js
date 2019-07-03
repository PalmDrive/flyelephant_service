'use strict';

const { app, mock, assert } = require('egg-mock/bootstrap');

describe('test/app/servive/redis', () => {
  let ctx;
  let redis;

  before(async () => {
    ctx = app.mockContext();
    redis = ctx.service.redis;
  });

  it('works with string', async () => {
    const str = 'hello world';
    const key = `test:${+new Date()}`;
    await redis.set(key, str, 'EX', 5);
    assert.equal(str, await redis.get(key));
  });

  it('works with number', async () => {
    const num = 0;
    const key = `test:${+new Date()}`;
    await redis.set(key, num, 'EX', 5);
    assert.equal(num, await redis.get(key));
  });

  it('works with hash', async () => {
    const hash = {
      name: 'test',
      value: 1,
    };
    const key = `test:${+new Date()}`;
    await redis.set(key, hash, 'EX', 5);
    assert.deepEqual(hash, await redis.get(key));
  });
});
