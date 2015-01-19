(function () {

    'use strict';

    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
    }

    //////////////////////////////////////////////////////////////////////////
    // キューブの色
    var cubeColor      = new THREE.Color(0x3333aa);
    var hoverCubeColor = new THREE.Color(0xaa0000);


    //////////////////////////////////////////////////////////////////////////
    // カメラを生成
    var fov    = 75;
    var aspect = window.innerWidth / window.innerHeight;
    var zNear  = 1;
    var zFar   = 3000;
    var camera = new THREE.PerspectiveCamera(fov, aspect, zNear, zFar);
    camera.position.y = 100;
    camera.position.z = 150;


    //////////////////////////////////////////////////////////////////////////
    // ライトを生成
    var light = new THREE.DirectionalLight(0x999999);
    light.position.set(10, 100, 10);
    light.castShadow = true;
    light.shadowMapWidth  = 2048;
    light.shadowMapHeight = 2048;


    //////////////////////////////////////////////////////////////////////////
    // シーンを生成
    var scene = new THREE.Scene();


    //////////////////////////////////////////////////////////////////////////
    // 地面を生成
    var planeGeometry = new THREE.PlaneBufferGeometry(1000, 1000, 1000);
    var planeMaterial = new THREE.MeshLambertMaterial({
        color: 0xdddddd
    });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.y    = -100;
    plane.rotation.x    = -Math.PI / 2;
    plane.receiveShadow = true;


    //////////////////////////////////////////////////////////////////////////
    // キューブを生成
    var boxGeometry = new THREE.BoxGeometry(50, 50, 50);
    var boxMaterial = new THREE.MeshLambertMaterial({
        color: cubeColor
    });

    var cube = new THREE.Mesh(boxGeometry, boxMaterial);
    cube.castShadow = true;
    cube.position.x = -100;

    // cubeを複製する
    // var cube2 = ....
    // var cube3 = ....


    //////////////////////////////////////////////////////////////////////////
    // シーンにオブジェクトを追加
    scene.add(plane);
    scene.add(cube);
    scene.add(light);


    //////////////////////////////////////////////////////////////////////////
    // カメラの注視点をcubeの位置にする
    camera.lookAt(cube.position);


    //////////////////////////////////////////////////////////////////////////
    // レンダラーを生成
    var renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setClearColor(0x000000, 0.0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;
    document.body.appendChild(renderer.domElement);


    //////////////////////////////////////////////////////////////////////////
    // アニメーション
    (function animate() {
        requestAnimationFrame(animate);

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.005;

        render();
    }());


    //////////////////////////////////////////////////////////////////////////
    // レンダリングをupdate
    function render() {
        renderer.render(scene, camera);
    }


    //////////////////////////////////////////////////////////////////////////
    // マウスによるホバー処理
    renderer.domElement.addEventListener('mousemove', function (e) {

        // ホバー処理を書く

    }, false);

}());
