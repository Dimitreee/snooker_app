class PhysicsSystem {
  #engine;

  constructor(engine) {
    this.#engine = engine;
  }

  applyForce(body, position, force) {
    Matter.Body.applyForce(body, position, force);
  }

  checkCollision(bodyA, bodyB) {
    return Matter.Collision.collides(bodyA, bodyB);
  }

  isBodyAtRest(body) {
    return Math.abs(body.velocity.x) < 0.05 && Math.abs(body.velocity.y) < 0.05;
  }
}
