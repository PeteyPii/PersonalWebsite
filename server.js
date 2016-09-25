var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');

var compression = require('compression');
var express = require('express');
var favicon = require('serve-favicon');
var file = require('file');
var less = require('less');
var Q = require('q');
var _ = require('lodash');

var api = require('./api.js');
var logger = require('./logger.js');
var settings = require('./settings.js');

try {
  logger.log('Rendering LESS files');

  file.walkSync(path.join(__dirname, 'less'), function(dirPath, dirs, files) {
    for (var i = 0; i < files.length; i++) {
      var filePath = path.join(dirPath, files[i]);
      less.render(fs.readFileSync(filePath).toString('utf8'), {
        paths: [path.join(__dirname, 'less')],
        filename: filePath,
        compress: false
      }, function(err, output) {
        if (err) {
          throw err;
        }

        var outFileName = path.join(__dirname, 'public/css', path.basename(files[i], '.less') + '.css');
        fs.writeFileSync(outFileName, output.css);
      });
    }
  });

  logger.log('Starting server up');

  var app = express();

  // Log all requests to the server
  app.use(function logRequests(req, res, next) {
    logger.logRequest(req);
    next();
  });

  app.use(compression());
  app.use(favicon(path.join(__dirname, 'public/assets/favicon.ico')));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/api', api);

  var httpServer = http.createServer(app);

  app.get('*', function(req, res) {
    res.header('Cache-Control', 'private, max-age=0');
    res.sendFile('index.html', {
      root: __dirname + '/'
    });
  });

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


