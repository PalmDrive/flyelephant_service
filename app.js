'use strict';

/*
 * Created by Gec on 2018/12/12.
 */
module.exports = app => {
  let ctx;
  const redisExpirationKeys = app.config.redisExpirationKeys;

  app.beforeStart(async () => {
    // 应用会等待这个函数执行完成才启动
    // 也可以通过以下方式来调用 Service
    ctx = app.createAnonymousContext();

    const redis = app.redis.get('subClient');
    redis.subscribe([ '__keyevent@0__:expired' ]);

    redis.on('message', async function(channel, expiredKey) {
      if (expiredKey) {
        if (expiredKey.indexOf(redisExpirationKeys.REWARD) > -1) {
          const userId = expiredKey.split(redisExpirationKeys.REWARD)[1];
          const user = await ctx.model.User.findById(userId);
          if (user) {
            ctx.service.user.settleTrialFund(user);
            ctx.service.mail.sendReawrdExpireMail(user);

            if (user.jpushRegistrationId) {
              ctx.service.notification.sendRewardExpireNotification(user);
            }
          }
        }
      }
    });
  });

  app.on('error', (err, ctx) => {
    ctx ? ctx.logger.error(err) : console.log(err);
  });

};
