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

      function backToSite() {
        $('.main-site').show();
        $('body').removeClass('game-mode');
        $('#game-container').hide();
        clearInterval(loopHandle);
      }

      var prevCursorX;
      var prevCursorY;
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

      var enterCode = 13;
      var leftCode = 37;
      var upCode = 38;
      var rightCode = 39;
      var downCode = 40;
      var shiftXCode = 88;

      var trackedKeys = {};
      trackedKeys[enterCode]  = true;
      trackedKeys[leftCode]   = true;
      trackedKeys[upCode]     = true;
      trackedKeys[rightCode]  = true;
      trackedKeys[downCode]   = true;

      var prevKeysDown = {};
      prevKeysDown[enterCode]   = false;
      prevKeysDown[leftCode]    = false;
      prevKeysDown[upCode]      = false;
      prevKeysDown[rightCode]   = false;
      prevKeysDown[downCode]    = false;

      var keysDown = {};
      keysDown[enterCode]   = false;
      keysDown[leftCode]    = false;
      keysDown[upCode]      = false;
      keysDown[rightCode]   = false;
      keysDown[downCode]    = false;

      $(document).keydown(function(e) {
        if (trackedKeys[e.which]) {
          keysDown[e.which] = true;
        }
      }).keyup(function(e) {
        if (trackedKeys[e.which]) {
          keysDown[e.which] = false;
        }
      }).keypress(function(e) {
        if (e.which === shiftXCode) {
          backToSite();
        }
      });

      var canvas = document.getElementById('game-canvas')
      var isSupported = !!canvas.getContext;
      var ctx = canvas.getContext('2d');

      // Generic helper functions
      function tripleToColour(triple) {
        return 'rgb(' + triple + ')';
      }

      function quadToColour(quad) {
        return 'rgba(' + quad + ')';
      }

      function fontValue(font, size, modifiers) {
        return (modifiers ? modifiers + ' ' : '') + (size | 0) + 'px ' + font;
      }

      function angleDifference(x, y) {
        return Math.atan2(Math.sin(y - x), Math.cos(y - x));
      }

      function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
      }

      function pointInRect(px, py, rl, rt, rr, rb) {
        return px >= rl && px <= rr && py >= rt && py <= rb;
      }

      // Constants
      var titleStateId = 0;
      var playStateId = 1;

      var titleTextSize = 0.15;
      var menuItemSize = 0.05;
      var menuFont = 'Oswald';
      var menuTextColour = '#ffffff';

      var titleText = 'Mystery';
      var titleTextY = 0.3;

      var playText = 'Play Game';
      var playTextY = 0.6;

      var exitText = 'Exit';
      var exitTextY = 0.675;

      var itemSelected = -1;
      var itemPlayId = 0;
      var itemExitId = 1;
      var itemCount = 2;

      var itemSelectedMarkerSize = 0.02;
      var itemSelectedMarkerXOffset = 0.13;
      var itemSelectedMarkerSpeed = 0.005;
      var itemSelectedMarkerColour = '#ffffff';

      var menuItemActions = [];

      var bgColour = '#000000';

      var gemSize = 0.01;
      var gemLineThickness = 1 / 750;
      var gemSizeInnerFactor = 0.6;
      var gemColour = [255, 255, 255];
      var gemShadeFactor = 0.5;
      var gemShadedColour = gemColour.map(function(c) { return (c * gemShadeFactor) | 0; });
      var gemShadeOpacity = 0.75;
      gemShadedColour.push(gemShadeOpacity);

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
        [234, 234, 234],
        [128, 128, 128]
      ];

      function bgColourCalculation(progress) {
        progress = clamp(progress, 0, 1);

        if (progress == 1) {
          return tripleToColour(bgColourFunction[bgColourFunction.length - 1]);
        }

        var ix = Math.floor(progress * (bgColourFunction.length - 1));
        var frac = progress * (bgColourFunction.length - 1) - ix;

        return tripleToColour([
          (bgColourFunction[ix][0] * (1 - frac) + bgColourFunction[ix + 1][0] * frac) | 0,
          (bgColourFunction[ix][1] * (1 - frac) + bgColourFunction[ix + 1][1] * frac) | 0,
          (bgColourFunction[ix][2] * (1 - frac) + bgColourFunction[ix + 1][2] * frac) | 0,
        ]);
      }

      var dotSpawnChance = 2 / 60;
      var dotMinSpeed = 1 / 600;
      var dotMaxSpeed = 1 / 600;
      var dotSize = 1 / 400;
      var dotColour = '#ffffff';

      var healthWidth = 0.03;
      var healthHeight = 1 / 400;
      var healthYOffset = 1 / 58;
      var healthFillColour = '#ffffff';
      var healthOutlineColour = '#ffffff';
      var healthOutlineThickness = 1 / 2000;

      var dotProgress = 0.02;
      var dotDamage = 0.05;
      var dotScore = 1;

      var scoreText = 'Score: ';
      var scoreTextX = 0.005;
      var scoreTextY = 0.995;
      var scoreTextSize = 0.05;
      var scoreTextFont = 'Oswald';
      var scoreTextColour = '#ffffff';

      var wallBBoxHalfWidth = wallHalfWidth + dotSize / wallDistance;

      var stateStep = [];
      var stateDraw = [];

      // Semi-constants for stuff that only changes sometimes (e.g. on screen resize)
      var width    = 0;
      var height   = 0;
      var midX     = 0;
      var midY     = 0;
      var scale    = 0;

      var bgSegmentPaths = [];
      for (var i = 0; i < bgSegments; i++) {
        bgSegmentPaths.push(null);
      }

      var itemSelectedMarkerPath = null;

      var gemInnerPath      = null;
      var gemOuterPath      = null;
      var healthFillPath    = null;
      var healthTotalPath   = null;

      var titleTextFontValue;
      var menuItemFontValue;
      var playTextWidth;
      var exitTextWidth;

      var scoreTextFontValue;

      // Variable declarations
      var gameState = titleStateId;

      var itemSelectedMarkerAngle = 0;

      var wallAngle;
      var bgProgress = [];
      for (var i = 0; i < bgSegments; i++) {
        bgProgress.push(0);
      }
      var idCounter = 0;
      var dots = {};
      var health = 1;
      var score = 0;

      function setHealth(value) {
        health = clamp(value, 0, 1);
        innerHealthBarResize();
      }

      menuItemActions[itemPlayId] = function() {
        gameState = playStateId;
      }

      menuItemActions[itemExitId] = backToSite;

      stateStep[titleStateId] = function() {
        if (keysDown[enterCode] && !prevKeysDown[enterCode]) {
          if (itemSelected === -1) {
            menuItemActions[itemPlayId]();
          } else {
            menuItemActions[itemSelected]();
          }
        }

        if (keysDown[downCode] && !prevKeysDown[downCode]) {
          if (itemSelected === -1) {
            itemSelected = itemPlayId;
          } else {
            itemSelected++;
            if (itemSelected === itemCount) {
              itemSelected = 0;
            }
          }
        }

        if (keysDown[upCode] && !prevKeysDown[upCode]) {
          if (itemSelected === -1) {
            itemSelected = itemPlayId;
          } else {
            itemSelected--;
            if (itemSelected === -1) {
              itemSelected = itemCount - 1;;
            }
          }
        }

        if (cursorX !== prevCursorX ||  cursorY !== prevCursorY) {
          if (pointInRect(cursorX, cursorY, midX - playTextWidth / 2, height * playTextY, midX + playTextWidth / 2, height * (playTextY + menuItemSize))) {
            itemSelected = itemPlayId;
          } else if (pointInRect(cursorX, cursorY, midX - exitTextWidth / 2, height * exitTextY, midX + exitTextWidth / 2, height * (exitTextY + menuItemSize))) {
            itemSelected = itemExitId;
          }
        }

        itemSelectedMarkerAngle += itemSelectedMarkerSpeed;
      }

      stateDraw[titleStateId] = function() {
        ctx.fillStyle = bgColour;
        ctx.fillRect(0, 0, width, height);

        ctx.textBaseline = 'hanging';
        ctx.textAlign = 'center';
        ctx.fillStyle = menuTextColour;

        ctx.font = titleTextFontValue;
        ctx.fillText(titleText, midX, height * titleTextY);

        ctx.font = menuItemFontValue;
        ctx.fillText(playText, midX, height * playTextY);
        ctx.fillText(exitText, midX, height * exitTextY);

        if (itemSelected !== -1) {

          var xOffset = itemSelectedMarkerXOffset * height;
          var yOffset;
          if (itemSelected === itemPlayId) {
            yOffset = playTextY;
          } else if (itemSelected === itemExitId) {
            yOffset = exitTextY;
          }

          ctx.save();

          ctx.fillStyle = itemSelectedMarkerColour;

          ctx.translate(midX - xOffset, height * (yOffset + menuItemSize / 2));
          ctx.rotate(itemSelectedMarkerAngle);
          ctx.fill(itemSelectedMarkerPath);
          ctx.rotate(-itemSelectedMarkerAngle);
          ctx.translate(2 * xOffset, 0);
          ctx.rotate(itemSelectedMarkerAngle);
          ctx.fill(itemSelectedMarkerPath);

          ctx.restore();
        }
      }

      stateStep[playStateId] = function() {
        wallAngle = Math.atan2(cursorY - midY, cursorX - midX);

        for (var dotId in dots) {
          var dot = dots[dotId];

          dot.previousDistance = dot.distance;
          dot.distance -= dot.speed;
        }

        for (var dotId in dots) {
          var dot = dots[dotId];

          if (dot.previousDistance + dotSize >= wallDistance - wallThickness / 2 && dot.distance - dotSize <= wallDistance + wallThickness / 2) {
            if (Math.abs(angleDifference(wallAngle, dot.direction)) <= wallBBoxHalfWidth) {
              var segmentIx = (dot.direction * bgSegments / (2 * Math.PI)) | 0;
              bgProgress[segmentIx] += dotProgress;
              score += dotScore;

              delete dots[dot.id];
            }
          } else if (dot.distance <= 0) {
            setHealth(health - dotDamage);

            delete dots[dot.id];
          }
        }

        if (Math.random() < dotSpawnChance) {
          var dot = {};

          dot.speed = Math.random() * (dotMaxSpeed - dotMinSpeed) + dotMinSpeed;
          dot.direction = 2 * Math.PI * Math.random();
          dot.id = idCounter++;
          dot.distance = 1;

          dots[dot.id] = dot;
        }
      }

      stateDraw[playStateId] = function() {
        // Draw bg
        for (var i = 0; i < bgSegments; i++) {
          ctx.fillStyle = bgColourCalculation(bgProgress[i]);
          ctx.fill(bgSegmentPaths[i]);
        }

        // Draw dots
        for (var dotId in dots) {
          var dot = dots[dotId];

          path = new Path2D();
          path.arc(midX + scale * dot.distance * Math.cos(dot.direction), midY + scale * dot.distance * Math.sin(dot.direction), scale * dotSize, 0, 2 * Math.PI);

          ctx.fillStyle = dotColour;
          ctx.fill(path);
        }

        // Draw gem
        ctx.fillStyle = quadToColour(gemShadedColour);
        ctx.fill(gemInnerPath);

        ctx.lineWidth = scale * gemLineThickness;
        ctx.lineCap = 'round';
        ctx.strokeStyle = tripleToColour(gemColour);
        ctx.stroke(gemOuterPath);
        ctx.lineCap = 'butt';

        // Draw wall
        var path = new Path2D();
        path.arc(midX, midY, scale * wallDistance, wallAngle - wallHalfWidth, wallAngle + wallHalfWidth, false);

        ctx.lineWidth = scale * wallThickness;
        ctx.strokeStyle = wallColour;
        ctx.stroke(path);

        // Draw health
        ctx.fillStyle = healthFillColour;
        ctx.fill(healthFillPath);

        ctx.strokeStyle = healthOutlineColour;
        ctx.lineWidth = scale * healthOutlineThickness;
        ctx.stroke(healthTotalPath);

        // Draw text
        ctx.font = scoreTextFontValue;
        ctx.fillStyle = scoreTextColour;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(scoreText + score, width * scoreTextX, height * scoreTextY);
      }

      function screenResize() {
        // Update certain semi-constants after the screen size changes
        width  = ctx.canvas.width  = window.innerWidth;
        height = ctx.canvas.height = window.innerHeight;
        midX = width / 2;
        midY = height / 2;
        scale = Math.sqrt(width * width + height * height);

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

        gemOuterPath = new Path2D();

        gemOuterPath.moveTo(midX + scale * gemSize, midY);
        gemOuterPath.lineTo(midX, midY + scale * gemSize);
        gemOuterPath.lineTo(midX - scale * gemSize, midY);
        gemOuterPath.lineTo(midX, midY - scale * gemSize);
        gemOuterPath.lineTo(midX + scale * gemSize, midY);

        gemOuterPath.moveTo(midX + scale * gemSize * gemSizeInnerFactor, midY);
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
        gemOuterPath.lineTo(midX + scale * gemSize, midY);

        innerHealthBarResize();
        outerHealthBarResize();

        // Text updates
        titleTextFontValue = fontValue(menuFont, titleTextSize * height, 'bold small-caps');
        menuItemFontValue = fontValue(menuFont, menuItemSize * height, 'small-caps');
        scoreTextFontValue = fontValue(scoreTextFont, scoreTextSize * height, 'small-caps');

        ctx.font = menuItemFontValue;
        playTextWidth = ctx.measureText(playText).width;
        exitTextWidth = ctx.measureText(exitText).width;

        itemSelectedMarkerPath = new Path2D()

        itemSelectedMarkerPath.moveTo(height * itemSelectedMarkerSize, 0);
        itemSelectedMarkerPath.lineTo(0, height * itemSelectedMarkerSize);
        itemSelectedMarkerPath.lineTo(-height * itemSelectedMarkerSize, 0);
        itemSelectedMarkerPath.lineTo(0, -height * itemSelectedMarkerSize);
      }

      function innerHealthBarResize() {
        healthFillPath = new Path2D();

        healthFillPath.moveTo(midX - scale * healthWidth / 2, midY + scale * (healthYOffset - healthHeight / 2));
        healthFillPath.lineTo(midX - scale * healthWidth / 2, midY + scale * (healthYOffset + healthHeight / 2));
        healthFillPath.lineTo(midX + scale * healthWidth * (health - 0.5), midY + scale * (healthYOffset + healthHeight / 2));
        healthFillPath.lineTo(midX + scale * healthWidth * (health - 0.5), midY + scale * (healthYOffset - healthHeight / 2));
      }

      function outerHealthBarResize() {
        healthTotalPath = new Path2D();

        healthTotalPath.moveTo(midX - scale * healthWidth / 2, midY + scale * (healthYOffset - healthHeight / 2));
        healthTotalPath.lineTo(midX - scale * healthWidth / 2, midY + scale * (healthYOffset + healthHeight / 2));
        healthTotalPath.lineTo(midX + scale * healthWidth / 2, midY + scale * (healthYOffset + healthHeight / 2));
        healthTotalPath.lineTo(midX + scale * healthWidth / 2, midY + scale * (healthYOffset - healthHeight / 2));
        healthTotalPath.lineTo(midX - scale * healthWidth / 2, midY + scale * (healthYOffset - healthHeight / 2));
      }

      function step() {
        stateStep[gameState]();

        prevCursorX = cursorX;
        prevCursorY = cursorY;

        // Create an independent copy
        prevKeysDown = $.extend({}, keysDown);
      }

      function draw() {
        stateDraw[gameState]();
      }

      function gameLoop() {
        if (width !== window.innerWidth || height !== window.innerHeight) {
          screenResize();
        }

        step();
        draw();
      }

      var loopHandle;
      if (isSupported) {
        loopHandle = setInterval(gameLoop, 16);
      } else {
        // TODO: Make user aware that the game isn't available to them
      }
    });
  }
]);
