function Game() {
  this.loopHandle = null;
  this.gameRunning = false;
}

Game.prototype.beginGame = function() {
  this.gameRunning = true;

  $('.main-site').hide();
  $('body').addClass('game-mode');

  var prevCursorX;
  var prevCursorY;
  var cursorX;
  var cursorY;

  var leftMBDown = false;
  var prevLeftMBDown = false;

  var lmbCode = 1;
  var rmbCode = 3;
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
      this.endGame(true);
    }
  }.bind(this));

  $('#game-canvas').mousedown(function(e) {
    e.preventDefault();

    if (e.which === lmbCode) {
      leftMBDown = true;
    }
  }).mouseup(function(e) {
    e.preventDefault();

    if (e.which === lmbCode) {
      leftMBDown = false;
    }
  }).mousemove(function(e) {
    cursorX = e.pageX;
    cursorY = e.pageY;
  }).mouseenter(function(e) {
    cursorX = e.pageX;
    cursorY = e.pageY;
  }).on('touchstart', function(e) {
    e.preventDefault();

    var changedTouches = e.originalEvent.changedTouches;
    cursorX = changedTouches[changedTouches.length - 1].pageX;
    cursorY = changedTouches[changedTouches.length - 1].pageY;
    leftMBDown = true;
  }).on('touchmove', function(e) {
    e.preventDefault();

    var changedTouches = e.originalEvent.changedTouches;
    cursorX = changedTouches[changedTouches.length - 1].pageX;
    cursorY = changedTouches[changedTouches.length - 1].pageY;
  }).on('touchend', function(e) {
    e.preventDefault();

    if (e.originalEvent.touches.length === 0) {
      leftMBDown = false;
    }
  });

  var canvas = document.getElementById('game-canvas');
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

  function storageAvailable(type) {
    try {
      var storage = window[type],
      x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch(e) {
      return false;
    }
  }

  function loadHighScores() {
    if (storageAvailable('localStorage')) {
      var savedScores = localStorage.getItem('highScores');
      if (!savedScores) {
        savedScores = [];
        localStorage.setItem('highScores', JSON.stringify(savedScores));
      } else {
        savedScores = JSON.parse(savedScores);
      }

      return savedScores;
    } else {
      return [];
    }
  }

  function saveHighScores(savedScores) {
    if (storageAvailable('localStorage')) {
      localStorage.setItem('highScores', JSON.stringify(savedScores));
    }
  }

  // Constants
  var titleStateId = 0;
  var playStateId = 1;
  var highScoresStateId = 2;
  var instructionsStateId = 3;

  var titleTextSize = 0.25;
  var menuItemSize = 0.05;
  var menuFont = 'Oswald';
  var menuTextColour = '#ffffff';

  var titleText = 'Meteorite';
  var titleTextY = 0.2;

  var playText = 'Play Game';
  var playTextY = 0.6;

  var instructionsText = 'Instructions';
  var instructionsTextY = 0.675;

  var highScoresText = 'High Scores';
  var highScoresTextY = 0.75;

  var exitText = 'Exit';
  var exitTextY = 0.825;

  var itemSelected = -1;
  var itemPlayId = 0;
  var itemInstructionsId = 1;
  var itemHighScoresId = 2;
  var itemExitId = 3;
  var itemCount = 4;

  var itemSelectedMarkerSize = 0.02;
  var itemSelectedMarkerXOffset = 0.145;
  var itemSelectedMarkerSpeed = 0.02;
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

  var gameOverOverlayColour = 'rgba(0, 0, 0, 0.5)';

  var gameOverTextFont = 'Oswald';
  var gameOverTextColour = '#ffffff';
  var gameOverNormalTextSize = 0.05;

  var gameOverAnnounceText = 'Game Over!'
  var gameOverBackText = 'Back to Menu';
  var gameOverScoreText = 'You achieved a score of: ';
  var gameOverHighScoreText = 'New High Score!';

  var gameOverAnnounceSize = 0.15;
  var gameOverAnnounceTextY = 0.2;
  var gameOverScoreTextY = 0.65;
  var gameOverHighScoreTextY = 0.75;

  var gameOverBackTextX = 0.005;
  var gameOverBackTextY = 0.995;

  var stateStep = [];
  var stateDraw = [];

  var maxHighScores = 5;

  var highScoresFont = 'Oswald';
  var highScoresTextColour = '#ffffff';
  var highScoresNormalSize = 0.05;

  var highScoresTitleText = 'High Scores';
  var highScoresBackText = 'Back To Menu';

  var highScoresTitleSize = 0.15;
  var highScoresTitleY = 0.2;
  var highScoresScoresY = 0.45;
  var highScoresScoresSpacing = 0.075;
  var highScoresBackTextX = 0.005;
  var highScoresBackTextY = 0.995;

  var instructionsFont = 'Oswald';
  var instructionsTextColour = '#ffffff';
  var instructionsNormalSize = 0.05;

  var instructionsTitleText = 'Instructions';
  var instructionsHowToPlayList = [
    'Protect your crystal at the center of the screen from',
    'incoming meteorites. You earn points by blocking',
    'meteorites with a mystical paddle controlled by',
    'moving your mouse or touching the screen. If your',
    'crystal takes too many hits, you lose!',
  ];
  var instructionsBackText = 'Back To Menu';

  var instructionsTitleSize = 0.15;
  var instructionsTitleY = 0.2;
  var instructionsHowToPlayY = 0.45;
  var instructionsBackTextX = 0.005;
  var instructionsBackTextY = 0.995;

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

  var playItemBBox;
  var instructionsItemBBox;
  var highScoresItemBBox;
  var exitItemBBox;

  var scoreTextFontValue;

  var gameOverAnnounceFontValue;
  var gameOverNormalFontValue;
  var gameOverBackBBox;

  var isNewHighScore;
  var highScores = loadHighScores();

  var highScoresTitleFontValue;
  var highScoresNormalFontValue;
  var highScoresBackBBox;

  var instructionsTitleFontValue;
  var instructionsNormalFontValue;
  var instructionsBackBBox;

  // Variable declarations
  var gameState = titleStateId;

  var itemSelectedMarkerAngle = 0;

  var wallAngle;
  var bgProgress;
  var idCounter;
  var dots;
  var health;
  var score;
  var gameOver;

  restartGame();

  // Initializes all game variables to their initial values
  function restartGame() {
    bgProgress = [];
    for (var i = 0; i < bgSegments; i++) {
      bgProgress.push(0);
    }
    idCounter = 0;
    dots = {};
    setHealth(1);
    score = 0;
    gameOver = false;
    isNewHighScore = false;
  }

  function setHealth(value) {
    health = clamp(value, 0, 1);
    innerHealthBarResize();
  }

  menuItemActions[itemPlayId] = function() {
    gameState = playStateId;
  }

  menuItemActions[itemInstructionsId] = function() {
    gameState = instructionsStateId;
  }

  menuItemActions[itemHighScoresId] = function() {
    gameState = highScoresStateId;
  }

  menuItemActions[itemExitId] = this.endGame.bind(this, true);

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

    var inPlay = pointInRect(cursorX, cursorY, playItemBBox.left, playItemBBox.top, playItemBBox.right, playItemBBox.bottom);
    var inInstructions = pointInRect(cursorX, cursorY, instructionsItemBBox.left, instructionsItemBBox.top, instructionsItemBBox.right, instructionsItemBBox.bottom);
    var inHighScores = pointInRect(cursorX, cursorY, highScoresItemBBox.left, highScoresItemBBox.top, highScoresItemBBox.right, highScoresItemBBox.bottom);
    var inExit = pointInRect(cursorX, cursorY, exitItemBBox.left, exitItemBBox.top, exitItemBBox.right, exitItemBBox.bottom);

    if (cursorX !== prevCursorX ||  cursorY !== prevCursorY) {
      if (inPlay) {
        itemSelected = itemPlayId;
      } else if (inInstructions) {
        itemSelected = itemInstructionsId;
      } else if (inHighScores) {
        itemSelected = itemHighScoresId;
      } else if (inExit) {
        itemSelected = itemExitId;
      }
    }

    if (leftMBDown && !prevLeftMBDown) {
      if (inPlay) {
        menuItemActions[itemPlayId]();
      } else if (inInstructions) {
        menuItemActions[itemInstructionsId]();
      } else if (inHighScores) {
        menuItemActions[itemHighScoresId]();
      } else if (inExit) {
        menuItemActions[itemExitId]();
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
    ctx.fillText(instructionsText, midX, height * instructionsTextY);
    ctx.fillText(highScoresText, midX, height * highScoresTextY);
    ctx.fillText(exitText, midX, height * exitTextY);

    if (itemSelected !== -1) {
      var xOffset = itemSelectedMarkerXOffset * height;
      var yOffset;
      if (itemSelected === itemPlayId) {
        yOffset = playTextY;
      } else if (itemSelected === itemInstructionsId) {
        yOffset = instructionsTextY;
      } else if (itemSelected === itemHighScoresId) {
        yOffset = highScoresTextY;
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
    if (!gameOver) {
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

      if (health <= 0) {
        gameOver = true;

        if (highScores.length < maxHighScores || highScores[maxHighScores - 1] < score) {
          isNewHighScore = true;
          highScores.push(score);
          Utils.sort(highScores);
          highScores.reverse();
          if (highScores.length > maxHighScores) {
            highScores.pop();
          }
          saveHighScores(highScores);
        }
      }
    } else {
      if (leftMBDown && !prevLeftMBDown) {
        if (pointInRect(cursorX, cursorY, gameOverBackBBox.left, gameOverBackBBox.top, gameOverBackBBox.right, gameOverBackBBox.bottom)) {
          restartGame();
          gameState = titleStateId;
        }
      }
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

    if (!gameOver) {
      // Draw score
      ctx.font = scoreTextFontValue;
      ctx.fillStyle = scoreTextColour;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(scoreText + score, width * scoreTextX, height * scoreTextY);
    } else {
      // Draw game over specific stuff
      ctx.fillStyle = gameOverOverlayColour;
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'hanging';
      ctx.fillStyle = gameOverTextColour;

      ctx.font = gameOverAnnounceFontValue;
      ctx.fillText(gameOverAnnounceText, midX, height * gameOverAnnounceTextY);

      ctx.font = gameOverNormalFontValue;
      ctx.fillText(gameOverScoreText + score, midX, height * gameOverScoreTextY);
      if (isNewHighScore) {
        ctx.fillText(gameOverHighScoreText, midX, height * gameOverHighScoreTextY);
      }

      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(gameOverBackText, width * gameOverBackTextX, height * gameOverBackTextY);
    }
  }

  stateStep[highScoresStateId] = function() {
    if (leftMBDown && !prevLeftMBDown) {
      if (pointInRect(cursorX, cursorY, gameOverBackBBox.left, gameOverBackBBox.top, gameOverBackBBox.right, gameOverBackBBox.bottom)) {
        gameState = titleStateId;
      }
    }
  }

  stateDraw[highScoresStateId] = function() {
    ctx.fillStyle = bgColour;
    ctx.fillRect(0, 0, width, height);

    ctx.textBaseline = 'hanging';
    ctx.textAlign = 'center';
    ctx.fillStyle = highScoresTextColour;

    ctx.font = highScoresTitleFontValue;
    ctx.fillText(highScoresTitleText, midX, height * highScoresTitleY);

    ctx.font = highScoresNormalFontValue;
    for (var i = 0; i < maxHighScores; i++) {
      var text = i >= highScores.length ? '- - -' : highScores[i].toString();
      ctx.fillText(text, midX, height * (highScoresScoresY + i * highScoresScoresSpacing));
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(highScoresBackText, width * highScoresBackTextX, height * highScoresBackTextY);
  }

  stateStep[instructionsStateId] = function() {
    if (leftMBDown && !prevLeftMBDown) {
      if (pointInRect(cursorX, cursorY, instructionsBackBBox.left, instructionsBackBBox.top, instructionsBackBBox.right, instructionsBackBBox.bottom)) {
        gameState = titleStateId;
      }
    }
  }

  stateDraw[instructionsStateId] = function() {
    ctx.fillStyle = bgColour;
    ctx.fillRect(0, 0, width, height);

    ctx.textBaseline = 'hanging';
    ctx.textAlign = 'center';
    ctx.fillStyle = instructionsTextColour;

    ctx.font = instructionsTitleFontValue;
    ctx.fillText(instructionsTitleText, midX, height * instructionsTitleY);

    ctx.font = instructionsNormalFontValue;
    for(var i = 0; i < instructionsHowToPlayList.length; i++) {
      ctx.fillText(instructionsHowToPlayList[i], midX, height * (instructionsHowToPlayY + instructionsNormalSize * i));
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(instructionsBackText, width * instructionsBackTextX, height * instructionsBackTextY);
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

    gameOverAnnounceFontValue = fontValue(gameOverTextFont, gameOverAnnounceSize * height, 'bold small-caps');
    gameOverNormalFontValue = fontValue(gameOverTextFont, gameOverNormalTextSize * height, 'small-caps');

    highScoresTitleFontValue = fontValue(highScoresFont, highScoresTitleSize * height, 'bold small-caps');
    highScoresNormalFontValue = fontValue(highScoresFont, highScoresNormalSize * height, 'small-caps');

    instructionsTitleFontValue = fontValue(instructionsFont, instructionsTitleSize * height, 'bold small-caps');
    instructionsNormalFontValue = fontValue(instructionsFont, instructionsNormalSize * height, 'small-caps');

    ctx.font = menuItemFontValue;
    var playTextWidth = ctx.measureText(playText).width;
    var instructionsTextWidth = ctx.measureText(instructionsText).width;
    var highScoresTextWidth = ctx.measureText(highScoresText).width;
    var exitTextWidth = ctx.measureText(exitText).width;

    playItemBBox = {
      left: midX - playTextWidth / 2,
      top: height * playTextY,
      right: midX + playTextWidth / 2,
      bottom: height * (playTextY + menuItemSize)
    };

    instructionsItemBBox = {
      left: midX - instructionsTextWidth / 2,
      top: height * instructionsTextY,
      right: midX + instructionsTextWidth / 2,
      bottom: height * (instructionsTextY + menuItemSize)
    };

    highScoresItemBBox = {
      left: midX - highScoresTextWidth / 2,
      top: height * highScoresTextY,
      right: midX + highScoresTextWidth / 2,
      bottom: height * (highScoresTextY + menuItemSize)
    };

    exitItemBBox = {
      left: midX - exitTextWidth / 2,
      top: height * exitTextY,
      right: midX + exitTextWidth / 2,
      bottom: height * (exitTextY + menuItemSize)
    };

    ctx.font = gameOverNormalFontValue;
    var gameOverBackTextWidth = ctx.measureText(gameOverBackText).width;

    gameOverBackBBox = {
      left: gameOverBackTextX * width,
      top: (gameOverBackTextY - gameOverNormalTextSize) * height,
      right: gameOverBackTextX * width + gameOverBackTextWidth,
      bottom: gameOverBackTextY * height,
    };

    ctx.font = highScoresNormalFontValue;
    var highScoresBackTextWidth = ctx.measureText(highScoresBackText).width;

    highScoresBackBBox = {
      left: highScoresBackTextX * width,
      top: (highScoresBackTextY - highScoresNormalSize) * height,
      right: highScoresBackTextX * width + highScoresBackTextWidth,
      bottom: highScoresBackTextY * height,
    };

    ctx.font = instructionsNormalFontValue;
    var instructionsBackTextWidth = ctx.measureText(instructionsBackText).width;

    instructionsBackBBox = {
      left: instructionsBackTextX * width,
      top: (instructionsBackTextY - instructionsNormalSize) * height,
      right: instructionsBackTextX * width + instructionsBackTextWidth,
      bottom: instructionsBackTextY * height,
    };

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
    prevLeftMBDown = leftMBDown;

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

  if (isSupported) {
    this.loopHandle = setInterval(gameLoop, 16);
    this.gameRunning = true;
  }
}

Game.prototype.endGame = function(goBack) {
  if (this.gameRunning) {
    $(document).off('keydown keyup keypress');
    $('#game-canvas').off('mousedown mouseup mousemove mouseenter touchstart touchmove touchend');

    clearInterval(this.loopHandle);
    this.loopHandle = null;
    this.gameRunning = false;

    $('body').removeClass('game-mode');
    $('.main-site').show();

    // Sometimes we don't want to go back when we're stopping the game such as when we hit back in
    // the browser. Other times, from within the game usually, we do want to go back.
    if (goBack) {
      window.history.back();
    }
  }
}
