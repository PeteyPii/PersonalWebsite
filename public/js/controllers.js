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

controllers.controller('GameController', ['$scope',
  function ($scope) {
    $('#begin-game-btn').click(function() {
      $('.main-site').hide();
      document.body.scrollTop = 0; // pull the page back up to the top
      $('body').addClass('game-mode');
      $('#game-container').show();

      var canvas = document.getElementById('game-canvas')
      var isSupported = !!canvas.getContext;
      var ctx = canvas.getContext('2d');

      function draw() {
        if (isSupported) {
          var width  = ctx.canvas.width  = window.innerWidth;
          var height = ctx.canvas.height = window.innerHeight;

          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, width, height);

          var path = new Path2D();

          path.moveTo(width / 2 + 25, height / 2);
          path.lineTo(width / 2, height / 2 + 25);
          path.lineTo(width / 2 - 25, height / 2);
          path.lineTo(width / 2, height / 2 - 25);
          path.lineTo(width / 2 + 25, height / 2);

          ctx.fillStyle = 'white';
          ctx.fill(path);
        }
      }

      draw();
    });
  }
]);
