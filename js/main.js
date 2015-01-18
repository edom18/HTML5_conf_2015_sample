(function () {
    'use strict';

    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
    }

    var PI_2 = Math.PI / 2;

    var domContainer;

    var container,
        camera,
        light,
        scene,
        renderer;

    var cube;
    var plane;

    function createCube(width, height, depth) {
        var segments = 10;
        var faceGeometry = new THREE.PlaneBufferGeometry(width, height, segments, segments);
        var faceMaterial = new THREE.MeshLambertMaterial({ color: 0xaa3333 });

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


        var topFace    = new THREE.Mesh(faceGeometry, faceMaterial);
        topFace.castShadow = true;
        var bottomFace = new THREE.Mesh(faceGeometry, faceMaterial);
        bottomFace.castShadow = true;

        var topJoint    = new THREE.Object3D();
        topJoint.add(topFace);
        var bottomJoint = new THREE.Object3D();
        bottomJoint.add(bottomFace);

        var halfWidth  = width / 2;
        var halfHeight = height / 2;

        topJoint.position.y = halfHeight;
        topFace.position.y  = halfHeight;

        bottomJoint.position.y = -halfHeight;
        bottomFace.position.y  = -halfHeight;

        topJoint.rotation.x    = -PI_2;
        bottomJoint.rotation.x = PI_2;


        var ret = createFace(width, height);
        ret.facies[2].add(topJoint);
        ret.facies[2].add(bottomJoint);

        ret.joints.forEach(function (joint, i) {
            joint.rotation.y = PI_2;
        });
        ret.facies.forEach(function (mesh, i) {
            mesh.castShadow = true;
        });

        var mainJoint = ret.joints[0];
        mainJoint.position.x = halfWidth;

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
        camera.position.y = 100;
        camera.position.z = 150;

        // ライトを生成
        light = new THREE.DirectionalLight(0xffffff);
        light.position.set(100, 100, 100);
        light.castShadow = true;
        light.shadowMapWidth  = 2048;
        light.shadowMapHeight = 2048;

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

    (function animate() {
        requestAnimationFrame(animate);

        container.rotation.x += 0.01;
        container.rotation.y += 0.005;

        render();
    }());

    function render() {
        renderer.render(scene, camera);
    }

}());
