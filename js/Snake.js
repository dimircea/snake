/** 
 * @author Mircea Diaconescu
 *
 * The Snake class representing the Snake actor in the game.
 * @param size
 *          the initial size of the snake (minimum value is 5)
 * @param speed
 *          the snake speed value - integer between 1 and 25
 */
function Snake(size, speed) {
  var i = 0;
  // be sure that the size value is correct
  size = (size && size % 1 === 0 && size >= 5 ? size : 5);
  // the speed of the snake
  this.setSpeed(speed);
  // the snake body - first element is the snake head and last is the snake body
  // the position of body parts are relative to the head
  this.body = [];
  // the graphics shapes associated with the snake
  this.bodyGraphics = [];
  
  // the current moving direction
  this.direction = Direction.NONE;
  
  // create the snake in the left-bottom corner of the map
  for(i = 1; i <= size; i++) {
    this.body[i-1] = new Position(i, 1);
  }
};

/** 
 * @author Mircea Diaconescu
 *
 * Set the snake speed (values: integers between 1 and 25)
 * @param speed
 *          the snake speed value to set
 */
Snake.prototype.setSpeed = function(speed) {
  if(typeof(speed) === "number" && speed % 1 === 0 
     && speed >0 && speed < 26) {
    this.speed = speed;
  }
  if(this.speed === undefined || this.speed === null) {
    this.speed = 1;
  }
};


/** 
 * @author Mircea Diaconescu
 *
 * The snake eats, so it will grow in length with 1 unit
 * @param graphics
 *          the graphic element for the new body part
 */
Snake.prototype.grow = function(graphics) {
  var head = this.body[this.body.length - 1];
  switch(this.direction) {
    case Direction.NONE : 
      return;
    case Direction.UP : 
      x = 0;
      y = 1;
      break;
    case Direction.RIGHT : 
      x = 1;
      y = 0;
      break;
    case Direction.DOWN : 
      x = 0;
      y = -1;
      break;
    case Direction.LEFT : 
      x = -1;
      y = 0;
      break;
  }
  this.body.push(new Position(head.x + x, head.y + y));
  this.bodyGraphics.unshift(graphics);
};

/** 
 * @author Mircea Diaconescu
 *
 * Change snake movind direction to LEFT
 */
Snake.prototype.moveLeft = function() {
  // change direction
  this.direction = Direction.LEFT;
};

/** 
 * @author Mircea Diaconescu
 *
 * Change snake movind direction to RIGHT
 */
Snake.prototype.moveRight = function() {
  // change direction
  this.direction = Direction.RIGHT;
};

/** 
 * @author Mircea Diaconescu
 *
 * Change snake movind direction to UP
 */
Snake.prototype.moveUp = function() {
  // change direction
  this.direction = Direction.UP;
};

/** 
 * @author Mircea Diaconescu
 *
 * Change snake movind direction to DOWN
 */
Snake.prototype.moveDown = function() {
  // change direction
  this.direction = Direction.DOWN;
};

/** 
 * @author Mircea Diaconescu
 *
 * Move the snake on step in the current direction
 * @return the new head position
 */
Snake.prototype.move = function() {
  var headIndex = this.body.length - 1;
  var newHeadPosition = null, x = 0, y = 0;
  var headGraphics = this.bodyGraphics[headIndex];
  switch(this.direction) {
    case Direction.NONE : 
      return;
    case Direction.UP : 
      this.moveUp();
      headGraphics.rotation = -90;
      x = 0;
      y = 1;
      break;
    case Direction.RIGHT : 
      this.moveRight();
      headGraphics.rotation = 0;
      x = 1;
      y = 0;
      break;
    case Direction.DOWN : 
      this.moveDown();
      headGraphics.rotation = 90;
      x = 0;
      y = -1;
      break;
    case Direction.LEFT : 
      this.moveLeft();
      headGraphics.rotation = 180;
      x = -1;
      y = 0;
      break;
  }  
  newHeadPosition = new Position(this.body[headIndex].x + x, this.body[headIndex].y + y);
  // add new element in front of the snake head (last array poition)
  // based on the new moving direction
  this.body.push(newHeadPosition);
  // remove first element - last part of the tail
  this.body.shift();
  // return new head position
  return newHeadPosition;
};

/** 
 * @author Mircea Diaconescu
 *
 * Check if the snake collides with parts of its body
 * @return true in case of collision, false otherwise
 */
Snake.prototype.checkBodyCollision = function() {
  var i = 0, n = this.body.length - 1;
  var head = this.body[n], bodyPart = null;
  for(i = 0; i < n; i++) {
    bodyPart = this.body[i];
    if(head.x === bodyPart.x && head.y === bodyPart.y) {
      return true;
    }
  } 
  return false;
};