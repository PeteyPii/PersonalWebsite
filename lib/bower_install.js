var path = require('path');

var bower = require('bower');
var fs = require('fs-extra');

var logger = require('./logger.js');

var files = [
  'angular-route/angular-route.js',
  'angular/angular.js',
  'archivonarrow-googlefont/ArchivoNarrow-Bold.ttf',
  'archivonarrow-googlefont/ArchivoNarrow-BoldItalic.ttf',
  'archivonarrow-googlefont/ArchivoNarrow-Italic.ttf',
  'archivonarrow-googlefont/ArchivoNarrow-Regular.ttf',
  'bitter-googlefont/Bitter-Bold.ttf',
  'bitter-googlefont/Bitter-Italic.ttf',
  'bitter-googlefont/Bitter-Regular.ttf',
  'bootstrap/dist/css/bootstrap-theme.css',
  'bootstrap/dist/css/bootstrap-theme.css.map',
  'bootstrap/dist/css/bootstrap.css',
  'bootstrap/dist/css/bootstrap.css.map',
  'bootstrap/dist/fonts/glyphicons-halflings-regular.eot',
  'bootstrap/dist/fonts/glyphicons-halflings-regular.svg',
  'bootstrap/dist/fonts/glyphicons-halflings-regular.ttf',
  'bootstrap/dist/fonts/glyphicons-halflings-regular.woff',
  'bootstrap/dist/fonts/glyphicons-halflings-regular.woff2',
  'bootstrap/dist/js/bootstrap.js',
  'font-awesome/css/font-awesome.css',
  'font-awesome/fonts/fontawesome-webfont.eot',
  'font-awesome/fonts/fontawesome-webfont.svg',
  'font-awesome/fonts/fontawesome-webfont.ttf',
  'font-awesome/fonts/fontawesome-webfont.woff',
  'font-awesome/fonts/fontawesome-webfont.woff2',
  'font-awesome/fonts/FontAwesome.otf',
  'jquery/dist/jquery.js',
  'oswald-googlefont/Oswald-Bold.ttf',
  'oswald-googlefont/Oswald-ExtraLight.ttf',
  'oswald-googlefont/Oswald-Light.ttf',
  'oswald-googlefont/Oswald-Medium.ttf',
  'oswald-googlefont/Oswald-Regular.ttf',
  'oswald-googlefont/Oswald-SemiBold.ttf',
];

module.exports = function(callback) {
  bower.commands.install(undefined, undefined, { cwd: path.join(__dirname, '..') }).on('error', logger.error).on('log', function(message) {
    // Do nothing
  }).on('end', function() {
    logger.log('Installed bower dependencies');

    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var type = path.extname(file);
      switch (type) {
        case '.js':
          fs.copySync(path.join(__dirname, '../bower_components', file), path.join(__dirname, '../public/js/lib/', path.basename(file)));
          break;
        case '.css':
        case '.map':
          fs.copySync(path.join(__dirname, '../bower_components', file), path.join(__dirname, '../public/css/', path.basename(file)));
          break;
        case '.otf':
        case '.eot':
        case '.svg':
        case '.ttf':
        case '.woff':
        case '.woff2':
          fs.copySync(path.join(__dirname, '../bower_components', file), path.join(__dirname, '../public/fonts/', path.basename(file)));
          break;
      }
    }

    logger.log('Copied all front end dependencies to public folder');

    callback();
  });
};
