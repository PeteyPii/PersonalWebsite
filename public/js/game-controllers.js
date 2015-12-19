app.controller('PlayGameController', ['$scope', '$location',
  function ($scope, $location) {
    $scope.isPlayGameBtnVisible = false;
    $scope.isAnimating = false;
    $scope.playGameButton = new PlayGameButton(document.getElementById('play-game-canvas'), {
      boxSize: 10,
      boxSpacing: 2,
      colourChangeChance: 0.10,
      colourChangePeriod: 100,
    });

    $scope.$on('$destroy', function() {
      $scope.playGameButton.stopDrawing();
    });

    $scope.tabBtnClick = function() {
      $('#play-game-tab-btn').blur();

      if ($scope.isAnimating) {
        return;
      }

      $scope.isAnimating = true;

      if ($scope.isPlayGameBtnVisible) {
        $scope.isPlayGameBtnVisible = false;
        $('.play-game-btn-container').slideUp({
          complete: function() {
            $scope.isAnimating = false;
            $scope.playGameButton.stopDrawing();
          }
        });
      } else {
        $scope.isPlayGameBtnVisible = true;
        $scope.playGameButton.beginDrawing();
        $('.play-game-btn-container').slideDown({
          complete: function() {
            $scope.isAnimating = false;
          }
        });
      }
    };

    $scope.playBtnClick = function() {
      $location.path('/Meteorite');
    };

    // Stop right-clicking from bringing the context menu up on the canvas
    $('#play-game-canvas').on('contextmenu', function(e) {
      return false;
    });
  }
]);

app.controller('GameController', ['$scope', '$rootScope',
  function ($scope, $rootScope) {
    $rootScope.setActiveNavLink('none');
    $rootScope.title = 'Meteorite';

    $scope.game = new Game();
    $scope.game.beginGame();

    $scope.$on('$destroy', function() {
      $scope.game.endGame();
    });

    // Stop right-clicking from bringing the context menu up on the canvas
    $('#game-canvas').on('contextmenu', function(e) {
      return false;
    });
  }
]);
