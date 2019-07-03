'use strict';
// socketio 相关路由
module.exports = app => {
  const { io } = app;
  // 绑定用户id
  io.of('/').route('bindUserId', io.controller.message.bindUserId);
  // logout
  io.of('/').route('logout', io.controller.message.logout);
  io.of('/').route('joinRoom', io.controller.message.joinRoom);
};
