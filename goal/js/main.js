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

    var cube,
        plane;

    /**
     * メニュー用のキューブを生成
     * 実際は、4つの面を回転させて箱状に見せている
     */
    function createCube(width, height, depth) {
        var segments = 10;
        var faceGeometry = new THREE.PlaneBufferGeometry(width, height, segments, segments);

        // テクスチャを利用してマテリアルを生成
        var faceMaterial = new THREE.MeshLambertMaterial({
            transparent: true,
            map: THREE.ImageUtils.loadTexture('img/menu.png')
        });

        // 半透明オブジェクトのため、裏面も表示するようにする
        faceMaterial.side = THREE.DoubleSide;

        /**
         * 各面を生成する
         */
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

        var ret = createFace(width, height);
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

        return {
            threeObject: cube,
            elements   : ret
        };
    }

    ////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////
    // オブジェクト（箱）を生成
    var container = new THREE.Object3D();
    container.position.y = 70;


    ////////////////////////////////////////////////////////////////////////////////
    // カメラを生成
    var fov    = 75;
    var aspect = window.innerWidth / window.innerHeight;
    var zNear  = 1;
    var zFar   = 3000;
    var camera = new THREE.PerspectiveCamera(fov, aspect, zNear, zFar);
    camera.position.y = 100;
    camera.position.z = 150;


    ////////////////////////////////////////////////////////////////////////////////
    // ディレクショナルライトを生成
    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(100, 100, 100);
    light.castShadow = true;
    light.shadowMapWidth  = 2048;
    light.shadowMapHeight = 2048;


    ////////////////////////////////////////////////////////////////////////////////
    // 環境光
    var ambientLight = new THREE.AmbientLight(0x666666);

    // シャドウのデバッグフラグ
    // light.shadowCameraVisible = true;
    //

    ////////////////////////////////////////////////////////////////////////////////
    // シーンを生成
    var scene = new THREE.Scene();

    cube = createCube(50, 50, 50);
    cube.threeObject.castShadow = true;
    container.add(cube.threeObject);

    ////////////////////////////////////////////////////////////////////////////////
    // 地面を生成
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


    ////////////////////////////////////////////////////////////////////////////////
    // レンダラーを生成
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xffffff);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;
    document.body.appendChild(renderer.domElement);


    /**
     * メニューを展開
     */
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
            cube.elements.joints.forEach(function (joint, i) {
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

    ///////////////////////////////////////////////////////////////////////////////

    // クリック時の挙動
    var mainAnimID;
    document.addEventListener('click', function (e) {
        cancelAnimationFrame(mainAnimID);
        deployCube();
    }, false);

    ///////////////////////////////////////////////////////////////////////////////
    // ホバー時の処理
    renderer.domElement.addEventListener('mousemove', function (e) {

        var rect = e.target.getBoundingClientRect();

        // スクリーン上のマウス位置を取得
        var mouseX = e.clientX - rect.left;
        var mouseY = e.clientY - rect.top;

        // 取得したスクリーン座標を-1〜1に正規化
        mouseX =  (mouseX / window.innerWidth)  * 2 - 1;
        mouseY = -(mouseY / window.innerHeight) * 2 + 1;

        // マウスの位置ベクトル
        var pos = new THREE.Vector3(mouseX, mouseY, 1);

        // pos はスクリーン座標系なので、オブジェクトの座標系に変換
        pos.unproject(camera);

        // 始点、向きベクトルを渡してレイを作成
        var ray = new THREE.Raycaster(camera.position, pos.sub(camera.position).normalize());

        // 交差判定
        var objs = ray.intersectObjects(cube.children, true);

        var isCross = objs.length > 0;
        if (isCross) {
            cube.elements.facies.forEach(function (face, i) {
                face.material.color = new THREE.Color(0x000000);
            });
        }
        else {
            cube.elements.facies.forEach(function (face, i) {
                face.material.color = new THREE.Color(0xffffff);
            });
        }
    }, false);


    ///////////////////////////////////////////////////////////////////////////////
    // アニメーション
    var limit = Math.PI * 2;
    (function animate() {
        mainAnimID = requestAnimationFrame(animate);

        container.rotation.x += 0.01;
        container.rotation.y += 0.005;

        if (container.rotation.x >= limit) {
            container.rotation.x = 0;
        }
        if (container.rotation.y >= limit) {
            container.rotation.y = 0;
        }

        render();
    }());

    /**
     * レンダリングをupate
     */
    function render() {
        renderer.render(scene, camera);
    }

}());
