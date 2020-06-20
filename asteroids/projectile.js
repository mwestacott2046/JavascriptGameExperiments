import {Mass} from "./mass.js";

export class Projectile extends Mass {
    constructor(mass, lifetime, x, y, x_speed, y_speed, rotation_speed) {
        const density = 0.001; // low density means we can see very light projectiles
        const radius = Math.sqrt((mass / density) / Math.PI);
        super(x, y, mass, radius, 0, x_speed, y_speed, rotation_speed);
        this.lifetime = lifetime;
        this.life = 2.0;
    }

    update(elapsed, c) {
        this.life -= (elapsed / this.lifetime);
        Mass.prototype.update.apply(this, arguments);
    }

    draw(c, guide) {
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.angle);
        draw_projectile(c, this.radius, this.life, guide);
        c.restore();
    }
}

function draw_projectile(ctx, radius, lifetime) {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = "rgb(100%, 100%, " + (100 * lifetime) + "%)";
    ctx.arc(0, 0, radius, 0, Math.PI *2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}
