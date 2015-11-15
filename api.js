var express = require('express');
var _ = require('lodash');
var request = require('request');

var settings = require('./settings.js');

var api = express.Router();

var cache = {};
var lastCacheUpdate = new Date(0);

api.get('/Euler', function(req, res) {
  if (cache.problemsSolved === undefined || (new Date()).getTime() - lastCacheUpdate.getTime() > settings.cache_life) {
    console.log('no cache');
    request.get('http://projecteuler.net/profile/BasicBananas.txt', function(err, resp, body) {
      if (err) {
        res.status(400);
        res.send('Bad request');
        return;
      }

      var stats = body.split(',');
      cache.problemsSolved = stats[3];
      res.send({
        problemsSolved: stats[3],
      });
      lastCacheUpdate = new Date();
    });
  } else {
    console.log('cached');
    res.send({
      problemsSolved: cache.problemsSolved,
    });
  }
});

module.exports = api;
