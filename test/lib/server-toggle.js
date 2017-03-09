'use strict';

const debug = require('debug')('cfgram:server-toggle');

module.exports = exports = {};

exports.serverOn = function(server, done) {
  if(!server.isRunning) {
    server.listen(process.env.PORT,  () => {
      server.isRunning = true;
      debug('server up:', process.env.PORT);
      done();
    });
    return;
  }
  done();
};

exports.serverOff = function(server, done) {
  if(server.isRunning) {
    server.close( err => {
      if(err) return done(err);
      server.isRunning = false;
      debug('server off');
      done();
    });
    return;
  }
  done();
};