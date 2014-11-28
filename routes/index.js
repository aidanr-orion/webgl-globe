var express = require('express');
var router = express.Router();

var GAPI = require('gapitoken');
var GA = require('googleanalytics');

var client = process.env.OAUTH_CLIENT;
var secret = process.env.OAUTH_SECRET;

var gapi = new GAPI({
	iss: client,
	scope: "https://www.googleapis.com/auth/analytics.readonly",
	key: secret
}, function(err) {
	gapi.getToken(function(err, token) {
		if (err) return console.log(err);
	});
});


function parseOptions(req) {
	var options = {
		'ids': process.env.GOOGLE_PROFILE_ID,
		'start-date': 'yesterday',
		'end-date': 'yesterday',
		'dimensions': 'ga:latitude, ga:longitude, ga:hour, ga:minute',
		'metrics': ['ga:sessions'],
		'sort': 'ga:hour, ga:minute'
	};
	return options;
}



/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', {
		title: 'ejs'
	});
});

router.get('/data/', function(req, res) {
	gapi.getToken(function(err, token) {
		if (err) return res.json(err);
		var ga = new GA.GA({
			"token": token
		});
		var options = parseOptions(req);
		ga.get(options, function(err, entries) {
			if (err) return res.json(err);
			var points = entries.map(function(val) {
				var dim = val.dimensions[0];
				var point = {
					lat: Math.round(parseFloat(dim["ga:latitude"])),
					lng: Math.round(parseFloat(dim["ga:longitude"]))
				};
				return point;
			});
			var pnts = {};
			for (var i = 0; i < points.length; i++) {
				var point = points[i];
				if (!pnts[point.lat])
					pnts[point.lat] = {};
				if (!pnts[point.lat][point.lng])
					pnts[point.lat][point.lng] = 0;
				pnts[point.lat][point.lng] += 1
			}
			var json = [];
			for (var lat in pnts) {
				var value = pnts[lat];
				for (var lng in value) {
					var count = value[lng];
					json.push(lat, lng, count);
				}
			}

			res.json(json);
		});
	});

});

module.exports = router;