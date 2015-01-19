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
    // camera.position.x = -200;
    camera.position.y = 100;
    camera.position.z = 150;


    //////////////////////////////////////////////////////////////////////////
    // ライトを生成
    var light = new THREE.DirectionalLight(0x999999);
    light.position.set(10, 100, 10);
    light.castShadow = true;
    light.shadowMapWidth  = 2048;
    light.shadowMapHeight = 2048;

    var ambientLight = new THREE.AmbientLight(0x666666);

    // シャドウのデバッグフラグ
    // light.shadowCameraVisible = true;


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
    var boxMaterial1 = new THREE.MeshLambertMaterial({
        color: cubeColor
    });
    var boxMaterial2 = new THREE.MeshLambertMaterial({
        color: cubeColor
    });
    var boxMaterial3 = new THREE.MeshLambertMaterial({
        color: cubeColor
    });

    var cube1 = new THREE.Mesh(boxGeometry, boxMaterial1);
    cube1.castShadow = true;
    cube1.position.x = -100;

    var cube2 = new THREE.Mesh(boxGeometry, boxMaterial2);
    cube2.castShadow = true;

    var cube3 = new THREE.Mesh(boxGeometry, boxMaterial3);
    cube3.position.x = 100;
    cube3.castShadow = true;


    //////////////////////////////////////////////////////////////////////////
    // シーンにオブジェクトを追加
    scene.add(plane);
    scene.add(cube1);
    scene.add(cube2);
    scene.add(cube3);
    scene.add(light);
    scene.add(ambientLight);


    //////////////////////////////////////////////////////////////////////////
    // カメラの注視点をcube2の位置にする
    camera.lookAt(cube2.position);


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

        cube1.rotation.x += 0.01;
        cube1.rotation.y += 0.005;

        cube2.rotation.x -= 0.01;
        cube2.rotation.y -= 0.005;

        cube3.rotation.x += 0.005;
        cube3.rotation.y += 0.0015;

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
            objs[0].object.material.color = new THREE.Color(hoverCubeColor);
        }
        else {
            [cube1, cube2, cube3].forEach(function (cube) { 
                cube.material.color = new THREE.Color(cubeColor);
            });
        }
    }, false);

}());
