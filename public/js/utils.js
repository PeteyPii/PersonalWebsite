function Utils() {};

/**
 * Shuffles an array uniformly in place. Each element of the array is equally likely to end up at any index.
 * array: An array to be shuffled in place.
 * returns: Nothing.
 */
Utils.shuffleArray = function(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

/**
 * Sorts an array of numbers in place as expected rather than lexicographically.
 * array: An array to be sorted in place.
 * returns: Nothing.
 */
Utils.prototype.sort = function(array) {
  array.sort(function(a, b) {
    return a - b;
  });
}


Utils.hexChars = '0123456789ABCDEF'.split('');
Utils.niceColourTop = 'FF';
Utils.niceColourBottom = '50';

/**
 * Returns a random nice looking colour in the form of a hex string.
 * returns: String of colour in hex format (e.g. '#CCAAFF').
 */
Utils.getNiceRandomColour = function() {
  var choices = [0, 1, 2];
  Utils.shuffleArray(choices);
  var colour = '#';
  for (var i = 0; i < 3; i++) {
    switch (choices[i]) {
      case 0:
        colour += Utils.niceColourBottom;
        break;
      case 1:
        colour += Utils.niceColourTop;
        break;
      case 2:
        colour += Utils.hexChars[Math.floor(Math.random() * 16)] + Utils.hexChars[Math.floor(Math.random() * 16)];
        break;
    }
  }

  return colour;
}
