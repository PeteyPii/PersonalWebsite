var express = require('express');
var git = require('git-rev');
var _ = require('lodash');
var request = require('request');

var Cache = require('./cache.js');
var logger = require('./logger.js');
var settings = require('./settings.js');

var api = express.Router();

var cache = new Cache();
cache.addUpdateHandler('euler', function(callback) {
  request.get('http://projecteuler.net/profile/BasicBananas.txt', function(err, resp, body) {
    if (err) {
      callback(err);
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
  request.get('https://na.api.pvp.net/api/lol/na/v1.4/summoner/by-name/' + settings.summoner_name + '?api_key=' + settings.lol_api_key, function(err, resp, body) {
    if (err) {
      callback(err)
      return;
    }

    var summonerData = JSON.parse(body);
    var summonerId = summonerData[settings.summoner_name.toLowerCase()].id;
    lol.summonerId = summonerId;

    var hadErr = false;
    var successes = 3;

    request.get('https://na.api.pvp.net/api/lol/na/v1.3/stats/by-summoner/' + summonerId + '/ranked?api_key=' + settings.lol_api_key, function(err, resp, body) {
      if (hadErr) {
        return;
      }

      if (err) {
        hadErr = true;
        callback(err);
        return;
      }

      var rankedData = JSON.parse(body);
      var allStats;
      for (var i = 0; i < rankedData.champions.length; i++) {
        if (rankedData.champions[i].id == 0) {
          allStats = rankedData.champions[i].stats;
        }
      }

      lol.rankedGamesPlayed = allStats.totalSessionsPlayed;
      lol.rankedAssists = allStats.totalAssists;
      lol.rankedKills = allStats.totalChampionKills;
      lol.rankedCreepScore = allStats.totalMinionKills + allStats.totalNeutralMinionsKilled;

      successes -= 1;
      if (successes === 0) {
        callback(null, lol);
      }
    });

    request.get('https://na.api.pvp.net/api/lol/na/v1.3/stats/by-summoner/' + summonerId + '/summary?api_key=' + settings.lol_api_key, function(err, resp, body) {
      if (hadErr) {
        return;
      }

      if (err) {
        hadErr = true;
        callback(err);
        return;
      }

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

      successes -= 1;
      if (successes === 0) {
        callback(null, lol);
      }
    });

    request.get('https://na.api.pvp.net/api/lol/na/v2.5/league/by-summoner/' + summonerId + '/entry?api_key=' + settings.lol_api_key, function(err, resp, body) {
      if (hadErr) {
        return;
      }

      if (err) {
        hadErr = true;
        callback(err);
        return;
      }

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

      successes -= 1;
      if (successes === 0) {
        callback(null, lol);
      }
    });
  });
});

api.get('/Euler', function(req, res) {
  cache.get('euler', function(err, data) {
    if (err) {
      res.status(500);
      res.end();
    } else {
      res.send(data);
    }
  });
});

api.get('/LoL', function(req, res) {
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
    });
  });
});

module.exports = api;
