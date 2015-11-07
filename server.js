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

var logger = require('./logger.js');
var settings = require('./settings.js');

try {
  var mlf;
  if (settings.host_mlf) {
    mlf = require('./MyLoLFantasy/app.js');
  }

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

  Q.Promise(function(resolve, reject, notify) {
    if (settings.host_mlf) {
      resolve(mlf.createApp(true));
    } else {
      resolve();
    }
  }).then(function(mlfApp) {
    var app = express();

    if (mlfApp) {
      app.use('/MLF', mlfApp);
      logger.log('Hosting MLF');
    } else {
      logger.log('Opted out of hosting MLF');
    }

    app.use(compression());
    app.use(favicon(path.join(__dirname, 'public/assets/favicon.ico')));
    app.use(express.static(path.join(__dirname, 'public')));

    var httpsServer = https.createServer({
      key: fs.readFileSync(path.join(__dirname, 'certs/key.pem')),
      cert: fs.readFileSync(path.join(__dirname, 'certs/key-cert.pem'))
    }, app);

    app.get('*', function(req, res) {
      logger.log(req.method + ' request at ' + req.url);
      res.sendFile('index.html', {
        root: __dirname + '/'
      });
    });

    httpsServer.listen(settings.server_https_port, function() {
      var host = httpsServer.address().address;
      var port = httpsServer.address().port;

      logger.log('Server listening at https://' + host + ':' + port);
    });

    var redirectApp = express();
    var httpServer = http.createServer(redirectApp);

    redirectApp.get('/MLF', function(req, res) {
      if (settings.redirect_default_port) {
        res.redirect('https://' + req.hostname + req.url);
      } else {
        res.redirect('https://' + req.hostname + ':' + settings.server_https_port + req.url);
      }
    });
    redirectApp.use('/', app);

    httpServer.listen(settings.server_http_port);

  }).fail(function(err) {
    if (err.stack) {
      logger.error(err.stack);
    } else {
      logger.error('Error: ' + err);
    }
  }).done();
} catch (err) {
  if (err.stack) {
    logger.error(err.stack);
  } else {
    logger.error('Error: ' + err);
  }
}


