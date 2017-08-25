/**
 * http://codeincomplete.com/
 * Game Runner Loop
 * This is a library used to abstract away standard setup for a canvas game.
 * Copious comments not included for that reason.
 *
 * Tasks:
 *   Initialize the runner
 *   Construct canvas front and back buffers
 *   Construct a game instance
 *   Start a 60 fps loop and on each iteration:
 *     - Call game.update() to provide dt timer interval since last frame
 *     - Call game.draw() to provide back buffer canvas context for drawing
 *     - Flip back and front buffers
 *     - Update frame rate statistics
 */

/** ===========================================================================
 * Custom object methods
 */

/**
 * Wrapper for Object.create that allows arguments to be passed to a
 * constructor function
 *
 * Calls initialize() for Objects
 */
if (!Object.construct) {
    Object.construct = function(base) {
        var instance = Object.create(base);
        if (instance.initialize)
            instance.initialize.apply(instance, [].slice.call(arguments, 1));
        return instance;
    };
}

/**
 * Enable ability to copy all properties of one object to another
 */
if (!Object.extend) {
    Object.extend = function(destination, source) {
        for (var property in source) {
            if (source.hasOwnProperty(property))
            destination[property] = source[property];
        }
        return destination;
    };
}

/** ===========================================================================
 * Global variables
 */

// for debugging
var debug;

/** ===========================================================================
 * Library for game logic
 */
var Game = {

    compatible: function () {
        // return custom object methods to check compatibility
        return Object.create &&
               Object.extend &&
               Function.bind;
    },

    // Called in index.html using Game.ready(), which waits for DOM to load
    start: function (id, game, config) {
        if (this.compatible())
            return Object.construct(this.Runner, id, game, config).game;
    },

    addEvent: function (obj, type, fn) {
        obj.addEventListener(type, fn, false);
    },
  
    removeEvent: function (obj, type, fn) {
        obj.removeEventListener(type, fn, false);
    },

    ready: function (fn) {
        if (this.compatible())
            this.addEvent(document, 'DOMContentLoaded', fn);
    },

    createCanvas: function () {
        return document.createElement('canvas');
    },

    random: function (min, max) {
        return (min + (Math.random() * (max - min)));
    },

    randomChoice: function () {
        return arguments[Math.floor(this.random(0, arguments.length))];
    },

    timestamp: function () { 
        return new Date().getTime();
    },

    KEY: {
        BACKSPACE: 8,
        TAB:       9,
        RETURN:   13,
        ESC:      27,
        SPACE:    32,
        LEFT:     37,
        UP:       38,
        RIGHT:    39,
        DOWN:     40,
        DELETE:   46,
        HOME:     36,
        END:      35,
        PAGEUP:   33,
        PAGEDOWN: 34,
        INSERT:   45,
        ZERO:     48,
        ONE:      49,
        TWO:      50,
        A:        65,
        I:        73,
        L:        76,
        O:        79,
        Q:        81,
        TILDE:    192
    },

    Runner: {

        initialize: function (id, game, config) {
            this.config = Object.extend(game.Defaults || {}, config || {});
            this.fps = this.config.fps || 60;
            this.interval = 1000.0 / this.fps;
            this.canvas = document.getElementById(id);
            this.width = this.config.width || this.canvas.offsetWidth;
            this.height = this.config.height || this.canvas.offsetHeight;
            this.front = this.canvas;
            this.front.width = this.width;
            this.front.height = this.height;
            this.back = Game.createCanvas();
            this.back.width = this.width;
            this.back.height = this.height;
            this.front2d = this.front.getContext('2d');
            this.back2d = this.back.getContext('2d');
            this.addEvents();
            this.resetStats();

            this.game = Object.construct(game, this, this.config);
        },

        // Called in app.js in Pong.initialize()
        start: function () {
            this.lastFrame = Game.timestamp();
            this.timer = setInterval(this.loop.bind(this), this.interval);
        },

        stop: function () {
            clearInterval(this.timer);
        },

        loop: function () {
            var start = Game.timestamp();

            // send dt as seconds
            this.update((start - this.lastFrame) / 1000.0);
            
            var middle = Game.timestamp();
            this.draw();
            var end = Game.timestamp();
            this.updateStats(middle - start, end - middle);
            this.lastFrame = start;
        },

        update: function (dt) {
            this.game.update(dt);

            // for debugging
            debug = this.stats;
        },

        draw: function () {
            this.back2d.clearRect(0, 0, this.width, this.height);
            this.game.draw(this.back2d);
            this.drawStats(this.back2d);
            this.front2d.clearRect(0, 0, this.width, this.height);
            this.front2d.drawImage(this.back, 0, 0);
        },

        resetStats: function () {
            this.stats = {
                count:  0,
                fps:    0,
                update: 0,
                draw:   0, 
                frame:  0
            };
        },

        updateStats: function (update, draw) {
            if (this.config.stats) {
                this.stats.update = Math.max(1, update);
                this.stats.draw = Math.max(1, draw);
                this.stats.frame = this.stats.update + this.stats.draw;
                this.stats.count = (this.stats.count === this.fps) ?
                        0 : this.stats.count + 1;
                this.stats.fps = Math.min(this.fps, 1000 / this.stats.frame);
            }
        },

        drawStats: function (ctx) {
            if (this.config.stats) {
                ctx.fillStyle = 'white';
                ctx.font = '12px Courier';
                ctx.fillText('frame: ' + this.stats.count, this.width - 100,
                        this.height - 75);
                ctx.fillText('fps: ' + this.stats.fps, this.width - 100,
                        this.height - 60);
                ctx.fillText('update: ' + this.stats.update + 'ms',
                        this.width - 100, this.height - 45);
                ctx.fillText('draw: ' + this.stats.draw   + 'ms',
                        this.width - 100, this.height - 30);
            }
        },

        addEvents: function() {
            Game.addEvent(document, 'keydown', this.onkeydown.bind(this));
            Game.addEvent(document, 'keyup', this.onkeyup.bind(this));
        },

        onkeydown: function (e) {
            if (this.game.onkeydown)
                this.game.onkeydown(e.keyCode);
        },
    
        onkeyup: function (e) {
            if (this.game.onkeyup)
                this.game.onkeyup(e.keyCode);
        },

        hideCursor: function () {
            this.canvas.style.cursor = 'none';
        },
    
        showCursor: function () {
            this.canvas.style.cursor = 'auto';
        }

    }

};
