'use strict';

module.exports = () => {
  return async function(ctx, next) {
    const auth = ctx.request.headers.Authorization || ctx.request.headers.authorization;

    let user;

    if (auth) {
      let key = auth.replace('Basic ', '');
      key = Buffer.from(key, 'base64').toString('ascii'); // username:password
      key = key.split(':')[0];

      // user = await ctx.model.User.findOne({
      //   secretKey: key,
      // });
      user = await ctx.service.user.authWithSecretKey(key);
    }

    if (!user) {
      ctx.status = 401;
      ctx.body = { type: 'authentication_error' };
      return;
    }

    ctx.state.user = user;

    await next();
  };
};
