/**
 * Created by Gec on 2018/10/10.
 */
'use strict';

module.exports = () => {
  return async function logMiddleware(ctx, next) {
    const jwtUser = ctx.state.user;
    const start = Date.now();
    ctx.res.on('finish', function() {
      let duration = (Date.now() - start);
      if (duration > 500) {
        duration = ctx.service.common.addColors(duration, 'yellow');
      }
      const req = ctx.request;
      const status = ctx.res._header ? ctx.res.statusCode : undefined;
      const code = status >= 500 ? ctx.service.common.addColors(status, 'red')
        : status >= 400 ? ctx.service.common.addColors(status, 'yellow')
          : status >= 300 ? ctx.service.common.addColors(status, 'cyan')
            : status >= 200 ? ctx.service.common.addColors(status, 'green')
              : status;
      const body = JSON.stringify(req.body);
      console.log('[%s] [%s] %s %s - %s - %s ms <<>> %s # %s # %s # %s', ctx.moment().utcOffset(480).format('YYYY-MM-DD HH:mm:ss.SSS'), process.pid, req.method, req.originalUrl, code, duration, JSON.stringify(req.query), body, JSON.stringify(req.params), jwtUser ? jwtUser._id : undefined);
    });
    await next();
  };
};
