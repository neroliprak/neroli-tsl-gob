import * as THREE from "three/webgpu";

export class Floor {
  constructor() {
    this.setGeometry();
    this.setMaterial();
    this.setMesh();
  }

  setGeometry() {
    this.geometry = new THREE.CircleGeometry(2, 64);
  }

  setMaterial() {
    this.material = new THREE.MeshStandardMaterial({
      color: 0x111111,
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.x = -Math.PI * 0.5;
    this.mesh.position.y = 0.9;
    this.mesh.receiveShadow = true;
    return this.mesh;
  }
}
