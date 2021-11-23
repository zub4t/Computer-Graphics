import * as THREE from '/three.js/build/three.module.js'
import { OrbitControls } from '/three.js/examples/jsm/controls/OrbitControls.js';
import { GUI } from '/three.js/examples/jsm/libs/dat.gui.module.js';
import MinMaxGUIHelper from '/javascripts/dynamic_camera/MinMaxGUIHelper.js';
import { FBXLoader } from '/three.js/examples/jsm/loaders/FBXLoader.js'
import { TextureLoader } from '/three.js/src/loaders/TextureLoader.js'


function main() {

    const views = [
        {
            left: 0,
            bottom: 0,
            width: 0.5,
            height: 1.0,
            background: new THREE.Color( 0.5, 0.5, 0.7 ),
            eye: [ 0, 300, 1800 ],
            up: [ 0, 1, 0 ],
            fov: 30
        },
        {
            left: 0.5,
            bottom: 0,
            width: 0.5,
            height: 1,
            background: new THREE.Color( 0.7, 0.5, 0.5 ),
            eye: [ 0, 1800, 0 ],
            up: [ 0, 0, 1 ],
            fov: 45
        }
    ];

    const textureLoader = new TextureLoader();
    const clock = new THREE.Clock();
    const scene = new THREE.Scene();
    let mixer = null;
    const renderer = new THREE.WebGLRenderer();
    const fov = 45;
    const aspect = 2;
    const perspectiveNear = 0.1;
    const perspectiveFar = 100;
    const orthographicNear = 0.1;
    const orthographicFar = 100;

    const perspectiveView = views[0];
	const perspectiveCamera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, perspectiveNear, perspectiveFar );
	perspectiveCamera.position.set(0, 10, 20);
    perspectiveView.camera = perspectiveCamera;

    const orthographicCameraView = views[1];
	const orthographicCamera = new THREE.OrthographicCamera( window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, orthographicNear, orthographicFar);
	orthographicCamera.position.set(0, 10, 50);
    
    orthographicCamera.zoom = 30;
    orthographicCamera.lookAt(0, 0, 0);
    orthographicCamera.updateProjectionMatrix();
    orthographicCameraView.camera = orthographicCamera;

    const perspectiveControls = new OrbitControls(views[0].camera, container);
    perspectiveControls.target = new THREE.Vector3(0, 5, 0);
    perspectiveControls.autoRotate = true;
    perspectiveControls.autoRotateSpeed = 4;
    perspectiveControls.update();
    views[0].controls = perspectiveControls;

    const ortographicControls = new OrbitControls(views[1].camera, container);
    ortographicControls.target = new THREE.Vector3(0, 5, 0);
    ortographicControls.autoRotate = true;
    ortographicControls.update();
    views[1].controls = ortographicControls;


    const guiOrthographic = new GUI();
    guiOrthographic.add(views[1].camera, 'zoom', 1, 100).onChange(updateCamera);
    guiOrthographic.add(views[1].controls, 'autoRotateSpeed', 0, 5);
    const minMaxGUIHelperOrthographic = new MinMaxGUIHelper(views[1].camera, 'near', 'far', 0.1);
    guiOrthographic.add(minMaxGUIHelperOrthographic, 'min', 0.1, 100, 0.1).name('near').onChange(updateCamera);
    guiOrthographic.add(minMaxGUIHelperOrthographic, 'max', 0.1, 100, 0.1).name('far').onChange(updateCamera);

    
    const guiPerspective = new GUI();
    guiPerspective.add(views[0].camera, 'fov', 1, 180).onChange(updateCamera);
    guiPerspective.add(views[0].controls, 'autoRotateSpeed', 0, 5);
    const minMaxGUIHelperPerspective = new MinMaxGUIHelper(views[0].camera, 'near', 'far', 0.1);
    guiPerspective.add(minMaxGUIHelperPerspective, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
    guiPerspective.add(minMaxGUIHelperPerspective, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);

    

    function updateCamera() {
        for ( let ii = 0; ii < views.length; ++ ii ) {
            views[ii].camera.updateProjectionMatrix();
        }
    }

    {

        for (let i = 1; i <= 5; i++) {
            setTimeout(() => {
                textureLoader.load(`/images/${i}.jpg`, function(texture) {
                    setInterval(() => {
                        scene.background = texture;
                        console.log(i)
                    }, 1000 * 5)
                });

            }, 1000 * i);


        }

    }
    scene.background = new THREE.Color('white'); {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(0, 10, 10);
        scene.add(light);
        scene.add(light.target);
    }

    {

        const animationActions = THREE.AnimationAction
        let activeAction = THREE.AnimationAction
        const fbxLoader = new FBXLoader()
        fbxLoader.load(
            '/fbx/Twist Dance.fbx',
            (object) => {
                object.scale.set(0.1, 0.1, 0.1)
                object.position.x = 0;
                object.position.y = 0;
                object.position.z = 0;

                mixer = new THREE.AnimationMixer(object);

                const action = mixer.clipAction(object.animations[0]);
                action.play();

                object.traverse(function(child) {

                    if (child.isMesh) {

                        child.castShadow = true;
                        child.receiveShadow = true;

                    }

                });

                scene.add(object)
            })
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    const animate = function() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();

        if (mixer) mixer.update(delta);
        for ( let ii = 0; ii < views.length; ++ ii ) {

            const view = views[ ii ];
            const camera = view.camera;

            const left = Math.floor( window.innerWidth * view.left );
            const bottom = Math.floor( window.innerHeight * view.bottom );
            const width = Math.floor( window.innerWidth * view.width );
            const height = Math.floor( window.innerHeight * view.height );

            renderer.setViewport( left, bottom, width, height );
            renderer.setScissor( left, bottom, width, height );
            renderer.setScissorTest( true );
            renderer.setClearColor( view.background );

            camera.aspect = width / height;
            camera.updateProjectionMatrix();

            renderer.render( scene, camera );

            views[ii].controls.update();

        }
    };

    animate();
}
main();