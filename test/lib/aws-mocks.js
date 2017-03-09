'use strict';

const AWS = require('aws-sdk-mock');

module.exports = exports = {};

exports.uploadMock = {
  Etag: '"1234abcd"', //needs to be a string w/in a string
  Location: 'https://notadomain.com',
  Key: '1234.png',
  key: '1234.png',
  bucket: 'cfgram-zach'
};

AWS.mock('S3', 'upload', function(params, callback) {
  if (!params.ACL === 'public-read') {
    return callback(new Error('ACL must be public-read'));
  }

  if (!params.Bucket === 'crgram-zach') {
    return callback(new Error('bucket must be cfgram-zach'));
  }

  if (!params.Key) {
    return callback(new Error('key required'));
  }

  if(!params.Body) {
    return callback(new Error('body required'));
  }

  callback(null, exports.uploadMock);
});