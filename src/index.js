// This file serves as the entry point for the game. It initializes the game by calling the necessary functions from game.js and sets up the game loop.

import { Game } from './game.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let topScore = localStorage.getItem('topScore') ? parseFloat(localStorage.getItem('topScore')) : null;
let game = new Game(ctx, topScore);

function gameLoop() {
    game.update();
    game.render();
    // Show restart button if game over
    const restartBtn = document.getElementById('restartBtn');
    if (game.gameOver) {
        restartBtn.style.display = 'block';
    } else {
        restartBtn.style.display = 'none';
    }
    requestAnimationFrame(gameLoop);
}

restartBtn.onclick = () => {
    // Update top score if needed
    if (game.gameOver) {
        const finalScore = game.totalTime + game.shotsTaken;
        if (!topScore || finalScore < topScore) {
            topScore = finalScore;
            localStorage.setItem('topScore', topScore);
        }
    }
    game = new Game(ctx, topScore);
};

game.start();
gameLoop();