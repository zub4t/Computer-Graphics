import * as THREE from '/three.js/build/three.module.js'
import { OrbitControls } from '/three.js/examples/jsm/controls/OrbitControls.js';
import { GUI } from '/three.js/examples/jsm/libs/dat.gui.module.js';
import MinMaxGUIHelper from '/javascripts/dynamic_camera/MinMaxGUIHelper.js';
import { FBXLoader } from '/three.js/examples/jsm/loaders/FBXLoader.js'
import { TextureLoader } from '/three.js/src/loaders/TextureLoader.js'


function main() {
    const textureLoader = new TextureLoader();
    const clock = new THREE.Clock();
    const scene = new THREE.Scene();
    let mixer = null;
    const renderer = new THREE.WebGLRenderer();
    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
    camera.position.set(0, 10, 20);
    const gui = new GUI();
    gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
    const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
    gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
    gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);
    const controls = new OrbitControls(camera, container);
    controls.target.set(0, 5, 0);
    controls.update();

    function updateCamera() {
        camera.updateProjectionMatrix();
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
        renderer.render(scene, camera);
    };

    animate();
}
main();