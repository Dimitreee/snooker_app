class WhiteBall {
    #body = null;
    #config = {
        radius: 400/72,
        friction: 0.05,
        restitution: 0.8,
        mass: 5,
        density: 0.002,
        timeScale: 1,
        maxSpeed: 20,
        airFriction: 0.002,
        surfaceFriction: 0.1,
        rollingFriction: 0.015,
        highlights: {
            offset: 0.3,
            size: 0.5,
            alpha: 180
        }
    };
    #readyToHit = false;
    #engine;
    #p5;

    constructor(engine) {
        this.#engine = engine;
        this.#p5 = window.p;
        Matter.Engine.update(this.#engine, 1000 / 60, this.#config.timeScale);
    }

    get ballObj() {
        return this.#body;
    }

    get position() {
        return this.#body ? this.#body.position : { x: 0, y: 0 };
    }

    get velocity() {
        return this.#body ? this.#body.velocity : { x: 0, y: 0 };
    }

    get readyToHit() {
        return this.#readyToHit;
    }

    set readyToHit(value) {
        this.#readyToHit = value;
    }

    createCueBall(x, y) {
        if (this.#body) {
            Matter.World.remove(this.#engine.world, this.#body);
        }

        this.#body = Matter.Bodies.circle(x, y, this.#config.radius, {
            friction: this.#config.friction,
            restitution: this.#config.restitution,
            mass: this.#config.mass,
            density: this.#config.density,
            frictionAir: this.#config.airFriction,
            frictionStatic: this.#config.surfaceFriction,
            render: { fillStyle: '#FFFFFF' },
            slop: 0,
            inertia: Infinity
        });

        this.#body.collisionFilter = {
            category: 0x0002,
            mask: 0x0001 | 0x0002
        };

        Matter.World.add(this.#engine.world, this.#body);
        this.#readyToHit = true;
    }

    render() {
        if (!this.#body) return;

        this.#p5.push();
        
        // Draw white ball
        this.#p5.fill(255);
        this.#p5.noStroke();
        this.#p5.circle(this.position.x, this.position.y, this.#config.radius * 2);

        // Draw highlight
        const highlights = this.#config.highlights;
        this.#p5.fill(255, 255, 255, highlights.alpha);
        const highlightX = this.position.x - this.#config.radius * highlights.offset;
        const highlightY = this.position.y - this.#config.radius * highlights.offset;
        this.#p5.circle(
            highlightX, 
            highlightY, 
            this.#config.radius * highlights.size
        );

        this.#p5.pop();
    }

    updateState() {
        if (!this.#body) return;
        
        const velocity = this.#body.velocity;
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        
        if (speed > this.#config.maxSpeed) {
            const factor = this.#config.maxSpeed / speed;
            Matter.Body.setVelocity(this.#body, {
                x: velocity.x * factor,
                y: velocity.y * factor
            });
        }

        if (speed > 0.05) {
            const rollingFrictionFactor = 1 - (this.#config.rollingFriction * (speed / this.#config.maxSpeed));
            const airFrictionFactor = 1 - this.#config.airFriction;
            
            Matter.Body.setVelocity(this.#body, {
                x: velocity.x * rollingFrictionFactor * airFrictionFactor,
                y: velocity.y * rollingFrictionFactor * airFrictionFactor
            });
        } else if (speed < 0.05) {
            Matter.Body.setVelocity(this.#body, { x: 0, y: 0 });
            this.#readyToHit = true;
        }

        const pos = this.#body.position;
        const buffer = this.#config.radius;
        
        if (pos.x < 200 + buffer) Matter.Body.setPosition(this.#body, { x: 200 + buffer, y: pos.y });
        if (pos.x > 1000 - buffer) Matter.Body.setPosition(this.#body, { x: 1000 - buffer, y: pos.y });
        if (pos.y < 100 + buffer) Matter.Body.setPosition(this.#body, { x: pos.x, y: 100 + buffer });
        if (pos.y > 500 - buffer) Matter.Body.setPosition(this.#body, { x: pos.x, y: 500 - buffer });
    }

    isOnTable() {
        if (!this.#body) return false;
        
        const { x, y } = this.#body.position;
        return x >= 200 && x <= 1000 && y >= 100 && y <= 500;
    }

    remove() {
        if (!this.#body) return;
        
        Matter.World.remove(this.#engine.world, this.#body);
        this.#body = null;
        this.#readyToHit = false;
    }
} 