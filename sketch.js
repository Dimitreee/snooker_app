const {
  Engine,
  World,
  Bodies,
  Body,
  Collision,
  Sleeping
} = Matter;

class Utilities {
  drawVertices(vertices) {
    beginShape();
    vertices.forEach(({ x, y }) => vertex(x, y));
    endShape(CLOSE);
  }
}

class Table {
  constructor() {
    this.cushions = [];
    this.tableWidth = 800;
    this.tableLength = this.tableWidth / 2;
    this.boxWidth = (this.tableWidth / 72) * 1.5;
    this.cushionHeight = 10;
    this.cushionAngle = 0.05;
  }

  createCushions() {
    const cushionDefs = [
      { x: 402, y: 105, width: this.tableLength - this.boxWidth * 2 - 13, angle: -0.07 },
      { x: 800, y: 105, width: this.tableLength - this.boxWidth * 2 - 10, angle: -this.cushionAngle },
      {
        x: 205,
        y: 300,
        width: this.tableLength - this.boxWidth * 2 + 9,
        angle: this.cushionAngle,
        rotation: Math.PI / 2,
      },
      {
        x: 403,
        y: 495,
        width: this.tableLength - this.boxWidth * 2 + 9,
        angle: this.cushionAngle,
      },
      {
        x: 797,
        y: 495,
        width: this.tableLength - this.boxWidth * 2 + 12,
        angle: this.cushionAngle,
      },
      {
        x: 995,
        y: 300,
        width: this.tableLength - this.boxWidth * 2 - 12,
        angle: -this.cushionAngle,
        rotation: Math.PI / 2,
      },
    ];

    cushionDefs.forEach(({ x, y, width, angle, rotation = 0 }) => {
      const cushion = Bodies.trapezoid(x, y, width, this.cushionHeight, angle, {
        isStatic: true,
        restitution: 1,
        angle: rotation,
      });
      this.cushions.push(cushion);
      World.add(engine.world, cushion);
    });
  }

  detectCollision(cueBallBody) {
    this.cushions.forEach((cushion) => {
      cushion.render.visible = Collision.collides(cueBallBody, cushion) ? false : true;
    });
  }

  draw() {
    this._drawPlayingField();
    this._drawRailing();
    this._drawYellowBoxes();
    this._drawHoles();
    this._drawDLine();
    this._drawCushions();
  }

  _drawPlayingField() {
    noStroke();
    fill("#4e8834");
    rect(200, 100, this.tableWidth, this.tableLength);
  }

  _drawRailing() {
    fill("#40230d");
    // Left rail
    rect(185, 100, 15, this.tableLength);
    // Top rail
    rect(200, 85, this.tableWidth, 15);
    // Right rail
    rect(1000, 100, 15, this.tableLength);
    // Bottom rail
    rect(200, 500, this.tableWidth, 15);
  }

  _drawYellowBoxes() {
    fill("#f1d74a");
    // Top left corner
    rect(185, 85, 25, 25, 15, 0, 0, 0);
    // Top middle
    rect(588, 85, 24, 15);
    // Top right corner
    rect(990, 85, 25, 25, 0, 15, 0, 0);

    // Bottom left corner
    rect(185, 490, 25, 25, 0, 0, 0, 15);
    // Bottom middle
    rect(588, 500, 24, 15);
    // Bottom right corner
    rect(990, 490, 25, 25, 0, 0, 15, 0);
  }

  _drawHoles() {
    fill(0);
    // Top row (left, center, right)
    ellipse(205, 104, this.boxWidth);
    ellipse(600, 104, this.boxWidth);
    ellipse(996, 104, this.boxWidth);

    // Bottom row (left, center, right)
    ellipse(205, 495, this.boxWidth);
    ellipse(600, 495, this.boxWidth);
    ellipse(996, 495, this.boxWidth);
  }

