import {Mass} from "./mass.js";
import {Projectile} from "./projectile.js";

export class Ship extends Mass {
    constructor(x, y, power, weapon_power, mass, radius) {
        super(x, y, mass, radius, 1.5 * Math.PI);
        this.thruster_power = power;
        this.steering_power = power / 20;
        this.right_thruster = false;
        this.left_thruster = false;
        this.thruster_on = false;
        this.weapon_power = weapon_power || 200;
        this.loaded = false;
        this.weapon_reload_time = 0.15; // seconds
        this.time_until_reloaded = this.weapon_reload_time;
        this.compromised = false;
        this.max_health = 2.0;
        this.health = this.max_health;
    }

    draw(c, guide) {
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.angle);
        if (guide && this.compromised) {
            c.save();
            c.fillStyle = "red";
            c.beginPath();
            c.arc(0, 0, this.radius, 0, 2 * Math.PI);
            c.fill();
            c.restore();
        }
        draw_ship(c, this.radius, {
            guide: guide,
            thruster: this.thruster_on
        });
        c.restore();
    }

    update(elapsed) {
        this.push(this.angle, this.thruster_on * this.thruster_power, elapsed);
        this.twist((this.right_thruster - this.left_thruster) * this.steering_power, elapsed);

        this.loaded = this.time_until_reloaded === 0;
        if (!this.loaded) {
            this.time_until_reloaded -= Math.min(elapsed, this.time_until_reloaded);
        }
        if (this.compromised) {
            this.health -= Math.min(elapsed, this.health);
        }
        Mass.prototype.update.apply(this, arguments);
    }

    projectile(elapsed) {
        let p = new Projectile(0.025, 1,
            this.x + Math.cos(this.angle) * this.radius,
            this.y + Math.sin(this.angle) * this.radius,
            this.x_speed,
            this.y_speed,
            this.rotation_speed
        );
        p.push(this.angle, this.weapon_power, elapsed);
        this.push(this.angle + Math.PI, this.weapon_power, elapsed);
        this.time_until_reloaded = this.weapon_reload_time;
        return p;
    }

}

function draw_ship(ctx, radius, options) {
    options = options || {};
    let angle = (options.angle || 0.5 * Math.PI) / 2;

    let curve1 = options.curve1 || 0.25;
    let curve2 = options.curve2 || 0.75;
    ctx.save();
    if(options.guide) {
        ctx.strokeStyle = "white";
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
    }

    if(options.thruster) {
        ctx.save();
        ctx.strokeStyle = "yellow";
        ctx.fillStyle = "red";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(
            Math.cos(Math.PI + angle * 0.8) * radius / 2,
            Math.sin(Math.PI + angle * 0.8) * radius / 2
        )
        ctx.quadraticCurveTo(-radius * 2, 0,
            Math.cos(Math.PI - angle * 0.8) * radius / 2,
            Math.sin(Math.PI - angle * 0.8) * radius / 2
        );
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    ctx.lineWidth = options.lineWidth || 2;
    ctx.strokeStyle = options.stroke || "white";
    ctx.fillStyle = options.fill || "black";
    ctx.beginPath();
    ctx.moveTo(radius, 0);

    ctx.quadraticCurveTo(
        Math.cos(angle) * radius * curve2,
        Math.sin(angle) * radius * curve2,
        Math.cos(Math.PI - angle) * radius,
        Math.sin(Math.PI - angle) * radius
    );
    ctx.quadraticCurveTo(-radius * curve1, 0,
        Math.cos(Math.PI + angle) * radius,
        Math.sin(Math.PI + angle) * radius
    );
    ctx.quadraticCurveTo(
        Math.cos(-angle) * radius * curve2,
        Math.sin(-angle) * radius * curve2,
        radius, 0
    );
    ctx.fill();
    ctx.stroke();


    if(options.guide) {
        ctx.strokeStyle = "white";
        ctx.fillStyle = "white";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(
            Math.cos(-angle) * radius,
            Math.sin(-angle) * radius
        );
        ctx.lineTo(0, 0);
        ctx.lineTo(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius
        );
        ctx.moveTo(-radius, 0);
        ctx.lineTo(0, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(
            Math.cos(angle) * radius * curve2,
            Math.sin(angle) * radius * curve2,
            radius/40, 0, 2 * Math.PI
        );
        ctx.fill();
        ctx.beginPath();
        ctx.arc(
            Math.cos(-angle) * radius * curve2,
            Math.sin(-angle) * radius * curve2,
            radius/40, 0, 2 * Math.PI
        );
        ctx.fill();
        ctx.beginPath();
        ctx.arc(radius * curve1 - radius, 0, radius/50, 0, 2 * Math.PI);
        ctx.fill();


    }
    ctx.restore();
}
