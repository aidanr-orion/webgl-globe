var express = require('express');
var router = express.Router();
var GAPI = require('gapitoken');
var GA = require('googleanalytics');

var token;

// Get google token
var gapi = new GAPI({
  iss: "",
  scope: "",
  keyFile: ""
}, function(err){
  if(err) console.log(err);
  gapi.getToken(function(err, t){
    if(err) return console.log(err);
    token = t;
  });
});





/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'ejs'});
});

router.get('/data/', function(req, res) {
  var config = {
    "token": token
  };
  var ga = new GA.GA(config);

  // Get the past day's data
  var options = {
    'ids': '',
    'start-date' : 'yesterday',
    'end-date' : 'yesterday',
    'dimensions' : 'ga:latitude, ga:longitude, ga:hour, ga:minute',
    'metrics' : ['ga:sessions'],
    'sort' : 'ga:hour, ga:minute'
  };
  ga.get(options, function(err, entries) {
    if (err) console.log(err);

    var points = entries.map(function(val){
      var dim = val.dimensions[0];
      var point = {
        lat: parseFloat(dim["ga:latitude"]),
        lng: parseFloat(dim["ga:longitude"]),
        hr: parseInt(dim["ga:hour"]),
        min: parseInt(dim["ga:minute"])
      }
      return point;
    });
    res.json(points);
  });
});

module.exports = router;
