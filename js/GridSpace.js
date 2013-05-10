/**
 * @author Mircea Diaconescu
 *
 * The GridSpace class that represents the world of the Snake Game
 * @param cellsOnWidth 
 *          the number of cells on the space width
 * @param cellsOnHeight
 *          the number of cells on the space height
 * @param canvasElementID
 *          the ID of the canvas element where the scene is drawn
 */
function GridSpace(cellsOnWidth, cellsOnHeight, canvasElementID) {
  var i = 0, j = 0;
  
  // reference to the canvas element where all the drawing is made
  this.canvasElement = document.getElementById(canvasElementID);
  // the width of cell
  this.cellWidthSize = this.canvasElement.width / cellsOnWidth;
  // the height of a cell
  this.cellHeightSize = this.canvasElement.height / cellsOnHeight;
  // the number of horizontal cells
  this.cellsOnWidth = cellsOnWidth;
  // the number of verical cells
  this.cellsOnHeight = cellsOnHeight;
  
  // initialize the map structure - initially all the map is empty
  this.map = [];
  for(i = 0; i < cellsOnWidth; i++) {
    this.map[i] = [];
    for(j = 0; j < cellsOnHeight; j++) {
      this.map[i][j] = null;
    }
  }
};

/**
 * @author Mircea Diaconescu
 *
 * Get the minimul cell size
 * @return the minimum between grid cell width and height
 */
GridSpace.prototype.getMinCellSize = function() {
  return Math.min(this.cellWidthSize, this.cellHeightSize);
};

/**
 * @author Mircea Diaconescu
 *
 * Knowing the cell coordinates, this method returns 
 * the cell center in screen coodinates (px) of that cell
 * @param x
 *          the X coordinate of the cell
 * @param y
 *          the Y coordinate of the cell
 * @return coordinates of the cell at the given position
 */
GridSpace.prototype.getCellRealCoordinates = function(x, y) {
  return {
    x : x * this.cellWidthSize + this.cellWidthSize / 2,
    y : this.canvasElement.height - (y * this.cellHeightSize + this.cellHeightSize / 2)
  };
};

/**
 * @author Mircea Diaconescu
 *
 * Generate a free random position on the map. That means it 
 * will consider occupied position as not being an allowed position.
 * @param excludePositions
 *          an array of positions to exclude
 * @return coordinates of the cell at the given position
 */
GridSpace.prototype.generateRandomPosition = function(excludePositions) {
  var maxW = this.cellsOnWidth, maxH = this.cellsOnHeight;
  var x = 0, y = 0, i = 0, n = 0, found = false;
  
  // be sure that the position is free
  while(!found) {
    x = Math.floor(Math.random() * maxW);
    y = Math.floor(Math.random() * maxH);
    found = true;
    // check free position on the map
    if(this.map[x][y] !== null) {
      found = false;
      continue;
    }
    // check the excluded positions
    if(excludePositions instanceof Array) {
      n = excludePositions.length;
      for(i = 0; i < n; i++) {
        position = excludePositions[i];
        if(position.x === x && position.y === y) {
          found = false;
          break;
        }
      }
    }
  }
  return  new Position (x, y);
};

/**
 * @author Mircea Diaconescu
 *
 * Check the collision of the snake with other not allowed items 
 * like wall or the snake itself.
 * @param snakeBody
 *          the array defining the snake body positions
 * @return the collided Item or null
 */
GridSpace.prototype.checkCollision = function(snakeBody) {
  var snakeHead = snakeBody[snakeBody.length - 1];
  var headX = snakeHead.x, headY = snakeHead.y, item = null;

  // check collision with the space boundaries
  if(headX < 0 || headY < 0 
      || headX >= this.cellsOnWidth 
      || headY >= this.cellsOnHeight) {
      
      return new Item(Item.Type.OBSTACLE, 0);
  }
  // check the collision with items
  item = this.map[headX][headY];
  if(item instanceof Item){
    return item;
  }
  return null;
};

/**
 * @author Mircea Diaconescu
 *
 * Add a new item (snake food of magic items) at the given coordinates.
 * @param item
 *          the item to be placed on the space
 * @param x
 *          the x coordinate (as number of cells starting from left = 0) 
 *          where to place the new item
 * @param y
 *          the y coordinate (as number of cells starting from bottom-left = 0) 
 *          where to place the new item
 */
GridSpace.prototype.addItem = function(item, x, y) {
  if(!(item instanceof Item) || typeof(x) !== "number" || x % 1 !== 0 
    || typeof(y) !== "number" || y % 1 !== 0) {
    return;
  }
  this.map[x][y] = item;
};

/**
 * @author Mircea Diaconescu
 *
 * Remove an item (snake food of magic items) from the given coordinates.
 * @param x
 *          the x coordinate (as number of cells starting from left = 0) 
 *          where to place the new item
 * @param y
 *          the y coordinate (as number of cells starting from bottom-left = 0) 
 *          where to place the new item (defaults to 0 if value not provided)
 */
GridSpace.prototype.removeItem = function(x, y) {
  if(typeof(x) !== "number" || x % 1 !== 0 
    || typeof(y) !== "number" || y % 1 !== 0) {
    return;
  }
  this.map[x][y] = null;
};  
