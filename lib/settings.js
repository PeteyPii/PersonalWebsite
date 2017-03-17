var path = require('path');

var _ = require('lodash');

var settings = {};

var logger = require('./logger.js');

try {
  var defaults = require(path.join(__dirname, '../defaults.json'));
  _.assign(settings, defaults);
} catch (err) {
  // Silently ignore (in case the file is missing)
}

try {
  var userSettings = require(path.join(__dirname, '../settings.json'));
  _.assign(settings, userSettings);
} catch (err) {
  // Silently ignore (in case the file is missing)
}

function validateSettings(settings) {
  var requiredSettings = [
    'cache_life',
    'is_prod',
    'lol_api_key',
    'port',
    'summoner_name',
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

  if (!isValidPort(settings.port)) {
    throw new Error('Server port must be a valid port number');
  }
  if (!_.isNumber(settings.cache_life) || settings.cache_life < 0) {
    throw new Error('Cache life should be a non-negative number');
  }
  if (!_.isString(settings.summoner_name)) {
    throw new Error('Summoner name should be a string');
  }
  if (!_.isString(settings.lol_api_key)) {
    throw new Error('LoL API key should be a string');
  }
  if (!_.isBoolean(settings.is_prod)) {
    throw new Error('Is production must be either `true` or `false`');
  }
}

try {
  validateSettings(settings);
} catch (err) {
  if (err.stack) {
    logger.error(err.stack);
  } else {
    logger.error('Error: ' + err);
  }

  // Just stop everything and tell the user they need to fix their settings
  process.kill(process.pid);
}

module.exports = settings;
