'use strict';

module.exports = appInfo => {
  const config = exports = {};

  config.proxy = true;
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1532962019674_2847';
  // add your config here

  config.middleware = [ 'logMiddleware', 'jwtMiddleware', 'graphql' ];
  config.jwtMiddleware = {
    match: '/graphql',
  };
  // config.apiAuth = {
  //   match: '/api/v1',
  // };
  // config.errorHandler = {
  //   match: '/api/v1',
  // };

  config.mongoose = {
    client: {
      url: 'mongodb://localhost/matrix_content_local',
    },
  };
  config.cluster = {
    listen: {
      port: 5000,
      hostname: '0.0.0.0',
    },
  };
  // graphql
  config.graphql = {
    router: '/graphql',
    // 是否加载到 app 上，默认开启
    app: true,
    // 是否加载到 agent 上，默认关闭
    agent: false,
    // 是否加载开发者工具 graphiql, 默认开启。路由同 router 字段。使用浏览器打开该可见。
    graphiql: true,
    // graphQL 路由前的拦截器
    async onPreGraphQL(ctx) {
      ctx.session.target = 1;
    },
    // 开发工具 graphiQL 路由前的拦截器，建议用于做权限操作(如只提供开发者使用)
    // * onPreGraphiQL(ctx) {},
  };
  exports.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    // credentials: 'true',
  };
  exports.redis = {
    clients: {
      master: {
        port: 6379,
        host: 'localhost',
        password: '',
        db: 0,
      },
      subClient: {
        port: 6379,
        host: 'localhost',
        password: '',
        db: 0,
      },
    },
  };
  exports.security = {
    csrf: {
      enable: false,
    },
  };
  exports.io = {
    redis: config.redis,
  };
  config.jwt = {
    enable: true,
    secret: 'a4267580',
    credentialsRequired: false,
  };
  config.session = {
    key: 'bcd9a7124ae5e168c427508a426c1601',
    maxAge: 24 * 3600 * 1000, // 1 天
    httpOnly: true,
    encrypt: true,
    // domain: '.ailingual.cn',
  };
  exports.static = {
    dynamic: true,
    prefix: '/',
  };
  config.io = {
    namespace: {
      '/': {
        connectionMiddleware: [ 'connection' ],
        packetMiddleware: [],
      },
    },
  };
  config.host = {
    // server: 'matrix-content-s.ailingual.cn',
    // web: 'matrix-content.ailingual.cn',
  };

  config.redisExpirationKeys = {
    COINCARE_EVENT: 'coincare_event_',
  };
  config.redisCacheKeys = {
    GOOGLE_AUTH: 'google_auth',
    GMAIL_LATEST_HISTORY_ID: 'gmail_latest_history_id',
  };
  config.redisNamespace = 'flyelephant';

  config.phoneCodePrefix = 'FLY_ELEPHANT_PHONECODE_';
  config.phoneCodeType = { signup: 'signup', updatePhone: 'updatePhone', forgetPassword: 'forgetPassword', bindPhone: 'bindPhone', loginAuth: 'loginAuth', bindGoogleAuth: 'bindGoogleAuth', untiePhone: 'untiePhone', untieGoogleAuth: 'untieGoogleAuth', updatePassword: 'updatePassword' };

  config.inviteCodeBasePrefix = 'INVITE_CODE_BASE';

  return config;
};
