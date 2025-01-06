class SpecialFeatures {
    #p5;
    #config = {
        portal: {
            size: 40,
            color1: '#FF6B6B',
            color2: '#4ECDC4',
            animationSpeed: 0.05,
            thickness: 8
        },
        multiplier: {
            size: 35,
            color: '#FFD93D',
            textColor: '#000000',
            textSize: 20
        },
        positions: {
            portals: [
                { x: 300, y: 200, linkedTo: { x: 900, y: 400 } },
                { x: 900, y: 400, linkedTo: { x: 300, y: 200 } }
            ],
            multipliers: [
                { x: 600, y: 300, value: 2 },
                { x: 400, y: 400, value: 3 }
            ]
        }
    };
    #animationPhase = 0;

    constructor() {
        this.#p5 = window.p;
    }

    render() {
        this.#renderPortals();
        this.#renderMultipliers();
        this.#updateAnimation();
    }

    #renderPortals() {
        this.#config.positions.portals.forEach((portal, index) => {
            const isFirstPortal = index % 2 === 0;
            const color = isFirstPortal ? this.#config.portal.color1 : this.#config.portal.color2;
            
            this.#p5.push();
            this.#p5.translate(portal.x, portal.y);
            
            // Outer ring
            this.#p5.noFill();
            this.#p5.strokeWeight(this.#config.portal.thickness);
            this.#p5.stroke(color);
            
            // Animated rotation
            const rotation = this.#animationPhase + (isFirstPortal ? 0 : this.#p5.PI);
            this.#p5.rotate(rotation);
            
            // Draw portal
            this.#p5.ellipse(0, 0, this.#config.portal.size, this.#config.portal.size);
            
            // Inner details
            this.#p5.strokeWeight(2);
            this.#p5.line(-this.#config.portal.size/4, 0, this.#config.portal.size/4, 0);
            this.#p5.line(0, -this.#config.portal.size/4, 0, this.#config.portal.size/4);
            
            this.#p5.pop();
        });
    }

    #renderMultipliers() {
        this.#config.positions.multipliers.forEach(multiplier => {
            this.#p5.push();
            
            // Draw multiplier circle
            this.#p5.fill(this.#config.multiplier.color);
            this.#p5.noStroke();
            this.#p5.circle(multiplier.x, multiplier.y, this.#config.multiplier.size);
            
            // Draw multiplier text
            this.#p5.fill(this.#config.multiplier.textColor);
            this.#p5.textSize(this.#config.multiplier.textSize);
            this.#p5.textAlign(this.#p5.CENTER, this.#p5.CENTER);
            this.#p5.text(`${multiplier.value}x`, multiplier.x, multiplier.y);
            
            this.#p5.pop();
        });
    }

    #updateAnimation() {
        this.#animationPhase += this.#config.portal.animationSpeed;
        if (this.#animationPhase > this.#p5.TWO_PI) {
            this.#animationPhase = 0;
        }
    }

    checkPortalCollision(ball) {
        if (!ball || !ball.position) return null;

        for (const portal of this.#config.positions.portals) {
            const distance = this.#p5.dist(
                ball.position.x,
                ball.position.y,
                portal.x,
                portal.y
            );

            if (distance < this.#config.portal.size / 2) {
                return portal.linkedTo;
            }
        }
        return null;
    }

    checkMultiplierCollision(ball) {
        if (!ball || !ball.position) return 1;

        for (const multiplier of this.#config.positions.multipliers) {
            const distance = this.#p5.dist(
                ball.position.x,
                ball.position.y,
                multiplier.x,
                multiplier.y
            );

            if (distance < this.#config.multiplier.size / 2) {
                return multiplier.value;
            }
        }
        return 1;
    }

    getPortalPositions() {
        return this.#config.positions.portals;
    }

    getMultiplierPositions() {
        return this.#config.positions.multipliers;
    }
}