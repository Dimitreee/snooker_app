class Ball {
  #engine;
  #body;
  #config;

  constructor(engine, config) {
    this.#engine = engine;
    this.#config = config;
  }

  create(x, y) {
    this.#body = Matter.Bodies.circle(x, y, this.#config.radius, {
      friction: this.#config.friction,
      restitution: this.#config.restitution
    });
    Matter.World.add(this.#engine.world, this.#body);
  }

  get position() {
    return this.#body?.position;
  }

  get velocity() {
    return this.#body?.velocity;
  }

  render() {
    if (!this.#body) return;

    new BallRenderer().render({
      position: this.position,
      radius: this.#config.radius,
      color: this.#config.color,
      highlights: this.#config.highlights
    });
  }
}