  _drawDLine() {
    fill(255);
    stroke(255);
    // Vertical line
    line(
        200 + this.tableWidth / 5,
        100 + 15,
        200 + this.tableWidth / 5,
        this.tableLength + 100 - 15
    );
    // D-arc
    noFill();
    arc(200 + this.tableWidth / 5, 175 + 370 / 3, 150, 150, 90, 270);
  }

  _drawCushions() {
    this.cushions.forEach((cushion) => {
      push();
      noStroke();
      fill(cushion.render?.visible ? "#346219" : "#69F319");
      utilities.drawVertices(cushion.vertices);
      pop();
    });
  }
}

function ballFactory(x, y, color, value) {
  return {
    object: Bodies.circle(x, y, 400 / 72, {
      isSleeping: true,
      restitution: 0.9,
      friction: 0.7,
    }),
    color,
    value,
  };
}

class CueBall {
  constructor() {
    this.ball = null;
    this.canStrike = false; // Prevent re-strikes until it stops
  }

  setUpCueBall(x, y) {
    this.ball = Bodies.circle(x, y, 400 / 72, {
      friction: 0.7,
      restitution: 0.95,
    });
    Body.setMass(this.ball, this.ball.mass * 2); // Slightly heavier
    World.add(engine.world, this.ball);
    this.canStrike = true;
  }

  draw() {
    if (!this.ball) return;
    const { x, y } = this.ball.position;
    const r = this.ball.circleRadius;

    // Draw a 3D-like white ball
    push();
    noStroke();
    fill("white");
    ellipse(x, y, r * 2);
    // highlight
    fill(255, 140);
    ellipse(x - r * 0.3, y - r * 0.3, r * 0.5);
    pop();
  }

  checkIfStationary() {
    if (!this.ball) return;
    const { x, y } = this.ball.velocity;
    const speed = Math.sqrt(x * x + y * y);
    if (speed < 0.05) {
      this.canStrike = true;
    }
  }

  inField() {
    if (!this.ball) return false;
    const { x, y } = this.ball.position;
    return x >= 200 && x <= 1000 && y >= 106 && y <= 494;
  }
}

class CueStick {
  constructor() {
    this.isAiming = false;
    this.maxPull = 240;
    this.pullDistance = 20;
    this.angle = 0;
    this.forceScale = 0.00007;
  }

  update(cueBall) {
    if (!cueBall.ball) return;
    const { x: bx, y: by } = cueBall.ball.position;

    const dx = mouseX - bx;
    const dy = mouseY - by;

    this.angle = atan2(dy, dx);
    const distToMouse = dist(bx, by, mouseX, mouseY);
    this.pullDistance = min(distToMouse, this.maxPull);
  }

  draw(cueBall) {
    if (!cueBall.ball) return;
    const { x: bx, y: by } = cueBall.ball.position;

    // 1) Dashed trajectory line
    this._drawTrajectory(bx, by, 1);

    // 2) Draw the cue with a gradient
    push();
    translate(bx, by);
    rotate(this.angle);

    let cueLength = this.pullDistance;
    let cueThickness = 6;

    noStroke();
    let fromColor = color(90, 50, 20);   // brown
    let toColor = color(180, 180, 180);  // silverish
    let slices = 40;
    for (let i = 0; i < slices; i++) {
      let t = i / (slices - 1);
      let rCol = lerpColor(fromColor, toColor, t);

      fill(rCol);
      let sliceWidth = cueLength / slices;
      let xPos = -cueLength + i * sliceWidth;
      rect(xPos - 14, -cueThickness * 0.5, sliceWidth + 1, cueThickness);
    }

    // Tip
    fill(220);
    rect(0, -cueThickness * 0.5, 6, cueThickness);

    pop();
  }

  strike(cueBall) {
    if (!cueBall.ball) return;
    const pos = cueBall.ball.position;
    let forceX = this.pullDistance * cos(this.angle) * this.forceScale;
    let forceY = this.pullDistance * sin(this.angle) * this.forceScale;
    Body.applyForce(cueBall.ball, { x: pos.x, y: pos.y }, { x: forceX, y: forceY });
    this.pullDistance = 0;
  }

