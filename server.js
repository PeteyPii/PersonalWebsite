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

  var settings = {};
  settings = _.assign(settings, require(path.join(__dirname, 'defaults.json')), require(path.join(__dirname, 'settings.json')));

  Q.Promise(function(resolve, reject, notify) {
    if (settings.dont_host_mlf) {
      resolve();
    } else {
      resolve(mlf.createApp(true));
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

    httpsServer.listen(443, function() {
      var host = httpsServer.address().address;
      var port = httpsServer.address().port;

      console.log('Server listening at http://%s:%s', host, port);
    });

    var redirectApp = express();
    var httpServer = http.createServer(redirectApp);

    reload(httpServer, app);
    redirectApp.get('/MLF', function(req, res) {
      res.redirect('https://' + req.hostname + req.url);
    });
    redirectApp.use('/', app);

    httpServer.listen(80);

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


