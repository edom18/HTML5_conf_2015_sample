(function () {
    'use strict';

    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
    }

    var hash = document.location.hash.substr(1);
    if (hash) {
        hash = parseInt(hash, 0);
    }

    /* TEXTURE WIDTH FOR SIMULATION */
    var WIDTH = hash || 32;

    var container;

    var object,
        camera,
        light,
        scene,
        renderer;

    var geometry,
        material,
        mesh;

    function init() {

        container = document.createElement('div');
        document.body.appendChild(container);

        //

        // オブジェクト（箱）を生成
        object = new THREE.Object3D();

        // カメラを生成
        var fov    = 75;
        var aspect = window.innerWidth / window.innerHeight;
        var zNear  = 1;
        var zFar   = 3000;
        camera = new THREE.PerspectiveCamera(fov, aspect, zNear, zFar);
        camera.position.z = 150;

        // ライトを生成
        light = new THREE.DirectionalLight(0xffffff);
        light.position.set(100, 10, 100);

        // シーンを生成
        scene = new THREE.Scene();

        geometry = new THREE.BoxGeometry(50, 50, 50);
        material = new THREE.MeshLambertMaterial({
            color: 0xaa0000
        });
        mesh = new THREE.Mesh(geometry, material);

        scene.add(mesh);
        scene.add(light);

        camera.lookAt(mesh.position);

        // レンダラーを生成
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0x000000);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);
    }

    init();

    (function animate() {
        requestAnimationFrame(animate);

        mesh.rotation.x += 0.01;

        render();
    }());

    function render() {
        renderer.render(scene, camera);
    }

}());
