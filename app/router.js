'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/hello', controller.user.hello);

  // webhook to coinbase api
  router.post('/coinbase/notifications', controller.coinbase.notifications);

  // require('./io/router')(app);
};
