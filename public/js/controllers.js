var controllers = angular.module('controllers', []);

controllers.controller('HomeController', ['$scope',
  function ($scope) {
    $('.navbar-nav>li').removeClass('active');
    $('.navbar-nav>li#nav-home').addClass('active');
  }
]);

controllers.controller('ProjectsController', ['$scope',
  function ($scope) {
    $('.navbar-nav>li').removeClass('active');
    $('.navbar-nav>li#nav-projects').addClass('active');
  }
]);

controllers.controller('ResumeController', ['$scope',
  function ($scope) {
    $('.navbar-nav>li').removeClass('active');
    $('.navbar-nav>li#nav-resume').addClass('active');
  }
]);

controllers.controller('AboutController', ['$scope',
  function ($scope) {
    $('.navbar-nav>li').removeClass('active');
    $('.navbar-nav>li#nav-about').addClass('active');
  }
])

controllers.controller('MissingPageController', ['$scope',
  function ($scope) {
    $('.navbar-nav>li').removeClass('active');
  }
]);
