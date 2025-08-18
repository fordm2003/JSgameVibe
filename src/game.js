
export class Game {
    constructor(ctx) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.stickman = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            armLength: 60,
            gunLength: 40,
            hatWidth: 60,
            hatHeight: 20,
            hatBrim: 80,
        };
        this.gunAngle = 0;
        this.target = this.spawnTarget();
        this.shotFired = false;
        this.shotPos = null;
        this.hit = false;
        this.handleEvents();
    }

    start() {
        // No-op, handled by game loop in index.js
    }

    update() {
        // If shot fired, check for hit
        if (this.shotFired && this.shotPos) {
            // Line from gun to shot endpoint
            const sx = this.stickman.x + Math.cos(this.gunAngle) * (this.stickman.armLength + this.stickman.gunLength);
            const sy = this.stickman.y + Math.sin(this.gunAngle) * (this.stickman.armLength + this.stickman.gunLength);
            const ex = this.shotPos.x;
            const ey = this.shotPos.y;
            // Target center
            const tx = this.target.x;
            const ty = this.target.y;
            // Target radius
            const r = 25;
            // Distance from target center to shot line
            const dist = this.pointToLineDistance(tx, ty, sx, sy, ex, ey);
            if (dist < r) {
                this.hit = true;
                this.target = this.spawnTarget();
            }
            this.shotFired = false;
        }
    }

    // Helper: distance from point (px,py) to line (x1,y1)-(x2,y2)
    pointToLineDistance(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        if (len_sq !== 0) param = dot / len_sq;
        let xx, yy;
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawStickman();
        this.drawTarget();
        if (this.shotPos) {
            this.drawShot();
        }
    }

    drawStickman() {
        const ctx = this.ctx;
        const s = this.stickman;
        // Body
        ctx.save();
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 4;
        // Head
        ctx.beginPath();
        ctx.arc(s.x, s.y - 60, 30, 0, Math.PI * 2);
        ctx.stroke();
        // Body line
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - 30);
        ctx.lineTo(s.x, s.y + 60);
        ctx.stroke();
        // Left leg
        ctx.beginPath();
        ctx.moveTo(s.x, s.y + 60);
        ctx.lineTo(s.x - 30, s.y + 120);
        ctx.stroke();
        // Right leg
        ctx.beginPath();
        ctx.moveTo(s.x, s.y + 60);
        ctx.lineTo(s.x + 30, s.y + 120);
        ctx.stroke();
        // Left arm
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.armLength, s.y - 20);
        ctx.stroke();
        // Right arm (gun arm)
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(this.gunAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(s.armLength, 0);
        ctx.stroke();
        // Gun
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(s.armLength, 0);
        ctx.lineTo(s.armLength + s.gunLength, 0);
        ctx.stroke();
        ctx.restore();
        // Cowboy hat
        ctx.save();
        ctx.fillStyle = '#a0522d';
        // Brim
        ctx.fillRect(s.x - s.hatBrim / 2, s.y - 90, s.hatBrim, 8);
        // Top
        ctx.fillRect(s.x - s.hatWidth / 2, s.y - 110, s.hatWidth, s.hatHeight);
        ctx.restore();
        ctx.restore();
    }

    drawTarget() {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = this.hit ? '#0f0' : '#f00';
        ctx.beginPath();
        ctx.arc(this.target.x, this.target.y, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        this.hit = false;
    }

    drawShot() {
        const ctx = this.ctx;
        ctx.save();
        ctx.strokeStyle = '#00f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.stickman.x + Math.cos(this.gunAngle) * (this.stickman.armLength + this.stickman.gunLength),
                   this.stickman.y + Math.sin(this.gunAngle) * (this.stickman.armLength + this.stickman.gunLength));
        ctx.lineTo(this.shotPos.x, this.shotPos.y);
        ctx.stroke();
        ctx.restore();
        // Remove shot after rendering
        this.shotPos = null;
    }

    spawnTarget() {
        // Place target randomly on edge
        const edge = Math.floor(Math.random() * 4);
        let x, y;
        const pad = 30;
        switch (edge) {
            case 0: // Top
                x = pad + Math.random() * (this.canvas.width - 2 * pad);
                y = pad;
                break;
            case 1: // Right
                x = this.canvas.width - pad;
                y = pad + Math.random() * (this.canvas.height - 2 * pad);
                break;
            case 2: // Bottom
                x = pad + Math.random() * (this.canvas.width - 2 * pad);
                y = this.canvas.height - pad;
                break;
            case 3: // Left
                x = pad;
                y = pad + Math.random() * (this.canvas.height - 2 * pad);
                break;
        }
        return { x, y };
    }

    handleEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const dx = mx - this.stickman.x;
            const dy = my - this.stickman.y;
            this.gunAngle = Math.atan2(dy, dx);
        });
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left click
                // Fire gun
                const sx = this.stickman.x + Math.cos(this.gunAngle) * (this.stickman.armLength + this.stickman.gunLength);
                const sy = this.stickman.y + Math.sin(this.gunAngle) * (this.stickman.armLength + this.stickman.gunLength);
                // Shot goes to edge of canvas
                const maxDist = Math.max(this.canvas.width, this.canvas.height);
                const tx = sx + Math.cos(this.gunAngle) * maxDist;
                const ty = sy + Math.sin(this.gunAngle) * maxDist;
                // Find intersection with edge
                let shotX = tx, shotY = ty;
                // Clamp to canvas
                if (tx < 0) shotX = 0;
                if (tx > this.canvas.width) shotX = this.canvas.width;
                if (ty < 0) shotY = 0;
                if (ty > this.canvas.height) shotY = this.canvas.height;
                this.shotPos = { x: shotX, y: shotY };
                this.shotFired = true;
            }
        });
    }
}