var path = require('path');

var _ = require('lodash');

var settings = {};

try {
  var defaults = require(path.join(__dirname, 'defaults.json'));
  _.assign(settings, defaults);
} catch (err) {
  // Silently ignore (in case the file is missing)
}

try {
  var userSettings = require(path.join(__dirname, 'settings.json'));
  _.assign(settings, userSettings);
} catch (err) {
  // Silently ignore (in case the file is missing)
}

function validateSettings(settings) {
  var requiredSettings = [
    'host_mlf',
    'server_http_port',
    'server_https_port',
  ];

  function isValidPort(port) {
    return _.isNumber(port) &&
      port > 0 && port < 65536 &&
      port === port | 0;
  }

  for (var i = 0; i < requiredSettings.length; i++) {
    if (typeof settings[requiredSettings[i]] === 'undefined') {
      throw new Error('Missing setting \'' + requiredSettings[i] + '\'');
    }
  }

  if (!_.isBoolean(settings.host_mlf)) {
    throw new Error('Host MLF must either be `true` or `false`');
  }
  if (!isValidPort(settings.server_http_port)) {
    throw new Error('Server HTTP port must be a valid port number');
  }
  if (!isValidPort(settings.server_https_port)) {
    throw new Error('Server HTTPS port must be a valid port number');
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
