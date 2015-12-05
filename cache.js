var settings = require('./settings.js');

function Cache() {
  this.values = {};
  this.lastUpdates = {};
  this.handlers = {};
}

Cache.prototype.isStale = function(key) {
  return this.values[key] === undefined || (new Date()).getTime() - this.lastUpdates[key] > settings.cache_life;
}

Cache.prototype.update = function(key, callback) {
  var self = this;
  self.handlers[key](function(err, value) {
    if (err) {
      callback(err);
    } else {
      self.values[key] = value;
      self.lastUpdates[key] = (new Date()).getTime();
      callback(err);
    }
  });
}

Cache.prototype.get = function(key, callback) {
  if (this.handlers[key] === undefined) {
    throw new Error('Specified key is not handled by cache');
  }

  var self = this;
  if (self.isStale(key)) {
    self.update(key, function(err) {
      if (err) {
        callback(err);
      } else {
        callback(err, self.values[key]);
      }
    });
  } else {
    callback(null, self.values[key]);
  }
}

Cache.prototype.addUpdateHandler = function(key, handler) {
  if (this.handlers[key] !== undefined) {
    throw new Error('Specified key already has an update handler');
  }

  this.lastUpdates[key] = 0;
  this.handlers[key] = handler;
}

module.exports = Cache;
