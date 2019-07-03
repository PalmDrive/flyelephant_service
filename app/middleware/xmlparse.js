/**
 * Created by Gec on 2018/8/6.
 */
'use strict';
module.exports = () => {
  return async function(ctx, next) {
    const bodyParser = require('body-parser');
    ctx.app.use(bodyParser.urlencoded({
      extended: true,
    }));
    await next();
  };
};
