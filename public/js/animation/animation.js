import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { GLTFLoader } from 'GLTFLoader';
import { RoomEnvironment } from 'RoomEnvironment';

// Import models
const idleUrl = new URL('../../assets/idle.glb', import.meta.url);
const danceUrl = new URL('../../assets/dance.glb', import.meta.url);

// Create renderer and append it to dom
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(500, 700);

document.getElementById('animation').appendChild(renderer.domElement);

// Set camera configurations and restrictions
const camera = new THREE.PerspectiveCamera(11, 5 / 7, 2, 1000);

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableZoom = false;
orbitControls.enableRotate = false;
orbitControls.enablePan = false;

camera.position.set(7, 9, 14);
orbitControls.update();

const pmremGenerator = new THREE.PMREMGenerator(renderer);
const assetLoader = new GLTFLoader();

// Load animations
const danceScene = new THREE.Scene();
const idleScene = new THREE.Scene();

danceScene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
idleScene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;

const danceClock = new THREE.Clock();
const idleClock = new THREE.Clock();

let danceMixer;
let idleMixer;

assetLoader.load(danceUrl.href, (gltf) => {
  const model = gltf.scene;
  danceScene.add(model);

  const clips = gltf.animations;
  const clip = THREE.AnimationClip.findByName(clips, 'dance');

  danceMixer = new THREE.AnimationMixer(model);
  const action = danceMixer.clipAction(clip);
  action.play();
}, undefined, (error) => {
  console.log(error);
});

assetLoader.load(idleUrl.href, (gltf) => {
  const model = gltf.scene;
  idleScene.add(model);

  const clips = gltf.animations;
  const clip = THREE.AnimationClip.findByName(clips, 'idle');

  idleMixer = new THREE.AnimationMixer(model);
  const action = idleMixer.clipAction(clip);
  action.play();
}, undefined, (error) => {
  console.log(error);
});

var isFirstPlay = true;

// Render animation according to player state
const animate = () => {
  if (danceMixer && idleMixer) {
    danceMixer.update(danceClock.getDelta());
    idleMixer.update(idleClock.getDelta());

    const isMixerPaused = document.getElementsByClassName('paused').length;

    if (isFirstPlay) {
      if (isMixerPaused) {
        isFirstPlay = false;
        console.log('here')
      }
      const scene = idleScene;
      renderer.render(scene, camera);

      return;
    }

    const scene = !isMixerPaused ? danceScene : idleScene;
    renderer.render(scene, camera);
  }
}

renderer.setAnimationLoop(animate);