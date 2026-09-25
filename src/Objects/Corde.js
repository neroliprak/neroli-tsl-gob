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
  smoothstep,
  min,
} from "three/tsl";

const colors = [
  ["#530707", "#ffd7d7"],
  ["#582d0b", "#ffdcb6"],
  ["#6a5411", "#fff1b7"],
  ["#11572b", "#c7ffd1"],
  ["#0f4a3e", "#beffec"],
  ["#0a2540", "#b3ddff"],
  ["#1d0f46", "#d0c0ff"],
];

export class Corde {
  // Piste optimisation -> singleton
  // static geometryCorde = null;
  // static materialCorde = null;

  constructor(index) {
    this.index = index;
    this.geometryWidth = 2;
    this.coordTouch = uniform(new THREE.Vector2());
    this.touchLive = uniform(0);
    const [colorA, colorB] = colors[index % colors.length];
    this.colorA = color(colorA);
    this.colorB = color(colorB);
    this.bulbColor = colorB;
    this.mesh = this.createMesh();
  }

  createMesh() {
    const cordeMaterial = new THREE.MeshBasicNodeMaterial();

    cordeMaterial.side = THREE.DoubleSide;

    cordeMaterial.colorNode = Fn(() => {
      const currentUv = uv().x;
      const distance = abs(this.coordTouch.x.sub(currentUv));
      const touchStrength = distance.mul(5).oneMinus().mul(this.touchLive);
      return mix(this.colorA, this.colorB, touchStrength);
    })();

    cordeMaterial.positionNode = Fn(() => {
      const currentUv = uv().x;

      const extremityRight = smoothstep(0.2, 1.0, currentUv);
      const extremityLeft = smoothstep(1.0, 0.8, currentUv);
      const extremity = min(extremityRight, extremityLeft);

      const distance = abs(this.coordTouch.x.sub(currentUv));
      const touchStrength = distance.mul(10).oneMinus().mul(this.touchLive);
      const coordVibration = sin(time.mul(10))
        .mul(0.05)
        .mul(touchStrength)
        .mul(extremity);

      const wave = distance
        .mul(20)
        .sub(this.touchLive.oneMinus().mul(5))
        .sin()
        .mul(this.touchLive)
        .mul(0.05)
        .mul(extremity);

      return vec3(
        positionLocal.x,
        positionLocal.y.add(coordVibration),
        positionLocal.z.add(wave),
      );
    })();

    const cordeGeometry = new THREE.PlaneGeometry(
      this.geometryWidth,
      0.05,
      100,
      10,
    );

    const mesh = new THREE.Mesh(cordeGeometry, cordeMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.rotation.z = Math.PI * 0.5;
    mesh.position.y = 1.1 + this.index * 0.05;
    mesh.position.z = (this.index - 3) * 0.07;
    return mesh;
  }

  touch(uv) {
    this.coordTouch.value.copy(uv);
    this.touchLive.value = 1;
  }

  update(delta) {
    this.touchLive.value = Math.max(this.touchLive.value - delta * 2, 0);
  }
}
