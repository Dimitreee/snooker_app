/**
 * Portal Snooker Game
 * 
 * Game Design:
 * The Portal Snooker game reimagines traditional snooker by incorporating portal mechanics
 * and score multipliers, creating a unique twist on the classic game. The design focuses
 * on intuitive controls while adding strategic depth through novel gameplay elements.
 * 
 * Mouse-Based Cue System:
 * The decision to implement a mouse-only cue system was driven by several key factors:
 * 1. Intuitive Interaction: The click-and-drag mechanism mirrors the natural motion of
 *    drawing back a cue stick, making it immediately accessible to players.
 * 2. Precise Control: Mouse movement allows for fine-grained control over both shot
 *    direction and power, offering a level of precision that keyboard controls cannot match.
 * 3. Visual Feedback: The dynamic cue animation and trajectory prediction system provides
 *    immediate visual feedback, helping players understand shot mechanics and improve
 *    their accuracy.
 * 
 * Unique Extension - Portal Mechanics:
 * The game's innovative portal system fundamentally transforms the traditional snooker
 * experience in several ways:
 * 
 * 1. Strategic Depth:
 *    - Portals create new tactical possibilities by allowing balls to teleport across
 *      the table
 *    - Players must consider both direct shots and portal-assisted trajectories
 *    - Portal positioning adds a layer of strategic planning to each shot
 * 
 * 2. Technical Implementation:
 *    - Custom physics system handling seamless teleportation while maintaining momentum
 *    - Advanced collision detection accounting for portal entry/exit angles
 *    - Smooth visual transitions and particle effects for portal transportation
 * 
 * 3. Score Multipliers:
 *    - Dynamic score zones that multiply points when balls pass through them
 *    - Encourages risk-reward decision making
 *    - Creates exciting moments when chaining multiple multipliers with portal shots
 * 
 * 4. Visual Design:
 *    - Animated portals with rotating effects
 *    - Real-time trajectory prediction showing potential portal paths
 *    - Particle effects enhancing the visual feedback of portal transitions
 * 
 * The portal mechanics represent a unique innovation in snooker gaming by:
 * - Introducing non-linear ball trajectories to a traditionally linear game
 * - Creating new strategic possibilities without compromising core snooker mechanics
 * - Adding excitement through high-risk, high-reward portal shots
 * - Maintaining competitive balance while adding depth to gameplay
 * 
 * Technical Challenges:
 * Implementing the portal system required solving several complex problems:
 * - Maintaining physical accuracy during teleportation
 * - Handling edge cases in collision detection
 * - Creating smooth visual transitions
 * - Balancing gameplay mechanics
 * 
 * The result is a fresh take on snooker that respects the original game while
 * introducing innovative mechanics that create entirely new possibilities for
 * skilled play and strategic thinking.
 */

// Create global game instance
let game;

// Create new p5 instance
new p5(function(p) {
    // Store p5 instance globally
    window.p = p;
    
    p.setup = () => {
        // Create canvas and set basic configurations
        p.createCanvas(1300, 800);
        p.angleMode(p.DEGREES);
        
        // Initialize game after p5.js is ready
        if (typeof Game !== 'undefined') {
            game = new Game();
            game.initialize();
        }
    };

    p.draw = () => {
        if (game && game.update) {
            game.update();
        }
    };

    p.keyTyped = (event) => {
        if (game) {
            game.getComponent('eventHandler').handleKeyPress(event);
        }
    };

    p.mousePressed = () => {
        if (game) {
            game.getComponent('eventHandler').handleMousePress();
        }
    };

    p.mouseReleased = () => {
        if (game) {
            game.getComponent('eventHandler').handleMouseRelease();
        }
    };

    // Trigger setup manually
    p.setup();
});
