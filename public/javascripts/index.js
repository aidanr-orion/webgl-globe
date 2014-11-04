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

// Create with socket.io?
var socket = new WebSocket("ws://localhost:8000", "echo-protocol");

socket.onopen = function(){
   /*Send a small message to the console once the connection is established */
   console.log('Connection open!');
}
socket.onmessage = function(evt) {
  var recievedData = evt.data;
  var pos = JSON.parse(recievedData);
  globe.addPoint(pos.lat, pos.lng);
}
var done = false;
var test = function() {
      if(done) return;
      var pos = genereateLatLng();
      var message = JSON.stringify(pos);
      socket.send(message);
      setTimeout(test, 100);
};
socket.onopen = function(){
  test();
}

function genereateLatLng() {
  var pos = {};
  pos.lat = getRandomInRange(-180, 180, 3);
  pos.lng = getRandomInRange(-180, 180, 3);
  return pos;
}

function getRandomInRange(from, to, fixed) {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
    // .toFixed() returns string, so ' * 1' is a trick to convert to number
}