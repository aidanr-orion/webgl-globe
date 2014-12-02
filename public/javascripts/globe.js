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
    var colorFn = opts.colorFn || function(x) {
        var c = new THREE.Color();
        c.setHSL((0.6 - (x * 0.5)), 1.0, 0.5);
        return c;
    };
    var imgDir = opts.imgDir || '/images/';

    var camera, scene, renderer, w, h;
    var mesh, atmosphere, point;
    var overRenderer;
    var curZoomSpeed = 0;
    var zoomSpeed = 50;
    var mouse = {
            x: 0,
            y: 0
        },
        mouseOnDown = {
            x: 0,
            y: 0
        };
    var rotation = {
            x: 0,
            y: 0
        },
        target = {
            x: Math.PI * 3 / 2,
            y: Math.PI / 6.0
        },
        targetOnDown = {
            x: 0,
            y: 0
        };
    var distance = 100000,
        distanceTarget = 100000;
    var padding = 40;
    var PI_HALF = Math.PI / 2;

    function init() {
        // Set container styles
        container.style.color = '#fff';
        container.style.font = '13px/20px Arial, sans-serif';
        var shader, uniforms, material;
        w = container.offsetWidth || window.innerWidth;
        h = container.offsetHeight || window.innerHeight;
        // Init Camera
        camera = new THREE.PerspectiveCamera(30, w / h, 1, 10000);
        camera.position.z = distance;
        // Init Scene
        scene = new THREE.Scene();
        // Add earth with an atmospher to the scene
        addEarth();
        // Create points objects
        geometry = new THREE.CubeGeometry(0.75, 0.75, 1);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, -0.5));
        point = new THREE.Mesh(geometry);
        // Create a renderer
        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer.setSize(w, h);
        renderer.domElement.style.position = 'absolute';
        container.appendChild(renderer.domElement);
        // Add event listeners
        container.addEventListener('mousedown', onMouseDown, false);
        container.addEventListener('mousewheel', onMouseWheel, false);
        document.addEventListener('keydown', onDocumentKeyDown, false);
        window.addEventListener('resize', onWindowResize, false);
        container.addEventListener('mouseover', function() {
            overRenderer = true;
        }, false);
        container.addEventListener('mouseout', function() {
            overRenderer = false;
        }, false);
    }

    function addEarth() {
        var geometry = new THREE.SphereGeometry(200, 40, 30);
        var shader = Shaders['earth'];
        var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        uniforms['texture'].value = THREE.ImageUtils.loadTexture(imgDir + 'world.jpg');
        var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader
        });
        mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.y = Math.PI;
        scene.add(mesh);
        addAtmosphere(geometry);
    }

    function addAtmosphere(geometry) {
        shader = Shaders['atmosphere'];
        uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        mesh = new THREE.Mesh(geometry, material);
        mesh.scale.set(1.1, 1.1, 1.1);
        scene.add(mesh);
    }

    addData = function(data) {
        var lat, lng, size, color;

        var step = 3;
        var colorFnWrapper = function(size) {
            return colorFn(size);
        }

        var subgeo = new THREE.Geometry();
        for (var i = 0; i < data.length; i += step) {
            lat = data[i];
            lng = data[i + 1];
            color = colorFnWrapper(data[i + 2]/10);
            size = data[i + 2];
            size = size * 10;
            addPoint(lat, lng, size, color, subgeo);
        }
        this._baseGeometry = subgeo;
    };

    function createPoints() {
        if (this._baseGeometry !== undefined) {
            this.points = new THREE.Mesh(this._baseGeometry, new THREE.MeshBasicMaterial({
                color: 0xffffff,
                vertexColors: THREE.FaceColors,
                morphTargets: false
            }));
            scene.add(this.points);
        }
    }

    function removePoints() {
        scene.remove(this.points);
    }

    function addPoint(lat, lng, size, color, subgeo) {
        var phi = (90 - lat) * Math.PI / 180;
        var theta = (180 - lng) * Math.PI / 180;
        point.position.x = 200 * Math.sin(phi) * Math.cos(theta);
        point.position.y = 200 * Math.cos(phi);
        point.position.z = 200 * Math.sin(phi) * Math.sin(theta);
        point.lookAt(mesh.position);
        point.scale.z = Math.max(size, 0.1); // avoid non-invertible matrix
        point.updateMatrix();
        for (var i = 0; i < point.geometry.faces.length; i++) {
            point.geometry.faces[i].color = color;
        }
        THREE.GeometryUtils.merge(subgeo, point);
    }

    function onMouseDown(event) {
        event.preventDefault();
        container.addEventListener('mousemove', onMouseMove, false);
        container.addEventListener('mouseup', onMouseUp, false);
        container.addEventListener('mouseout', onMouseOut, false);
        mouseOnDown.x = -event.clientX;
        mouseOnDown.y = event.clientY;
        targetOnDown.x = target.x;
        targetOnDown.y = target.y;
        container.style.cursor = 'move';
    }

    function onMouseMove(event) {
        mouse.x = -event.clientX;
        mouse.y = event.clientY;
        var zoomDamp = distance / 1000;
        target.x = targetOnDown.x + (mouse.x - mouseOnDown.x) * 0.005 * zoomDamp;
        target.y = targetOnDown.y + (mouse.y - mouseOnDown.y) * 0.005 * zoomDamp;
        target.y = target.y > PI_HALF ? PI_HALF : target.y;
        target.y = target.y < -PI_HALF ? -PI_HALF : target.y;
    }

    function onMouseUp(event) {
        container.removeEventListener('mousemove', onMouseMove, false);
        container.removeEventListener('mouseup', onMouseUp, false);
        container.removeEventListener('mouseout', onMouseOut, false);
        container.style.cursor = 'auto';
    }

    function onMouseOut(event) {
        container.removeEventListener('mousemove', onMouseMove, false);
        container.removeEventListener('mouseup', onMouseUp, false);
        container.removeEventListener('mouseout', onMouseOut, false);
    }

    function onMouseWheel(event) {
        event.preventDefault();
        if (overRenderer) {
            zoom(event.wheelDeltaY * 0.3);
        }
        return false;
    }

    function onDocumentKeyDown(event) {
        switch (event.keyCode) {
            case 38:
                zoom(100);
                event.preventDefault();
                break;
            case 40:
                zoom(-100);
                event.preventDefault();
                break;
        }
    }

    function onWindowResize(event) {
        camera.aspect = container.offsetWidth / container.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
    }

    function zoom(delta) {
        distanceTarget -= delta;
        distanceTarget = distanceTarget > 1000 ? 1000 : distanceTarget;
        distanceTarget = distanceTarget < 350 ? 350 : distanceTarget;
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
        zoom(curZoomSpeed);
        rotation.x += (target.x - rotation.x) * 0.1;
        rotation.y += (target.y - rotation.y) * 0.1;
        distance += (distanceTarget - distance) * 0.3;
        camera.position.x = distance * Math.sin(rotation.x) * Math.cos(rotation.y);
        camera.position.y = distance * Math.sin(rotation.y);
        camera.position.z = distance * Math.cos(rotation.x) * Math.cos(rotation.y);
        camera.lookAt(mesh.position);
        renderer.render(scene, camera);
    }
    init();
    this.animate = animate;
    this.__defineGetter__('time', function() {
        return this._time || 0;
    });
    this.__defineSetter__('time', function(t) {
        var validMorphs = [];
        var morphDict = this.points.morphTargetDictionary;
        for (var k in morphDict) {
            if (k.indexOf('morphPadding') < 0) {
                validMorphs.push(morphDict[k]);
            }
        }
        validMorphs.sort();
        var l = validMorphs.length - 1;
        var scaledt = t * l + 1;
        var index = Math.floor(scaledt);
        for (i = 0; i < validMorphs.length; i++) {
            this.points.morphTargetInfluences[validMorphs[i]] = 0;
        }
        var lastIndex = index - 1;
        var leftover = scaledt - index;
        if (lastIndex >= 0) {
            this.points.morphTargetInfluences[lastIndex] = 1 - leftover;
        }
        this.points.morphTargetInfluences[index] = leftover;
        this._time = t;
    });
    this.removePoints = removePoints;
    this.addData = addData;
    this.createPoints = createPoints;
    this.renderer = renderer;
    this.scene = scene;
    return this;
};