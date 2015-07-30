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

      function tripleToColour(triple) {
        return 'rgb(' + (triple[0] | 0) + ',' + (triple[1] | 0) + ',' + (triple[2] | 0) + ')';
      }

      // Constants
      var bgColour = 'black';

      var gemSize = 0.01;
      var gemLineThickness = 1 / 750;
      var gemSizeInnerFactor = 0.6;
      var gemColour = [255, 255, 255];
      var gemShadeFactor = 0.6;
      var gemShadedColour = gemColour.map(function(c) { return (c * gemShadeFactor) | 0});

      var wallDistance = 0.03;
      var wallHalfWidth = 2 * Math.PI * 0.15;
      var wallColour = '#ffffff';
      var wallThickness = 1 / 500;

      var bgSegments = 16;

      // Must have 2 elements, if a constant function is desired
      // put the constant value twice
      var bgColourFunction = [
        [0,   0,   0],
        [255, 0,   0],
        [255, 255, 0],
        [0,   255, 0],
        [0,   255, 255],
        [0,   0,   255],
        [255, 0,   255],
        [255, 255, 255]
      ];

      function bgColourCalculation(progress) {
        progress = Math.max(Math.min(1, progress), 0);

        if (progress == 1) {
          return bgColourFunction[bgColourFunction.length - 1];
        }

        var ix = Math.floor(progress * (bgColourFunction.length - 1));
        var frac = progress * (bgColourFunction.length - 1) - ix;

        return tripleToColour([
          bgColourFunction[ix][0] * (1 - frac) + bgColourFunction[ix + 1][0] * frac,
          bgColourFunction[ix][1] * (1 - frac) + bgColourFunction[ix + 1][1] * frac,
          bgColourFunction[ix][2] * (1 - frac) + bgColourFunction[ix + 1][2] * frac,
        ]);
      }

      // Semi-constants for stuff that only changes sometimes (e.f=g. on screen resize)
      var width;
      var height;
      var midX;
      var midY;
      var scale;

      var bgSegmentPaths = [];
      for (var i = 0; i < bgSegments; i++) {
        bgSegmentPaths.push(null);
      }

      var gemInnerPath = null;
      var gemOuterPath = null;

      // Variable declarations
      var wallAngle;
      var bgProgress = [];
      for (var i = 0; i < bgSegments; i++) {
        bgProgress.push(0);
      }

      function step() {
        wallAngle = Math.atan2(cursorY - midY, cursorX - midX);
      }

      function screenResize() {
        // Update certain semi-constants after the screen size changes
        width  = ctx.canvas.width  = window.innerWidth;
        height = ctx.canvas.height = window.innerHeight;
        midX = width / 2;
        midY = height / 2;
        scale = Math.sqrt(width*width + height*height);

        // Bg updates
        for (var i = 0; i < bgSegments; i++) {
          bgSegmentPaths[i] = new Path2D();

          bgSegmentPaths[i].moveTo(midX, midY);
          bgSegmentPaths[i].lineTo(midX + scale * Math.cos(2 * Math.PI / bgSegments * i), midY + scale * Math.sin(2 * Math.PI / bgSegments * i));
          bgSegmentPaths[i].lineTo(midX + scale * Math.cos(2 * Math.PI / bgSegments * (i + 1)), midY + scale * Math.sin(2 * Math.PI / bgSegments * (i + 1)));
        }

        // Gem updates
        gemInnerPath = new Path2D();

        gemInnerPath.moveTo(midX + scale * gemSize, midY);
        gemInnerPath.lineTo(midX, midY + scale * gemSize);
        gemInnerPath.lineTo(midX - scale * gemSize, midY);
        gemInnerPath.lineTo(midX, midY - scale * gemSize);
        gemInnerPath.lineTo(midX + scale * gemSize, midY);

        gemOuterPath = new Path2D();

        gemOuterPath.moveTo(midX + scale * gemSize, midY);
        gemOuterPath.lineTo(midX, midY + scale * gemSize);
        gemOuterPath.lineTo(midX - scale * gemSize, midY);
        gemOuterPath.lineTo(midX, midY - scale * gemSize);
        gemOuterPath.lineTo(midX + scale * gemSize, midY);

        gemOuterPath.lineTo(midX + scale * gemSize * gemSizeInnerFactor, midY);
        gemOuterPath.lineTo(midX, midY + scale * gemSize * gemSizeInnerFactor);
        gemOuterPath.lineTo(midX, midY + scale * gemSize);
        gemOuterPath.lineTo(midX, midY + scale * gemSize * gemSizeInnerFactor);
        gemOuterPath.lineTo(midX - scale * gemSize * gemSizeInnerFactor, midY);
        gemOuterPath.lineTo(midX - scale * gemSize, midY);
        gemOuterPath.lineTo(midX - scale * gemSize * gemSizeInnerFactor, midY);
        gemOuterPath.lineTo(midX, midY - scale * gemSize * gemSizeInnerFactor);
        gemOuterPath.lineTo(midX, midY - scale * gemSize);
        gemOuterPath.lineTo(midX, midY - scale * gemSize * gemSizeInnerFactor);
        gemOuterPath.lineTo(midX + scale * gemSize * gemSizeInnerFactor, midY);
      }

      function draw() {
        // Draw bg
        for (var i = 0; i < bgSegments; i++) {
          ctx.fillStyle = bgColourCalculation(bgProgress[i]);
          ctx.fill(bgSegmentPaths[i]);
        }

        // Draw gem
        ctx.fillStyle = tripleToColour(gemShadedColour);
        ctx.fill(gemInnerPath);

        ctx.lineWidth = scale * gemLineThickness;
        ctx.strokeStyle = tripleToColour(gemColour);
        ctx.stroke(gemOuterPath);

        // Draw wall
        var path = new Path2D();

        path.arc(midX, midY, scale * wallDistance, wallAngle - wallHalfWidth, wallAngle + wallHalfWidth, false);

        ctx.lineWidth = scale * wallThickness;
        ctx.strokeStyle = wallColour;
        ctx.stroke(path);
      }

      function gameLoop() {
        if (width !== window.innerWidth || height !== window.innerHeight) {
          screenResize();
        }

        step();
        draw();
      }

      if (isSupported) {
        setInterval(gameLoop, 16);
      } else {
        // TODO: Make user aware that the game isn't available to them
      }
    });
  }
]);
