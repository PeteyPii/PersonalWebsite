app.controller('HomeController', ['$scope', '$rootScope',
  function ($scope, $rootScope) {
    $rootScope.setActiveNavLink('home');
  }
]);

app.controller('ProjectsController', ['$scope', '$rootScope', '$http',
  function ($scope, $rootScope, $http) {
    $rootScope.setActiveNavLink('projects');
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
    $rootScope.setActiveNavLink('resume');
  }
]);

app.controller('AboutMeController', ['$scope', '$rootScope',
  function ($scope, $rootScope) {
    $rootScope.setActiveNavLink('aboutMe');
  }
]);

app.controller('MissingPageController', ['$scope', '$rootScope',
  function ($scope, $rootScope) {
    $rootScope.setActiveNavLink('none');
  }
]);
