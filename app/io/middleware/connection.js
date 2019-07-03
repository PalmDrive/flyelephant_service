'use strict';
/*
  {
    messageType : 2,
    data:[
      {}
    ]
  }
  */
module.exports = app => {
  return async (ctx, next) => {
    // console.log('-----------有一条socket连入-----------');
    // const message = this.args[0];
    await ctx.socket.emit('MESSAGE_COMPONENT', {
      messageType: 1,
      data: [],
    });
    // await app.redis.set(`userSocketKey:${ctx.socket.id}`, '', 'EX', 60 * 60 * 24 * 1);
    await next();
    // execute when disconnect.
    // await app.redis.del(`userSocketKey:${ctx.socket.id}`);
    // console.log('disconnection!');
  };
};
