import {Mass} from "./mass.js";

export class Asteroid extends Mass {
    constructor(x, y, mass, x_speed, y_speed, rotation_speed) {
        let density = 1; // kg per square pixel
        let radius = Math.sqrt((mass / density) / Math.PI);
        super(x, y, mass, radius, 0, x_speed, y_speed, rotation_speed);
        this.circumference = 2 * Math.PI * this.radius;
        this.segments = Math.ceil(this.circumference / 15);
        this.segments = Math.min(25, Math.max(5, this.segments));
        this.noise = 0.2;
        this.shape = [];
        for (let i = 0; i < this.segments; i++) {
            this.shape.push(2 * (Math.random() - 0.5));
        }
    }

    draw(ctx, guide) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        draw_asteroid(ctx, this.radius, this.shape, {
            noise: this.noise,
            guide: guide
        });

        ctx.restore();
    }

    child(mass) {
        return new Asteroid(
            this.x, this.y, mass,
            this.x_speed, this.y_speed,
            this.rotation_speed
        )
    }
}

function draw_asteroid(ctx, radius, shape, options) {
    options = options || {};
    ctx.strokeStyle = options.stroke || "white";
    ctx.fillStyle = options.fill || "black";
    ctx.save();
    ctx.beginPath();
    for(let i = 0; i < shape.length; i++) {
        ctx.rotate(2 * Math.PI / shape.length);
        ctx.lineTo(radius + radius * options.noise * shape[i], 0);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if(options.guide) {
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.lineWidth = 0.2;
        ctx.arc(0, 0, radius + radius * options.noise, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, radius - radius * options.noise, 0, 2 * Math.PI);
        ctx.stroke();
    }
    ctx.restore();
}
