if (!Detector.webgl) {
	Detector.addGetWebGLMessage();
	throw 500;
}

var xmlHttp = null;

xmlHttp = new XMLHttpRequest();
xmlHttp.open("GET", "/data", false);
xmlHttp.send(null);

var json = JSON.parse(xmlHttp.responseText);

var container = document.getElementById('container');
var globe = new DAT.Globe(container);

globe.addData(json)
globe.createPoints();


globe.animate();