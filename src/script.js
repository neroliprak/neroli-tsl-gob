import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as THREE from "three/webgpu";
import { Corde } from "./Objects/Corde";
import { Floor } from "./Scene/Floor";
import { AudioManager } from "./AudioManager";
import { Harp } from "./Objects/Harp";
import { bloom } from "three/addons/tsl/display/BloomNode.js";

import {
  pass,
  Fn,
  color,
  mix,
  uv,
  positionLocal,
  vec3,
  time,
  sin,
  PI,
  uniform,
  abs,
  smoothstep,
  min,
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

// Audio
const audioManager = new AudioManager();
audioManager.load();

const cordes = [];

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
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.x = 3.5;
camera.position.y = 1.5;
camera.position.z = 4;
scene.add(camera);

/**
 * HARP DE LA SCENE
 */
const harp = new Harp();
const harpModel = await harp.load();
harpModel.position.y = 1.7;
harpModel.position.z = -0.1;
harpModel.rotation.y = 0.2;
scene.add(harpModel);

// Controls
const controls = new OrbitControls(camera, canvas);
// controls.target.set(0, 1, 0);
controls.target.set(
  harpModel.position.x,
  harpModel.position.y,
  harpModel.position.z,
);
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

/**
 * SOL DE LA SCENE
 */
const floor = new Floor();
scene.add(floor.mesh);

/**
 * BULB
 */

const bulbGeometry = new THREE.SphereGeometry(0.05, 16, 8);
const bulbColor = uniform(color(0xffffff));
const bulbMaterial = new THREE.MeshBasicNodeMaterial();
bulbMaterial.colorNode = bulbColor.mul(2);
const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
const bulbSpotLight = new THREE.SpotLight(
  0xffffff,
  20,
  100,
  Math.PI / 6,
  0.5,
  1,
);

bulbSpotLight.position.set(0, 2.7, 0);
bulbSpotLight.target.position.set(0, 1.1, 0);
bulbSpotLight.add(bulb);
bulbSpotLight.position.set(0, 2.7, 0);
scene.add(bulbSpotLight);
bulbSpotLight.castShadow = true;

/**
 * Post-processing
 */
const renderPipeline = new THREE.RenderPipeline(renderer);
const scenePass = pass(scene, camera);
const sceneOutput = scenePass.getTextureNode("output");

const bloomSettings = {
  strength: 1,
  radius: 0.7,
  threshold: 0.7,
};

const bloomPass = bloom(
  sceneOutput,
  bloomSettings.strength,
  bloomSettings.radius,
  bloomSettings.threshold,
);
const bloomOutput = sceneOutput.add(bloomPass);
renderPipeline.outputNode = bloomOutput;

/**
 * BOUCLE CORDES
 */

for (let index = 0; index < 7; index++) {
  const corde = new Corde(index);
  scene.add(corde.mesh);
  cordes.push(corde);
}

/**
 * INTERACTIONS SOURIS
 */

const raycaster = new THREE.Raycaster();
const cursor = new THREE.Vector2();

window.addEventListener("mousemove", (event) => {
  cursor.x = (event.clientX / window.innerWidth) * 2 - 1;
  cursor.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(cursor, camera);

  const cordeMeshes = cordes.map((corde) => corde.mesh);
  const [intersection] = raycaster.intersectObjects(cordeMeshes);
  if (!intersection) return;
  const corde = cordes.find((corde) => corde.mesh === intersection.object);
  if (!corde) return;

  corde.touch(intersection.uv);

  bulbColor.value.set(corde.bulbColor);
  bulbSpotLight.color.set(corde.bulbColor);

  audioManager.play(corde.index);
});

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
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

const spotLight = new THREE.SpotLight(0x5496ae, 20, 100, Math.PI / 6, 0.5, 1);
spotLight.position.set(1, 4, -1);
scene.add(spotLight);

/**
 * Animate
 */
const timer = new THREE.Timer();
timer.connect(document);

const tick = () => {
  timer.update();

  const delta = timer.getDelta();

  cordes.forEach((corde) => {
    corde.update(delta);
  });

  controls.update();
  renderPipeline.render(scene, camera);
};

renderer.setAnimationLoop(() => {
  tick();
});

console.log(renderer.backend);
