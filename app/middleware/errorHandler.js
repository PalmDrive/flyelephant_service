'use strict';
// -----REST接口统一错误处理中间件 暂时没用--------
// function handleError(error, ctx) {
//   const errorCode = error.code;
//   const errorList = error.errors;
//   // 参数类型的错误
//   if (errorCode === 'invalid_param') {
//     let errorMsg = '';
//     for (const msg of errorList) {
//       errorMsg += `${msg.field} ${msg.message},`;
//     }
//     errorMsg = errorMsg.substring(0, errorMsg.length - 1);
//     ctx.returnMsg(1004, errorMsg, null);
//   }
//   if (error.typeCode) {
//     ctx.returnMsg(error.typeCode, error.message, null);
//   } else if (typeof error === 'string') {
//     ctx.returnMsg(1, error, null);
//   } else {
//     ctx.app.emit('error', error, ctx.app);
//   }
// }

/*
 * Error object:
 * { type, [message, [detail }
 * type: api_error, invalid_request_error, authentication_error
 */
function handleError(err, ctx) {
  // 所有的异常都在 app 上触发一个 error 事件，框架会记录一条错误日志
  ctx.app.emit('error', err, ctx);

  const status = err.status || 500;
  // 生产环境时 500 错误的详细错误内容不返回给客户端，因为可能包含敏感信息
  const error = status === 500 && ctx.app.config.env === 'prod'
    ? 'Internal Server Error'
    : err.message;

  // 从 error 对象上读出各个属性，设置到响应中
  ctx.body = {
    message: error,
    type: err.type || 'api_error',
  };
  if (status === 422) {
    ctx.body.detail = err.errors;
    ctx.body.type = 'invalid_request_error';
  }
  ctx.status = status;
}

module.exports = () => {
  return async function error(ctx, next) {
    // ctx.logger.info(`tokenCheck-Url=>${ctx.request.url}`);
    // ctx.logger.info(`tokenCheck-method=>${ctx.request.method}`);
    // ctx.logger.info(`tokenCheck-param-post=>${JSON.stringify(ctx.request.body)}`);
    // ctx.logger.info(`tokenCheck-param-get=>${JSON.stringify(ctx._query)}`);
    try {
      await next();
    } catch (error) {
      handleError(error, ctx);
    }
  };
}
;
