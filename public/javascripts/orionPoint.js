

OrionPoint = function() {
  
  THREE.Object3D.call(this);
  
  this.container = new THREE.Object3D();
  this.container.rotation.y = THREE.Math.degToRad(180);
  this.add(this.container);
  
  this.color = 0xFF33CC;
  this.addPointDrop();
  this.addPoint();

};

OrionPoint.prototype = new THREE.Object3D();
OrionPoint.prototype.constructor = OrionPoint;
OrionPoint.prototype.supr = THREE.Object3D.prototype;

OrionPoint.prototype.addPointDrop = function() {
  
};

OrionPoint.prototype.addPoint = function () {
  var radius = 20;
  var segments = 16 
  var time = 4; // Show point for 4 seconds
  
  var material = new THREE.MeshBasicMaterial({
    color: this.color,
    transparent: true,
    opacity: 1.0
  });
  var circleGeometry = new THREE.CircleGeometry(radius, segments);        
  var circle = new THREE.Mesh(circleGeometry, material);
    
  circle.position.z = 5;
  circle.scale.x = circle.scale.y = circle.scale.x = 0.1;
  this.container.add(circle);
  
  this.tween = new TWEEN.Tween(circle.scale).to({x: 1.0, y: 1.0, z: 1.0}, 1000);
  
  this.show();
};

OrionPoint.prototype.show = function () {
  var self = this;
  
  
  this.tween.onComplete(function(){
    self.hide();
  });
  this.tween.start();
};

OrionPoint.prototype.hide = function () {
  // Remove the point animation
  // Remove point
  if (this.onHideCallback) this.onHideCallback();
};

OrionPoint.prototype.onHide = function (callback) {
  this.onHideCallback = callback;
}