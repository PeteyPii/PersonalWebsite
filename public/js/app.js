var app = angular.module('app', [
  'ngRoute',
  'controllers'
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
      templateUrl: 'views/about.html',
      controller: 'AboutController',
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
  $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
    // Have to check for $$route presence because it's missing for bad URL requests.
    $rootScope.title = current.$$route ? current.$$route.title : '';
  });

  $rootScope.$on('$viewContentLoaded', function() {
    if ($window.ga) {
      $window.ga('send', 'pageview', $location.path());
    }
  });

  $rootScope.activeNavLinks = {};
  $rootScope.navLinkClick = function navLinkClick(itemClicked) {
    for (var item in $rootScope.activeNavLinks) {
      $rootScope.activeNavLinks[item] = false;
    }
    $rootScope.activeNavLinks[itemClicked] = true;
  };
}]);

$(document).ready(function() {
  $('.navbar-nav>li>a, .navbar-brand').click(function() {
    $(this).blur();
  });
});
