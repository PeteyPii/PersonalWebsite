var settings = require('./settings.js');

function Cache(pollRetryPeriod, pollRetryCount) {
  this.values = {};
  this.lastUpdates = {};
  this.handlers = {};
  this.locks = {};

  if (!pollRetryPeriod) {
    pollRetryPeriod = 250;
  }
  this.pollRetryPeriod = pollRetryPeriod;

  if (!pollRetryCount) {
    pollRetryCount = 20;
  }
  this.pollRetryCount = pollRetryCount;
}

Cache.prototype.isStale = function(key) {
  return this.values[key] === undefined || (new Date()).getTime() - this.lastUpdates[key] > settings.cache_life;
};

Cache.prototype.update = function(key, callback) {
  var self = this;
  self.locks[key] = true;
  self.handlers[key](function(err, value) {
    if (err) {
      self.locks[key] = false;
      callback(err);
    } else {
      self.values[key] = value;
      self.lastUpdates[key] = (new Date()).getTime();
      self.locks[key] = false;
      callback(err);
    }
  });
};

Cache.prototype.get = function(key, callback) {
  if (this.handlers[key] === undefined) {
    throw new Error('Specified key is not handled by cache');
  }

  var self = this;
  if (self.isStale(key)) {
    if (self.locks[key]) {
      self.getPolled(key, callback);
    } else {
      self.update(key, function(err) {
        if (err) {
          callback(err);
        } else {
          callback(err, self.values[key]);
        }
      });
    }
  } else {
    callback(null, self.values[key]);
  }
};

Cache.prototype.getPolled = function(key, callback) {
  var self = this;
  setTimeout(function() {
    var retriesRemaining = self.pollRetryCount;
    var loopHandle = setInterval(function() {
      if (!self.locks[key]) {
        clearInterval(loopHandle);
        loopHandle = null;
        if (!self.isStale(key)) {
          callback(null, self.values[key]);
        } else {
          callback(new Error('Value for key failed to update successfully'));
        }
      } else {
        retriesRemaining -= 1;
        if (retriesRemaining === 0) {
          clearInterval(loopHandle);
          loopHandle = null;
          callback(new Error('Value for key failed to update in time'));
        }
      }
    }, self.pollRetryPeriod);
  }, self.pollRetryPeriod);
};

Cache.prototype.addUpdateHandler = function(key, handler) {
  if (this.handlers[key] !== undefined) {
    throw new Error('Specified key already has an update handler');
  }

  this.lastUpdates[key] = 0;
  this.handlers[key] = handler;
  this.locks[key] = false;
};

module.exports = Cache;
