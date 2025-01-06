class GameEventHandler {
  #game;
  #p5;
  #physics;

  constructor(game) {
    this.#game = game;
    this.#p5 = window.p;
    this.#physics = new PhysicsSystem(game.getEngine());
  }

  initialize() {
    // Event listeners are set up in main.js
  }

  handleKeyPress(event) {
    // Ensure event is defined and has a key property
    if (!event || typeof event !== 'object') {
      console.warn('Invalid key event received');
      return;
    }

    const key = typeof event === 'string' ? event : event.key;
    
    if (!this.#game.getComponent('ballController').gameMode) {
      this.#handleModeSelection(key);
    } else if (key === 'r' || key === 'R') {
      this.#resetGame();
    }
  }

  handleMousePress() {
    if (this.#game.isGameActive()) {
      const whiteBall = this.#game.getComponent('whiteBall');
      const cueRod = this.#game.getComponent('cueRod');

      if (whiteBall.readyToHit) {
        cueRod.startAiming();
      }
    }
  }

  handleMouseRelease() {
    if (!this.#game.isGameActive()) {
      this.#handleBallPlacement();
    } else {
      this.#handleShot();
    }
  }

  #handleModeSelection(key) {
    if (!key || typeof key !== 'string') {
      console.warn('Invalid key for mode selection');
      return;
    }

    const ballController = this.#game.getComponent('ballController');
    switch(key.toLowerCase()) {
      case 'o':
        ballController.setMode('ordered');
        break;
      case 'u':
        ballController.setMode('unordered');
        break;
      case 'p':
        ballController.setMode('partial');
        break;
      default:
        console.log('Invalid game mode key');
        break;
    }
  }

  #handleBallPlacement() {
    const whiteBall = this.#game.getComponent('whiteBall');
    const mouseX = this.#p5.mouseX;
    const mouseY = this.#p5.mouseY;
    
    // Check if mouse is in D zone
    const dZoneX = 200 + 800/5;  // Adjust based on your table dimensions
    const dZoneY = 300;          // Center Y of the table
    const dZoneRadius = 75;      // Radius of D zone

    if (this.#p5.dist(mouseX, mouseY, dZoneX, dZoneY) <= dZoneRadius &&
        mouseX >= 200 && mouseX <= dZoneX) {
      whiteBall.createCueBall(mouseX, mouseY);
      this.#game.setGameActive(true);
    }
  }

  #handleShot() {
    const whiteBall = this.#game.getComponent('whiteBall');
    const cueRod = this.#game.getComponent('cueRod');

    if (cueRod.isAiming && whiteBall.readyToHit) {
      const force = cueRod.fireShot();
      if (force) {
        this.#physics.applyForce(
          whiteBall.ballObj,
          whiteBall.position,
          force
        );
        whiteBall.readyToHit = false;
      }
      cueRod.reset();
    }
  }

  #resetGame() {
    location.reload();
  }
}