  _drawTrajectory(bx, by, radius) {
    push();
    stroke(255);
    strokeWeight(1);

    let dashLen = 2;
    let gapLen = 2;
    let totalLen = 200;
    let offset = radius + 2;

    let xStart = bx + cos(this.angle) * offset;
    let yStart = by + sin(this.angle) * offset;

    let xCurr = xStart;
    let yCurr = yStart;
    let traveled = 0;

    while (traveled < totalLen) {
      // dash
      let dashDist = min(dashLen, totalLen - traveled);
      let xDashEnd = xCurr + cos(this.angle) * dashDist;
      let yDashEnd = yCurr + sin(this.angle) * dashDist;
      line(xCurr, yCurr, xDashEnd, yDashEnd);

      xCurr = xDashEnd;
      yCurr = yDashEnd;
      traveled += dashDist;

      // gap
      let gapDist = min(gapLen, totalLen - traveled);
      xCurr += cos(this.angle) * gapDist;
      yCurr += sin(this.angle) * gapDist;
      traveled += gapDist;
    }

    pop();
  }
}

class BallManager {
  constructor() {
    this.balls = { red: [], color: [] };
    this.foul = false;
    this.won = false;
    this.foulMessage = "";
    this.consecutiveColorHits = 0;
    this.target = "Red Ball";
    this.redBallIn = false;
    this.ballCollided = "";
    this.mode = null;

    this.coloredBalls = {
      pink:   { x: 720, y: 310 - 800 / 72, value: 6 },
      blue:   { x: 600, y: 310 - 800 / 72, value: 5 },
      black:  { x: 900, y: 310 - 800 / 72, value: 7 },
      brown:  { x: 360, y: 310 - 800 / 72, value: 4 },
      green:  { x: 360, y: 250 + 370 / 3, value: 3 },
      yellow: { x: 360, y: 100 + 370 / 3, value: 2 },
    };
  }

  setMode(mode) {
    this.mode = mode;
    this._createBallsByMode(mode);
  }

  setBallsSleep(asleep) {
    for (const type in this.balls) {
      for (const ball of this.balls[type]) {
        Sleeping.set(ball.object, asleep);
      }
    }
  }

  drawBalls() {
    for (const type in this.balls) {
      for (const b of this.balls[type]) {
        const { x, y } = b.object.position;
        const r = b.object.circleRadius;

        push();
        noStroke();
        fill(b.color);
        ellipse(x, y, r * 2);
        // highlight
        fill(255, 140);
        ellipse(x - r * 0.3, y - r * 0.3, r * 0.5);
        pop();
      }
    }
  }

  detectFalling() {
    for (const type in this.balls) {
      for (const b of this.balls[type]) {
        const { y } = b.object.position;
        if (y <= 106 || y >= 494) {
          this._handleFallenBall(b, type);
        }
      }
    }
  }

  detectCollision(cue) {
    for (const type in this.balls) {
      for (const b of this.balls[type]) {
        if (cue?.ball && Collision.collides(cue.ball, b.object)) {
          if (b.color === "red") {
            this._redBallCollision();
          } else {
            this._coloredBallCollision();
          }
          if (this.balls.red.length > 0) {
            this.target = "Red Ball";
          }
        }
      }
    }
  }

  newTurn() {
    this.foul = false;
    this.foulMessage = "";
    this.ballCollided = "";
    this.consecutiveColorHits = 0;
    this.setBallsSleep(true);
  }

  checkWin() {
    if (this.won) {
      push();
      textSize(40);
      stroke("green");
      fill("green");
      text("You Win!", 400, 700);
      pop();
      setTimeout(() => noLoop(), 1000);
    }
  }

  showTarget() {
    push();
    textSize(20);
    stroke(255);
    fill("white");
    text(`Target: ${this.target}`, 900, 50);
    pop();
  }

