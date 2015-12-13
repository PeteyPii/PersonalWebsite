var app = angular.module('pwApp', [
  'ngRoute',
]);

app.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider.
    when('/Home', {
      templateUrl: 'views/home.html',
      controller: 'HomeController',
      title: 'Home'
    }).
    when('/', {
      redirectTo: '/Home'
    }).
    when('/Projects', {
      templateUrl: 'views/projects.html',
      controller: 'ProjectsController',
      title: 'Projects'
    }).
    when('/Resume', {
      templateUrl: 'views/resume.html',
      controller: 'ResumeController',
      title: 'Resume'
    }).
    when('/AboutMe', {
      templateUrl: 'views/about-me.html',
      controller: 'AboutMeController',
      title: 'About Me'
    }).
    otherwise({
      templateUrl: 'views/404.html',
      controller: 'MissingPageController',
      title: 'Page Does Not Exist'
    });

    $locationProvider.html5Mode(true);
  }]);

app.run(['$location', '$rootScope', '$window', function($location, $rootScope, $window) {
  $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
    // Have to check for $$route presence because it's missing for bad URL requests.
    $rootScope.title = current.$$route ? current.$$route.title : '';
  });

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
