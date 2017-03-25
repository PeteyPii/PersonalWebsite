var http = require('http');
var path = require('path');

var compression = require('compression');
var express = require('express');
var favicon = require('serve-favicon');

var api = require('./lib/api.js');
var logger = require('./lib/logger.js');
var settings = require('./lib/settings.js');

try {
  logger.log('Starting server up');

  var app = express();

  // Log all requests to the server
  app.use(function logRequests(req, res, next) {
    logger.logRequest(req);
    next();
  });

  app.use(compression());
  app.use(favicon(path.join(__dirname, 'public/assets/favicon.ico'), {
    maxAge: settings.is_prod ? settings.asset_cache_time : 0,
  }));
  app.use(express.static(path.join(__dirname, 'public'), {
    redirect: false,
    maxAge: settings.is_prod ? settings.asset_cache_time : 0,
  }));

  app.set('trust proxy', 'loopback');

  app.use('/api', api);
  app.get('*', function(req, res) {
    res.header('Cache-Control', 'private, max-age=0');  // private because of cookies in subpages and from GA
    res.sendFile('public/index.html', {
      root: __dirname + '/'
    });
  });

  var httpServer = http.createServer(app);
  httpServer.listen(settings.port, function() {
    var host = httpServer.address().address;
    var port = httpServer.address().port;

    logger.log('Server listening at http://' + host + ':' + port);
  });
} catch (err) {
  if (err.stack) {
    logger.error(err.stack);
  } else {
    logger.error('Error: ' + err);
  }
}


