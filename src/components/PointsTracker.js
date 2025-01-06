class PointsTracker {
  #score = 0;
  #multiplier = 1;

  constructor() {
    this.reset();
  }

  getScore() {
    return this.#score;
  }

  addPoints(points) {
    this.#score += points * this.#multiplier;
  }

  setMultiplier(value) {
    this.#multiplier = value;
  }

  reset() {
    this.#score = 0;
    this.#multiplier = 1;
  }
}
