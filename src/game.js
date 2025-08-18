class Game {
    constructor() {
        this.isRunning = false;
        this.lastTime = 0;
    }

    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    gameLoop() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(() => this.gameLoop());
    }

    update(deltaTime) {
        // Update game logic here
    }

    render() {
        // Render game elements here
    }

    stop() {
        this.isRunning = false;
    }
}

export default Game;