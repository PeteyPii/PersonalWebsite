var express = require('express');
var git = require('git-rev');
var _ = require('lodash');
var Q = require('q');
var request = require('request');

var Cache = require('./cache.js');
var logger = require('./logger.js');
var settings = require('./settings.js');
var version = require('./version.js');

var api = express.Router();

var cache = new Cache();
cache.addUpdateHandler('euler', function(callback) {
  request.get('http://projecteuler.net/profile/BasicBananas.txt', function(err, resp, body) {
    if (err) {
      callback(err);
      return;
    }

    if (resp.statusCode < 200 || resp.statusCode >= 400) {
      callback(new Error('Request to ' + resp.request.href + ' responded with status code: ' + resp.statusCode));
      return;
    }

    var stats = body.split(',');
    var value = {
      problemsSolved: stats[3],
    };

    callback(null, value);
  });
});
cache.addUpdateHandler('lol', function(callback) {
  var lol = {};

  function assertGoodResponse(resp) {
    if (resp.statusCode < 200 || resp.statusCode >= 400) {
      throw new Error('Request to ' + resp.request.href + ' responded with status code: ' + resp.statusCode);
    }
  }

  var url = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/' + settings.summoner_name + '?api_key=' + settings.lol_api_key;
  Q.ninvoke(request, 'get', url).spread(function(resp, body) {
    assertGoodResponse(resp);

    var summonerData = JSON.parse(body);
    var summonerId = summonerData.id;
    lol.summonerName = settings.summoner_name;
    lol.summonerId = summonerId;
    lol.profileIconId = summonerData.profileIconId;

    lol.soloQueue = {
      wins: 0,
      losses: 0,
      tier: 'UNRANKED',
      leaguePoints: 0,
      division: '',
    };
    lol.flex = _.clone(lol.soloQueue);
    lol.threes = _.clone(lol.soloQueue);
    url = 'https://na1.api.riotgames.com/lol/league/v3/positions/by-summoner/' + summonerId + '?api_key=' + settings.lol_api_key;
    var rankedPromise = Q.ninvoke(request, 'get', url).spread(function(resp, body) {
      assertGoodResponse(resp);

      var rankedData = JSON.parse(body);
      for (var i = 0; i < rankedData.length; i++) {
        var queueData = rankedData[i];
        switch (queueData.queueType) {
          case 'RANKED_SOLO_5x5':
            lol.soloQueue.wins = queueData.wins;
            lol.soloQueue.losses = queueData.losses;
            lol.soloQueue.tier = queueData.tier;
            lol.soloQueue.division = queueData.rank;
            lol.soloQueue.leaguePoints = queueData.leaguePoints;
            break;

          case 'RANKED_FLEX_SR':
            lol.flex.wins = queueData.wins;
            lol.flex.losses = queueData.losses;
            lol.flex.tier = queueData.tier;
            lol.flex.division = queueData.rank;
            lol.flex.leaguePoints = queueData.leaguePoints;
            break;

          case 'RANKED_FLEX_TT':
            lol.threes.wins = queueData.wins;
            lol.threes.losses = queueData.losses;
            lol.threes.tier = queueData.tier;
            lol.threes.division = queueData.rank;
            lol.threes.leaguePoints = queueData.leaguePoints;
            break;
        }
      }
    });

    url = 'https://na1.api.riotgames.com/lol/static-data/v3/champions?locale=en_US&tags=image&dataById=true&api_key=' + settings.lol_api_key;
    champPromise = Q.ninvoke(request, 'get', url);

    lol.masteryScore = 0;
    lol.masteryPoints = 0;
    lol.topChamps = [];
    url = 'https://na1.api.riotgames.com/lol/champion-mastery/v3/champion-masteries/by-summoner/' + summonerId + '?api_key=' + settings.lol_api_key;
    var masteryPromise = Q.ninvoke(request, 'get', url).spread(function(resp, body) {
      assertGoodResponse(resp);

      var masteryData = JSON.parse(body);
      masteryData = _.sortBy(masteryData, 'championPoints');
      masteryData.reverse();
      for (var i = 0; i < masteryData.length; i++) {
        var champData = masteryData[i];
        lol.masteryScore += champData.championLevel;
        lol.masteryPoints += champData.championPoints;

        if (i < 4) {
          lol.topChamps.push({
            id: champData.championId,
            points: champData.championPoints,
          });
        }
      }

      return champPromise;
    }).spread(function(resp, body) {
      assertGoodResponse(resp);

      var champData = JSON.parse(body);
      for (var i = 0; i < lol.topChamps.length; i++) {
        var id = lol.topChamps[i].id.toString();
        lol.topChamps[i].image = champData.data[id].image.full;
      }
    });

    url = 'https://na1.api.riotgames.com/lol/static-data/v3/versions?api_key=' + settings.lol_api_key;
    var versionPromise = Q.ninvoke(request, 'get', url).spread(function(resp, body) {
      assertGoodResponse(resp);

      var versionData = JSON.parse(body);
      lol.version = versionData[0];
    });

    return Q.all([rankedPromise, masteryPromise, versionPromise]);
  }).then(function() {
    callback(null, lol);
  }).fail(function(reason) {
    logger.error(reason);
    callback(reason);
  }).done();
});

api.get('/euler', function(req, res) {
  cache.get('euler', function(err, data) {
    if (err) {
      res.status(500);
      res.end();
    } else {
      res.send(data);
    }
  });
});

api.get('/lol', function(req, res) {
  cache.get('lol', function(err, data) {
    if (err) {
      res.status(500);
      res.end();
    } else {
      res.send(data);
    }
  });
});

api.get('/status', function(req, res) {
  git.long(function(sha) {
    res.send({
      sha: sha,
      version: version,
    });
  });
});

module.exports = api;
