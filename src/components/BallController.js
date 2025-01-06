class BallController {
  #engine;
  #balls = [];
  #gameMode = '';
  #physics;
  #p5;
  #game;
  #config = {
    radius: 400/72,
    friction: 0.05,
    restitution: 0.8,
    mass: 5,
    density: 0.002,
    maxSpeed: 20,
    airFriction: 0.002,
    surfaceFriction: 0.1,
    rollingFriction: 0.015,
    timeScale: 1,
    portalCooldown: 500
  };
  #lastPortalUse = new Map();

  constructor(engine) {
    this.#engine = engine;
    this.#physics = new PhysicsSystem(engine);
    this.#p5 = window.p;
  }

  get balls() {
    return this.#balls;
  }

  get gameMode() {
    return this.#gameMode;
  }

  setMode(mode) {
    this.#gameMode = mode;
    this.#setupBalls();
  }

  render() {
    this.#balls.forEach(ball => {
      if (!ball || !ball.ballObj) return;
      
      this.#p5.push();
      this.#p5.fill(ball.color);
      this.#p5.noStroke();
      this.#p5.circle(ball.position.x, ball.position.y, ball.radius * 2);
      
      this.#p5.fill(255, 255, 255, 180);
      this.#p5.circle(
        ball.position.x - ball.radius * 0.3,
        ball.position.y - ball.radius * 0.3,
        ball.radius * 0.5
      );
      
      this.#p5.pop();
    });
  }

  processCollisions(whiteBall) {
    if (!whiteBall || !whiteBall.ballObj || !this.#game) return;

    const specialFeatures = this.#game.getComponent('specialFeatures');

    this.#balls.forEach(ball => {
      if (!ball || !ball.ballObj) return;

      this.#handlePortalTeleport(ball, specialFeatures);

      const velocity = ball.ballObj.velocity;
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      if (speed > this.#config.maxSpeed) {
        const factor = this.#config.maxSpeed / speed;
        Matter.Body.setVelocity(ball.ballObj, {
          x: velocity.x * factor,
          y: velocity.y * factor
        });
      }

      if (speed > 0.05) {
        const rollingFrictionFactor = 1 - (this.#config.rollingFriction * (speed / this.#config.maxSpeed));
        const airFrictionFactor = 1 - this.#config.airFriction;
        
        Matter.Body.setVelocity(ball.ballObj, {
          x: velocity.x * rollingFrictionFactor * airFrictionFactor,
          y: velocity.y * rollingFrictionFactor * airFrictionFactor
        });
      } else if (speed < 0.05) {
        Matter.Body.setVelocity(ball.ballObj, { x: 0, y: 0 });
      }

      const collision = this.#physics.checkCollision(whiteBall.ballObj, ball.ballObj);
      if (collision) {
        console.log('Collision detected');
      }
    });

    this.#handlePortalTeleport(whiteBall, specialFeatures);
  }

  checkPocketedBalls() {
    this.#balls = this.#balls.filter(ball => {
      if (!ball || !ball.ballObj) return false;

      const { x, y } = ball.ballObj.position;
      const isOnTable = x >= 200 && x <= 1000 && y >= 100 && y <= 500;
      
      if (!isOnTable) {
        Matter.World.remove(this.#engine.world, ball.ballObj);
      }
      
      return isOnTable;
    });
  }

  #setupBalls() {
    this.#balls.forEach(ball => {
      if (ball && ball.ballObj) {
        Matter.World.remove(this.#engine.world, ball.ballObj);
      }
    });
    this.#balls = [];

    const positions = BallPositions.getInitialPositions(this.#gameMode);
    
    positions.forEach(pos => {
      const ballBody = Matter.Bodies.circle(pos.x, pos.y, this.#config.radius, {
        friction: this.#config.friction,
        restitution: this.#config.restitution,
        mass: this.#config.mass,
        density: this.#config.density,
        frictionAir: this.#config.airFriction,
        frictionStatic: this.#config.surfaceFriction,
        slop: 0,
        inertia: Infinity,
        collisionFilter: {
          category: 0x0002,
          mask: 0x0001 | 0x0002
        }
      });
      
      this.#balls.push({
        ballObj: ballBody,
        color: pos.color,
        points: pos.points,
        radius: this.#config.radius,
        get position() {
          return this.ballObj ? this.ballObj.position : { x: 0, y: 0 };
        }
      });
      
      Matter.World.add(this.#engine.world, ballBody);
    });
  }

  checkVictoryCondition() {
    return this.#balls.length === 0;
  }

  #handlePortalTeleport(ball, specialFeatures) {
    if (!ball || !ball.ballObj || !specialFeatures) return;

    const now = Date.now();
    const lastUse = this.#lastPortalUse.get(ball) || 0;

    if (now - lastUse < this.#config.portalCooldown) return;

    const portalExit = specialFeatures.checkPortalCollision(ball);
    if (portalExit) {
      Matter.Body.setPosition(ball.ballObj, portalExit);

      const velocity = ball.ballObj.velocity;
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      const boostFactor = 1.1;
      Matter.Body.setVelocity(ball.ballObj, {
        x: velocity.x * boostFactor,
        y: velocity.y * boostFactor
      });

      this.#lastPortalUse.set(ball, now);
    }
  }

  setGame(game) {
    this.#game = game;
  }
}
