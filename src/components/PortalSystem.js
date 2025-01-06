class PortalSystem {
    #portals = [];
    #config = {
        portalRadius: 20,
        maxPortals: 2,
        teleportCooldown: 500, // milliseconds
        colors: {
            entry: '#FF6B6B',
            exit: '#4ECDC4'
        },
        particleCount: 20
    };
    #lastTeleportTime = 0;
    #particles = [];
    #p5;

    constructor() {
        this.#p5 = window.p;
        this.#initializeParticles();
    }

    #initializeParticles() {
        for (let i = 0; i < this.#config.particleCount; i++) {
            this.#particles.push({
                angle: (360 / this.#config.particleCount) * i,
                offset: 0,
                speed: this.#p5.random(2, 4)
            });
        }
    }

    addPortal(x, y, isEntry = true) {
        if (this.#portals.length >= this.#config.maxPortals) {
            this.#portals.shift();
        }

        this.#portals.push({
            x,
            y,
            isEntry,
            createdAt: Date.now()
        });
    }

    render() {
        this.#portals.forEach((portal, index) => {
            this.#drawPortal(portal, index);
        });
    }

    #drawPortal(portal) {
        this.#p5.push();
        this.#p5.translate(portal.x, portal.y);

        // Draw portal ring
        this.#p5.noFill();
        this.#p5.strokeWeight(4);
        this.#p5.stroke(portal.isEntry ? this.#config.colors.entry : this.#config.colors.exit);
        this.#p5.circle(0, 0, this.#config.portalRadius * 2);

        // Draw particles
        this.#particles.forEach(particle => {
            const time = this.#p5.millis() / 1000;
            particle.offset = (particle.offset + particle.speed) % 360;
            
            const distance = this.#config.portalRadius + this.#p5.sin(time * 2 + particle.angle) * 5;
            const x = this.#p5.cos(particle.angle + particle.offset) * distance;
            const y = this.#p5.sin(particle.angle + particle.offset) * distance;
            
            this.#p5.noStroke();
            this.#p5.fill(portal.isEntry ? this.#config.colors.entry : this.#config.colors.exit);
            this.#p5.circle(x, y, 2);
        });

        this.#p5.pop();
    }

    process(balls, whiteBall) {
        if (this.#portals.length < 2) return;
        
        const currentTime = Date.now();
        if (currentTime - this.#lastTeleportTime < this.#config.teleportCooldown) return;

        const entryPortal = this.#portals.find(p => p.isEntry);
        const exitPortal = this.#portals.find(p => !p.isEntry);
        
        if (!entryPortal || !exitPortal) return;

        this.#checkBallTeleport(whiteBall, entryPortal, exitPortal);
        balls.forEach(ball => {
            this.#checkBallTeleport(ball, entryPortal, exitPortal);
        });
    }

    #checkBallTeleport(ball, entryPortal, exitPortal) {
        if (!ball.ballObj) return;

        const ballPos = ball.position;
        const distanceToEntry = this.#p5.dist(
            ballPos.x,
            ballPos.y,
            entryPortal.x,
            entryPortal.y
        );

        if (distanceToEntry <= this.#config.portalRadius) {
            this.#teleportBall(ball, exitPortal);
        }
    }

    #teleportBall(ball, exitPortal) {
        const velocity = ball.velocity;
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        
        if (speed < 0.5) return;

        Matter.Body.setPosition(ball.ballObj, {
            x: exitPortal.x,
            y: exitPortal.y
        });

        this.#lastTeleportTime = Date.now();
        this.#createTeleportEffect(exitPortal);
    }

    #createTeleportEffect(portal) {
        this.#p5.push();
        this.#p5.translate(portal.x, portal.y);
        
        for (let i = 0; i < 20; i++) {
            const angle = this.#p5.random(360);
            const speed = this.#p5.random(2, 5);
            const particle = {
                x: 0,
                y: 0,
                vx: this.#p5.cos(angle) * speed,
                vy: this.#p5.sin(angle) * speed,
                life: 1
            };
            this.#particles.push(particle);
        }
        
        this.#p5.pop();
    }

    clearPortals() {
        this.#portals = [];
    }

    getPortalCount() {
        return this.#portals.length;
    }

    isPortalNearby(x, y, minDistance = 50) {
        return this.#portals.some(portal => 
            this.#p5.dist(x, y, portal.x, portal.y) < minDistance
        );
    }
} 