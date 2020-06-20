"use strict";

export class Indicator {
    constructor(label, x, y, width, height) {
        this.label = label + ": ";
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(c, max, level) {
        c.save();
        c.strokeStyle = "white";
        c.fillStyle = "white";
        c.font = this.height + "pt Arial";
        const offset = c.measureText(this.label).width;
        c.fillText(this.label, this.x, this.y + this.height - 1);
        c.beginPath();
        c.rect(offset + this.x, this.y, this.width, this.height);
        c.stroke();
        c.beginPath();
        c.rect(offset + this.x, this.y, this.width * (max / level), this.height);
        c.fill();
        c.restore()
    }
}

export class NumberIndicator {
    constructor(label, x, y, options) {
        options = options || {}
        this.label = label + ": ";
        this.x = x;
        this.y = y;
        this.digits = options.digits || 0;
        this.pt = options.pt || 10;
        this.align = options.align || 'end';
    }

    draw(c, value) {
        c.save();
        c.fillStyle = "white";
        c.font = this.pt + "pt Arial";
        c.textAlign = this.align;
        c.fillText(
            this.label + value.toFixed(this. digits),
            this.x, this.y + this.pt - 1
        );
        c.restore();
    }
}

export class Message {
    constructor(x, y, options) {
        options = options || {};
        this.x = x;
        this.y = y;
        this.main_pt = options.main_pt || 28;
        this.sub_pt = options.sub_pt || 18;
        this.fill = options.fill || "white";
        this.textAlign = options.align || 'center';
    }

    draw(c, main, sub) {
        c.save();
        c.fillStyle = this.fill;
        c.textAlign = this.textAlign;
        c.font = this.main_pt + "pt Arial";
        c.fillText(main, this.x, this.y);
        c.font = this.sub_pt + "pt Arial";
        c.fillText(sub, this.x, this.y + this.main_pt);
        c.restore();
    }
}
