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

var xmlHttp = new XMLHttpRequest();
xmlHttp.open("GET", "/data", false);
xmlHttp.send( null );
var points = JSON.parse(xmlHttp.responseText);

points.forEach(function(point) {
  var date = new Date();
  var hour = date.getHours();
  var minute = date.getMinutes();
  if(point.hr <= hour && point.min <= minute) return;
  var millisTill10 = new Date(date.getFullYear(), date.getMonth(), date.getDate(), point.hr, point.min, 0, 0) - date;
  timeoutPoint(point.lat, point.lng, millisTill10);
});


function timeoutPoint(lat, lng, time){
 setTimeout(plotPoint(lat, lng), time);
}
function plotPoint (lat, lng){
  return function(){
    console.log("point: " + new Date());
    globe.addPoint(lat, lng);
  };
}


timeoutStuff(46, 105, 1000);