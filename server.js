'use strict';

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const debug = require('debug')('cf-gram:server');

const authRouter = require('./route/auth-router.js');
const errors = require('./lib/error-middleware.js');
const galleryRouter = require('./route/gallery-router.js');
const picRouter = require('./route/pic-router.js');

dotenv.load(); //loads .env file for environment variables

const PORT = process.env.PORT || 3000;
const app = express();

mongoose.connect(process.env.MONGODB_URI);//putting this inside .env

app.use(cors());
app.use(morgan('dev'));
app.use(authRouter);
app.use(galleryRouter);
app.use(picRouter);
app.use(errors);


const server = module.exports = app.listen(PORT, () => debug('server up:', PORT));

server.isRunning = true;