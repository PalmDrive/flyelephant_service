'use strict';
function createMsg(returnCode, returnUserMessage, data) {
  const msg = {
    error: {
      returnCode: returnCode || 0,
      returnMessage: returnUserMessage || 'success',
      returnUserMessage: returnUserMessage || '成功',
    },
  };
  if (Array.isArray(data) && data.length === 0) {
    msg.data = [];
  } else {
    msg.data = data || {};
  }

  return msg;
}

function returnMsg(returnCode, returnUserMessage, data) {
  this.body = createMsg(returnCode, returnUserMessage, data);
}

function fixNumber(num, n = 2) {
  const m = Math.pow(10, n);
  return Math.round(num * m, 10) / m;
}

function validateExistenceAndOwnership(doc, userIdField, user) {
  let isValid = true;
  if (!doc) {
    this.status = 404;
    this.body = {
      type: 'invalid_request_error',
      message: 'Payout not found',
    };
    isValid = false;
  } else {
    if (!user.isAdmin && String(doc[userIdField]) !== user.id) {
      this.status = 402;
      this.body = {
        type: 'invalid_request_error',
        message: 'Forbidden',
      };
      isValid = false;
    }
  }

  return isValid;
}

// function trimNumber()

module.exports = {
  returnMsg,
  _: require('underscore'),
  crypto: require('crypto'),
  xmlParser: require('xml2json'),
  moment: require('moment'),
  fixNumber,
  fs: require('fs'),
  ccxt: require('ccxt'),
  nodemailer: require('nodemailer'),
  httpsAgent: require('https-proxy-agent'),
  speakeasy: require('speakeasy'),
  svgCaptcha: require('svg-captcha'),
  stripe: require('stripe'),
  oss: require('ali-oss'),
  bip32: require('bip32'),
  axios: require('axios'),
  validateExistenceAndOwnership,
};
