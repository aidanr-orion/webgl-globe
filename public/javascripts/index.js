if (!Detector.webgl) {
	Detector.addGetWebGLMessage();
	throw 500;
}

function getPoints(callback) {
	var params = "startDate=" + encodeURIComponent(startDate._d) + "&endDate=" + encodeURIComponent(endDate._d);
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
			callback(JSON.parse(xmlHttp.responseText))
		}
	};
	xmlHttp.open("GET", "/data?" + params, true);
	xmlHttp.send(null);
}

function updateGlobe() {
	getPoints(function(points) {
		globe.removePoints();
		globe.addData(points)
		globe.createPoints();
	});
}

var startDate, endDate;
var globe;

$(document).ready(function() {
	startDate = moment().subtract('days', 1);
	endDate = moment().subtract('days', 1);
	$('#daterange span').html(startDate.format('MMMM D, YYYY') + ' - ' + endDate.format('MMMM D, YYYY'));
	// Initialize the date picker
	$('#daterange').daterangepicker({
			ranges: {
				'Today': [new Date(), new Date()],
				'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
				'Last 7 Days': [moment().subtract('days', 6), new Date()],
				'Last 30 Days': [moment().subtract('days', 29), new Date()],
				'This Month': [moment().startOf('month'), moment().endOf('month')],
				'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
			},
			opens: 'left',
			format: 'YYYY-MM-DD',
			startDate: moment().subtract('days', 1),
			endDate: moment().subtract('days', 1),
			buttonClasses: ["noShow"],
			showDropdowns: true
		},
		function(start, end, label) {
			$('#daterange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
			startDate = start;
			endDate = end;
		});

	$('#updateBtn').on("click", updateGlobe);

	var container = document.getElementById('globeContainer');
	globe = new DAT.Globe(container);
	globe.animate();
	updateGlobe();
});

// TODO: globe.removePoints() need to animate the points
// 			Same with globe.createPoints() Make it happen..