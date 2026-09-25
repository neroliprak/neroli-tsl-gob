import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class Harp {
  constructor() {
    this.loader = new GLTFLoader();
    this.mesh = null;
  }

  load() {
    return new Promise((resolve, reject) => {
      this.loader.load(
        "harp2.glb",
        (gltf) => {
          this.mesh = gltf.scene;
          this.mesh.scale.set(0.8, 0.8, 0.8);
          resolve(this.mesh);
        },
        undefined,
        (error) => {
          console.error("Erreur lors du chargement de la harpe :", error);
          reject(error);
        },
      );
    });
  }
}
