/**
 * Logic for the overall game
 */
var Pong = {

    Defaults: {
        width: window.innerWidth,
        height: window.innerHeight,
        wallWidth: 6,
        paddleWidth: 12,
        paddleHeight: 60,
        paddleSpeed: 2,
        ballSpeed: 4,
        ballAccel: 8,
        ballRadius: 5,

        // debug mode
        stats: false
    },

    initialize: function (runner, config) {
        this.config = config;
        this.runner = runner;

        // subtract 16 pixels to allow extra space to visualize borders
        this.width = runner.width - 16;
        this.height = runner.height - 16;

        // initialize game and create game objects
        this.playing = false;
        this.scores = [0, 0];
        this.court = Object.construct(Pong.Court, this);
        this.leftPaddle = Object.construct(Pong.Paddle, this);
        this.rightPaddle = Object.construct(Pong.Paddle, this, true);
        this.ball = Object.construct(Pong.Ball, this);

        this.runner.start();
    },

    startSinglePlayer: function () {
        this.start(1);
    },

    startDoublePlayer: function() {
        this.start(2);
    },

    start: function (numPlayers) {
        if (!this.playing) {
            this.scores = [0, 0];
            this.playing = true;
            this.ball.reset();
            this.runner.hideCursor();
        }
    },

    stop: function () {
        if (this.playing) {
            this.playing = false;
            this.runner.showCursor();
            console.log('game stopped');
        }
    },

    goal: function (playerNum) {
        this.scores[playerNum] += 1;
        if (this.scores[playerNum] === 11) {
            console.log('winner ', playerNum);
            this.stop();
        } else {
            this.ball.reset(playerNum);
        }
    },

    // dt stands for delta time
    update: function (dt) {
        this.leftPaddle.update(dt, this.ball);
        this.rightPaddle.update(dt, this.ball);
        if (this.playing) {
            var dx = this.ball.dx;
            var dy = this.ball.dy;
            this.ball.update(dt, this.leftPaddle, this.rightPaddle);

            if (this.ball.left > this.width) {
                this.goal(0);
            } else if (this.ball.right < 0) {
                this.goal(1);
            }
        }
    },

    // draw the canvas (ctx stands for context)
    draw: function (ctx) {
        // part 3 =========================================
        this.court.draw(ctx, this.scores[0], this.scores[1]);
        this.leftPaddle.draw(ctx);
        this.rightPaddle.draw(ctx);
        if (this.playing)
            this.ball.draw(ctx);

        // bouncing ball app ==============================
        // this.court.draw(ctx);
        // for (let i = 0; i < this.balls.length; i++) {
        //     this.balls[i].draw(ctx);
        // }

        // counting app ===================================
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

    onkeydown: function (keyCode) {
        switch (keyCode) {
            case Game.KEY.ONE:
                this.startSinglePlayer(); break;
            case Game.KEY.TWO:
                this.startDoublePlayer(); break;
            case Game.KEY.ESC:
                this.stop(true); break;
            case Game.KEY.Q:
                this.leftPaddle.moveUp(); break;
            case Game.KEY.A:
                this.leftPaddle.moveDown(); break;
            case Game.KEY.O:
                this.rightPaddle.moveUp(); break;
            case Game.KEY.L:
                this.rightPaddle.moveDown(); break;
        }
    },

    onkeyup: function (keyCode) {
        switch (keyCode) {
            case Game.KEY.Q:
                this.leftPaddle.stopMovingUp(); break;
            case Game.KEY.A:
                this.leftPaddle.stopMovingDown(); break;
            case Game.KEY.O:
                this.rightPaddle.stopMovingUp(); break;
            case Game.KEY.L:
                this.rightPaddle.stopMovingDown(); break;
        }
    },

    /**
     * The court for the game =================================================
     */
    Court: {

        initialize: function (pong) {
            var w = pong.width;
            var h = pong.height;
            var ww = pong.config.wallWidth;

            this.ww = ww;
            this.walls = [];

            // top wall
            this.walls.push({x: 0, y: 0, width: w, height: ww});

            // bottom wall
            this.walls.push({x: 0, y: h - ww, width: w, height: ww});

            this.score1 = {
                x: (w / 2) - (w / 14),
                y: 10 * ww
            };
            this.score2 = {
                x: (w / 2) + (w / 14),
                y: 10 * ww
            };
        },

        draw: function (ctx, scorePlayer1, scorePlayer2) {
            ctx.fillStyle = 'white';
            for (let i = 0; i < this.walls.length; i++) {
                ctx.fillRect(this.walls[i].x, this.walls[i].y,
                        this.walls[i].width, this.walls[i].height);
            }

            ctx.font = '65px Courier';
            ctx.fillText(scorePlayer1, this.score1.x, this.score1.y);
            ctx.fillText(scorePlayer2, this.score2.x, this.score2.y);
        }

    },

    /**
     * The paddle for the game ================================================
     */
    Paddle: {

        // rhs stands for right-hand side
        initialize: function (pong, rhs) {
            this.pong = pong;
            this.width = pong.config.paddleWidth;
            this.height = pong.config.paddleHeight;
            this.minY = pong.config.wallWidth;
            this.maxY = pong.height - pong.config.wallWidth - this.height;
            this.speed = (this.maxY - this.minY) / pong.config.paddleSpeed;
            this.setpos((rhs) ? (pong.width - this.width) : 0,
                    this.minY + (this.maxY - this.minY)/2);
            this.setdir(0);
        },

        setpos: function (x, y) {
            this.x = x;
            this.y = y;
            this.left = this.x;
            this.right = this.left + this.width;
            this.top = this.y;
            this.bottom = this.y + this.height;
        },

        setdir: function (dy) {
            this.up = ((dy < 0) ? -dy : 0);
            this.down = ((dy > 0) ? dy : 0);
        },

        update: function (dt, ball) {
            var amount = this.down - this.up;
            if (amount !== 0) {
                var y = this.y + (amount * dt * this.speed);
                if (y < this.minY) {
                    y = this.minY;
                } else if (y > this.maxY) {
                    y = this.maxY;
                }

                this.setpos(this.x, y);
            }
        },

        draw: function (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },

        moveUp: function () {
            this.up = 1;
        },
    
        moveDown: function () {
            this.down = 1;
        },
    
        stopMovingUp: function () {
            this.up = 0;
        },
    
        stopMovingDown: function () {
            this.down = 0;
        }

    },

    /**
     * The ball for the game ==================================================
     */
    Ball: {

        initialize: function (pong) {
            this.pong = pong;
            this.radius = pong.config.ballRadius;
            this.minX = this.radius;
            this.minY = pong.config.wallWidth + this.radius;
            this.maxX = pong.width - this.radius;
            this.maxY = pong.height - pong.config.wallWidth - this.radius;
            this.speed = (this.maxX - this.minX) / pong.config.ballSpeed;
            this.accel = pong.config.ballAccel;
        },

        reset: function (playerNum) {
            this.setpos((playerNum === 1) ? this.maxX : this.minX,
                    Game.random(this.minY, this.maxY));
            this.setdir((playerNum === 1) ? -this.speed : this.speed,
                    this.speed);
        },

        setpos: function (x, y) {
            this.x = x;
            this.y = y;
            this.left = this.x - this.radius;
            this.top = this.y - this.radius;
            this.right = this.x + this.radius;
            this.bottom = this.y + this.radius;
        },

        setdir: function(dx, dy) {
            this.dx = dx;
            this.dy = dy;
        },

        update: function (dt, leftPaddle, rightPaddle) {
            pos = Pong.Helper.accelerate(this.x, this.y, this.dx, this.dy,
                    this.accel, dt);

            if ((pos.dy > 0) && (pos.y > this.maxY)) {
                pos.y = this.maxY;
                pos.dy *= -1;
            } else if ((pos.dy < 0) && (pos.y < this.minY)) {
                pos.y = this.minY;
                pos.dy *= -1;
            }

            this.setpos(pos.x, pos.y);
            this.setdir(pos.dx, pos.dy);
        },

        draw: function (ctx) {
            var w = this.radius * 2;
            var h = w;
            ctx.fillStyle = 'white';
            ctx.fillRect(this.x - this.radius, this.y - this.radius, w, h);
        }

    },

    /**
     * Helper methods =========================================================
     */
    Helper: {

        accelerate: function (x, y, dx, dy, accel, dt) {
            var x2  = x + (dt * dx) + (accel * dt * dt * 0.5);
            var y2  = y + (dt * dy) + (accel * dt * dt * 0.5);
            var dx2 = dx + (accel * dt) * ((dx > 0) ? 1 : -1);
            var dy2 = dy + (accel * dt) * ((dy > 0) ? 1 : -1);

            var result = {
                newX: (x2 - x),
                newY: (y2 - y),
                x: x2,
                y: y2,
                dx: dx2,
                dy: dy2
            };

            return result;
        }

    }

};