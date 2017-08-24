/**
 * Logic for the overall game
 * Based on logic from: http://codeincomplete.com/
 *
 * My largest contributions:
 * 
 */
var Pong = {

    Defaults: {
        width: window.innerWidth,
        height: window.innerHeight,
        wallWidth: 6, // default 6
        paddleWidth: 12, // default 12
        paddleHeight: 60, // default 60
        paddleSpeed: 2, // default 2, lower is faster
        ballSpeed: 4, // default 4, lower is faster
        ballAccel: 6, // default 8
        ballRadius: 6, // default 5

        // debug mode
        stats: false
    },

    Levels: [
        {aiReaction: 0.2, aiError:  40}, // 0: best skill level
        {aiReaction: 0.3, aiError:  50},
        {aiReaction: 0.4, aiError:  60},
        {aiReaction: 0.5, aiError:  70},
        {aiReaction: 0.6, aiError:  80},
        {aiReaction: 0.7, aiError:  90},
        {aiReaction: 0.8, aiError: 100},
        {aiReaction: 0.9, aiError: 110},
        {aiReaction: 1.0, aiError: 120}, // 8: default
        {aiReaction: 1.1, aiError: 130},
        {aiReaction: 1.2, aiError: 140},
        {aiReaction: 1.3, aiError: 150},
        {aiReaction: 1.4, aiError: 160},
        {aiReaction: 1.5, aiError: 170},
        {aiReaction: 1.6, aiError: 180},
        {aiReaction: 1.7, aiError: 190},
        {aiReaction: 1.8, aiError: 200}  // 16: worst skill level
    ],

    /**
     * Initialize the Pong object (overall game logic)
     */
    initialize: function (runner, config) {
        this.config = config;
        this.runner = runner;

        // subtract 16 pixels to allow extra space to visualize borders
        this.width = runner.width - 16;
        this.height = runner.height - 16;

        // initialize game
        this.playing = false;
        this.scores = [0, 0];

        // create game objects
        this.court = Object.construct(Pong.Court, this);
        this.leftPaddle = Object.construct(Pong.Paddle, this);
        this.rightPaddle = Object.construct(Pong.Paddle, this, true);
        this.ball = Object.construct(Pong.Ball, this);

        this.runner.start();
    },

    /**
     * Mode where 2 AI players compete
     */
    startObserve: function () {
        this.start(0);
    },

    /**
     * Mode where 1 player faces AI
     */
    startSinglePlayer: function () {
        this.start(1);
    },

    /**
     * Mode where 2 players compete
     */
    startDoublePlayer: function() {
        this.start(2);
    },

    /**
     * Starts game in 1 of 3 modes
     */
    start: function (numPlayers) {
        if (!this.playing) {
            // reset score
            this.scores = [0, 0];
            var score = document.getElementsByClassName('score')[0];
            score.textContent = `${this.scores[0]} - ${this.scores[1]}`;

            this.playing = true;

            // enable AI for respective game modes
            this.leftPaddle.setAuto((numPlayers < 1), this.level(0));
            this.rightPaddle.setAuto((numPlayers < 2), this.level(1));
            
            if (Pong.Defaults.stats) {
                console.log('0', this.level(0));
                console.log('1', this.level(1));
            }

            // launch ball and hide cursor
            this.ball.reset();
            this.runner.hideCursor();
        }
    },

    /**
     * Stop the game, disable AI, and show cursor
     */
    stop: function () {
        if (this.playing) {
            this.playing = false;

            this.leftPaddle.setAuto(false, this.level(0));
            this.rightPaddle.setAuto(false, this.level(1));

            this.runner.showCursor();
            console.log('game stopped');
        }
    },

    /**
     * Return new skill level for AI that will improve or worsen depending
     * on difference in spread
     */
    level: function (playerNum) {
        // if this losing, improve (decrease level) by adding negative deficit
        // if this winning, worsen (increase level) by adding positive spread
        return 8 + (this.scores[playerNum] - this.scores[playerNum ? 0 : 1]);
    },

    /**
     * Increment score for winner of round and handle winner of match
     */
    goal: function (playerNum) {
        // add 1 to winner's score
        this.scores[playerNum] += 1;
        var score = document.getElementsByClassName('score')[0];
        score.textContent = `${this.scores[0]} - ${this.scores[1]}`;

        if (this.scores[playerNum] === 11) {
            // game over
            console.log('winner ', playerNum);
            this.stop();
        } else {
            // winner serves
            this.ball.reset(playerNum);

            // update level for AI (if enabled)
            this.leftPaddle.setLevel(this.level(0));
            this.rightPaddle.setLevel(this.level(1));

            // for debugging
            if (Pong.Defaults.stats) {
                console.log('0', this.level(0));
                console.log('1', this.level(1));
            }
        }
    },

    /**
     * Update position for paddle and ball each iteration of gamerunner.js loop
     * dt stands for delta time
     */
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

    /**
     * Draw the court and paddles
     * ctx stands for context
     */
    draw: function (ctx) {
        this.court.draw(ctx, this.scores[0], this.scores[1]);
        this.leftPaddle.draw(ctx);
        this.rightPaddle.draw(ctx);
        if (this.playing) this.ball.draw(ctx);
    },

    /**
     * Hide and show the instructions menu
     */
    toggleMenu: function () {
        var modal = document.getElementsByClassName('modal')[0];
        if (modal.style.opacity !== '0') modal.style.opacity = 0;
        else modal.style.opacity = 1;
    },

    /**
     * Map onkeydown events
     */
    onkeydown: function (keyCode) {
        switch (keyCode) {
            case Game.KEY.ZERO:
                this.startObserve(); break;
            case Game.KEY.ONE:
                this.startSinglePlayer(); break;
            case Game.KEY.TWO:
                this.startDoublePlayer(); break;
            case Game.KEY.ESC:
                this.stop(true); break;
            case Game.KEY.I:
                this.toggleMenu(); break;
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

    /**
     * Map onkeyup events
     */
    onkeyup: function (keyCode) {
        switch (keyCode) {
            case Game.KEY.Q:
                if (!this.leftPaddle.auto) this.leftPaddle.stopMovingUp();
                break;
            case Game.KEY.A:
                if (!this.leftPaddle.auto) this.leftPaddle.stopMovingDown();
                break;
            case Game.KEY.O:
                if (!this.rightPaddle.auto) this.rightPaddle.stopMovingUp();
                break;
            case Game.KEY.L:
                if (!this.rightPaddle.auto) this.rightPaddle.stopMovingDown();
                break;
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

        /**
         * Draw top and bottom wall of court using fillRect(x,y,width,height)
         */
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

            // speed = distance / time
            this.speed = (this.maxY - this.minY) / pong.config.paddleSpeed;

            // if rhs, set x-coordinate to right side of screen
            this.setPos((rhs) ? (pong.width - this.width) : 0,
                    this.minY + (this.maxY - this.minY)/2);

            this.setDir(0);
        },

        /**
         * Set position of the paddle
         */
        setPos: function (x, y) {
            this.x = x;
            this.y = y;
            this.left = this.x;
            this.right = this.left + this.width;
            this.top = this.y;
            this.bottom = this.y + this.height;
        },

        /**
         * Set y-dimension direction of the paddle
         */
        setDir: function (dy) {
            this.up = ((dy < 0) ? -dy : 0);
            this.down = ((dy > 0) ? dy : 0);
        },

        /**
         * Enable or disable AI
         */
        setAuto: function (on, level) {
            if (on && !this.auto) {
                // enable AI
                this.auto = true;
                this.setLevel(level);
            } else if (!on && this.auto) {
                // disable AI and stop movement
                this.auto = false;
                this.setDir(0);
            }
        },

        /**
         * Set position of the paddle
         */
        setLevel: function(level) {
            if (this.auto) this.level = Pong.Levels[level];
        },

        /**
         * Library function from http://codeincomplete.com/
         *
         * If ball is moving away, do nothing
         * Else, predict ball and paddle intersection
         * Move paddle to meet predicted intersection
         */
        ai: function (dt, ball) {
            // if ball is to this left and moving left, don't move
            // if ball is to this right and moving right, don't move
            if (((ball.x < this.left) && (ball.dx < 0)) ||
                    ((ball.x > this.right) && (ball.dx > 0))) {
                this.stopMovingUp();
                this.stopMovingDown();
                return;
            }

            this.predict(ball, dt);

            if (this.prediction) {
                if (this.prediction.y < (this.top + this.height/2 - 5)) {
                    this.stopMovingDown();
                    this.moveUp();
                } else if (this.prediction.y > (this.bottom - this.height/2 + 5)) {
                    this.stopMovingUp();
                    this.moveDown();
                } else {
                    this.stopMovingUp();
                    this.stopMovingDown();
                }
            }
        },

        /**
         * Library function from http://codeincomplete.com/
         *
         * Do nothing until reached AI level's reaction time
         * Predict intercept assuming infinite height court
         * "Bounce prediction off top and bottom until ball reaches paddle"
         * Introduce error factor to AI
         */
        predict: function(ball, dt) {
            // predict again only if the ball changed direction, or it's been
            // some time since last prediction
            if (this.prediction &&
                    ((this.prediction.dx * ball.dx) > 0) &&
                    ((this.prediction.dy * ball.dy) > 0) &&
                    (this.prediction.since < this.level.aiReaction)) {
                this.prediction.since += dt;
                return;
            }

            var pt = Pong.Helper.ballIntercept(ball, {left: this.left,
                    right: this.right, top: -10000, bottom: 10000},
                    (ball.dx * 10), (ball.dy * 10));
            if (pt) {
                var topWall = this.minY + ball.radius;
                var bottomWall = this.maxY + this.height - ball.radius;

                while ((pt.y < topWall) || (pt.y > bottomWall)) {
                    if (pt.y < topWall) {
                        pt.y = topWall + (topWall - pt.y);
                    } else if (pt.y > bottomWall) {
                        pt.y = topWall + (bottomWall - topWall) - (pt.y - bottomWall);
                    }
                }
            
                this.prediction = pt;
            } else {
                this.prediction = null;
            }

            if (this.prediction) {
                this.prediction.since = 0;
                this.prediction.dx = ball.dx;
                this.prediction.dy = ball.dy;
                this.prediction.radius = ball.radius;
                this.prediction.exactX = this.prediction.x;
                this.prediction.exactY = this.prediction.y;
            
                var closeness = (ball.dx < 0 ? ball.x - this.right
                        : this.left - ball.x) / this.pong.width;
                var error = this.level.aiError * closeness;
                
                this.prediction.y += Game.random(-error, error);
            }
        },

        /**
         * Logic for paddle movement each iteration of gamerunner.js loop
         * dt stands for delta time
         */
        update: function (dt, ball) {
            // run AI movement if enabled
            if (this.auto) this.ai(dt, ball);

            var amount = this.down - this.up;
            if (amount !== 0) {
                var y = this.y + (amount * dt * this.speed);
                if (y < this.minY) {
                    y = this.minY;
                } else if (y > this.maxY) {
                    y = this.maxY;
                }

                this.setPos(this.x, y);
            }
        },

        /**
         * Draw a ball
         */
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

            // speed = distance / time
            this.speed = (this.maxX - this.minX) / pong.config.ballSpeed;

            this.accel = pong.config.ballAccel;
            this.curve = false;
            this.opposite = false;
        },

        /**
         * Winner serves the ball (or Player 1 at start of game)
         */
        reset: function (playerNum) {
            // remove curve
            this.curve = false;
            this.opposite = false;

            this.setPos((playerNum === 1) ? this.maxX : this.minX,
                    Game.random(this.minY, this.maxY));
            this.setDir((playerNum === 1) ? -this.speed : this.speed,
                    this.speed);
        },

        /**
         * Set position of the ball
         */
        setPos: function (x, y) {
            this.x = x;
            this.y = y;
            this.left = this.x - this.radius;
            this.top = this.y - this.radius;
            this.right = this.x + this.radius;
            this.bottom = this.y + this.radius;
        },

        /**
         * Set x- and y-dimension direction of the ball
         */
        setDir: function(dx, dy) {
            this.dx = dx;
            this.dy = dy;
        },

        /**
         * Logic for paddle movement each iteration of gamerunner.js loop
         * dt stands for delta time
         */
        update: function (dt, leftPaddle, rightPaddle) {
            // accelerate the ball every iteration
            var pos = Pong.Helper.accelerate(this, this.x, this.y, this.dx, this.dy,
                    this.accel, dt);

            if ((pos.dy > 0) && (pos.y > this.maxY)) {
                // pos.dy is negative when ball moving to bottom
                // if ball reaches bottom wall bounce it back up
                pos.y = this.maxY;
                pos.dy = Pong.Helper.bounce(pos.dy);
            } else if ((pos.dy < 0) && (pos.y < this.minY)) {
                // pos.dy is positive when ball moving to top
                // if ball reaches top wall bounce it back down
                pos.y = this.minY;
                pos.dy = Pong.Helper.bounce(pos.dy);
            }

            // select correct paddle depending on ball direction
            var paddle = (pos.dx < 0) ? leftPaddle : rightPaddle;

            // find out if paddle and ball have collided
            var pt = Pong.Helper.ballIntercept(this, paddle, pos.newX, pos.newY);

            if (pt) {
                // paddle and ball have collided

                // for debugging
                var debugPaddleStr = 'paddle';

                switch (pt.d) {
                    case 'left':
                    case 'right':
                        pos.x = pt.x;
                        pos.dx = Pong.Helper.bounce(pos.dx);

                        // make angle steeper to make game interesting
                        if (pos.dy >= -20 && pos.dy <= 20) {
                            if (Pong.Defaults.stats)
                                    console.log('too horizontal');
                            pos.dy *= 15;
                            this.curve = false;
                            this.opposite = false;
                        }

                        break;
                    case 'top':
                    case 'bottom':
                        pos.y = pt.y;
                        pos.dy = Pong.Helper.bounce(pos.dx);

                        // make angle steeper to make game more interesting
                        if (pos.dy >= -20 && pos.dy <= 20) {
                            if (Pong.Defaults.stats)
                                    console.log('too horizontal');
                            pos.dy *= 15;
                            this.curve = false;
                            this.opposite = false;
                        }

                        break;
                }

                if (paddle.up || paddle.down) this.curve = true;
                if ((paddle.up && pos.dy > 0) || (paddle.down && pos.dy < 0)) {
                    // paddle and ball moving in opposite directions
                    this.opposite = true;
                }

                if (paddle.up) debugPaddleStr += ' up';
                else if (paddle.down) debugPaddleStr += ' down';

                if (Pong.Defaults.stats) console.log(debugPaddleStr, pos.dy);
            }

            this.setPos(pos.x, pos.y);
            this.setDir(pos.dx, pos.dy);

            if (Pong.Defaults.stats && debug.count === 0)
                console.log('ball position', pos);
        },

        draw: function (ctx) {
            var w = this.radius * 2;
            var h = w;
            ctx.fillStyle = 'white';
            ctx.fillRect(this.x - this.radius, this.y - this.radius, w, h);
        },

    },

    /**
     * Helper methods =========================================================
     */
    Helper: {

        // TODO: mathematical explanation
        accelerate: function (ball, x, y, dx, dy, accel, dt) {
            var x2  = x + (dt * dx) + (accel * dt * dt * 0.5);
            var y2 = y + (dt * dy) + (accel * dt * dt * 0.5);
            var dx2 = dx + (accel * dt) * ((dx > 0) ? 1 : -1);
            
            var dy2 = dy + (accel * dt) * ((dy > 0) ? 1 : -1);
            if (ball.curve) dy2 *= 0.99;
            if (ball.opposite) {
                dy2 *= -1;
                ball.opposite = false;
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

        bounce: function (pos) {
            this.curve = false;
            this.opposite = false;
            return -pos;
        },

        // TODO: mathematical explanation
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

        // TODO: explanation and refactor
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