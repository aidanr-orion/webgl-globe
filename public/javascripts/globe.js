/**
 * dat.globe Javascript WebGL Globe Toolkit
 * http://dataarts.github.com/dat.globe
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

var DAT = DAT || {};

DAT.Globe = function(container, opts) {
  opts = opts || {};
  

  var imgDir = opts.imgDir || '/images/';

  

  var camera, scene, renderer;
  var orionPoints, earchMesh, atmosphere;

  var rotation = { x: 0, y: 0 },
      target = { x: Math.PI*3/2, y: Math.PI / 6.0 },
      targetOnDown = { x: 0, y: 0 };
  
  // CONSTANTS
  var PI_HALF = Math.PI / 2;
  var POS_X = 0;
	var POS_Y = 800;
	var POS_Z = 2000;
	var FOV = 45;
	var NEAR = 1;
	var FAR = 150000;
  var ROTATION = -0.002;
  var E_RAD = 600, E_HEIGHT = 50, E_WIDTH = 50;
  
  function init() {
  
    container.style.color = '#fff';
    container.style.font = '13px/20px Arial, sans-serif';

    var shader, uniforms, material;
    
    var innerWidth = container.offsetWidth || window.innerWidth;
    var innerHeight = container.offsetHeight || window.innerHeight;
    
    // Create the renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(innerWidth, innerHeight);
    renderer.domElement.style.position = 'absolute';
    container.appendChild(renderer.domElement);
    
    // Create the camera
    camera = new THREE.PerspectiveCamera(FOV, innerWidth / innerHeight, NEAR, FAR);
		camera.position.set(POS_X, POS_Y, POS_Z);
		camera.lookAt( new THREE.Vector3(0,0,0) );
    
    // Create the scene
    scene = new THREE.Scene();
    scene.add(camera);
    
    // Add Elements
    addEarth();
    addAtmosphere();

    // Set Event Listeners
    window.addEventListener('resize', onWindowResize, false);
  }

  function addAtmosphere(){
    var geometry = new THREE.SphereGeometry(E_RAD, E_WIDTH, E_HEIGHT);
    var shader = Shaders['atmosphere'];
    var uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    var material = new THREE.ShaderMaterial({

          uniforms: uniforms,
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          transparent: true

        });

    var mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set( 1.1, 1.1, 1.1 );
    scene.add(mesh);
  }
  
  function addEarth() {
    var geometry = new THREE.SphereGeometry(E_RAD, E_WIDTH, E_HEIGHT);
    var shader = Shaders['earth'];
    var uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    uniforms['texture'].value = THREE.ImageUtils.loadTexture(imgDir+'world.jpg');

    var material = new THREE.ShaderMaterial({

          uniforms: uniforms,
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader

        });

    earchMesh = new THREE.Mesh(geometry, material);
    earchMesh.rotation.y = Math.PI;
    scene.add(earchMesh);
    
    orionPoints = new THREE.Object3D();
    earchMesh.add(orionPoints);
  }
  
  function latlngToVector3(lat, lng) {
    lng = lng + 10;
	  lat = lat - 2;

	  var phi = PI_HALF - lat * Math.PI / 180 - Math.PI * 0.01;
	  var theta = 2 * Math.PI - lng * Math.PI / 180 + Math.PI * 0.06;
    
    var vector3 = new THREE.Vector3(0,0,0);
    vector3.x = E_RAD * Math.sin(phi) * Math.cos(theta);
    vector3.y = E_RAD * Math.cos(phi);
    vector3.z = E_RAD * Math.sin(phi) * Math.sin(theta);
    
    return vector3;
  }

  function addPoint(lat, lng) {

    var vector3 = latlngToVector3(lat, lng);
    var point = new OrionPoint();
    point.position.x = vector3.x;
    point.position.y = vector3.y;
    point.position.z = vector3.z;
    point.lookAt(earchMesh.position);
    
    orionPoints.add(point);
    point.onHide(function() {
      orionPoints.remove(point);
    });
  }

  function onWindowResize( event ) {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( container.offsetWidth, container.offsetHeight );
  }


  function animate() {
    requestAnimationFrame(animate);
    render();
  }

  function render() {

    earchMesh.rotation.y = earchMesh.rotation.y + ROTATION;

    renderer.autoClear = false;
    renderer.clear();
    renderer.render(scene, camera);
    
    TWEEN.update();
  }

  init();
  this.animate = animate;


  this.addPoint = addPoint;
  this.renderer = renderer;
  this.scene = scene;

  return this;

};

