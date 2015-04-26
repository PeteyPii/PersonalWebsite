var http = require('http');
var fs = require('fs');
var path = require('path');

var express = require('express');
var file = require('file');
var less = require('less');
var reload = require('reload');

console.log('Rendering LESS files');

file.walkSync('less', function(dirPath, dirs, files) {
  for (var i = 0; i < files.length; i++) {
    var filePath = path.join(dirPath, files[i]);
    less.render(fs.readFileSync(filePath).toString('utf8'), {
      paths: ['less'],
      filename: filePath,
      compress: false
    }, function(err, output) {
      if (err) {
        throw err;
      }

      var outFileName = path.join('public/css', dirPath.split(path.sep).slice(1).join(path.sep), path.basename(files[i], '.less') + '.css');
      fs.writeFileSync(outFileName, output.css);
    });
  }
});

console.log('Starting server up');

var app = express();
var server = http.createServer(app);

reload(server, app);

app.use(express.static('public'));

app.get('*', function(req, res){
  console.log(req.method + ' request at ' + req.url);
  res.sendFile('index.html', {
    root: __dirname + '/'
  });
});

server.listen(80, '127.0.0.1', function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Server listening at http://%s:%s', host, port);
});


