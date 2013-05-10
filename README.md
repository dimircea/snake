Snake Game
==========

Implementation of the classic Snake Game using CreateJS Suite API and HTML5 + CSS3 technologies

How to play:
- initially the snake is on "stay" position
- use arrow keys of W, S, A, D to start moving the snake
- once the snake starts moving, you can't stop it - will continue to move in the current direction
- don't touch the walls or the obstacles, otherwise you will die
- don't touch snake body, otherwise you will die
- eating fruits gives points and increase the snake size with 1 unit
- when eating fruits, the snake increase in size with 1 unit in the moving direction, so be sure to have one empty cell in front!
- collecting fruits from corners means your chances to die are 100% (this is on the list of bug fixing, and will be solved)!
- each fruit type will give a different number of points
- the level advance based on the condition: score >= ((level * (level + 1)) / 2) * 20
- when the level increases, then the snake speed increases too
- restart the game by pressing F5 anytime (during play time or when you die and want to play again)

Have fun!

TODOs:
- save highest score;
- add restart without reloading the page (no F5 reload...)
- add mute sound feature to be able to play in the middle of the night without disturbing your neighbors!
- improve graphics, sounds & design
- fix bug: it is possible that some food items appears in corners, and you die sure if collect them. Solution to implement: food items have an expiring period.

Do you want to contribute ? Just send me a mail to dimircea{at]gmail.com
