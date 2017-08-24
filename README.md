# pong

A classic game.

## Rules

1. Return the ball to the other side
2. If the other player fails to return the ball, you earn 1 point (and vice versa)
3. First to 11 wins

## Technologies

Plain HTML, CSS, and JavaScript.

## Development process

1. Created wireframe

![wireframe](/images/pong-wireframe.png)

2. Created and used [trello board](https://trello.com/b/7dQ5BoAR) to track feature development

![trello-board](/images/trello-board.png)

3. Wrote pseudocode

4. Developed features in phases

## Interesting features

* Spin/ curve ball towards horizontal
* Smash hit at steep angle if returning a flat ball
* 3 modes: Observe AI, 1 Player, 2 Player

## Future features

* Design for mobile (requires overhaul to handle touch events as opposed to keydown and keyup)
* Improve aesthetics and responsiveness
* Add sound

## Bugs

* Currently in beta-testing
* Fixable: Fix resolution and use media queries to make responsive and still somewhat fullscreen, currently resizing the window requires refresh to redraw canvas

## Notes for developers

1. Use `console.trace()` to trace the call stack for particular functions

## References

`http://codeincomplete.com/` was a very important resource for creation of this game.
