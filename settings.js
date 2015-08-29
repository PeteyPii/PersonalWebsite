var path = require('path');

var _ = require('lodash');

var settings = {};

try {
  var defaults = require(path.join(__dirname, 'defaults.json'));
  _.assing(settings, defaults);
} catch (err) {
  // Silently ignore (in case the file is missing)
}

try {
  var userSettings = require(path.join(__dirname, 'settings.json'));
  _.assing(settings, userSettings);
} catch (err) {
  // Silently ignore (in case the file is missing)
}

function validateSettings(settings) {
  var requiredSettings = [
    'host_mlf',
  ];

  for (var i = 0; i < requiredSettings.length; i++) {
    if (typeof settings[requiredSettings[i]] === 'undefined') {
      throw new Error('Missing setting \'' + requiredSettings[i] + '\'');
    }
  }

  if (!_.isBoolean(settings.host_mlf)) {
    throw new Error('Host MLF must either be `true` or `false`');
  }
}

try {
  validateSettings(settings);
} catch (err) {
  if (err.stack) {
    console.error(err.stack);
  } else {
    console.error('Error: ' + err);
  }

  // Just stop everything and tell the user they need to fix their settings
  process.kill(process.pid);
}

module.exports = settings;
