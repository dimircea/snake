function Game() {
  // reference to itself
  var self = this;
  // the difficulty level
  var difficultyLevel = 1;
  // the game score
  var score = 0;
  // the game world - a grid space representation
  var world = new GridSpace(20, 15, "playground");
  // the snake actor - controllable by player
  var snake = new Snake(5, 3);
  // the FPS rate
  var fps = snake.speed;
  // create a stage by getting a reference to the canvas
  var stage = new createjs.Stage("playground");
  // flag to detect if currently there is an eatable item on map
  var foodItemAvailable = false;
  // the array with used images
  this.images = [];
  // the array with used audio
  this.audio = [];

  // initialize the Game Engine
  this.init = function () {
    difficultyLevel = 1;
    score = 0;

    // register keyboard events
    document.addEventListener('keydown', function (e) {
      var keyCode = e.keyCode ? e.keyCode : e.which;
      switch (keyCode) {
      case 37:
        snake.moveLeft();
        break;
      case 65:
        snake.moveLeft();
        break;
      case 38:
        snake.moveUp();
        break;
      case 87:
        snake.moveUp();
        break;
      case 39:
        snake.moveRight();
        break;
      case 68:
        snake.moveRight();
        break;
      case 40:
        snake.moveDown();
        break;
      case 83:
        snake.moveDown();
        break;
      }
    }, false);

    // register keyboard events
    document.addEventListener('click', function (e) {
      var offsetX = 0, offsetY = 0, xMouse = 0, yMouse = 0, diffX = 0, diffY = 0;
      var cellUnderMouse = null, n = snake.body.length, snakeHead = snake.body[n - 1];
      var element = e.target;
      if (element.offsetParent) {
        do {
          offsetX += element.offsetLeft;
          offsetY += element.offsetTop;
          element = element.offsetParent
        } while (element);
      }
      xMouse = e.pageX - offsetX;
      yMouse = e.pageY - offsetY;
      cellUnderMouse = world.getSpaceCoordinates(xMouse, yMouse);
      diffX = snakeHead.x - cellUnderMouse.x;
      diffY = snakeHead.y - cellUnderMouse.y;
      if (diffX < 0 && diffY === 0) {
        snake.moveRight();
      } else if (diffX > 0 && diffY === 0) {
        snake.moveLeft();
      } else if (diffY < 0 && diffX === 0) {
        snake.moveUp();
      } else if (diffY > 0 && diffX === 0) {
        snake.moveDown();
      }
    }, false);

    // draw the snake in the initial position
    drawSnake();

    // create the static items
    createStaticItems();

    // show initial score
    updateScore(0);

    // show initial level
    updateLevel(0);

    // show initial speed
    updateSpeed(0);
  };

  // the method that trigger the update on each clock tick
  var update = function (e) {
    var bodyCollision = false, itemCollision = false, mapPosition = null;
    var playTime = parseInt(e.runTime / 1000), bmp = null, snakeHead = null;

    // snake will move one step in the current direction
    snake.move();
    // redraw the snake
    drawSnake();

    itemCollision = world.checkCollision(snake.body);
    bodyCollision = snake.checkBodyCollision();
    snakeHead = snake.body[snake.body.length - 1];
    if (bodyCollision || (itemCollision !== null && itemCollision.type === Item.Type.OBSTACLE)) {
      self.stop();
      createjs.Sound.play("ouch");
    } else if (itemCollision !== null && itemCollision.type !== Item.Type.OBSTACLE) {
      bmp = new createjs.Bitmap(self.images["snakeBody"]);
      // add BMP Shape instance to stage display list.
      stage.addChild(bmp);
      world.removeItem(snakeHead.x, snakeHead.y);
      stage.removeChild(itemCollision.graphics)
      foodItemAvailable = false;
      updateScore(itemCollision.value);
      createjs.Sound.play("eating");
      snake.grow(bmp);

      // update level if is the case
      if (score > (difficultyLevel * (difficultyLevel + 1) * 20)) {
        updateLevel(1);    
        updateSpeed(1);
      }
    }
    // create dynamic food items
    if (!foodItemAvailable && playTime !== 0 && playTime % 3 === 0) {
      createFoodItem();
      foodItemAvailable = true;
    }
  };

  // the method that will trigger the game start
  this.play = function (){
    // Start game loop
    if (!createjs.Ticker.hasEventListener('tick')) {
      createjs.Ticker.setFPS(fps);
      createjs.Ticker.addEventListener('tick', update);
    }
  };

  // the method that will trigger the game stop
  this.stop = function (){
    // reset listeners, so no more snake updates
    createjs.Ticker.init();
  };

  // draw the snake body
  var drawSnake = function () {
    var n = snake.body.length, i = 0, bmp = null; 
    var snakeHead = snake.body[n - 1], snakePartPos = null;
    var coords = null, shape = null, firstDraw = (snake.bodyGraphics.length < 1);
    var offsetX = 0, offsetY = 0;

    // draw the snake
    for (i = 0; i < n; i++) {
      snakePartPos = snake.body[i];
      coords = world.getCellRealCoordinates(snakePartPos.x, snakePartPos.y);
      if (firstDraw) {
        if (i === n - 1) {
          bmp = new createjs.Bitmap(self.images["snakeHead"]);
        } else {
          bmp = new createjs.Bitmap(self.images["snakeBody"]);
        }
        snake.bodyGraphics.push(bmp);
        // add BMP Shape instance to stage display list.
        stage.addChild(bmp);
      } else {
        bmp = snake.bodyGraphics[i];
      }
      if (bmp.rotation === -90) {
        offsetY = -world.cellHeightSize;
      } else if (bmp.rotation === 90) {
        offsetX = -world.cellWidthSize;
      } else if (bmp.rotation === 180) {
        offsetY = -world.cellHeightSize;
        offsetX = -world.cellWidthSize;
      }
      bmp.x = coords.x - world.cellWidthSize / 2 - offsetX;
      bmp.y = coords.y - world.cellHeightSize / 2 - offsetY;
    }
    // update stage will render next frame
    stage.update();
  };

  // create the static items
  var createStaticItems = function () {
    var maxW = world.cellsOnWidth - 1, maxH = world.cellsOnHeight - 1;
    var i = 0, itemsNr = difficultyLevel * maxW * maxH * 0.0075, mapPosition = null;
    // create top-bottom map margins
    for (i = 0; i <= maxW; i++) {
      // top row
      createItemOnMap(Item.Type.OBSTACLE, 0, i, maxH);
      // bottom row
      createItemOnMap(Item.Type.OBSTACLE, 0, i, 0);
    }
    // create left-right map margins
    for (i = 1; i < maxH; i++) {
      // left row
      createItemOnMap(Item.Type.OBSTACLE, 0, 0, i);
      // bottom row
      createItemOnMap(Item.Type.OBSTACLE, 0, maxW, i);
    }
    // create the additional obstacles on the map
    for (i = 0; i < itemsNr; i++) {
      mapPosition = world.generateRandomPosition(snake.body);
      createItemOnMap(Item.Type.OBSTACLE, 0, mapPosition.x, mapPosition.y);
    }
  };

  // create item to be placed on the given map coordinates
  var createItemOnMap = function (type, value, x, y) {
    var realPosition = null, bmp = null, img = null, item = null;

    switch (type) {
      case Item.Type.OBSTACLE: 
        img = self.images["obstacle"];
        break;
      case Item.Type.APPLE: 
        img = self.images["apple"];
        break;
      case Item.Type.CHERRY: 
        img = self.images["cherry"];
        break;
     case Item.Type.STRAWBERRY: 
        img = self.images["strawberry"];
        break;  
      case Item.Type.RASPBERRY: 
        img = self.images["raspberry"];
        break;  
      case Item.Type.LEMON: 
        img = self.images["lemon"];
        break;  
    }
    realPosition = world.getCellRealCoordinates(x, y);
    bmp = new createjs.Bitmap(img);
    bmp.x = realPosition.x - world.cellWidthSize / 2;
    bmp.y = realPosition.y - world.cellHeightSize / 2;
    item = new Item(type, value, bmp);
    world.addItem(item, x, y);
    // add BMP instance to stage display list.
    stage.addChild(world.map[x][y].graphics);
    // update stage will render next frame
    stage.update();
  };
  
  // create new food item on the map
  var createFoodItem = function () {
    var type = 2 + Math.floor(Math.random() * 5);
    var value = difficultyLevel * (type + 3);;
    switch (type) {
      case 2: 
        type = Item.Type.APPLE;
        break;
      case 3: 
        type = Item.Type.CHERRY;
        break;
      case 4: 
        type = Item.Type.STRAWBERRY;
        break;  
      case 5: 
        type = Item.Type.RASPBERRY;
        break;  
      case 6: 
        type = Item.Type.LEMON;
        break;  
    }
    mapPosition = world.generateRandomPosition(snake.body);
    createItemOnMap(type, value, mapPosition.x, mapPosition.y);
  };
  
  // update the score
  var updateScore = function (addedValue) {
    var scoreElem = document.getElementById("score");
    score += addedValue;
    scoreElem.removeChild(scoreElem.firstChild);
    scoreElem.appendChild(document.createTextNode(score)); 
  };
  // update the level
  var updateLevel = function (addedValue) {
    var levelElem = document.getElementById("level");
    difficultyLevel += addedValue;
    levelElem.removeChild(levelElem.firstChild);
    levelElem.appendChild(document.createTextNode(difficultyLevel)); 
  };
  // update the snake speed
  var updateSpeed = function (updateSpeed) {
    var speedElem = document.getElementById("speed");
    snake.setSpeed(snake.speed + updateSpeed);
    fps = snake.speed;
    speedElem.removeChild(speedElem.firstChild);
    speedElem.appendChild(document.createTextNode(snake.speed)); 
    createjs.Ticker.setFPS(fps);
  };
};

