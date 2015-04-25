var app = angular.module('app', [
  'ngRoute',
  'controllers'
]);

app.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider.
    when('/Home', {
      templateUrl: 'templates/home.html',
      controller: 'HomeController',
      title: 'Home - '
    }).
    when('/', {
      redirectTo: '/Home'
    }).
    when('/Projects', {
      templateUrl: 'templates/projects.html',
      controller: 'ProjectsController',
      title: 'Projects - '
    }).
    when('/Resume', {
      templateUrl: 'templates/resume.html',
      controller: 'ResumeController',
      title: 'Resume - '
    }).
    when('/AboutMe', {
      templateUrl: 'templates/about.html',
      controller: 'AboutController',
      title: 'About Me - '
    }).
    otherwise({
      templateUrl: 'templates/404.html',
      controller: 'MissingPageController',
      title: 'Page Does Not Exist - '
    });

    $locationProvider.html5Mode(true);
  }]);

app.run(['$location', '$rootScope', function($location, $rootScope) {
  $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
    // Have to check for $$route presence because it's missing for bad URL requests.
    $rootScope.title = current.$$route ? current.$$route.title : '';
  });
}]);

$(document).ready(function() {
  $('.navbar-nav>li>a, .navbar-brand').click(function() {
    $(this).blur();
  });
});
