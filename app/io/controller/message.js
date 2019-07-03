'use strict';

module.exports = app => {
  class MessageController extends app.Controller {
    async bindUserId() {
      const { ctx, app } = this;
      const message = ctx.args[0];
      const socket = ctx.socket;
      const client = socket.id;
      const userId = message.userId || null;
      ctx.logger.debug(`收到绑定id消息  userId:${userId}`);
      if (userId !== null) {
        await app.redis.get('master').set(`matrix:user-socket:${userId}`, client, 'EX', 60 * 60 * 24 * 1);
        await this.ctx.service.messageio.pushAllData(userId);
      }
    }

    async logout() {
      const { ctx, app } = this;
      const message = ctx.args[0];
      const userId = message.userId;
      ctx.logger.debug(`收到绑定id消息  userId:${userId}`);
      if (userId !== null) {
        await app.redis.get('master').del(`matrix:user-socket:${userId}`);
      }
    }

    async joinRoom() {
      const { ctx } = this;
      const message = ctx.args[0];
      const socket = ctx.socket;
      // 先退出其他房间
      const rooms = socket.rooms;
      const symbol = message.symbol;
      const roomNames = Object.keys(rooms);
      for (let i = 0; i < roomNames.length; i++) {
        socket.leave(roomNames[i]);
      }
      const roomName = `${symbol}_room`;
      console.log(roomName);
      socket.join(roomName);
    }
  }
  return MessageController;
};
