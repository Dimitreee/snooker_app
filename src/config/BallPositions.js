const BallPositions = {
    ordered: [
        { x: 600, y: 300, color: '#FF0000', points: 1 },  // Red
        { x: 620, y: 290, color: '#FF8C00', points: 2 },  // Orange
        { x: 620, y: 310, color: '#FFFF00', points: 3 },  // Yellow
        { x: 640, y: 280, color: '#008000', points: 4 },  // Green
        { x: 640, y: 300, color: '#0000FF', points: 5 },  // Blue
        { x: 640, y: 320, color: '#4B0082', points: 6 },  // Indigo
        { x: 660, y: 300, color: '#800080', points: 7 }   // Violet
    ],
    unordered: [
        { x: 600, y: 300, color: '#FF0000', points: 1 },
        { x: 620, y: 290, color: '#FF0000', points: 1 },
        { x: 620, y: 310, color: '#FF0000', points: 1 },
        { x: 640, y: 280, color: '#FF0000', points: 1 },
        { x: 640, y: 300, color: '#FF0000', points: 1 },
        { x: 640, y: 320, color: '#FF0000', points: 1 },
        { x: 660, y: 300, color: '#FF0000', points: 1 }
    ],
    partial: [
        { x: 600, y: 300, color: '#FF0000', points: 2 },
        { x: 620, y: 290, color: '#FF0000', points: 2 },
        { x: 620, y: 310, color: '#FF0000', points: 2 },
        { x: 640, y: 280, color: '#0000FF', points: 5 }
    ],

    getInitialPositions(mode) {
        if (!this[mode]) {
            console.error(`Invalid mode: ${mode}`);
            return [];
        }
        return [...this[mode]]; // Return a copy of the array
    },

    getBallConfig(mode, index) {
        const positions = this[mode];
        if (!positions || index >= positions.length) {
            return null;
        }
        return { ...positions[index] }; // Return a copy of the config
    },

    getTotalBalls(mode) {
        return this[mode]?.length || 0;
    }
}; 