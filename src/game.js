
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
    this.bullet = null; // {x, y, vx, vy, active}
        this.hit = false;
        this.targetStartTime = performance.now();
        this.totalTime = 0;
        this.targetTimes = [];
        this.targetsHit = 0;
        this.gameOver = false;
    this.shotsTaken = 0;
    this.handleEvents();
    }

    start() {
        // No-op, handled by game loop in index.js
    }

    update() {
    if (this.gameOver) return;
        // Animate bullet if active
    if (this.bullet && this.bullet.active) {
            this.bullet.x += this.bullet.vx;
            this.bullet.y += this.bullet.vy;
            // Check if bullet reached edge
            if (
                this.bullet.x <= 0 || this.bullet.x >= this.canvas.width ||
                this.bullet.y <= 0 || this.bullet.y >= this.canvas.height
            ) {
                // Check for hit
                const sx = this.stickman.x + Math.cos(this.gunAngle) * (this.stickman.armLength + this.stickman.gunLength);
                const ex = this.bullet.x;
                const sy = this.stickman.y + Math.sin(this.gunAngle) * (this.stickman.armLength + this.stickman.gunLength);
                const ey = this.bullet.y;
                const tx = this.target.x;
                const ty = this.target.y;
                const r = 25;
                const dist = this.pointToLineDistance(tx, ty, sx, sy, ex, ey);
                if (dist < r) {
                    this.hit = true;
                    const now = performance.now();
                    const targetTime = (now - this.targetStartTime) / 1000;
                    this.targetTimes.push(targetTime);
                    this.totalTime += targetTime;
                    this.targetsHit++;
                    if (this.targetsHit >= 10) {
                        this.gameOver = true;
                    } else {
                        this.target = this.spawnTarget();
                        this.targetStartTime = performance.now();
                    }
                }
                this.bullet.active = false;
            }
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
        if (this.gameOver) {
            ctx.save();
            ctx.font = '48px Arial';
            ctx.fillStyle = '#222';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`Game Over!`, this.canvas.width / 2, this.canvas.height / 2 - 60);
            ctx.font = '32px Arial';
            ctx.fillText(`Total Time: ${this.totalTime.toFixed(2)}s`, this.canvas.width / 2, this.canvas.height / 2 - 10);
            ctx.fillText(`Shots Taken: ${this.shotsTaken}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
            ctx.fillText(`Penalty: ${(this.shotsTaken).toFixed(2)}s`, this.canvas.width / 2, this.canvas.height / 2 + 70);
            ctx.font = '36px Arial';
            ctx.fillText(`Final Score: ${(this.totalTime + this.shotsTaken).toFixed(2)}s`, this.canvas.width / 2, this.canvas.height / 2 + 120);
            ctx.restore();
            return;
        }
        this.drawStickman();
        this.drawTarget();
        if (this.bullet && this.bullet.active) {
            this.drawBullet();
        }
        // Draw timer and score
    ctx.save();
    ctx.font = '24px Arial';
    ctx.fillStyle = '#222';
    ctx.textAlign = 'left';
    ctx.fillText(`Target: ${this.targetsHit + 1}/10`, 20, 40);
    ctx.fillText(`Shots: ${this.shotsTaken}`, 20, 70);
    const now = performance.now();
    const currentTime = (now - this.targetStartTime) / 1000;
    ctx.fillText(`Current Target Time: ${currentTime.toFixed(2)}s`, 20, 100);
    ctx.fillText(`Total Time: ${this.totalTime.toFixed(2)}s`, 20, 130);
    ctx.restore();
    }

    drawStickman() {
        const ctx = this.ctx;
        const s = this.stickman;
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
    // Pistol gun (barrel and grip)
    ctx.save();
    // Raise barrel a bit
    ctx.translate(s.armLength, -7);
    // Barrel (rectangle, pointing away from arm)
    ctx.fillStyle = '#222';
    ctx.fillRect(0, -3, s.gunLength, 8);
    // Barrel tip (small rectangle)
    ctx.fillStyle = '#555';
    ctx.fillRect(s.gunLength, -1, 6, 4);
    // Grip (longer, angled down)
    ctx.save();
    ctx.rotate(Math.PI / 2.2); // angle grip downward
    ctx.fillStyle = '#222';
    ctx.fillRect(-6, 0, 28, 12);
    ctx.restore();
    // Trigger guard (arc under barrel)
    ctx.beginPath();
    ctx.arc(10, 7, 7, Math.PI * 0.5, Math.PI * 1.5);
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Hand holding gun (circle at top of grip)
    ctx.save();
    ctx.rotate(Math.PI / 2.2);
    ctx.fillStyle = '#f5deb3';
    ctx.beginPath();
    ctx.arc(8, 6, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.restore();
    ctx.restore();
        // Cowboy hat
        ctx.save();
        ctx.fillStyle = '#a0522d';
        ctx.fillRect(s.x - s.hatBrim / 2, s.y - 90, s.hatBrim, 8);
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

    drawBullet() {
        const ctx = this.ctx;
        ctx.save();
        // Calculate bullet angle from velocity
        const angle = Math.atan2(this.bullet.vy, this.bullet.vx);
        ctx.translate(this.bullet.x, this.bullet.y);
        ctx.rotate(angle);
        // Draw bullet body (box)
        ctx.fillStyle = '#000';
        ctx.fillRect(-6, -5, 12, 10);
        // Draw bullet tip (triangle)
        ctx.beginPath();
        ctx.moveTo(6, -5);
        ctx.lineTo(14, 0);
        ctx.lineTo(6, 5);
        ctx.closePath();
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.restore();
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
            // Gun position (end of arm)
            const gunX = this.stickman.x + Math.cos(this.gunAngle) * this.stickman.armLength;
            const gunY = this.stickman.y + Math.sin(this.gunAngle) * this.stickman.armLength;
            // Calculate angle from gun position to mouse
            const dx = mx - this.stickman.x;
            const dy = my - this.stickman.y;
            this.gunAngle = Math.atan2(dy, dx);
        });
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0 && (!this.bullet || !this.bullet.active)) { // Left click
                this.shotsTaken++;
                // Gun position (end of arm + gun)
                const sx = this.stickman.x + Math.cos(this.gunAngle) * (this.stickman.armLength + this.stickman.gunLength);
                const sy = this.stickman.y + Math.sin(this.gunAngle) * (this.stickman.armLength + this.stickman.gunLength);
                // Shot direction: use gun angle
                const dirX = Math.cos(this.gunAngle);
                const dirY = Math.sin(this.gunAngle);
                // Find intersection with canvas edge
                const maxDist = Math.max(this.canvas.width, this.canvas.height) * 2;
                const tx = sx + dirX * maxDist;
                const ty = sy + dirY * maxDist;
                // Calculate intersection with each edge
                const edges = [
                    { x: 0, y: null }, // left
                    { x: this.canvas.width, y: null }, // right
                    { x: null, y: 0 }, // top
                    { x: null, y: this.canvas.height } // bottom
                ];
                let minT = Infinity;
                let hitX = tx, hitY = ty;
                for (const edge of edges) {
                    let t;
                    if (edge.x !== null) {
                        t = (edge.x - sx) / dirX;
                        if (t > 0) {
                            const y = sy + dirY * t;
                            if (y >= 0 && y <= this.canvas.height && t < minT) {
                                minT = t;
                                hitX = edge.x;
                                hitY = y;
                            }
                        }
                    } else {
                        t = (edge.y - sy) / dirY;
                        if (t > 0) {
                            const x = sx + dirX * t;
                            if (x >= 0 && x <= this.canvas.width && t < minT) {
                                minT = t;
                                hitX = x;
                                hitY = edge.y;
                            }
                        }
                    }
                }
                // Bullet speed (pixels per frame)
                const speed = 30;
                const dist = Math.sqrt((hitX - sx) ** 2 + (hitY - sy) ** 2);
                const vx = ((hitX - sx) / dist) * speed;
                const vy = ((hitY - sy) / dist) * speed;
                this.bullet = {
                    x: sx,
                    y: sy,
                    vx,
                    vy,
                    active: true
                };
            }
        });
    }
}