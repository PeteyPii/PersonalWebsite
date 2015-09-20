var childProcess = require('child_process');
var http = require('http');
var os = require('os');

var express = require('express');
var open = require('open');

var settings = require('./settings.js');

module.exports = function(grunt) {
  grunt.initConfig({});

  grunt.registerTask('serve', 'Task to run the website in development.', function(build) {
    if (!build) {
      throw new Error('Need to set build');
    }

    if (build.toLowerCase() !== 'develop') {
      throw new Error('Not implemented');
    }

    var done = this.async();

    var supervisorCommand = 'supervisor';
    if (os.platform() === 'win32') {
      supervisorCommand += '.cmd';
    }

    var webServer = childProcess.spawn(supervisorCommand, ['--extensions', 'js,html,less,json', '--ignore', '.', '--no-restart-on-exit', 'exit', '--quiet', 'server.js']);

    webServer.stdout.on('data', function(data) {
      var strData = data.toString();
      process.stdout.write(strData);

      // Wait for the console to log that the server is listening to open up the site in the browser
      if (data.toString().match('listening')) {
        if (done) {
          done();
          done = null;
        }
      }
    });

    webServer.stderr.on('data', function(data) {
      process.stdout.write(data.toString());
    });
  });

  grunt.registerTask('open', 'Task to open the app in the browser.', function() {
    console.log('Opening http://localhost in your browser');
    open('http://localhost:' + settings.server_http_port);
  });

  grunt.registerTask('wait', 'Task to wait forever in grunt.', function() {
    console.log('Waiting forever...\n');
    this.async();
  });

  grunt.registerTask('default', ['serve:develop', 'open', 'wait']);
};