  drawFoul() {
    push();
    textSize(24);
    stroke(this.foul ? "red" : 0);
    fill(this.foul ? "red" : 0);
    text(`Foul: ${this.foulMessage}`, 450, 700);
    pop();
  }

  _createBallsByMode(mode) {
    switch (mode) {
      case "ordered":
        this._createRedPyramid();
        for (const color in this.coloredBalls) {
          const { x, y, value } = this.coloredBalls[color];
          this._createBall(x, y, color, value);
        }
        break;
      case "unordered":
        for (let i = 0; i < 15; i++) {
          this._createBall(random(250, 950), random(150, 400), "red", 1);
        }
        for (const color in this.coloredBalls) {
          const value = this.coloredBalls[color].value;
          this._createBall(random(250, 950), random(150, 400), color, value);
        }
        break;
      case "partial":
        for (let i = 0; i < 15; i++) {
          this._createBall(random(250, 950), random(150, 400), "red", 1);
        }
        for (const color in this.coloredBalls) {
          const { x, y, value } = this.coloredBalls[color];
          this._createBall(x, y, color, value);
        }
        break;
      default:
        console.error("Invalid mode selected.");
    }
  }

  _createRedPyramid() {
    const startX = 725;
    const startY = 305;
    const radius = 400 / 72;
    const gap = 4;

    for (let i = 0; i < 6; i++) {
      const yPos = startY - i * radius;
      for (let j = 0; j <= i; j++) {
        this._createBall(
            startX + i * (radius + gap),
            yPos + 2 * j * radius,
            "red",
            1
        );
      }
    }
  }

  _createBall(x, y, color, value) {
    const ball = ballFactory(x, y, color, value);
    const type = color === "red" ? "red" : "color";
    this.balls[type].push(ball);
    World.add(engine.world, ball.object);
  }

  _handleFallenBall(ball, type) {
    const arr = this.balls[type];
    const idx = arr.indexOf(ball);
    if (idx !== -1) {
      World.remove(engine.world, ball.object);
      arr.splice(idx, 1);
    }

    if (type === "red") {
      this.redBallIn = true;
      this.target = "Colored Ball";
    } else {
      this.consecutiveColorHits++;
      if (this.consecutiveColorHits >= 2) {
        this.foul = true;
        this.foulMessage = "Two consecutive colored balls fell.";
      }
      if (this.balls.red.length === 0) {
        this.target = "Red Ball";
      }
    }

    if (this.balls.red.length === 0 && this.balls.color.length === 0) {
      this.won = true;
    }
    scoreBoard.addScore(this.foul ? 0 : ball.value);
  }

  _redBallCollision() {
    if ((this.redBallIn || this.ballCollided === "color") && !this.foul) {
      this.foul = true;
      this.foulMessage = "Red ball hit illegally.";
      scoreBoard.addScore(-4);
    }
    this.redBallIn = false;
    this.ballCollided = "red";
  }

  _coloredBallCollision() {
    if (!this.redBallIn && this.balls.red.length !== 0 && !this.foul) {
      this.foul = true;
      this.foulMessage = "Colored ball hit illegally.";
      scoreBoard.addScore(-4);
    }
    this.redBallIn = false;
    this.ballCollided = "color";
  }
}

class ScoreBoard {
  constructor() {
    this.score = 0;
  }

  addScore(points) {
    this.score += points;
  }

  showScore() {
    push();
    textSize(24);
    fill("white");
    stroke("white");
    text(`Score: ${this.score}`, 1050, 400);
    pop();
  }
}

class Timer {
  constructor() {
    this.minutes = 10;
    this.seconds = 0;
  }

  startTimer() {
    if (frameCount % 60 === 0) {
      if (this.minutes === 0 && this.seconds === 0) {
        noLoop();
      } else if (this.seconds === 0) {
        this.minutes -= 1;
        this.seconds = 59;
      } else {
        this.seconds -= 1;
      }
    }
  }

