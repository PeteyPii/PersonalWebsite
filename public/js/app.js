var app = angular.module('pwApp', [
  'ngRoute',
]);

app.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider.when('/Home', {
      templateUrl: '/views/home.html',
      controller: 'HomeController',
    }).when('/', {
      redirectTo: '/Home'
    }).when('/Projects', {
      templateUrl: '/views/projects.html',
      controller: 'ProjectsController',
    }).when('/Resume', {
      templateUrl: '/views/resume.html',
      controller: 'ResumeController',
    }).when('/AboutMe', {
      templateUrl: '/views/about-me.html',
      controller: 'AboutMeController',
    }).otherwise({
      templateUrl: '/views/404.html',
      controller: 'MissingPageController',
    });

    $locationProvider.html5Mode(true);
  }]);

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
