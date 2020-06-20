"use strict";
import {Indicator, Message, NumberIndicator} from "./indicators.js";
import {Asteroid} from "./asteroid.js";
import {Ship} from "./ship.js";

export class AsteroidsGame {
    constructor(gameCanvasId, highScoresId) {
        this.canvas = document.getElementById(gameCanvasId);
        this.scoresElement = document.getElementById(highScoresId);
        this.c = this.canvas.getContext("2d");
        this.canvas.focus();
        this.guide = false;
        this.ship_mass = 10;
        this.ship_radius = 20;
        this.level = 1;
        this.asteroid_mass = 10000;
        this.asteroid_push = 5000000;
        this.mass_destroyed = 500;
        this.health_indicator = new Indicator("health", 5, 5, 100, 10);
        this.score_indicator = new NumberIndicator("score", this.canvas.width - 10, 5);
        this.fps_indicator = new NumberIndicator("fps", this.canvas.width - 10, this.canvas.height - 10);
        this.level_indicator = new NumberIndicator("level", this.canvas.width / 2, 5, {
            align: "center"
        });
        this.highScores = [0,0,0,0,0,0,0,0,0,0];
        this.message = new Message(this.canvas.width / 2, this.canvas.height * 0.4);
        this.canvas.addEventListener("keydown", this.keyDown.bind(this), true);
        this.canvas.addEventListener("keyup", this.keyUp.bind(this), true);
        window.requestAnimationFrame(this.frame.bind(this));
        this.displayScores();
        this.reset_game();
    }

    reset_game() {
        this.game_over = false;
        this.score = 0;
        this.level = 0;
        this.ship = new Ship(
            this.canvas.width / 2,
            this.canvas.height / 2,
            1000, 200,
            this.ship_mass,
            this.ship_radius
        );
        this.projectiles = [];
        this.asteroids = [];
        this.scoreLogged = false;
        this.level_up();
    }

    moving_asteroid(elapsed) {
        let asteroid = this.new_asteroid();
        this.push_asteroid(asteroid, elapsed);
        return asteroid;
    }

    new_asteroid() {
        return new Asteroid(
            this.canvas.width * Math.random(),
            this.canvas.height * Math.random(),
            this.asteroid_mass
        );
    }

    push_asteroid(asteroid, elapsed) {
        elapsed = elapsed || 0.015;
        asteroid.push(2 * Math.PI * Math.random(), this.asteroid_push, elapsed);
        asteroid.twist(
            (Math.random() - 0.5) * Math.PI * this.asteroid_push * 0.02,
            elapsed
        );
    }

    keyDown(e) {
        this.key_handler(e, true);
    }

    keyUp(e) {
        this.key_handler(e, false);
    }

    key_handler(e, value) {
        var nothing_handled = false;
        switch(e.key || e.keyCode) {
            case "ArrowLeft":
            case 37: // left arrow
                this.ship.left_thruster = value;
                break;
            case "ArrowUp":
            case 38: // up arrow
                this.ship.thruster_on = value;
                break;
            case "ArrowRight":
            case 39: // right arrow
                this.ship.right_thruster = value;
                break;
            case "ArrowDown":
            case 40:
                this.ship.retro_on = value;
                break;
            case " ":
            case 32: //spacebar
                if(this.game_over) {
                    this.reset_game();
                } else {
                    this.ship.trigger = value;
                }
                break;
            case "g":
            case 71: // g for guide
                if(value) this.guide = !this.guide;
                break;
            default:
                nothing_handled = true;
        }
        if(!nothing_handled) e.preventDefault();
    }

    frame(timestamp) {
        if (!this.previous) this.previous = timestamp;
        const elapsed = timestamp - this.previous;
        this.fps = 1000 / elapsed;
        this.update(elapsed / 1000);
        this.draw();
        this.previous = timestamp;
        window.requestAnimationFrame(this.frame.bind(this));
    }

