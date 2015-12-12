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

controllers.controller('AboutController', ['$scope', '$rootScope',
  function ($scope, $rootScope) {
    $rootScope.activeNavLinks.aboutMe = true;
  }
])

controllers.controller('MissingPageController', ['$scope',
  function ($scope) {
  }
]);
