var controllers = angular.module('controllers', []);

controllers.controller('HomeController', ['$scope', '$rootScope',
  function ($scope, $rootScope) {
    $rootScope.activeNavLinks.home = true;
  }
]);

controllers.controller('ProjectsController', ['$scope', '$rootScope', '$http',
  function ($scope, $rootScope, $http) {
    $rootScope.activeNavLinks.projects = true;
    $scope.problemsSolved = '75+';
    $http.get('/api/Euler').success(function(data) {
      $scope.problemsSolved = data.problemsSolved;
    }).error(function() {
      // Sliently fail since we have a default value which is sufficient.
    });
  }
]);

controllers.controller('ResumeController', ['$scope', '$rootScope',
  function ($scope, $rootScope) {
    $rootScope.activeNavLinks.resume = true;
  }
]);

controllers.controller('AboutController', ['$scope', '$rootScope', '$http',
  function ($scope, $rootScope, $http) {
    $rootScope.activeNavLinks.aboutMe = true;

    aramTakedownsBreakpoints = [100, 500, 2500, 5000, 10000];
    aramWinsBreakpoints = [5, 25, 100, 300, 600];
    aramTowersBreakpoints = [5, 25, 100, 200, 500];

    function getBreakpoint(value, breakpoints) {
      for (var i = 0; i < breakpoints.length; i++) {
        if (value <= breakpoints[i]) {
          return i;
        }
      }

      return breakpoints.length;
    }

    breakpointToMedal = [
      'none',
      'bronze',
      'silver',
      'gold',
      'platinum',
      'diamond',
    ];

    function medalImage(value, breakpoints) {
      return '/imgs/lolmedals/' + breakpointToMedal[getBreakpoint(value, breakpoints)] + '.png';
    }

    function aramTakedownsMedal() {
      return medalImage($scope.lol.aramKills + $scope.lol.aramAssists, aramTakedownsBreakpoints);
    }

    function aramWinsMedal() {
      return medalImage($scope.lol.aramWins, aramWinsBreakpoints);
    }

    function aramTowersMedal() {
      return medalImage($scope.lol.aramTurretKills, aramTowersBreakpoints);
    }

    $http.get('/api/LoL').success(function(data) {
      $scope.lol = data;
      $scope.aramTakedownsMedal = aramTakedownsMedal;
      $scope.aramWinsMedal = aramWinsMedal;
      $scope.aramTowersMedal = aramTowersMedal;
    }).error(function() {
      // TODO: Handle this
    });
  }
])

controllers.controller('MissingPageController', ['$scope',
  function ($scope) {
  }
]);
