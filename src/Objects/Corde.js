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
} from "three/tsl";

const colors = [
  ["#ffaeae", "#ff0000"],
  ["#ffa94d", "#ff6f00"],
  ["#ffe066", "#ffc107"],
  ["#69db7c", "#00a63c"],
  ["#38d9a9", "#008f72"],
  ["#4dabf7", "#0066cc"],
  ["#b197fc", "#7048e8"],
];

export class Corde {
  constructor(index) {
    this.index = index;

    this.coordTouch = uniform(new THREE.Vector2());
    this.touchLive = uniform(0);

    const [colorA, colorB] = colors[index % colors.length];

    this.colorA = color(colorA);
    this.colorB = color(colorB);

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
      const distance = abs(this.coordTouch.x.sub(currentUv));
      const touchStrength = distance.mul(10).oneMinus().mul(this.touchLive);
      const coordVibration = sin(time.mul(60)).mul(0.005).mul(touchStrength);

      // const wave = positionLocal.x
      //   .mul(PI.mul(5))
      //   .add(time)
      //   .sin()
      //   .mul(touchStrength)
      //   .mul(0.01);

      const wave = distance
        .mul(30)
        .sub(this.touchLive.oneMinus().mul(15))
        .sin()
        .mul(this.touchLive)
        .mul(0.03);

      return vec3(
        positionLocal.x,
        positionLocal.y.add(coordVibration),
        positionLocal.z.add(wave),
      );
    })();

    const cordeGeometry = new THREE.PlaneGeometry(2, 0.05, 100, 10);

    const mesh = new THREE.Mesh(cordeGeometry, cordeMaterial);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    mesh.rotation.z = Math.PI * 0.5;

    mesh.position.y = 1 + this.index * 0.05;
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
