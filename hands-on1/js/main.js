(function () {
    'use strict';

    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
    }

    var domContainer;
    
    var camera,
        light,
        scene,
        renderer;

    var cube1, cube2, cube3;
    var plane;

    domContainer = document.createElement('div');
    document.body.appendChild(domContainer);

    // カメラを生成
    var fov    = 75;
    var aspect = window.innerWidth / window.innerHeight;
    var zNear  = 1;
    var zFar   = 3000;
    camera = new THREE.PerspectiveCamera(fov, aspect, zNear, zFar);
    // camera.position.x = -200;
    camera.position.y = 100;
    camera.position.z = 150;

    // ライトを生成
    light = new THREE.DirectionalLight(0x999999);
    light.position.set(10, 100, 10);
    light.castShadow = true;
    light.shadowMapWidth  = 2048;
    light.shadowMapHeight = 2048;

    var ambientLight = new THREE.AmbientLight(0x666666);

    // シャドウのデバッグフラグ
    // light.shadowCameraVisible = true;

    // シーンを生成
    scene = new THREE.Scene();

    var planeGeometry = new THREE.PlaneBufferGeometry(1000, 1000, 1000);
    var planeMaterial = new THREE.MeshLambertMaterial({
        color: 0xdddddd
    });
    plane = new THREE.Mesh(planeGeometry, planeMaterial);

    plane.position.y    = -100;
    plane.rotation.x    = -Math.PI / 2;
    plane.receiveShadow = true;

    var boxGeometry = new THREE.BoxGeometry(50, 50, 50);
    var boxMaterial = new THREE.MeshLambertMaterial({
        color: 0x3333aa
    });
    cube1 = new THREE.Mesh(boxGeometry, boxMaterial);
    cube1.castShadow = true;
    cube1.position.x = -100;

    cube2 = new THREE.Mesh(boxGeometry, boxMaterial);
    cube2.castShadow = true;

    cube3 = new THREE.Mesh(boxGeometry, boxMaterial);
    cube3.position.x = 100;
    cube3.castShadow = true;

    scene.add(plane);
    scene.add(cube1);
    scene.add(cube2);
    scene.add(cube3);
    scene.add(light);
    scene.add(ambientLight);

    camera.lookAt(cube2.position);

    // レンダラーを生成
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xffffff);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;
    domContainer.appendChild(renderer.domElement);

    (function animate() {
        requestAnimationFrame(animate);

        cube1.rotation.x += 0.01;
        cube1.rotation.y += 0.005;

        cube2.rotation.x -= 0.01;
        cube2.rotation.y -= 0.005;

        cube3.rotation.x += 0.005;
        cube3.rotation.y += 0.0015;

        render();
    }());

    function render() {
        renderer.render(scene, camera);
    }

    domContainer.addEventListener('mousemove', function (e) {

        var rect = e.target.getBoundingClientRect();

        // スクリーン上のマウス位置を取得する
        var mouseX = e.clientX - rect.left;
        var mouseY = e.clientY - rect.top;

        // 取得したスクリーン座標を-1〜1に正規化する（WebGLは-1〜1で座標が表現される）
        mouseX =  (mouseX / window.innerWidth)  * 2 - 1;
        mouseY = -(mouseY / window.innerHeight) * 2 + 1;

        // マウスの位置ベクトル
        var pos = new THREE.Vector3(mouseX, mouseY, 1);

        // pos はスクリーン座標系なので、オブジェクトの座標系に変換
        // オブジェクト座標系は今表示しているカメラからの視点なのでカメラオブジェクトを渡す
        pos.unproject(camera);

        // 始点、向きベクトルを渡してレイを作成
        var ray = new THREE.Raycaster(camera.position, pos.sub(camera.position).normalize());

        // 交差判定
        // 引数は取得対象となるMeshの配列を渡す。以下はシーン内のすべてのオブジェクトを対象に。
        // ヒエラルキーを持った子要素も対象とする場合は第二引数にtrueを指定する
        var objs = ray.intersectObjects([cube1, cube2, cube3], true);

        if (objs.length > 0) {
            objs[0].object.material.color = new THREE.Color(0xaa0000);
        }
        else {
            [cube1, cube2, cube3].forEach(function (cube) { 
                cube.material.color = new THREE.Color(0x3333aa);
            });
        }
    }, false);

}());
