class SnookerTable {
  #engine;
  #config = {
    tableWidth: 800,
    cushionHeight: 10,
    boxWidth: (800 / 72) * 1.5,
    cushionRestitution: 0.8,
    cushionFriction: 0.1
  };
  #cushions = [];
  #p5;
  #drawField;
  #drawRails;
  #drawCushions;
  #drawDZone;

  constructor(engine) {
    this.#engine = engine;
    this.#p5 = window.p;
    this.#initializeDrawMethods();
  }

  initialize() {
    this.#buildCushions();
  }

  #initializeDrawMethods() {
    this.#drawField = () => {
      this.#p5.noStroke();
      this.#p5.fill("#2E6F2F");
      this.#p5.rect(200, 100, this.#config.tableWidth, this.#config.tableWidth / 2);
    };

    this.#drawRails = () => {
      this.#p5.fill("#5b3c14");
      this.#p5.rect(185, 100, 15, this.#config.tableWidth / 2);
      this.#p5.rect(200, 85, this.#config.tableWidth, 15);
      this.#p5.rect(1000, 100, 15, this.#config.tableWidth / 2);
      this.#p5.rect(200, 500, this.#config.tableWidth, 15);
    };

    this.#drawCushions = () => {
      this.#cushions.forEach(cushion => {
        this.#p5.push();
        this.#p5.noStroke();
        this.#p5.fill(cushion.render?.visible ? "#5E8633" : "#A3FF5A");
        this.#p5.beginShape();
        cushion.vertices.forEach(v => this.#p5.vertex(v.x, v.y));
        this.#p5.endShape(this.#p5.CLOSE);
        this.#p5.pop();
      });
    };

    this.#drawDZone = () => {
      const dZoneX = 200 + this.#config.tableWidth / 5;
      this.#p5.fill(255);
      this.#p5.stroke(255);
      this.#p5.line(dZoneX, 115, dZoneX, 485);
      this.#p5.noFill();
      this.#p5.arc(dZoneX, 295, 150, 150, 90, 270);
    };
  }

  #buildCushions() {
    this.#createCushion({
      x: 402,
      y: 105,
      width: this.#config.tableWidth / 2 - this.#config.boxWidth * 2 - 13,
      angle: -0.07
    });

    this.#createCushion({
      x: 800,
      y: 105,
      width: this.#config.tableWidth / 2 - this.#config.boxWidth * 2 - 10,
      angle: -0.05
    });

    this.#createCushion({
      x: 205,
      y: 300,
      width: this.#config.tableWidth / 2 - this.#config.boxWidth * 2 + 9,
      angle: 0.05,
      rotation: Math.PI / 2
    });

    this.#createCushion({
      x: 995,
      y: 300,
      width: this.#config.tableWidth / 2 - this.#config.boxWidth * 2 - 12,
      angle: -0.05,
      rotation: Math.PI / 2
    });

    this.#createCushion({
      x: 403,
      y: 495,
      width: this.#config.tableWidth / 2 - this.#config.boxWidth * 2 + 9,
      angle: 0.05
    });

    this.#createCushion({
      x: 797,
      y: 495,
      width: this.#config.tableWidth / 2 - this.#config.boxWidth * 2 + 12,
      angle: 0.05
    });
  }

  #createCushion({ x, y, width, angle, rotation = 0 }) {
    const cushion = Matter.Bodies.trapezoid(x, y, width, this.#config.cushionHeight, angle, {
      isStatic: true,
      restitution: this.#config.cushionRestitution,
      friction: this.#config.cushionFriction,
      angle: rotation,
      chamfer: { radius: 2 },
      render: { visible: true }
    });

    cushion.slop = 0.01;
    cushion.density = 1;

    this.#cushions.push(cushion);
    Matter.World.add(this.#engine.world, cushion);
  }

  render() {
    this.#drawField();
    this.#drawRails();
    this.#drawCushions();
    this.#drawDZone();
  }

  detectCueCollision(cueObj) {
    if (!cueObj) return;
    
    this.#cushions.forEach(cushion => {
      cushion.render.visible = Matter.Collision.collides(cueObj, cushion) ? false : true;
    });
  }
}
