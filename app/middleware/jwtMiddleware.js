'use strict';
// const env = require('process').env.NODE_ENV;

/**
 * Resolvers does not need auth
 */
const publicResolversList = [
  'login',
  'signup',
  'sendsms',
  'forgetPassword',
  'courses',
  'coursesCount',
];

function inList(str, list) {
  let flag = false;
  for (const r of list) {
    if (str.match(r)) {
      flag = true;
      break;
    }
  }
  return flag;
}

module.exports = () => {
  return async function jwtMiddleware(ctx, next) {
    const resolver = ctx.request.body.query;
    const jwtUser = ctx.state.user;

    // return next();

    const error = new Error();
    error.status = 403;
    error.code = 403;
    error.message = 'Forbidden';

    if (resolver && !inList(resolver, publicResolversList)) {
      if (!jwtUser) {
        throw error;
      }
    }

    if (jwtUser) ctx.state.user = await ctx.model.User.findById(jwtUser._id);

    await next();
  };
};
