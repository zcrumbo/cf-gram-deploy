'use strict';

const createError = require('http-errors');
const debug = require('debug')('cf-gram:basic-auth-middleware');

module.exports = function(req, res, next) {
  debug('basic auth');

  var authHeader = req.headers.authorization;//basic auth just encodes
  if(!authHeader) {
    return next(createError(401, 'authorization header required'));
  }

  var base64str = authHeader.split('Basic ')[1]; //header comes in format 'Basic xxxxxxxx'. space is important
  if (!base64str) {
    return next(createError(401, 'username and password required'));
  }

  var utf8str = new Buffer(base64str, 'base64').toString(); //one method to decode auth header
  //comes back as username:password
  var authArr = utf8str.split(':');

  req.auth = {
    username: authArr[0],
    password: authArr[1]
  };

  if(!req.auth.username) {
    return next(createError(401, 'username required'));
  }

  if(!req.auth.password) {
    return next(createError(401, 'password required'));
  }
  //return req.auth;
  next();
};