'use strict';

module.exports = () => {
  async function getBody(ctx) {
    const req = ctx.req;
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    return new Promise(resolve => {
      req.on('end', () => {
        resolve(body);
      });
    });
  }
  return async function(ctx, next) {
    if (ctx.request.body !== undefined) return await next();
    let body = await getBody(ctx);

    let json;
    try {
      json = JSON.parse(body);
    } catch (err) {
      body = body.replace(/\n/g, ' ');
      json = JSON.parse(body);
    } finally {
      ctx.request.body = json;
      await next();
    }
  };
};
