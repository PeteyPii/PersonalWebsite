var express = require('express');
var request = require('request');

var api = express.Router();

api.get('/Euler', function(req, res) {
  var data = {};

  request = request.get('http://projecteuler.net/profile/BasicBananas.txt', function(err, resp, body) {
    if (err) {
      res.status(400);
      res.send('Bad request');
      return;
    }

    var stats = body.split(',');

    data.problemsSolved = stats[3];

    res.send(data);
  });

});

module.exports = api;
