export class AudioManager {
  constructor() {
    this.sounds = [];
  }

  load() {
    for (let index = 0; index < 7; index++) {
      const sound = new Audio(`harp-${index + 1}.mp3`);
      sound.preload = "auto";
      this.sounds.push(sound);
    }
  }

  play(index) {
    const sound = this.sounds[index];
    if (!sound) return;
    sound.currentTime = 0;
    sound.play();
  }
}
