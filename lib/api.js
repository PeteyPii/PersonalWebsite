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

  var url = 'https://na.api.pvp.net/api/lol/na/v1.4/summoner/by-name/' + settings.summoner_name + '?api_key=' + settings.lol_api_key;
  Q.ninvoke(request, 'get', url).spread(function(resp, body) {
    assertGoodResponse(resp);

    var summonerData = JSON.parse(body)[settings.summoner_name.toLowerCase().replace(/\W+/g, '')];
    var summonerId = summonerData.id;
    lol.summonerName = settings.summoner_name;
    lol.summonerId = summonerId;
    lol.profileIconId = summonerData.profileIconId;

    url = 'https://na.api.pvp.net/api/lol/na/v1.3/stats/by-summoner/' + summonerId + '/ranked?api_key=' + settings.lol_api_key;
    var rankedPromise = Q.ninvoke(request, 'get', url).spread(function(resp, body) {
      assertGoodResponse(resp);

      var rankedData = JSON.parse(body);
      var allStats;
      for (var i = 0; i < rankedData.champions.length; i++) {
        if (rankedData.champions[i].id === 0) {
          allStats = rankedData.champions[i].stats;
        }
      }

      lol.rankedGamesPlayed = allStats.totalSessionsPlayed;
      lol.rankedAssists = allStats.totalAssists;
      lol.rankedKills = allStats.totalChampionKills;
      lol.rankedCreepScore = allStats.totalMinionKills + allStats.totalNeutralMinionsKilled;
    });

    url = 'https://na.api.pvp.net/api/lol/na/v1.3/stats/by-summoner/' + summonerId + '/summary?api_key=' + settings.lol_api_key;
    var summaryPromise = Q.ninvoke(request, 'get', url).spread(function(resp, body) {
      assertGoodResponse(resp);

      var summaryData = JSON.parse(body);
      for (var i = 0; i < summaryData.playerStatSummaries.length; i++) {
        var statSummary = summaryData.playerStatSummaries[i];
        switch (statSummary.playerStatSummaryType) {
          case 'Unranked':
            lol.normalWins = statSummary.wins;
            lol.normalCreepScore = statSummary.aggregatedStats.totalMinionKills + statSummary.aggregatedStats.totalNeutralMinionsKilled;
            lol.normalAssists = statSummary.aggregatedStats.totalAssists;
            lol.normalKills = statSummary.aggregatedStats.totalChampionKills;
            lol.normalTurretKills = statSummary.aggregatedStats.totalTurretsKilled;
            break;

          case 'RankedSolo5x5':
            lol.soloQueueWins = statSummary.wins;
            lol.soloQueueLosses = statSummary.losses;
            lol.soloQueueCreepScore = statSummary.aggregatedStats.totalMinionKills + statSummary.aggregatedStats.totalNeutralMinionsKilled;
            lol.soloQueueAssists = statSummary.aggregatedStats.totalAssists;
            lol.soloQueueKills = statSummary.aggregatedStats.totalChampionKills;
            lol.soloQueueTurretKills = statSummary.aggregatedStats.totalTurretsKilled;
            break;

          case 'AramUnranked5x5':
            lol.aramWins = statSummary.wins;
            lol.aramAssists = statSummary.aggregatedStats.totalAssists;
            lol.aramKills = statSummary.aggregatedStats.totalChampionKills;
            lol.aramTurretKills = statSummary.aggregatedStats.totalTurretsKilled;
            break;
        }
      }
    });

    url = 'https://na.api.pvp.net/api/lol/na/v2.5/league/by-summoner/' + summonerId + '/entry?api_key=' + settings.lol_api_key;
    var soloQPromise = Q.ninvoke(request, 'get', url).spread(function(resp, body) {
      assertGoodResponse(resp);

      var rankData = JSON.parse(body)[summonerId];
      var soloQData;
      for (var i = 0; i < rankData.length;  i++) {
        if (rankData[i].queue == 'RANKED_SOLO_5x5') {
          soloQData = rankData[i];
          break;
        }
      }

      if (soloQData) {
        lol.soloQueueTier = soloQData.tier;
        lol.soloQueueLeaguePoints = soloQData.entries[0].leaguePoints;
        lol.soloQueueDivision = soloQData.entries[0].division;
      }
    });

    url = 'https://global.api.pvp.net/api/lol/static-data/na/v1.2/versions?api_key=' + settings.lol_api_key;
    var versionPromise = Q.ninvoke(request, 'get', url).spread(function(resp, body) {
      assertGoodResponse(resp);

      var versionData = JSON.parse(body);
      lol.version = versionData[0];
    });

    return Q.all([rankedPromise, summaryPromise, soloQPromise, versionPromise]);
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
