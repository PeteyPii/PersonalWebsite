var app = angular.module('pwApp', [
  'ngRoute',
]);

app.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider.when('/home', {
      templateUrl: '/views/home.html?v=' + gVersion,
      controller: 'HomeController',
      caseInsensitiveMatch: true,
    }).when('/', {
      redirectTo: '/home'
    }).when('/projects', {
      templateUrl: '/views/projects.html?v=' + gVersion,
      controller: 'ProjectsController',
      caseInsensitiveMatch: true,
    }).when('/resume', {
      templateUrl: '/views/resume.html?v=' + gVersion,
      controller: 'ResumeController',
      caseInsensitiveMatch: true,
    }).when('/about-me', {
      templateUrl: '/views/about-me.html?v=' + gVersion,
      controller: 'AboutMeController',
      caseInsensitiveMatch: true,
    }).when('/about', {
      templateUrl: '/views/about.html?v=' + gVersion,
      controller: 'AboutController',
      caseInsensitiveMatch: true,
    }).when('/meteorite', {
      templateUrl: '/views/game.html?v=' + gVersion,
      controller: 'GameController',
      caseInsensitiveMatch: true,
    }).when('/licenses', {
      templateUrl: '/views/licenses.html?v=' + gVersion,
      controller: 'LicensesController',
      caseInsensitiveMatch: true,
    }).when('/privacy-policy', {
      templateUrl: '/views/privacy.html?v=' + gVersion,
      controller: 'PrivacyPolicyController',
      caseInsensitiveMatch: true,
    }).otherwise({
      templateUrl: '/views/404.html?v=' + gVersion,
      controller: 'MissingPageController',
    });

    $locationProvider.html5Mode(true);
  }
]);

app.run(['$location', '$rootScope', '$window', function($location, $rootScope, $window) {
  $rootScope.$on('$viewContentLoaded', function() {
    // This isn't in $routeChangeSuccess since that event gets fired multiple times for redirects.
    if ($window.ga) {
      $window.ga('send', 'pageview', $location.path());
    }
  });

  $rootScope.activeNavLinks = {};
  $rootScope.setActiveNavLink = function(activeItem) {
    for (var item in $rootScope.activeNavLinks) {
      $rootScope.activeNavLinks[item] = false;
    }
    $rootScope.activeNavLinks[activeItem] = true;
  };
}]);

$(document).ready(function() {
  $('.navbar-nav>li>a, .navbar-brand').click(function() {
    $(this).blur();
  });
});
