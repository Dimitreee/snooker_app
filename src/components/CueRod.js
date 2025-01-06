class CueRod {
    #isAiming = false;
    #startX = 0;
    #startY = 0;
    #p5;
    #config = {
        rod: {
            length: 400,
            width: 6,
            color: '#8B4513',
            tipColor: '#F8F8FF',
            tipLength: 20,
            maxPullback: 100,
            minPullback: 10,
            pullbackOffset: 40
        },
        trajectory: {
            length: 500,
            segments: 10,
            color: '#FFFFFF',
            opacity: 150,
            dotSize: 3
        },
        guide: {
            length: 50,
            color: '#FFFFFF',
            opacity: 100
        },
        animation: {
            prepareDuration: 30,
            currentFrame: 0,
            isPreparing: false
        }
    };

    constructor() {
        this.#p5 = window.p;
    }

    get isAiming() {
        return this.#isAiming;
    }

    startAiming() {
        this.#isAiming = true;
        this.#startX = this.#p5.mouseX;
        this.#startY = this.#p5.mouseY;
        this.#config.animation.isPreparing = true;
        this.#config.animation.currentFrame = 0;
    }

    render(whiteBall) {
        if (!this.#isAiming || !whiteBall.ballObj) return;

        const dx = this.#p5.mouseX - this.#startX;
        const dy = this.#p5.mouseY - this.#startY;
        const angle = this.#p5.atan2(dy, dx);
        const pullback = this.#p5.min(
            this.#p5.dist(this.#startX, this.#startY, this.#p5.mouseX, this.#p5.mouseY),
            this.#config.rod.maxPullback
        );

        this.#renderTrajectory(whiteBall, angle);
        this.#renderCueRod(whiteBall, angle, pullback);
        this.#updateAnimation();
    }

    #renderTrajectory(whiteBall, angle) {
        this.#p5.push();
        
        const trajectoryAngle = angle + this.#p5.PI;
        
        // Guide line behind the ball
        this.#p5.stroke(this.#config.guide.color);
        this.#p5.strokeWeight(1);
        this.#p5.line(
            whiteBall.position.x - this.#p5.cos(trajectoryAngle) * this.#config.guide.length,
            whiteBall.position.y - this.#p5.sin(trajectoryAngle) * this.#config.guide.length,
            whiteBall.position.x,
            whiteBall.position.y
        );

        // Dotted trajectory line
        const segmentLength = this.#config.trajectory.length / this.#config.trajectory.segments;
        for (let i = 1; i <= this.#config.trajectory.segments; i++) {
            const distance = i * segmentLength;
            const opacity = this.#config.trajectory.opacity * (1 - i / this.#config.trajectory.segments);
            
            this.#p5.fill(255, 255, 255, opacity);
            this.#p5.noStroke();
            this.#p5.circle(
                whiteBall.position.x + this.#p5.cos(trajectoryAngle) * distance,
                whiteBall.position.y + this.#p5.sin(trajectoryAngle) * distance,
                this.#config.trajectory.dotSize
            );
        }
        
        this.#p5.pop();
    }

    #renderCueRod(whiteBall, angle, pullback) {
        this.#p5.push();
        
        // Calculate animation progress
        let animationOffset = 0;
        if (this.#config.animation.isPreparing) {
            const progress = this.#config.animation.currentFrame / this.#config.animation.prepareDuration;
            animationOffset = this.#p5.sin(progress * this.#p5.PI) * this.#config.rod.pullbackOffset;
        }

        // Calculate total offset including pullback and animation
        const totalOffset = whiteBall.ballObj.circleRadius + animationOffset + pullback;
        
        // Calculate rod positions
        const rodStartX = whiteBall.position.x - this.#p5.cos(angle) * totalOffset;
        const rodStartY = whiteBall.position.y - this.#p5.sin(angle) * totalOffset;
        const rodEndX = rodStartX - this.#p5.cos(angle) * this.#config.rod.length;
        const rodEndY = rodStartY - this.#p5.sin(angle) * this.#config.rod.length;

        // Draw rod body
        this.#p5.strokeWeight(this.#config.rod.width);
        this.#p5.stroke(this.#config.rod.color);
        this.#p5.line(rodStartX, rodStartY, rodEndX, rodEndY);

        // Draw rod tip
        this.#p5.strokeWeight(this.#config.rod.width);
        this.#p5.stroke(this.#config.rod.tipColor);
        this.#p5.line(
            rodStartX,
            rodStartY,
            rodStartX - this.#p5.cos(angle) * this.#config.rod.tipLength,
            rodStartY - this.#p5.sin(angle) * this.#config.rod.tipLength
        );

        this.#p5.pop();
    }

    #updateAnimation() {
        if (this.#config.animation.isPreparing) {
            this.#config.animation.currentFrame++;
            if (this.#config.animation.currentFrame >= this.#config.animation.prepareDuration) {
                this.#config.animation.isPreparing = false;
            }
        }
    }

    fireShot() {
        if (!this.#isAiming) return null;

        const dx = this.#p5.mouseX - this.#startX;
        const dy = this.#p5.mouseY - this.#startY;
        const pullback = this.#p5.dist(this.#startX, this.#startY, this.#p5.mouseX, this.#p5.mouseY);
        
        if (pullback < this.#config.rod.minPullback) {
            return null;
        }

        const force = this.#p5.min(pullback, this.#config.rod.maxPullback) / 10;

        return {
            x: dx * force * 0.0005,
            y: dy * force * 0.0005
        };
    }

    reset() {
        this.#isAiming = false;
        this.#config.animation.isPreparing = false;
        this.#config.animation.currentFrame = 0;
    }
}