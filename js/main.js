(function () {
    'use strict';

    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
    }

    /**
     * @param a 初期値
     * @param b 達成値
     * @param x 0〜1の遷移
     */
    function easing(a, b, x) {
        var c = b - a;
        return c * (-Math.pow(2, -10 * x) + 1) + a;
    }

    var PI_2 = Math.PI / 2;

    var domContainer;

    var container,
        camera,
        light,
        scene,
        renderer;

    var cube, ret;
    var plane;

    function createCube(width, height, depth) {
        var segments = 10;
        var faceGeometry = new THREE.PlaneBufferGeometry(width, height, segments, segments);
        var faceMaterial = new THREE.MeshLambertMaterial({
            transparent: true,
            map: THREE.ImageUtils.loadTexture('img/menu.png')
        });
        faceMaterial.side = THREE.DoubleSide;

        function createFace(width, height) {
            var halfWidth  = width / 2;
            var halfHeight = height / 2;

            var prevFace;

            var joints = [],
                facies = [];
            for (var i = 0; i < 4; i++) {
                var joint = new THREE.Object3D();
                var face  = new THREE.Mesh(faceGeometry, faceMaterial);

                if (i !== 0) {
                    joint.position.x = halfWidth;
                    face.position.x  = halfWidth;
                }
                joint.add(face);
                if (prevFace) {
                    prevFace.add(joint);
                }

                joints.push(joint);
                facies.push(face);

                prevFace = face;
            }

            return {
                joints: joints,
                facies: facies
            };
        }

        ret = createFace(width, height);
        ret.joints.forEach(function (joint, i) {
            joint.rotation.y = PI_2;
        });
        ret.facies.forEach(function (mesh, i) {
            mesh.castShadow = true;
        });

        var mainJoint = ret.joints[0];
        mainJoint.position.x = width / 2;

        var cube = new THREE.Object3D();
        cube.add(mainJoint);

        return cube;
    }

    function init() {

        domContainer = document.createElement('div');
        document.body.appendChild(domContainer);

        // オブジェクト（箱）を生成
        container = new THREE.Object3D();
        container.position.y = 70;

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
        light = new THREE.DirectionalLight(0xffffff);
        light.position.set(100, 100, 100);
        light.castShadow = true;
        light.shadowMapWidth  = 2048;
        light.shadowMapHeight = 2048;

        var ambientLight = new THREE.AmbientLight(0x666666);

        // シャドウのデバッグフラグ
        // light.shadowCameraVisible = true;

        // シーンを生成
        scene = new THREE.Scene();

        cube = createCube(50, 50, 50);
        cube.castShadow = true;
        container.add(cube);

        //

        var planeGeometry = new THREE.PlaneBufferGeometry(1000, 1000, 1000);
        var planeMaterial = new THREE.MeshLambertMaterial({
            color: 0xdddddd
        });
        plane = new THREE.Mesh(planeGeometry, planeMaterial);

        plane.rotation.x    = -PI_2;
        plane.receiveShadow = true;

        scene.add(plane);
        scene.add(container);
        scene.add(light);
        scene.add(ambientLight);

        camera.lookAt(container.position);

        // レンダラーを生成
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0xffffff);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMapEnabled = true;
        domContainer.appendChild(renderer.domElement);
    }

    init();

    function deployCube() {
        var time = 2000;
        var start = Date.now();
        var t = 0;

        var startRotationX = container.rotation.x;
        var startRotationY = container.rotation.y;

        (function loop() {
            var now = Date.now();
            var delta = (now - start) || 1;
            var t = delta / time;
            if (t >= 1) {
                return;
            }
            var rad = easing(PI_2, 0, t);
            ret.joints.forEach(function (joint, i) {
                joint.rotation.y = rad;
            });

            var containerRadX = easing(startRotationX, 0, t);
            var containerRadY = easing(startRotationX, 0, t);
            container.rotation.x = containerRadX;
            container.rotation.y = containerRadY;
            render();
            
            requestAnimationFrame(loop);
        }());
    }

    var mainAnimID;
    document.addEventListener('click', function (e) {
        cancelAnimationFrame(mainAnimID);
        deployCube();
    }, false);

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
        var objs = ray.intersectObjects(cube.children, true);

        if (objs.length > 0) {
            // 交差していたらobjsが1以上になるので、やりたいことをやる。
            ret.facies.forEach(function (face, i) {
                face.material.color = new THREE.Color(0x000000);
            });
        }
        else {
            ret.facies.forEach(function (face, i) {
                face.material.color = new THREE.Color(0xffffff);
            });
        }
    }, false);

    (function animate() {
        mainAnimID = requestAnimationFrame(animate);

        container.rotation.x += 0.01;
        container.rotation.y += 0.005;

        if (container.rotation.x >= Math.PI * 2) {
            container.rotation.x = 0;
        }
        if (container.rotation.y >= Math.PI * 2) {
            container.rotation.y = 0;
        }

        render();
    }());

    function render() {
        renderer.render(scene, camera);
    }

}());