  drawTimer() {
    push();
    textSize(18);
    fill("white");
    stroke(255);
    const fm = this.minutes < 10 ? `0${this.minutes}` : this.minutes;
    const fs = this.seconds < 10 ? `0${this.seconds}` : this.seconds;

    const msg = (this.minutes + this.seconds > 0)
        ? `Time left: ${fm}:${fs}`
        : "TIME'S UP!";

    text(msg, 1050, 200);
    pop();
  }
}

class Extensions {
  constructor() {
    this.powersUsed = [];
    this.buttons = [];

    this.powers = {
      mass: {
        title: "10X MASS GAINER",
        activated: false,
        activate: () => {
          if (cue.ball) {
            Body.setMass(cue.ball, cue.ball.mass * 10);
          }
        },
        deactivate: () => {
          if (cue.ball) {
            const resetMass = cue.ball.mass > 1 ? cue.ball.mass / 10 : cue.ball.mass;
            Body.setMass(cue.ball, resetMass);
          }
        },
      },
      shrink: {
        title: "SHRINK RAY",
        activated: false,
        activate: () => {
          for (const type in ballManager.balls) {
            for (const b of ballManager.balls[type]) {
              Body.scale(b.object, 2 / 3, 2 / 3);
            }
          }
        },
        deactivate: () => {
          for (const type in ballManager.balls) {
            for (const b of ballManager.balls[type]) {
              if (b.object.area < 91) {
                Body.scale(b.object, 3 / 2, 3 / 2);
              }
            }
          }
        },
      },
      points: {
        title: "DOUBLE POINTS",
        activated: false,
        activate: () => {
          for (const type in ballManager.balls) {
            for (const b of ballManager.balls[type]) {
              b.value *= 2;
            }
          }
        },
        deactivate: () => {
          for (const type in ballManager.balls) {
            for (const b of ballManager.balls[type]) {
              if (
                  b.color === "red" ||
                  b.value !== ballManager.coloredBalls[b.color]?.value
              ) {
                b.value /= 2;
              }
            }
          }
        },
      },
      align: {
        title: "LINE 'EM UP",
        activated: false,
        activate: () => {
          const positions = [
            { x: 220, y: 120 },
            { x: 600, y: 120 },
            { x: 980, y: 120 },
            { x: 220, y: 480 },
            { x: 600, y: 480 },
            { x: 980, y: 480 },
          ];
          let counter = 0;
          for (const type in ballManager.balls) {
            for (const b of ballManager.balls[type]) {
              if (Math.random() > (b.color === "red" ? 0.7 : 0.5) && counter < 6) {
                Body.setPosition(b.object, { x: positions[counter].x, y: positions[counter].y });
                counter++;
              }
            }
          }
        },
        deactivate: () => {},
      },
    };
  }

  placeButtons() {
    let y = 200;
    for (const btn of this.buttons) {
      btn.hide();
    }
    this.buttons.length = 0;

    for (const key in this.powers) {
      y += 50;
      this._createButton(this.powers[key], y);
    }
  }

  deactivate() {
    for (const key in this.powers) {
      const power = this.powers[key];
      if (power.activated) {
        power.deactivate();
        power.activated = false;
      }
    }
  }

  _createButton(power, y) {
    const button = createButton(power.title);
    this.buttons.push(button);
    button.position(25, y);

    if (this.powersUsed.includes(power)) {
      button.attribute("disabled", true);
    }

    button.mousePressed(() => {
      power.activate();
      power.activated = true;
      button.attribute("disabled", true);
      this.powersUsed.push(power);
    });
  }
}

const engine = Engine.create();
let canvas;
let gameStart = false;

// Instantiate classes
const table = new Table();
const cue = new CueBall();
const ballManager = new BallManager();
const scoreBoard = new ScoreBoard();
const timer = new Timer();
const extensions = new Extensions();
const utilities = new Utilities();
const cueStick = new CueStick();

