var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');

var express = require('express');
var favicon = require('serve-favicon');
var file = require('file');
var less = require('less');
var reload = require('reload');
var Q = require('q');
var _ = require('lodash');

var mlf = require('./MyLoLFantasy/app.js');
var settings = require('./settings.js');

try {
  console.log('Rendering LESS files');

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

  console.log('Starting server up');

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
      console.log('Hosting MLF');
    } else {
      console.log('Opted out of hosting MLF');
    }

    app.use(favicon(path.join(__dirname, 'public/assets/favicon.ico')));
    app.use(express.static(path.join(__dirname, 'public')));

    var httpsServer = https.createServer({
      key: fs.readFileSync(path.join(__dirname, 'certs/key.pem')),
      cert: fs.readFileSync(path.join(__dirname, 'certs/key-cert.pem'))
    }, app);

    reload(httpsServer, app);

    app.get('*', function(req, res) {
      console.log(req.method + ' request at ' + req.url);
      res.sendFile('index.html', {
        root: __dirname + '/'
      });
    });

    httpsServer.listen(settings.server_https_port, function() {
      var host = httpsServer.address().address;
      var port = httpsServer.address().port;

      console.log('Server listening at https://%s:%s', host, port);
    });

    var redirectApp = express();
    var httpServer = http.createServer(redirectApp);

    reload(httpServer, app);
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
      console.error(err.stack);
    } else {
      console.error('Error: ' + err);
    }
  }).done();
} catch (err) {
  if (err.stack) {
    console.error(err.stack);
  } else {
    console.error('Error: ' + err);
  }
}


