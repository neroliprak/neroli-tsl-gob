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

export class Corde {
  constructor(index) {
    this.index = index;

    this.coordTouch = uniform(new THREE.Vector2());
    this.touchLive = uniform(0);

    this.red = color("#6f416f");
    this.blue = color("#361731");

    this.mesh = this.createMesh();
  }

  createMesh() {
    const cordeMaterial = new THREE.MeshBasicNodeMaterial();

    cordeMaterial.side = THREE.DoubleSide;

    cordeMaterial.colorNode = Fn(() => {
      const currentUv = uv().x;
      const distance = abs(this.coordTouch.x.sub(currentUv));

      const touchStrength = distance.mul(this.touchLive).mul(10);

      return mix(this.red, this.blue, touchStrength);
    })();

    cordeMaterial.positionNode = Fn(() => {
      const currentUv = uv().x;

      const distance = abs(this.coordTouch.x.sub(currentUv));

      const touchStrength = distance.oneMinus().mul(this.touchLive);

      const coordVibration = sin(time.mul(30)).mul(0.05).mul(touchStrength);

      const wave = positionLocal.x
        .mul(PI.mul(5))
        .add(time)
        .sin()
        .mul(touchStrength)
        .mul(0.01);

      return vec3(
        positionLocal.x,
        positionLocal.y.add(coordVibration),
        positionLocal.z.add(wave),
      );
    })();

    const cordeGeometry = new THREE.PlaneGeometry(3, 0.05, 100, 10);

    const mesh = new THREE.Mesh(cordeGeometry, cordeMaterial);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    mesh.rotation.z = Math.PI * 0.5;
    mesh.position.y = 1;
    mesh.position.z = (this.index - 2) * 0.07;

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
