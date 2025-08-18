// This file serves as the entry point for the game. It initializes the game by calling the necessary functions from game.js and sets up the game loop.

import { Game } from './game.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const game = new Game(ctx);

function gameLoop() {
    game.update();
    game.render();
    requestAnimationFrame(gameLoop);
}

game.start();
gameLoop();