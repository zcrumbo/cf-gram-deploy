'use strict';

require('./lib/test-env.js');
require('./lib/aws-mocks.js');

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const User = require('../model/user.js');

require('../server.js');

const PORT = process.env.PORT || 3000;
const url = `localhost:${PORT}`;

const exampleUser = {
  username: 'exampleUser',
  password: '1234',
  email: 'exampleuser@test.com'
};

describe('Auth routes', function() {
  describe('POST: /api/signup', function() {
    describe('with a valid body', function() {
      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err, res) => {
          if (err) return done(err);
          console.log('token:', res.text);
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });
  });
  describe('GET: /api/signin', function() {
    describe('with a valid body', function() {
      before( done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then (user => user.save())
        .then (user => {
          this.tempUser = user;
          done();
        })
        .catch(done);
      });
      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });
      it('should return a token', done => { //superagent auth
        request.get(`${url}/api/signin`)
        .auth('exampleUser', '1234')
        .end((err, res) => {
          if (err) return done(err);
          console.log('temp user:', this.tempUser);
          console.log('GET: /api/signin token:', res.text);
          expect(res.status).to.equal(200);
          done();
        });
      });
    });
  });
});


