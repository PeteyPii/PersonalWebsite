function Medal() {}

Medal.getBreakpoint = function(value, breakpoints) {
  for (var i = 0; i < breakpoints.length; i++) {
    if (value < breakpoints[i]) {
      return i;
    }
  }

  return breakpoints.length;
};

Medal.medalImageSrc = function(value, breakpoints) {
  return '/imgs/lolmedals/' + Medal.breakpointToMedalSrc[Medal.getBreakpoint(value, breakpoints)] + '.png?v=' + gVersion;
};

Medal.medalImageAlt = function(value, breakpoints) {
  return Medal.breakpointToMedalAlt[Medal.getBreakpoint(value, breakpoints)];
};

Medal.rankedMedalImageSrc = function(tier, division) {
  if (tier && division) {
    if (tier in Medal.divisionlessTiers) {
      return '/imgs/lolmedals/' + tier.toLowerCase() + '.png?v=' + gVersion;
    } else {
      return '/imgs/lolmedals/' + tier.toLowerCase() + '-' + division.toLowerCase() + '.png?v=' + gVersion;
    }
  } else {
    return '/imgs/lolmedals/provisional.png?v=' + gVersion;
  }
};

Medal.rankedMedalImageAlt = function(tier) {
  return Medal.tierToAltText[tier] || 'Provisional tier icon for League of Legends';
};

Medal.prettyMasteryPoints = function(points) {
  if (points < 10000) {
    return points.toString();
  } else {
    return (points / 1000).toFixed(1) + 'K';
  }
};

Medal.masteryScoreBreakpoints = [10, 50, 100, 250, 500];
Medal.masteryPointsBreakpoints = [10000, 100000, 500000, 1000000, 2500000];

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
  'UNRANKED': true,
  'MASTER': true,
  'CHALLENGER': true,
};

Medal.tierToPrettyTier = {
  'UNRANKED': 'Unranked',
  'BRONZE': 'Bronze',
  'SILVER': 'Silver',
  'GOLD': 'Gold',
  'PLATINUM': 'Platinum',
  'DIAMOND': 'Diamond',
  'MASTER': 'Master',
  'CHALLENGER': 'Challenger',
};

Medal.tierToAltText = {
  'UNRANKED': 'Unranked tier icon for League of Legends',
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
    templateUrl: '/partials/lol-stats.html?v=' + gVersion,
    scope: {},
    controller: ['$scope', function($scope) {
      $scope.stats = {};
      $scope.loading = true;
      $scope.error = false;
      $http.get('/api/lol').then(function(resp) {
        var stats = resp.data;
        $scope.stats = stats;

        $scope.soloQueueRank = Medal.divisionlessTiers[stats.soloQueue.tier] ?
          Medal.tierToPrettyTier[stats.soloQueue.tier] :
          (Medal.tierToPrettyTier[stats.soloQueue.tier] + ' ' + stats.soloQueue.division);
        $scope.soloQueueMedalSrc = Medal.rankedMedalImageSrc(stats.soloQueue.tier, stats.soloQueue.division);
        $scope.soloQueueMedalAlt = Medal.rankedMedalImageAlt(stats.soloQueue.tier);

        $scope.flexRank = Medal.divisionlessTiers[stats.flex.tier] ?
          Medal.tierToPrettyTier[stats.flex.tier] :
          (Medal.tierToPrettyTier[stats.flex.tier] + ' ' + stats.flex.division);
        $scope.flexMedalSrc = Medal.rankedMedalImageSrc(stats.flex.tier, stats.flex.division);
        $scope.flexMedalAlt = Medal.rankedMedalImageAlt(stats.flex.tier);

        $scope.threesRank = Medal.divisionlessTiers[stats.threes.tier] ?
          Medal.tierToPrettyTier[stats.threes.tier] :
          (Medal.tierToPrettyTier[stats.threes.tier] + ' ' + stats.threes.division);
        $scope.threesMedalSrc = Medal.rankedMedalImageSrc(stats.threes.tier, stats.threes.division);
        $scope.threesMedalAlt = Medal.rankedMedalImageAlt(stats.threes.tier);

        $scope.totalMasteryPoints = Medal.prettyMasteryPoints(stats.masteryPoints);
        $scope.masteryScoreMedalSrc = Medal.medalImageSrc(stats.masteryScore, Medal.masteryScoreBreakpoints);
        $scope.masteryScoreMedalAlt = Medal.medalImageAlt(stats.masteryScore, Medal.masteryScoreBreakpoints);
        $scope.masteryPointsMedalSrc = Medal.medalImageSrc(stats.masteryPoints, Medal.masteryPointsBreakpoints);
        $scope.masteryPointsMedalAlt = Medal.medalImageAlt(stats.masteryPoints, Medal.masteryPointsBreakpoints);

        $scope.summonerIconSrc = '//ddragon.leagueoflegends.com/cdn/' + stats.version + '/img/profileicon/' + stats.profileIconId + '.png';

        for (var i = 0; i < stats.topChamps.length; i++) {
          var topChamp = stats.topChamps[i];
          topChamp.points = Medal.prettyMasteryPoints(topChamp.points);
          topChamp.image = '//ddragon.leagueoflegends.com/cdn/' + stats.version + '/img/champion/' + topChamp.image;
        }
        while (stats.topChamps.length < 4) {
          stats.topChamps.push({
            points: '0',
            image: '//ddragon.leagueoflegends.com/cdn/' + stats.version + '/img/champion/Teemo.png',
          });
        }

        $scope.loading = false;
      }, function() {
        $scope.error = true;
        $scope.loading = false;
      });
    }],
  };
}]);
