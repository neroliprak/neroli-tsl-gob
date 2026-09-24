import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as THREE from "three/webgpu";
import {
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

const red = color("#6f416f");
const blue = color("#361731");

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
const cordes = [];

/**
 * SOL DE LA SCENE
 */
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0x111111,
});
const floor = new THREE.Mesh(planeGeometry, planeMaterial);
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0.9;
floor.receiveShadow = true;
scene.add(floor);

/**
 * INTERACTIONS SOURIS
 */

window.addEventListener("mousemove", (event) => {
  cursor.x = (event.clientX / window.innerWidth) * 2 - 1;
  cursor.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(cursor, camera);
  const cordeMeshes = cordes.map((corde) => corde.mesh);
  const [intersection] = raycaster.intersectObjects(cordeMeshes);
  if (!intersection) return;
  const corde = cordes.find((corde) => corde.mesh === intersection.object);
  if (!corde) return;
  corde.coordTouch.value.copy(intersection.uv);
  corde.touchLive.value = 1;
});

/**
 * CREATION DE CORDES
 */

const createCorde = (index) => {
  const coordTouch = uniform(new THREE.Vector2());
  const touchLive = uniform(0);

  const cordeMaterial = new THREE.MeshBasicNodeMaterial({});
  cordeMaterial.side = THREE.DoubleSide;

  cordeMaterial.colorNode = Fn(() => {
    const currentUv = uv().x;
    const distance = abs(coordTouch.x.sub(currentUv));
    const touchStrength = distance.mul(touchLive).mul(10);
    return mix(red, blue, touchStrength);
  })();

  cordeMaterial.positionNode = Fn(() => {
    const currentUv = uv().x;
    const distance = abs(coordTouch.x.sub(currentUv));
    const touchStrength = distance.oneMinus().mul(touchLive).mul(1);
    const coordVibration = sin(time.mul(30)).mul(0.05).mul(touchStrength);

    const wave = positionLocal.x
      .mul(PI.mul(5))
      .add(time)
      .sin()
      .mul(touchStrength)
      .mul(0.01);

    const finalPosition = vec3(positionLocal);

    const transformedPosition = vec3(
      finalPosition.x,
      finalPosition.y.add(coordVibration),
      finalPosition.z.add(wave),
    );
    return transformedPosition;
  })();

  const cordePlane = new THREE.PlaneGeometry(3, 0.05, 100, 10);
  const corde = new THREE.Mesh(cordePlane, cordeMaterial);

  corde.castShadow = true;
  corde.receiveShadow = true;
  corde.rotation.z = Math.PI * 0.5;
  corde.position.y = 1;
  corde.position.z = (index - 2) * 0.07;

  scene.add(corde);

  return { mesh: corde, coordTouch, touchLive };
};

/**
 * Boucle des cordes
 */

for (let index = 0; index < 5; index++) {
  const corde = createCorde(index);
  cordes.push(corde);
}

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

  cordes.forEach((corde) => {
    corde.touchLive.value = Math.max(corde.touchLive.value - delta * 2, 0);
  });

  controls.update();

  renderer.render(scene, camera);
};

renderer.setAnimationLoop(() => {
  tick();
});

console.log(renderer.backend);
