app.controller('HomeController', ['$scope', '$rootScope',
  function ($scope, $rootScope) {
    $rootScope.activeNavLinks.home = true;
  }
]);

app.controller('ProjectsController', ['$scope', '$rootScope', '$http',
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

app.controller('ResumeController', ['$scope', '$rootScope',
  function ($scope, $rootScope) {
    $rootScope.activeNavLinks.resume = true;
  }
]);

app.controller('AboutMeController', ['$scope', '$rootScope',
  function ($scope, $rootScope) {
    $rootScope.activeNavLinks.aboutMe = true;
  }
])

app.controller('MissingPageController', ['$scope',
  function ($scope) {
  }
]);
