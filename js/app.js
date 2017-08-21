var Pong = {

    Defaults: {
        // canvas width that will scale with browswer via @media css queries
        width: window.innerWidth,

        // canvas height that will scale with browswer via @media css queries
        height: window.innerHeight,

        // tell Game.Runner to show stats
        stats: true

        // safe way to grab viewport height and width
        // if (typeof window.innerWidth != 'undefined') {
        //     this.width = window.innerWidth;
        //     this.height = window.innerHeight;
        // }
    },

    initialize: function (runner, config) {
        this.config = config;
        this.runner = runner;

        // subtract 16 pixels to allow extra space to visualize borders
        this.width = runner.width - 16;
        this.height = runner.height - 16;

        this.time = 0;
        this.runner.start();
    },

    // does dt stand for delta time?
    update: function (dt) {
        this.time += dt;
    },

    // draw the canvas (ctx stands for context)
    draw: function (ctx) {
        ctx.strokeStyle = 'white';
        ctx.strokeRect(0, 0, this.width, this.height);

        ctx.fillStyle = 'white';
        ctx.font = '144px sans-serif';

        var count = Math.round(this.time).toString();
        var dim = ctx.measureText(count);

        // measureText returns a width, now add a height
        dim.height = dim.height || 100;
        
        var x = (this.width - dim.width) / 2;
        var y = (this.height - dim.height) / 2;

        ctx.fillText(count, x, y + dim.height);
    }

};