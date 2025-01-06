class CountdownTimer {
  #timeLeft = 180; // 3 minutes in seconds
  #isExpired = false;
  #p5;

  constructor() {
    this.#p5 = window.p;
  }

  get isExpired() {
    return this.#isExpired;
  }

  update() {
    if (this.#isExpired) return;
    
    this.#timeLeft -= this.#p5.deltaTime / 1000; // Convert milliseconds to seconds
    
    if (this.#timeLeft <= 0) {
      this.#timeLeft = 0;
      this.#isExpired = true;
    }
  }

  render() {
    const minutes = Math.floor(this.#timeLeft / 60);
    const seconds = Math.floor(this.#timeLeft % 60);
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    this.#p5.push();
    this.#p5.textSize(24);
    this.#p5.textAlign(this.#p5.CENTER, this.#p5.CENTER);
    
    if (this.#timeLeft <= 30) {
      this.#p5.fill('#FF0000');
    } else {
      this.#p5.fill('#FFFFFF');
    }
    
    this.#p5.text(timeString, 1100, 100);
    this.#p5.pop();
  }

  reset() {
    this.#timeLeft = 180;
    this.#isExpired = false;
  }

  getTimeLeft() {
    return this.#timeLeft;
  }
}