    update(elapsed) {
        this.ship.compromised = false;
        if(this.asteroids.length === 0) {
            this.level_up();
        }

        this.asteroids.forEach(function(asteroid) {
            asteroid.update(elapsed, this.c);
            if(collision(asteroid, this.ship)) {
                this.ship.compromised = true;
            }
        }, this);

        if(this.ship.health <= 0) {
            this.game_over = true;
            this.addHighScore(this.score);
            return;
        }
        this.ship.update(elapsed, this.c);
        this.projectiles.forEach(function(p, i, projectiles) {
            p.update(elapsed, this.c);
            if(p.life <= 0) {
                projectiles.splice(i, 1);
            } else {
                this.asteroids.forEach(function(asteroid, j) {
                    if(collision(asteroid, p)) {
                        projectiles.splice(i, 1);
                        this.asteroids.splice(j, 1);
                        this.split_asteroid(asteroid, elapsed);
                    }
                }, this);
            }
        }, this);
        if(this.ship.trigger && this.ship.loaded) {
            this.projectiles.push(this.ship.projectile(elapsed));
        }
    }

    draw() {
        this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if(this.guide) {
            draw_grid(this.c);
            this.asteroids.forEach(function(asteroid) {
                draw_line(this.c, asteroid, this.ship);
            }, this);
            this.fps_indicator.draw(this.c, this.fps);
        }
        this.asteroids.forEach(function(asteroid) {
            asteroid.draw(this.c, this.guide);
        }, this);
        this.score_indicator.draw(this.c, this.score);
        this.level_indicator.draw(this.c, this.level);
        if(this.game_over) {
            this.message.draw(this.c, "GAME OVER", "Press space to play again");
            return;
        }
        this.ship.draw(this.c, this.guide);
        this.projectiles.forEach(function(p) {
            p.draw(this.c);
        }, this);

        this.c.save();
        this.c.font = "18px arial";
        this.c.fillStyle = "white";
        // this.c.fillText("health: " + this.ship.health.toFixe-d(1), 10, this.canvas.height - 10);
        this.health_indicator.draw(this.c, this.ship.health, this.ship.max_health);
        this.c.restore();
    }

    split_asteroid(asteroid, elapsed) {
        asteroid.mass -= this.mass_destroyed;
        this.score += this.mass_destroyed;
        const split = 0.25 + 0.5 * Math.random(); // split unevenly
        let ch1 = asteroid.child(asteroid.mass * split);
        let ch2 = asteroid.child(asteroid.mass * (1 - split));
        [ch1, ch2].forEach(function(child) {
            if(child.mass < this.mass_destroyed) {
                this.score += child.mass;
            } else {
                this.push_asteroid(child, elapsed);
                this.asteroids.push(child);
            }
        }, this);
    }

    level_up() {
        this.level += 1;
        for(let i = 0; i < this.level; i++) {
            this.asteroids.push(this.moving_asteroid());
        }
    }

    addHighScore(score) {
        if(!this.scoreLogged) {
            this.scoreLogged = true;
            this.addToHighScores(score);
            this.displayScores();
        }
    }

    displayScores() {
        let editHtml = "";
        this.highScores.forEach((highScore) => {
            editHtml += `<div class="highScore">${highScore.toFixed(0).padStart(10, "0")}</div>`;
        });

        this.scoresElement.innerHTML = editHtml;
    }

    addToHighScores(score) {
        this.highScores.push(score);
        this.highScores.sort();
        this.highScores.reverse();
        while (this.highScores.length > 10) {
            this.highScores.pop();
        }
    }
}

function collision(obj1, obj2) {
    return distance_between(obj1, obj2) < (obj1.radius + obj2.radius);
}

function distance_between(obj1, obj2) {
    return Math.sqrt(Math.pow(obj1.x - obj2.x, 2) + Math.pow(obj1.y - obj2.y, 2));
}

function draw_grid (ctx, minor, major, stroke, fill) {
    minor = minor || 10;
    major = major || minor * 5;
    stroke = stroke || "#00FF00";
    fill = fill || "#009900";

    ctx.save();
    ctx.strokeStyle = stroke;
    ctx.fillStyle = fill;

    let width = ctx.canvas.width;
    let height = ctx.canvas.height;

    for (let x = 0; x < width; x += minor) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.lineWidth = (x % major === 0) ? 0.5 : 0.25;
        ctx.stroke();
        if (x % major === 0) {
            ctx.fillText(x, x, 10);
        }
    }

    for (let y = 0; y < height; y += minor) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.lineWidth = (y % major === 0) ? 0.5 : 0.25;
        ctx.stroke();
        if (y % major === 0) {
            ctx.fillText(y, 0, y + 10);
        }
    }

    ctx.restore();
}

function draw_line(ctx, obj1, obj2) {
    ctx.save();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(obj1.x, obj1.y);
    ctx.lineTo(obj2.x, obj2.y);
    ctx.stroke();
    ctx.restore();
}
