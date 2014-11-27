if(!Detector.webgl){
  Detector.addGetWebGLMessage();
  throw 500;
}

var container = document.getElementById('container');
var globe = new DAT.Globe(container);
globe.animate();
// India
globe.addPoint(21, 78);
// Mongolia
globe.addPoint(46, 105);

var xmlHttp = null;

xmlHttp = new XMLHttpRequest();
xmlHttp.open( "GET", "/data", false );
xmlHttp.send( null );

var json = JSON.parse(xmlHttp.responseText);


