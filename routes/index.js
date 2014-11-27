var express = require('express');
var router = express.Router();

var GAPI = require('gapitoken');
var GA = require('googleanalytics');

var client = process.env.OAUTH_CLIENT;
var secret = process.env.OAUTH_SECRET;
 
var gapi = new GAPI({
	iss : client,
	scope : "https://www.googleapis.com/auth/analytics.readonly",
	key : secret
}, function(err) {
	 gapi.getToken(function (err, token) {
	 	if(err) return console.log(err);
	 });
});


function parseOptions (req) {
	var options = {
		'ids': process.env.GOOGLE_PROFILE_ID,
	    'start-date' : 'yesterday',
	    'end-date' : 'yesterday',
	    'dimensions' : 'ga:latitude, ga:longitude, ga:hour, ga:minute',
	    'metrics' : ['ga:sessions'],
	    'sort' : 'ga:hour, ga:minute'
	};
	return options;
}



/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'ejs'});
});

router.get('/data/', function(req, res) {
  gapi.getToken(function (err, token){
  	if (err) return res.json(err);
  	var ga = new GA.GA({"token": token});
  	var options = parseOptions(req);
  	ga.get(options, function(err, entries){
  		if (err) return res.json(err);
  		
  		 var points = entries.map(function(val){
	 		 var dim = val.dimensions[0];
	         var point = {
		        lat: parseFloat(dim["ga:latitude"]),
		        lng: parseFloat(dim["ga:longitude"]),
		        hr: parseInt(dim["ga:hour"]),
		        min: parseInt(dim["ga:minute"])
		      };
      		 return point;
    	});
  		
  		res.json(points);
  	});
  });

});

module.exports = router;