// Finished loading the HTML Document, start playing then...
window.addEventListener("load", function () {
  var game = new Game(), queue = new createjs.LoadQueue(false, "media/images/");
  
  // load sound assets
  createjs.Sound.registerSound("media/sounds/game.mp3|media/sounds/game.ogg", "game");
  createjs.Sound.registerSound("media/sounds/ouch.mp3|media/sounds/ouch.ogg", "ouch");
  createjs.Sound.registerSound("media/sounds/eating.mp3|media/sounds/eating.ogg", "eating");
  // start playing the sound
  createjs.Sound.play("game", "none", 0, 0, -1);

  // load graphic assets
  queue.addEventListener("complete", function() {
    game.images["obstacle"] = queue.getResult("obstacle");
    game.images["snakeHead"] = queue.getResult("snakeHead");
    game.images["snakeBody"] = queue.getResult("snakeBody");
    game.images["apple"] = queue.getResult("apple");
    game.images["cherry"] = queue.getResult("cherry");
    game.images["strawberry"] = queue.getResult("strawberry");
    game.images["raspberry"] = queue.getResult("raspberry");
    game.images["lemon"] = queue.getResult("lemon");
    // graphics loaded, so lets start playing
    game.init();
    game.play();
  });
  queue.loadManifest([
    {id: "obstacle", src: "obstacle.png"},
    {id: "snakeHead", src: "snake-head.png"},
    {id: "snakeBody", src: "snake-body.png"},
    {id: "apple", src: "apple.png"},
    {id: "cherry", src: "cherry.png"},
    {id: "strawberry", src: "strawberry.png"},
    {id: "raspberry", src: "raspberry.png"},
    {id: "lemon", src: "lemon.png"}
  ]);
});