function setup() {
  canvas = createCanvas(1300, 800);
  angleMode(DEGREES);
  background(0);

  table.createCushions();
  // No MouseConstraint => cannot push/drag the ball
}

function draw() {
  background(0);
  Engine.update(engine);
  engine.gravity.y = 0;

  // Draw table & header
  table.draw();
  _drawHeader();

  // Timer & scoreboard
  timer.drawTimer();

  // If no mode, prompt user
  if (!ballManager.mode) {
    _promptModeSelection();
  } else {
    textSize(14);
    text(`Mode: ${ballManager.mode}`, 25, 100);
    ballManager.drawBalls();
    scoreBoard.showScore();

    if (!gameStart) {
      _promptCuePlacement();
    } else {
      _handleGameLogic();
    }
  }
}

function _drawHeader() {
  push();
  textSize(36);
  fill("white");
  stroke(255);
  text("Snooker", 550, 50);
  pop();
}

function _promptModeSelection() {
  push();
  textSize(24);
  fill("white");
  text(
      'Press: \n "O" - for ordered type \n "U" - for unordered type \n "P" - for partially ordered type',
      200,
      600
  );
  pop();
}

function _promptCuePlacement() {
  push();
  textSize(24);
  stroke(255);
  fill("white");
  text("Click anywhere on the D-line to place the white ball", 200, 600);
  pop();
}

function _handleGameLogic() {
  timer.startTimer();
  _promptRestart();

  // Draw the cue ball
  cue.draw();
  ballManager.showTarget();

  if (cue.ball && cue.inField()) {
    ballManager.drawFoul();
    table.detectCollision(cue.ball);
    ballManager.detectCollision(cue);
    ballManager.detectFalling();
    ballManager.checkWin();

    // Re-enable striking if ball is nearly stopped
    cue.checkIfStationary();

    // If user is aiming & can strike => show & update the cue stick
    if (cueStick.isAiming && cue.canStrike) {
      cueStick.update(cue);
      cueStick.draw(cue);
    }
  } else {
    // If ball left the field => foul
    if (cue.ball) {
      scoreBoard.addScore(-4);
      World.remove(engine.world, cue.ball);
      cue.ball = null;
    }
    gameStart = false;
  }
}

function _promptRestart() {
  push();
  textSize(24);
  fill("white");
  text("Press 'R' to restart the game", 200, 600);
  pop();
}

/*********************************************
 * Event Handlers
 *********************************************/
function keyTyped() {
  if (!gameStart && !ballManager.mode) {
    _selectMode(key.toLowerCase());
  }
  if (key.toLowerCase() === "r") {
    window.location.reload();
  }
}

function _selectMode(k) {
  if (k === "o") ballManager.setMode("ordered");
  if (k === "u") ballManager.setMode("unordered");
  if (k === "p") ballManager.setMode("partial");
}

function mousePressed() {
  // If the game has started, we have a cue ball, and it's strikeable, we aim:
  if (gameStart && cue.ball && cue.canStrike) {
    cueStick.isAiming = true;
  }
}

function mouseReleased() {
  if (!gameStart && ballManager.mode) {
    _placeCueBall();
  } else if (cueStick.isAiming && cue.ball && cue.canStrike) {
    cueStick.strike(cue);
    cue.canStrike = false;
    cueStick.isAiming = false;
    ballManager.setBallsSleep(false);
  }
}

function _placeCueBall() {
  const dLineCenterX = 350;
  const dLineCenterY = 175 + 370 / 3;
  const distanceFromDLine = dist(mouseX, mouseY, dLineCenterX, dLineCenterY);

  if (distanceFromDLine < 75 && mouseX < dLineCenterX) {
    gameStart = true;
    cue.setUpCueBall(mouseX, mouseY);
    ballManager.setBallsSleep(true);
    extensions.placeButtons();
  }
}
