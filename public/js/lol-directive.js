function Medal() {}

Medal.getBreakpoint = function(value, breakpoints) {
  for (var i = 0; i < breakpoints.length; i++) {
    if (value <= breakpoints[i]) {
      return i;
    }
  }

  return breakpoints.length;
}

Medal.medalImage = function(value, breakpoints) {
  return '/imgs/lolmedals/' + Medal.breakpointToMedal[Medal.getBreakpoint(value, breakpoints)] + '.png';
}

Medal.medalRankImage = function(tier, division) {
  if (tier && division) {
    if (tier in Medal.divisionlessTiers) {
      return '/imgs/lolmedals/' + tier.toLowerCase() + '.png';
    } else {
      return '/imgs/lolmedals/' + tier.toLowerCase() + '-' + division.toLowerCase() + '.png';
    }
  } else {
    return '/imgs/lolmedals/provisional.png';
  }
}

Medal.soloQueueTakedownsBreakpoints = [50, 250, 1000, 2500, 5000];
Medal.soloQueueWinsBreakpoints = [1, 10, 25, 50, 100];

Medal.normalTakedownsBreakpoints = [100, 500, 2500, 5000, 10000];
Medal.normalWinsBreakpoints = [5, 25, 100, 300, 600];
Medal.normalCreepScoreBreakpoints = [2000, 10000, 50000, 100000, 200000];

Medal.aramTakedownsBreakpoints = [100, 500, 2500, 5000, 10000];
Medal.aramWinsBreakpoints = [5, 25, 100, 300, 600];
Medal.aramTowersBreakpoints = [5, 25, 100, 200, 500];

Medal.breakpointToMedal = [
  'none',
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
];

Medal.divisionlessTiers = {
  'MASTER': true,
  'CHALLENGER': true,
};

app.directive('pwLolStats', function() {
  return {
    restrict: 'A', // attribute name only
    templateUrl: '/partials/lol-stats.html',
    scope: {
      stats: '=',
      isLoading: '=',
    },
    link: function(scope, element) {
      scope.selected = 'ranked';

      scope.rankedClick = function() {
        scope.selected = 'ranked';
      }

      scope.normalsClick = function() {
        scope.selected = 'normals';
      }

      scope.aramClick = function() {
        scope.selected = 'aram';
      }

      scope.summonerIcon = function() {
        if (!scope.isLoading) {
          return '//ddragon.leagueoflegends.com/cdn/5.8.1/img/profileicon/' + scope.stats.profileIconId + '.png';
        }
      }

      var prettifiedTier = {
        'BRONZE': 'Bronze',
        'SILVER': 'Silver',
        'GOLD': 'Gold',
        'PLATINUM': 'Platinum',
        'DIAMOND': 'Diamond',
        'MASTER': 'Master',
        'CHALLENGER': 'Challenger',
      };

      scope.soloQueueRank = function() {
        return prettifiedTier[scope.stats.soloQueueTier] + ' ' + scope.stats.soloQueueDivision;
      }

      scope.soloQueueTakedownsMedal = function() {
        return Medal.medalImage(scope.stats.soloQueueKills + scope.stats.soloQueueAssists, Medal.soloQueueTakedownsBreakpoints);
      }

      scope.soloQueueRankMedal = function() {
        return Medal.medalRankImage(scope.stats.soloQueueTier, scope.stats.soloQueueDivision);
      }

      scope.soloQueueWinsMedal = function() {
        return Medal.medalImage(scope.stats.soloQueueWins, Medal.soloQueueWinsBreakpoints);
      }

      scope.normalTakedownsMedal = function() {
        return Medal.medalImage(scope.stats.normalKills + scope.stats.normalAssists, Medal.normalTakedownsBreakpoints);
      }

      scope.normalWinsMedal = function() {
        return Medal.medalImage(scope.stats.normalWins, Medal.normalWinsBreakpoints);
      }

      scope.normalCreepScoreMedal = function() {
        return Medal.medalImage(scope.stats.normalCreepScore, Medal.normalCreepScoreBreakpoints);
      }

      scope.aramTakedownsMedal = function() {
        return Medal.medalImage(scope.stats.aramKills + scope.stats.aramAssists, Medal.aramTakedownsBreakpoints);
      }

      scope.aramWinsMedal = function() {
        return Medal.medalImage(scope.stats.aramWins, Medal.aramWinsBreakpoints);
      }

      scope.aramTowersMedal = function() {
        return Medal.medalImage(scope.stats.aramTurretKills, Medal.aramTowersBreakpoints);
      }

      scope.$watch('stats', function(value) {
        if (scope.isLoading) {
          scope.loading = true;
        } else {
          scope.loading = false;
        }
      });
    },
  };
});
