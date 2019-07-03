'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/service/common', () => {
  let ctx;
  let Common;
  const namespace = 'unittest:uniqnum';

  before(async () => {
    ctx = app.mockContext();
    Common = ctx.service.common;
  });

  afterEach(async () => {
    const pattern = `${namespace}:*`;
    const redis = app.redis.get('master');
    const keys = await redis.keys(pattern);
    if (keys && keys.length) await redis.del.apply(redis, keys);
  });

  it('generate uniq number', async () => {
    const count = 10;
    const nums = [];
    for (let i = 0; i < count; i++) {
      const num = await Common.genUniqNum(680.68, namespace);
      nums.push(num);
    }

    const nums2 = ctx._.uniq(nums);

    console.log(nums);

    assert.deepEqual(nums2, nums);
  });

  it('generate random number for integers', async () => {
    const a = 10;
    const b = 20;
    const c = Common.random(a, b);
    assert.equal(c >= a, true);
    assert.equal(c < b, true);
    assert.equal(Common.getPrecision(c), 0);
    // console.log(c);
  });

  it('generate random number for float', async () => {
    const a = 99.9;
    const b = 100.1;
    const precision = 2;
    const c = Common.random(a, b, precision);
    assert.equal(c >= a, true);
    assert.equal(c < b, true);
    // assert.equal(Common.getPrecision(c), precision);
    // console.log(c);
  });
});
