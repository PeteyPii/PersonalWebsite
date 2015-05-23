var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');

var express = require('express');
var file = require('file');
var less = require('less');
var reload = require('reload');

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

  mlf.createApp(true).then(function(mlfApp) {
    var app = express();

    app.use('/MLF', mlfApp);
    app.use(express.static(path.join(__dirname, 'public')));

    var httpsServer = https.createServer({
      key: fs.readFileSync(path.join(__dirname, 'certs/key.pem')),
      cert: fs.readFileSync(path.join(__dirname, 'certs/key-cert.pem')),
      requestCert: true,
      rejectUnauthorized: false
    }, app);

    reload(httpsServer, app);

    app.get('*', function(req, res) {
      console.log(req.method + ' request at ' + req.url);
      res.sendFile('index.html', {
        root: __dirname + '/'
      });
    });

    httpsServer.listen(443, '127.0.0.1', function() {
      var host = httpsServer.address().address;
      var port = httpsServer.address().port;

      console.log('Server listening at http://%s:%s', host, port);
    });

    var redirectApp = express();
    var httpServer = http.createServer(redirectApp);

    reload(httpServer, app);
    /*redirectApp.get('/MLF/*', function(req, res) {
      res.redirect('https://' + req.hostname + req.url);
    });*/
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


