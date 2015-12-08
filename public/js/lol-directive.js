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

app.directive('pwLolStats', function() {
  return {
    restrict: 'A', // attribute name only
    templateUrl: '/partials/lol-stats.html',
    scope: {
      stats: '=',
      isLoading: '=',
    },
    link: function(scope, element) {
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
