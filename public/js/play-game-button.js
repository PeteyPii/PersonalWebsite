function PlayGameButton(canvas, settings) {
  this.boxes = [];

  this.addToBoxes(PlayGameButton.letterShapes.P, 0, 0);
  this.addToBoxes(PlayGameButton.letterShapes.L, 6, 0);
  this.addToBoxes(PlayGameButton.letterShapes.A, 12, 0);
  this.addToBoxes(PlayGameButton.letterShapes.Y, 18, 0);

  this.addToBoxes(PlayGameButton.letterShapes.G, 0, 10);
  this.addToBoxes(PlayGameButton.letterShapes.A, 6, 10);
  this.addToBoxes(PlayGameButton.letterShapes.M, 12, 10);
  this.addToBoxes(PlayGameButton.letterShapes.E, 18, 10);

  this.canvas = canvas;
  this.ctx = this.canvas.getContext('2d');
  this.isSupported = !!this.ctx;

  this.boxSize = settings.boxSize;
  this.boxSpacing = settings.boxSpacing;
  this.colourChangeChance = settings.colourChangeChance;
  this.colourChangePeriod = settings.colourChangePeriod;

  var maxX = 0;
  var maxY = 0;
  for(var i = 0; i < this.boxes.length; i++) {
    if(this.boxes[i].x > maxX) {
      maxX = this.boxes[i].x;
    }
    if(this.boxes[i].y > maxY) {
      maxY = this.boxes[i].y;
    }
  }

  this.canvas.width = maxX * (this.boxSize + this.boxSpacing) + this.boxSize;
  this.canvas.height = maxY * (this.boxSize + this.boxSpacing) + this.boxSize;

  this.updateHandle = null;
}

PlayGameButton.prototype.beginDrawing = function() {
  if (this.isSupported && this.updateHandle === null) {
    for (var i = 0; i < this.boxes.length; i++) {
      var left = this.boxes[i].x * (this.boxSize + this.boxSpacing);
      var top = this.boxes[i].y * (this.boxSize + this.boxSpacing);
      this.ctx.fillStyle = Utils.getNiceRandomColour();
      this.ctx.fillRect(left, top, this.boxSize, this.boxSize);
    }

    this.updateHandle = setInterval(this.update.bind(this), this.colourChangePeriod);
  }
}

PlayGameButton.prototype.stopDrawing = function() {
  if (this.updateHandle !== null) {
    clearInterval(this.updateHandle);
    this.updateHandle = null;
  }
}

PlayGameButton.prototype.update = function() {
  for (var i = 0; i < this.boxes.length; i++) {
    if (Math.random() < this.colourChangeChance) {
      var left = this.boxes[i].x * (this.boxSize + this.boxSpacing);
      var top = this.boxes[i].y * (this.boxSize + this.boxSpacing);
      this.ctx.fillStyle = Utils.getNiceRandomColour();
      this.ctx.fillRect(left, top, this.boxSize, this.boxSize);
    }
  }
}

PlayGameButton.prototype.addToBoxes = function(letter, offsetX, offsetY) {
  for (var i = 0; i < letter.length; i++) {
    this.boxes.push({
      x: letter[i].x + offsetX,
      y: letter[i].y + offsetY,
    });
  }
};

PlayGameButton.letterShapes = {
  P: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
    { x: 4, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
    { x: 0, y: 3 },
    { x: 0, y: 4 },
    { x: 0, y: 5 },
    { x: 0, y: 6 },
    { x: 0, y: 7 },
    { x: 0, y: 8 },
    { x: 4, y: 1 },
    { x: 4, y: 2 },
    { x: 4, y: 3 },
    { x: 4, y: 4 },
    { x: 3, y: 4 },
    { x: 2, y: 4 },
    { x: 1, y: 4 },
  ],

  L: [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
    { x: 0, y: 3 },
    { x: 0, y: 4 },
    { x: 0, y: 5 },
    { x: 0, y: 6 },
    { x: 0, y: 7 },
    { x: 0, y: 8 },
    { x: 1, y: 8 },
    { x: 2, y: 8 },
    { x: 3, y: 8 },
    { x: 4, y: 8 },
  ],

  A: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
    { x: 0, y: 3 },
    { x: 0, y: 4 },
    { x: 1, y: 4 },
    { x: 2, y: 4 },
    { x: 3, y: 4 },
    { x: 0, y: 5 },
    { x: 0, y: 6 },
    { x: 0, y: 7 },
    { x: 0, y: 8 },
    { x: 4, y: 0 },
    { x: 4, y: 1 },
    { x: 4, y: 2 },
    { x: 4, y: 3 },
    { x: 4, y: 4 },
    { x: 4, y: 5 },
    { x: 4, y: 6 },
    { x: 4, y: 7 },
    { x: 4, y: 8 },
  ],

  Y: [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
    { x: 0, y: 3 },
    { x: 0, y: 4 },
    { x: 4, y: 0 },
    { x: 4, y: 1 },
    { x: 4, y: 2 },
    { x: 4, y: 3 },
    { x: 4, y: 4 },
    { x: 1, y: 4 },
    { x: 3, y: 4 },
    { x: 2, y: 4 },
    { x: 2, y: 5 },
    { x: 2, y: 6 },
    { x: 2, y: 7 },
    { x: 2, y: 8 },
  ],

  G: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
    { x: 4, y: 0 },
    { x: 4, y: 1 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
    { x: 0, y: 3 },
    { x: 0, y: 4 },
    { x: 0, y: 5 },
    { x: 0, y: 6 },
    { x: 0, y: 7 },
    { x: 0, y: 8 },
    { x: 1, y: 8 },
    { x: 2, y: 8 },
    { x: 3, y: 8 },
    { x: 4, y: 8 },
    { x: 4, y: 7 },
    { x: 4, y: 6 },
    { x: 4, y: 5 },
    { x: 4, y: 4 },
    { x: 3, y: 4 },
  ],

  M: [
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 3, y: 1 },
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
    { x: 0, y: 3 },
    { x: 0, y: 4 },
    { x: 0, y: 5 },
    { x: 0, y: 6 },
    { x: 0, y: 7 },
    { x: 0, y: 8 },
    { x: 4, y: 0 },
    { x: 4, y: 1 },
    { x: 4, y: 2 },
    { x: 4, y: 3 },
    { x: 4, y: 4 },
    { x: 4, y: 5 },
    { x: 4, y: 6 },
    { x: 4, y: 7 },
    { x: 4, y: 8 },
  ],

  E: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
    { x: 4, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
    { x: 0, y: 3 },
    { x: 0, y: 4 },
    { x: 1, y: 4 },
    { x: 2, y: 4 },
    { x: 0, y: 5 },
    { x: 0, y: 6 },
    { x: 0, y: 7 },
    { x: 0, y: 8 },
    { x: 1, y: 8 },
    { x: 2, y: 8 },
    { x: 3, y: 8 },
    { x: 4, y: 8 },
  ],
};
