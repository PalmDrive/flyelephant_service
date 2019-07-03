'use strict';

// had enabled by egg
exports.graphql = {
  enable: true,
  package: 'egg-graphql',
};

exports.mongoose = {
  enable: true,
  package: 'egg-mongoose',
};

exports.redis = {
  enable: true,
  package: 'egg-redis',
};

exports.jwt = {
  enable: true,
  package: 'egg-jwt',
};

exports.sessionRedis = {
  enable: false,
  package: 'egg-session-redis',
};

exports.cors = {
  enable: true,
  package: 'egg-cors',
};

exports.io = {
  enable: true,
  package: 'egg-socket.io',
};

exports.validate = {
  enable: true,
  package: 'egg-validate',
};
