app.controller('HomeController', ['$scope', '$rootScope',
  function ($scope, $rootScope) {
    $rootScope.setActiveNavLink('home');
    $rootScope.title = 'Home';
  }
]);

app.controller('ProjectsController', ['$scope', '$rootScope', '$http',
  function ($scope, $rootScope, $http) {
    $rootScope.setActiveNavLink('projects');
    $rootScope.title = 'Projects';

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
    $rootScope.title = 'Resume';
  }
]);

app.controller('AboutMeController', ['$scope', '$rootScope',
  function ($scope, $rootScope) {
    $rootScope.setActiveNavLink('aboutMe');
    $rootScope.title = 'About Me';
  }
]);

app.controller('MissingPageController', ['$scope', '$rootScope',
  function ($scope, $rootScope) {
    $rootScope.setActiveNavLink('none');
    $rootScope.title = 'Page Does Not Exist';
  }
]);
