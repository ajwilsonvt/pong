/**
 * Logic for the game
 */
var Pong = {

    Defaults: {
        width: window.innerWidth,
        height: window.innerHeight,
        wallWidth: 1,
        balls: 20,
        stats: true
    },

    initialize: function (runner, config) {
        this.config = config;
        this.runner = runner;

        // subtract 16 pixels to allow extra space to visualize borders
        this.width = runner.width - 16;
        this.height = runner.height - 16;

        // create court and balls for game
        this.court = Object.construct(Pong.Court, this);
        this.balls = this.constructBalls();

        // this.time = 0;
        this.runner.start();
    },

    constructBalls: function () {
        var balls = [];
        for (let i = 0; i < this.config.balls; i++) {
            balls.push(Object.construct(Pong.Ball, this));
        }
        return balls;
    },

    // dt stands for delta time
    update: function (dt) {
        // this.time += dt;
        for (let i = 0; i < this.balls.length; i++) {
            this.balls[i].update(dt);
        }
    },

    // draw the canvas (ctx stands for context)
    draw: function (ctx) {
        // bouncing ball app
        this.court.draw(ctx);
        for (let i = 0; i < this.balls.length; i++) {
            this.balls[i].draw(ctx);
        }

        // counting app
        // ctx.strokeStyle = 'white';
        // ctx.strokeRect(0, 0, this.width, this.height);

        // ctx.fillStyle = 'white';
        // ctx.font = '144px Courier';

        // var count = Math.round(this.time).toString();
        // var dim = ctx.measureText(count);

        // // measureText returns a width, now add a height
        // dim.height = dim.height || 100;
        
        // var x = (this.width - dim.width) / 2;
        // var y = (this.height - dim.height) / 2;

        // ctx.fillText(count, x, y + dim.height);
    },

    /**
     * The court for the game
     */
    Court: {

        walls: [],

        initialize: function (pong) {
            var w = pong.width;
            var h = pong.height;
            var ww = pong.config.wallWidth;

            // top wall
            this.walls.push({x: 0, y: 0, width: w, height: ww});

            // bottom wall
            this.walls.push({x: 0, y: h - ww, width: w, height: ww});

            // left wall
            this.walls.push({x: 0, y: 0, width: w, height: h});

            // right wall
            this.walls.push({x: w - ww, y: 0, width: ww, height: h});
        },

        draw: function (ctx) {
            ctx.fillStyle = 'black';
            for (let i = 0; i < this.walls.length; i++) {
                ctx.fillRect(this.walls[i].x, this.walls[i].y,
                        this.walls[i].width, this.walls[i].height);
            }
        }

    },

    /**
     * The ball for the game
     */
    Ball: {

        initialize: function (pong) {
            this.pong = pong;
            this.radius = Game.random(1, 30);
            this.minX = pong.config.wallWidth + this.radius;
            this.minY = pong.config.wallWidth + this.radius;
            this.maxX = pong.width  - pong.config.wallWidth - this.radius;
            this.maxY = pong.height - pong.config.wallWidth - this.radius;
            this.x = Game.random(this.minX, this.maxX);
            this.y = Game.random(this.minY, this.maxY);

            // d stands for delta
            this.dx = (this.maxX - this.minX) / (Game.random(1, 10) * Game.randomChoice(1, -1));
            this.dy = (this.maxY - this.minY) / (Game.random(1, 10) * Game.randomChoice(1, -1));
            
            this.color = 'rgb(' + Math.round(Game.random(0,255)) + ', ' + Math.round(Game.random(0,255)) + ', ' + Math.round(Game.random(0,255)) + ')';
        },

        update: function (dt) {
            this.x += (this.dx * dt);
            this.y += (this.dy * dt);

            if ((this.dx > 0) && (this.x > this.maxX)) {
                this.x = this.maxX;
                this.dx *= -1;
            } else if ((this.dx < 0) && (this.x < this.minX)) {
                this.x = this.minX;
                this.dx *= -1;
            }

            if ((this.dy > 0) && (this.y > this.maxY)) {
                this.y = this.maxY;
                this.dy *= -1;
            } else if ((this.dy < 0) && (this.y < this.minY)) {
                this.y = this.minY;
                this.dy *= -1;
            }
        },

        draw: function (ctx) {
            var w = this.radius * 2;
            var h = this.radius * 2;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
            ctx.fill();
            ctx.closePath();
        }

    }
};