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

      var cursorX;
      var cursorY;

      document.onmousemove = function(e) {
        cursorX = e.pageX;
        cursorY = e.pageY;
      }

      document.onmouseenter = function(e) {
        cursorX = e.pageX;
        cursorY = e.pageY;
      }

      var canvas = document.getElementById('game-canvas')
      var isSupported = !!canvas.getContext;
      var ctx = canvas.getContext('2d');

      // Constants
      var bgColour = 'black';

      var gemSize = 0.01;
      var gemSizeInnerFactor = 0.6;
      var gemColour = [255, 255, 255];
      var gemShadeFactor = 0.6;
      var gemShadedColour = gemColour.map(function(c) { return (c * gemShadeFactor) | 0});

      var wallDistance = 0.03;
      var wallHalfWidth = 2 * Math.PI * 0.15;
      var wallColour = '#ffffff'

      function tripleToColour(triple) {
        return 'rgb(' + triple[0] + ',' + triple[1] + ',' + triple[2] + ')';
      }

      function draw() {
        if (isSupported) {
          var width  = ctx.canvas.width  = window.innerWidth;
          var height = ctx.canvas.height = window.innerHeight;
          var midX = width / 2;
          var midY = height / 2;
          var scale = Math.sqrt(width*width + height*height);
          var wallAngle = Math.atan2(cursorY - midY, cursorX - midX);

          ctx.fillStyle = bgColour;
          ctx.fillRect(0, 0, width, height);

          // draw gem
          var path = new Path2D();

          path.moveTo(midX + scale * gemSize, midY);
          path.lineTo(midX, midY + scale * gemSize);
          path.lineTo(midX - scale * gemSize, midY);
          path.lineTo(midX, midY - scale * gemSize);
          path.lineTo(midX + scale * gemSize, midY);

          ctx.fillStyle = tripleToColour(gemShadedColour);
          ctx.fill(path);

          path = new Path2D();

          path.moveTo(midX + scale * gemSize, midY);
          path.lineTo(midX, midY + scale * gemSize);
          path.lineTo(midX - scale * gemSize, midY);
          path.lineTo(midX, midY - scale * gemSize);
          path.lineTo(midX + scale * gemSize, midY);

          path.lineTo(midX + scale * gemSize * gemSizeInnerFactor, midY);
          path.lineTo(midX, midY + scale * gemSize * gemSizeInnerFactor);
          path.lineTo(midX, midY + scale * gemSize);
          path.lineTo(midX, midY + scale * gemSize * gemSizeInnerFactor);
          path.lineTo(midX - scale * gemSize * gemSizeInnerFactor, midY);
          path.lineTo(midX - scale * gemSize, midY);
          path.lineTo(midX - scale * gemSize * gemSizeInnerFactor, midY);
          path.lineTo(midX, midY - scale * gemSize * gemSizeInnerFactor);
          path.lineTo(midX, midY - scale * gemSize);
          path.lineTo(midX, midY - scale * gemSize * gemSizeInnerFactor);
          path.lineTo(midX + scale * gemSize * gemSizeInnerFactor, midY);

          ctx.strokeStyle = tripleToColour(gemColour);
          ctx.stroke(path);

          // draw wall
          path = new Path2D();

          path.arc(midX, midY, scale * wallDistance, wallAngle - wallHalfWidth, wallAngle + wallHalfWidth, false);

          ctx.strokeStyle = wallColour;
          ctx.stroke(path);
        }
      }

      setInterval(draw, 33);
    });
  }
]);
