function Medal() {}

Medal.getBreakpoint = function(value, breakpoints) {
  for (var i = 0; i < breakpoints.length; i++) {
    if (value <= breakpoints[i]) {
      return i;
    }
  }

  return breakpoints.length;
}

Medal.medalImageSrc = function(value, breakpoints) {
  return '/imgs/lolmedals/' + Medal.breakpointToMedalSrc[Medal.getBreakpoint(value, breakpoints)] + '.png';
}

Medal.medalImageAlt = function(value, breakpoints) {
  return Medal.breakpointToMedalAlt[Medal.getBreakpoint(value, breakpoints)];
}

Medal.rankedMedalImageSrc = function(tier, division) {
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

Medal.rankedMedalImageAlt = function(tier) {
  return Medal.tierToAltText[tier] || 'Provisional tier icon for League of Legends';
}

Medal.soloQueueTakedownsBreakpoints = [50, 250, 1000, 2500, 5000];
Medal.soloQueueWinsBreakpoints = [1, 10, 25, 50, 100];

Medal.normalTakedownsBreakpoints = [100, 500, 2500, 5000, 10000];
Medal.normalWinsBreakpoints = [5, 25, 100, 300, 600];
Medal.normalCreepScoreBreakpoints = [2000, 10000, 50000, 100000, 200000];

Medal.aramTakedownsBreakpoints = [100, 500, 2500, 5000, 10000];
Medal.aramWinsBreakpoints = [5, 25, 100, 300, 600];
Medal.aramTowersBreakpoints = [5, 25, 100, 200, 500];

Medal.breakpointToMedalSrc = [
  'none',
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
];

Medal.breakpointToMedalAlt = [
  'Provisional tier icon for League of Legends',
  'Bronze tier icon for League of Legends',
  'Silver tier icon for League of Legends',
  'Gold tier icon for League of Legends',
  'Platinum tier icon for League of Legends',
  'Diamond tier icon for League of Legends',
];

Medal.divisionlessTiers = {
  'MASTER': true,
  'CHALLENGER': true,
};

Medal.tierToPrettyTier = {
  'BRONZE': 'Bronze',
  'SILVER': 'Silver',
  'GOLD': 'Gold',
  'PLATINUM': 'Platinum',
  'DIAMOND': 'Diamond',
  'MASTER': 'Master',
  'CHALLENGER': 'Challenger',
};

Medal.tierToAltText = {
  'BRONZE': 'Bronze tier icon for League of Legends',
  'SILVER': 'Silver tier icon for League of Legends',
  'GOLD': 'Gold tier icon for League of Legends',
  'PLATINUM': 'Platinum tier icon for League of Legends',
  'DIAMOND': 'Diamond tier icon for League of Legends',
  'MASTER': 'Master tier icon for League of Legends',
  'CHALLENGER': 'Challenger tier icon for League of Legends',
};

app.directive('pwLolStats', ['$http', function($http) {
  return {
    restrict: 'A', // attribute name only
    templateUrl: '/partials/lol-stats.html',
    scope: {},
    controller: ['$scope', function($scope) {
      $scope.stats = {};
      $scope.loading = true;
      $scope.error = false;
      $http.get('/api/lol').success(function(data) {
        var stats = data;
        $scope.stats = stats;

        $scope.soloQueueRank = stats.soloQueueTier
          ? Medal.tierToPrettyTier[stats.soloQueueTier] + ' ' + stats.soloQueueDivision
          : 'Unranked';
        $scope.soloQueueTakedownsMedalSrc = Medal.medalImageSrc(stats.soloQueueKills + stats.soloQueueAssists, Medal.soloQueueTakedownsBreakpoints);
        $scope.soloQueueTakedownsMedalAlt = Medal.medalImageAlt(stats.soloQueueKills + stats.soloQueueAssists, Medal.soloQueueTakedownsBreakpoints);
        $scope.soloQueueRankMedalSrc = Medal.rankedMedalImageSrc(stats.soloQueueTier, stats.soloQueueDivision);
        $scope.soloQueueRankMedalAlt = Medal.rankedMedalImageAlt(stats.soloQueueTier);
        $scope.soloQueueWinsMedalSrc = Medal.medalImageSrc(stats.soloQueueWins, Medal.soloQueueWinsBreakpoints);
        $scope.soloQueueWinsMedalAlt = Medal.medalImageAlt(stats.soloQueueWins, Medal.soloQueueWinsBreakpoints);
        $scope.normalTakedownsMedalSrc = Medal.medalImageSrc(stats.normalKills + stats.normalAssists, Medal.normalTakedownsBreakpoints);
        $scope.normalTakedownsMedalAlt = Medal.medalImageSrc(stats.normalKills + stats.normalAssists, Medal.normalTakedownsBreakpoints);
        $scope.normalWinsMedalSrc = Medal.medalImageSrc(stats.normalWins, Medal.normalWinsBreakpoints);
        $scope.normalWinsMedalAlt = Medal.medalImageAlt(stats.normalWins, Medal.normalWinsBreakpoints);
        $scope.normalCreepScoreMedalSrc = Medal.medalImageSrc(stats.normalCreepScore, Medal.normalCreepScoreBreakpoints);
        $scope.normalCreepScoreMedalAlt = Medal.medalImageAlt(stats.normalCreepScore, Medal.normalCreepScoreBreakpoints);
        $scope.aramTakedownsMedalSrc = Medal.medalImageSrc(stats.aramKills + stats.aramAssists, Medal.aramTakedownsBreakpoints);
        $scope.aramTakedownsMedalAlt = Medal.medalImageAlt(stats.aramKills + stats.aramAssists, Medal.aramTakedownsBreakpoints);
        $scope.aramWinsMedalSrc = Medal.medalImageSrc(stats.aramWins, Medal.aramWinsBreakpoints);
        $scope.aramWinsMedalAlt = Medal.medalImageAlt(stats.aramWins, Medal.aramWinsBreakpoints);
        $scope.aramTowersMedalSrc = Medal.medalImageSrc(stats.aramTurretKills, Medal.aramTowersBreakpoints);
        $scope.aramTowersMedalAlt = Medal.medalImageAlt(stats.aramTurretKills, Medal.aramTowersBreakpoints);

        $scope.summonerIconSrc = '//ddragon.leagueoflegends.com/cdn/' + stats.version + '/img/profileicon/' + stats.profileIconId + '.png';

        $scope.loading = false;
      }).error(function() {
        $scope.error = true;
        $scope.loading = false;
      });
    }],
  };
}]);
