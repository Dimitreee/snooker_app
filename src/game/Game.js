class Game {
  #engine;
  #components = new Map();
  #isActive = false;
  #p5;
  #uiRenderer;
  #pointsTracker;
  #countdownTimer;

  constructor() {
    this.#p5 = window.p;
    this.#engine = Matter.Engine.create();
    this.#engine.gravity.y = 0;
    this.#uiRenderer = new UIRenderer();
    this.#pointsTracker = new PointsTracker();
    this.#countdownTimer = new CountdownTimer();
    this.#initializeComponents();
  }

  getEngine() {
    return this.#engine;
  }

  initialize() {
    this.#setupEventListeners();
  }

  update() {
    Matter.Engine.update(this.#engine);
    this.#render();
  }

  isGameActive() {
    return this.#isActive;
  }

  setGameActive(value) {
    this.#isActive = value;
  }

  getComponent(name) {
    return this.#components.get(name);
  }

  #initializeComponents() {
    // Initialize table
    const table = new SnookerTable(this.#engine);
    table.initialize();
    this.#components.set('table', table);

    // Initialize white ball
    const whiteBall = new WhiteBall(this.#engine);
    this.#components.set('whiteBall', whiteBall);

    // Initialize ball controller
    const ballController = new BallController(this.#engine);
    ballController.setGame(this);  // Add this line
    this.#components.set('ballController', ballController);

    // Initialize cue rod
    const cueRod = new CueRod();
    this.#components.set('cueRod', cueRod);

    // Add points tracker to components
    this.#components.set('pointsTracker', this.#pointsTracker);

    // Initialize special features
    const specialFeatures = new SpecialFeatures();
    this.#components.set('specialFeatures', specialFeatures);
  }

  #setupEventListeners() {
    const eventHandler = new GameEventHandler(this);

    this.#p5.keyTyped = (event) => {
        eventHandler.handleKeyPress({
            key: this.#p5.key,
            keyCode: this.#p5.keyCode
        });
    };

    this.#p5.mousePressed = () => eventHandler.handleMousePress();
    this.#p5.mouseReleased = () => eventHandler.handleMouseRelease();
  }

  #render() {
    this.#p5.background(26);

    if (!this.getComponent('ballController').gameMode) {
        this.#uiRenderer.renderTitle();
    } else if (!this.#isActive) {
        this.#renderGameState();
        this.#uiRenderer.renderPlacementInstructions();
    } else {
        this.#renderGameState();
        this.#uiRenderer.renderGameInfo(
            this.#pointsTracker.getScore(),
            this.#countdownTimer.getTimeLeft(),
            this.getComponent('ballController').gameMode
        );

        if (this.#isGameOver()) {
            this.#uiRenderer.renderGameOver(
                this.#pointsTracker.getScore(),
                this.#checkVictory()
            );
        }
    }
  }

  #renderGameState() {
    this.#renderGameElements();
    this.#runGameLogic();
  }

  #renderGameElements() {
    const table = this.getComponent('table');
    const whiteBall = this.getComponent('whiteBall');
    const ballController = this.getComponent('ballController');
    const cueRod = this.getComponent('cueRod');
    const specialFeatures = this.getComponent('specialFeatures');

    table.render();
    specialFeatures.render();
    whiteBall.render();
    ballController.render();

    if (this.#isActive && whiteBall.readyToHit) {
        cueRod.render(whiteBall);
    }
  }

  #runGameLogic() {
    if (!this.#isActive) return;

    const whiteBall = this.getComponent('whiteBall');
    const ballController = this.getComponent('ballController');

    whiteBall.updateState();
    ballController.processCollisions(whiteBall);
    ballController.checkPocketedBalls();
    this.#countdownTimer.update();

    if (!whiteBall.isOnTable()) {
      whiteBall.remove();
      this.#isActive = false;
    }
  }

  #isGameOver() {
    return this.#countdownTimer.isExpired || this.#checkVictory();
  }

  #checkVictory() {
    return this.getComponent('ballController').checkVictoryCondition();
  }
}
