/**
 * Logic for the overall game
 */
var Pong = {

    Defaults: {
        width: window.innerWidth,
        height: window.innerHeight,
        wallWidth: 6, // default 6
        paddleWidth: 12, // default 12
        paddleHeight: 60, // default 60
        paddleSpeed: 2.75, // default 2
        ballSpeed: 5, // default 4, lower is faster
        ballAccel: 6, // default 8
        ballRadius: 6, // default 5

        // debug mode
        stats: true
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
        // add 1 to winner's score
        this.scores[playerNum] += 1;
        if (this.scores[playerNum] === 11) {
            // game over
            console.log('winner ', playerNum);
            this.stop();
        } else { // winner serves
            this.ball.reset(playerNum);
        }

        console.log(this.scores);
    },

    // update position for paddle and ball
    // dt stands for delta time
    update: function (dt) {
        this.leftPaddle.update(dt, this.ball);
        this.rightPaddle.update(dt, this.ball);
        if (this.playing) {
            var dx = this.ball.dx;
            var dy = this.ball.dy;
            this.ball.update(dt, this.leftPaddle, this.rightPaddle);

            // if ball reaches left or right boundary, someone scored
            if (this.ball.left > this.width) {
                this.goal(0);
            } else if (this.ball.right < 0) {
                this.goal(1);
            }
        }
    },

    // draw the canvas (ctx stands for context)
    draw: function (ctx) {
        this.court.draw(ctx, this.scores[0], this.scores[1]);
        this.leftPaddle.draw(ctx);
        this.rightPaddle.draw(ctx);
        if (this.playing)
            this.ball.draw(ctx);
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
        },

        draw: function (ctx, scorePlayer1, scorePlayer2) {
            ctx.fillStyle = 'white';
            for (let i = 0; i < this.walls.length; i++) {
                ctx.fillRect(this.walls[i].x, this.walls[i].y,
                        this.walls[i].width, this.walls[i].height);
            }
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
            this.sameCurve = false;
            this.oppCurve = false;
        },

        reset: function (playerNum) {
            this.sameCurve = false;
            this.oppCurve = false;

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
            var pos = Pong.Helper.accelerate(this, this.x, this.y, this.dx, this.dy,
                    this.accel, this.sameCurve, this.oppCurve, dt);

            if ((pos.dy > 0) && (pos.y > this.maxY)) {
                pos.y = this.maxY;
                pos.dy *= -1;
                this.sameCurve = false;
                this.oppCurve = false;
            } else if ((pos.dy < 0) && (pos.y < this.minY)) {
                pos.y = this.minY;
                pos.dy *= -1;
                this.sameCurve = false;
                this.oppCurve = false;
            }

            var paddle = (pos.dx < 0) ? leftPaddle : rightPaddle;
            var pt = Pong.Helper.ballIntercept(this, paddle, pos.newX, pos.newY);
            if (pt) {
                switch (pt.d) {
                    case 'left':
                    case 'right':
                        pos.x = pt.x;
                        pos.dx *= -1;
                        break;
                    case 'top':
                    case 'bottom':
                        pos.y = pt.y;
                        pos.dy *= -1;
                        this.sameCurve = false;
                        this.oppCurve = false;
                        break;
                }

                if (paddle.up) {
                    console.log('paddle up', pos.dy);

                    // -dy means ball is moving up
                    // halve dy if paddle is also moving up
                    // 1.5x dy if ball is moving down (opposite dir of paddle)
                    // pos.dy *= ((pos.dy < 0) ? 0.5 : 1.5);

                    if (pos.dy < 0) {
                        // both moving in same upwards direction
                        // curve the ball so that y shrinks from upwards travel to horizontal
                        this.sameCurve = true;
                    } else {
                        // ball moving down and paddle moving up
                        // return the ball back at same angle received but upward and curve towards horizontal
                        this.oppCurve = true;
                    }
                } else if (paddle.down) {
                    console.log('paddle down', pos.dy);

                    // dy means ball is moving down
                    // halve dy if paddle is also moving down
                    // 1.5x dy if ball is moving up (opposite dir of paddle)
                    // pos.dy *= ((pos.dy > 0) ? 0.5 : 1.5);

                    if (pos.dy > 0) {
                        // both moving in same downwards direction
                        // curve the ball so that y shrinks from downwards travel to horizontal
                        this.sameCurve = true;
                    } else {
                        // ball moving up and paddle moving down
                        // return the ball back at same angle received but downward and curve towards horizontal
                        this.oppCurve = true;
                    }
                }

                this.sameCurve = false;
                this.oppCurve = false;
                console.log('paddle', pos.dy);
            }

            this.setpos(pos.x, pos.y);
            this.setdir(pos.dx, pos.dy);

            // debugging
            if (this.config.stats && debug.count === 0)
                console.log('ball position', pos);
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

        accelerate: function (ball, x, y, dx, dy, accel, sameCurve, oppCurve, dt) {
            var x2  = x + (dt * dx) + (accel * dt * dt * 0.5);
            var y2 = y + (dt * dy) + (accel * dt * dt * 0.5);
            var dx2 = dx + (accel * dt) * ((dx > 0) ? 1 : -1);
            
            var dy2 = dy + (accel * dt) * ((dy > 0) ? 1 : -1);
            if (sameCurve || oppCurve) {
                // if (dy2 >= -15 && dy2 <= 15) {
                //     dy2 *= 5;
                //     ball.sameCurve = false;
                //     ball.oppCurve = false;
                // }
                dy2 *= 0.99;
            }
            if (oppCurve) {
                dy2 *= -1;
                ball.oppCurve = false;
            }

            var result = {
                newX: (x2 - x),
                newY: (y2 - y),
                x: x2,
                y: y2,
                dx: dx2,
                dy: dy2
            };

            return result;
        },

        intercept: function(x1, y1, x2, y2, x3, y3, x4, y4, d) {
            var denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
            
            if (denom !== 0) {
                var ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) /
                        denom;
            
                if ((ua >= 0) && (ua <= 1)) {
                    var ub = (((x2 - x1) *
                            (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denom;
                
                    if ((ub >= 0) && (ub <= 1)) {
                        var x = x1 + (ua * (x2 - x1));
                        var y = y1 + (ua * (y2 - y1));

                        return { x: x, y: y, d: d };
                    }
                }
            }
          
            return null;
        },

        ballIntercept: function (ball, rect, newX, newY) {
            var pt;

            if (newX < 0) {
                pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + newX,
                        ball.y + newY,
                        rect.right + ball.radius,
                        rect.top - ball.radius,
                        rect.right + ball.radius,
                        rect.bottom + ball.radius,
                        'right');
            } else if (newX > 0) {
                pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + newX,
                        ball.y + newY,
                        rect.left - ball.radius,
                        rect.top - ball.radius,
                        rect.left - ball.radius,
                        rect.bottom + ball.radius,
                        'left');
            }
          
            if (!pt) {
                if (newY < 0) {
                    pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + newX,
                            ball.y + newY,
                            rect.left - ball.radius,
                            rect.bottom + ball.radius,
                            rect.right  + ball.radius,
                            rect.bottom + ball.radius,
                            'bottom');
                } else if (newY > 0) {
                    pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + newX,
                            ball.y + newY,
                            rect.left - ball.radius,
                            rect.top - ball.radius,
                            rect.right + ball.radius,
                            rect.top - ball.radius,
                            'top');
                }
            }
          
            return pt;
        }

    }

};