import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as THREE from "three/webgpu";
import {
  Fn,
  color,
  mix,
  uv,
  positionLocal,
  normalLocal,
  vec3,
  time,
  cos,
  sin,
  If,
  greaterThan,
  PI,
  uniform,
  abs,
  sub,
} from "three/tsl";

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.threejs");

// Scene
const scene = new THREE.Scene();

// Loaders
const textureLoader = new THREE.TextureLoader();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.x = 5;
camera.position.y = 4.5;
camera.position.z = 2.5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 1, 0);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGPURenderer({
  canvas: canvas,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x111111);

const raycaster = new THREE.Raycaster();
const cursor = new THREE.Vector2();
const coordTouch = uniform(new THREE.Vector2());

// 1. CORDE

const cordePlane = new THREE.PlaneGeometry(5, 0.1, 100, 10);
const cordeMaterial = new THREE.MeshBasicNodeMaterial({});
const corde = new THREE.Mesh(cordePlane, cordeMaterial);
cordeMaterial.side = THREE.DoubleSide;
corde.castShadow = true;
corde.receiveShadow = true;
corde.rotation.x = -Math.PI * 0.5;
corde.position.y = 1;
scene.add(corde);

// 2. INTERACTION SOURIS

window.addEventListener("click", (event) => {
  cursor.x = (event.clientX / window.innerWidth) * 2 - 1;
  cursor.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(cursor, camera);

  const [intersection] = raycaster.intersectObject(corde);
  if (intersection) {
    coordTouch.value = intersection.uv;
  }
});

// 3. SHADER CORDE QUI BOUGE

const colorCordeShader = Fn(() => {
  const currentUv = uv().x;
  const distance = abs(coordTouch.x.sub(currentUv));

  return vec3(mix(1, 0, distance.oneMinus()));
});

cordeMaterial.colorNode = colorCordeShader();

// const distanceWave = abs(currentUv.x.sub(wave));

// return currentUv.sub(coordTouch).length();

// const wave = coords.x.mul(PI.mul(4)).sin().div(4).add(0.5);
// const distance = abs(coords.y.sub(wave));

// const wave = positionLocal.x.mul(PI.mul(12)).add(time).sin().mul(0.1);

// cordeMaterial.colorNode = vec3(1, 1, 1);

// cordeMaterial.positionNode = vec3(
//   positionLocal.x,
//   positionLocal.y,
//   positionLocal.z.add(wave),
// );

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 4.5);
directionalLight.castShadow = true;
directionalLight.position.set(2, 0.75, -1).normalize().multiplyScalar(10);
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.bottom = -10;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.near = 0.01;
directionalLight.shadow.camera.far = 20;
directionalLight.shadow.radius = 3;
directionalLight.shadow.normalBias = 0.1;
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x859dff, 1);
scene.add(ambientLight);

/**
 * Animate
 */
const timer = new THREE.Timer();
timer.connect(document);

const tick = () => {
  timer.update();
  const delta = timer.getDelta();

  if (delta > 0.1) console.log(delta);

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);
};

renderer.setAnimationLoop(() => {
  tick();
  raycaster.setFromCamera(cursor, camera);
  raycaster.intersectObject(corde);
});

console.log(renderer.backend);
