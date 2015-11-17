var express = require('express');
var _ = require('lodash');
var request = require('request');

var settings = require('./settings.js');

var api = express.Router();

var cache = {};
var lastUpdates = {
  euler: 0,
  lol: 0,
};

function isCacheStale(value) {
  return cache[value] === undefined || (new Date()).getTime() - lastUpdates[value] > settings.cache_life;
}

function updateCache(value, callback) {
  switch(value) {
    case 'euler':
      request.get('http://projecteuler.net/profile/BasicBananas.txt', function(err, resp, body) {
        if (err) {
          callback(err);
          return;
        }

        var stats = body.split(',');

        cache.euler = {
          problemsSolved: stats[3],
        };
        lastUpdates[value] = (new Date()).getTime();
        callback(null);
      });
      break;
    case 'lol':
      request.get('https://na.api.pvp.net/api/lol/na/v1.4/summoner/by-name/' + settings.summoner_name + '?api_key=' + settings.lol_api_key, function(err, resp, body) {
        if (err) {
          callback(err)
          return;
        }

        var data = JSON.parse(body);
        var summonerId = JSON.parse(body)[settings.summoner_name.toLowerCase()].id;

        cache.lol = {
          summonerId: data[settings.summoner_name.toLowerCase()].id,
        };
        lastUpdates[value] = (new Date()).getTime();
        callback(null);
      });
      break;
    default:
      throw Error('Value not handled in cache \'' + value + '\'');
      break;
  }
}

function getCached(value, callback) {
  if (isCacheStale(value)) {
    updateCache(value, function(err) {
      if (err) {
        callback(err);
      } else {
        callback(err, cache[value]);
      }
    });
  } else {
    callback(null, cache[value]);
  }
}

api.get('/Euler', function(req, res) {
  getCached('euler', function(err, data) {
    if (err) {
      res.status(500);
      res.end();
    } else {
      res.send(data);
    }
  });
});

api.get('/LoL', function(req, res) {
  getCached('lol', function(err, data) {
    if (err) {
      res.status(500);
      res.end();
    } else {
      res.send(data);
    }
  });
});

module.exports = api;
