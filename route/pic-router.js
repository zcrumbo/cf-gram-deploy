'use strict';

const fs = require('fs');
const path = require('path');//parsing file path text
const del = require('del');
const AWS = require('aws-sdk'); //constructor
const multer = require('multer');
const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('cfgram:pic-router');

const Pic = require('../model/pic.js');
const Gallery = require('../model/gallery.js');
const bearerAuth = require('../lib/bearer-auth-middleware');

AWS.config.setPromisesDependency(require('bluebird')); //syntax comes directly from AWS SDK.

const s3 = new AWS.S3(); //again, right from AWS SDK
const dataDir = `${__dirname}/../data`;
const upload = multer({dest: dataDir });

const picRouter = module.exports = Router();
//upload wrapper, promisified
function s3uploadProm(params) { //function name is arbitrary. params are metadata
  debug('s3uploadProm');

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, s3data) => {
      if(err) console.error(reject);
      resolve(s3data); //includes data about data
    });
  });
}

picRouter.post('/api/gallery/:galleryID/pic', bearerAuth, upload.single('image'), function(req,res, next) { //upload middleware allows for limits on file types and numbers
  debug('POST: /api/gallery/:galleryID/pic');

  if (!req.file) return next(createError(400, 'file not found'));
  if (!req.file.path) return next(createError(500, 'file not saved'));

  let ext = path.extname(req.file.originalname); //extracts original extension of file
  let params = {
    ACL: 'public-read', //Access Control List
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`, //multer hashes filename
    Body: fs.createReadStream(req.file.path),
  };

  Gallery.findById(req.params.galleryID)
  .then( ()  =>  s3uploadProm(params))
  .then( s3data => {
    del([`${dataDir}/*`]);
    let picData = {
      name: req.body.name,
      desc: req.body.desc,
      objectKey: s3data.Key,
      imageURI: s3data.Location,
      userID: req.user._id,
      galleryID: req.params.galleryID
    };
    return new Pic(picData).save();
  })
  .then( pic => res.json(pic))
  .catch( err => next(err));
});

