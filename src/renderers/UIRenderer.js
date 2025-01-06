class UIRenderer {
    #p5;
    #config = {
      fonts: {
        title: 48,
        subtitle: 24,
        menu: 20,
        score: 32,
        timer: 24
      },
      colors: {
        title: '#FFFFFF',
        subtitle: '#CCCCCC',
        menu: '#AAAAAA',
        score: '#00FF00',
        timer: '#FFFFFF',
        highlight: '#FFD700'
      },
      padding: 20
    };
  
    constructor() {
      this.#p5 = window.p;
    }
  
    renderTitle() {
      this.#p5.push();
      this.#p5.textAlign(this.#p5.CENTER, this.#p5.CENTER);
      
      // Title
      this.#p5.textSize(this.#config.fonts.title);
      this.#p5.fill(this.#config.colors.title);
      this.#p5.text('Portal Snooker', 650, 200);
      
      // Subtitle
      this.#p5.textSize(this.#config.fonts.subtitle);
      this.#p5.fill(this.#config.colors.subtitle);
      this.#p5.text('Select Game Mode', 650, 280);
      
      // Menu Options
      this.#p5.textSize(this.#config.fonts.menu);
      this.#p5.fill(this.#config.colors.menu);
      this.#p5.text('Press [O] for Ordered Mode', 650, 340);
      this.#p5.text('Press [U] for Unordered Mode', 650, 380);
      this.#p5.text('Press [P] for Practice Mode', 650, 420);
      
      this.#p5.pop();
    }
  
    renderGameInfo(score, timeLeft, gameMode) {
      this.#p5.push();
      
      // Score
      this.#p5.textAlign(this.#p5.LEFT, this.#p5.CENTER);
      this.#p5.textSize(this.#config.fonts.score);
      this.#p5.fill(this.#config.colors.score);
      this.#p5.text(`Score: ${score}`, 50, 50);
      
      // Timer
      this.#p5.textSize(this.#config.fonts.timer);
      this.#p5.fill(this.#config.colors.timer);
      const minutes = Math.floor(timeLeft / 60);
      const seconds = Math.floor(timeLeft % 60);
      this.#p5.text(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`, 50, 90);
      
      // Game Mode
      this.#p5.textSize(this.#config.fonts.menu);
      this.#p5.fill(this.#config.colors.menu);
      this.#p5.text(`Mode: ${gameMode}`, 50, 130);
      
      // Controls Help
      this.#p5.textAlign(this.#p5.RIGHT, this.#p5.CENTER);
      this.#p5.text('R - Reset Game', 1250, 50);
      this.#p5.text('Click and drag to shoot', 1250, 80);
      
      this.#p5.pop();
    }
  
    renderGameOver(finalScore, isVictory) {
      this.#p5.push();
      this.#p5.textAlign(this.#p5.CENTER, this.#p5.CENTER);
      
      // Game Over Title
      this.#p5.textSize(this.#config.fonts.title);
      this.#p5.fill(isVictory ? this.#config.colors.score : this.#config.colors.title);
      this.#p5.text(isVictory ? 'Victory!' : 'Game Over', 650, 200);
      
      // Final Score
      this.#p5.textSize(this.#config.fonts.subtitle);
      this.#p5.fill(this.#config.colors.subtitle);
      this.#p5.text(`Final Score: ${finalScore}`, 650, 280);
      
      // Restart Instructions
      this.#p5.textSize(this.#config.fonts.menu);
      this.#p5.fill(this.#config.colors.menu);
      this.#p5.text('Press [R] to Restart', 650, 340);
      
      this.#p5.pop();
    }
  
    renderPlacementInstructions() {
      this.#p5.push();
      this.#p5.textAlign(this.#p5.CENTER, this.#p5.CENTER);
      
      this.#p5.textSize(this.#config.fonts.subtitle);
      this.#p5.fill(this.#config.colors.subtitle);
      this.#p5.text('Click in the D-zone to place the white ball', 650, 550);
      
      this.#p5.pop();
    }
  
    renderText(text, x, y, size = 24, color = '#FFFFFF') {
      this.#p5.push();
      this.#p5.textSize(size);
      this.#p5.fill(color);
      this.#p5.text(text, x, y);
      this.#p5.pop();
    }
  }
  