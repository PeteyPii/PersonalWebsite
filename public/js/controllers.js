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

    $scope.problemsSolved = '90+';
    $http.get('/api/euler').then(function(resp) {
      $scope.problemsSolved = resp.data.problemsSolved;
    }, function() {
      // Silently fail since we have a default value which is sufficient.
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

app.controller('AboutController', ['$scope', '$rootScope',
  function ($scope, $rootScope) {
    $rootScope.setActiveNavLink('none');
    $rootScope.title = 'About';
  }
]);

app.controller('LicensesController', ['$scope', '$rootScope',
  function ($scope, $rootScope) {
    $rootScope.setActiveNavLink('none');
    $rootScope.title = 'Licenses';
  }
]);

app.controller('PrivacyPolicyController', ['$scope', '$rootScope',
  function ($scope, $rootScope) {
    $rootScope.setActiveNavLink('none');
    $rootScope.title = 'Privacy Policy';
  }
]);

app.controller('MissingPageController', ['$scope', '$rootScope',
  function ($scope, $rootScope) {
    $rootScope.setActiveNavLink('none');
    $rootScope.title = 'Page Does Not Exist';
  }
]);
