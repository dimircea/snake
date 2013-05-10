function Game() {
  // reference to itself
  var self = this;
  // the difficulty level
  var difficultyLevel = 1;
  
  // the game world - a grid space representation
  var world = new GridSpace(20, 15, "playground");
  // the snake actor - controllable by player
  var snake = new Snake(15, 8);
  // the FPS rate
  var fps = snake.speed;
  // create a stage by getting a reference to the canvas
  var stage = new createjs.Stage("playground");
  
  // initialize the Game Engine
  this.init = function() {
    // Load assets
   /* var queue = new createjs.LoadQueue();
    queue.addEventListener("complete", function() {
        self.stone1Img = queue.getResult("stone1");
        self.stone2Img = queue.getResult("stone2");
    });
    queue.loadManifest([
        {id: "stone1", src: "media/images/stone1.png"},
        {id: "stone2", src: "media/images/stone2.png"},
    ]);*/
    
    // start playing the sound
    //createjs.Sound.play("game", "none", 0, 0, -1);
    
    document.addEventListener('keydown', function(e) {
      var keyCode = (e.keyCode ? e.keyCode : e.which);
      switch(keyCode) {
        case 37 : 
          snake.moveLeft();
        break;
        case 38 : 
          snake.moveUp();
        break;
        case 39 : 
          snake.moveRight();
        break;
        case 40 : 
          snake.moveDown();
        break;
      }
    }, false);
    // draw the snake in the initial position
    drawSnake();
    
    // create the static items
    createStaticItems();
    
    // draw the items available on the map
    drawMapItems();
  };

  // the method that trigger the update on each clock tick
  var update = function() {
    var collided = false, foodDetected = false;
    // snake will move one step in the current direction
    snake.move();
    collided = world.checkCollision(snake.body);
    collided = collided || snake.checkBodyCollision();
    if(collided === true) {
      self.stop();
      createjs.Sound.play("ouch");
    } else if(foodDetected) {
      createjs.Sound.play("ouch");
    }
    drawSnake();
    stage.update();
  };
  
  // the method that will trigger the game start
  this.play = function(){
    // Start game loop
    if (!createjs.Ticker.hasEventListener('tick')) {
      createjs.Ticker.setFPS(fps);
      createjs.Ticker.addEventListener('tick', update);
    }
  };
  
  // the method that will trigger the game stop
  this.stop = function(){
    // reset listeners, so no more snake updates
    createjs.Ticker.init();
  };
  
  // draw the snake body
  var drawSnake = function() {
    var n = snake.body.length, i = 0, bmp = null; 
    var snakeHead = snake.body[n - 1], snakePartPos = null;
    var coords = null, radius = world.getMinCellSize() / 2;
    var shape = null, firstDraw = (snake.bodyGraphics.length < 1);
    var offsetX = 0, offsetY = 0;
   
    // draw the snake
    for(i = 0; i < n; i++) {
      snakePartPos = snake.body[i];
      coords = world.getCellRealCoordinates(snakePartPos.x, snakePartPos.y);
      if(firstDraw) {
        if(i === n-1) {
          bmp = new createjs.Bitmap("media/images/snake-head.png");
        } else {
          bmp = new createjs.Bitmap("media/images/snake-body.png");
        }
        snake.bodyGraphics.push(bmp);
        // add BMP Shape instance to stage display list.
        stage.addChild(bmp);
      } else {
        bmp = snake.bodyGraphics[i];
      }
      if(bmp.rotation === -90) {
        offsetY = -world.cellHeightSize;
      } else if(bmp.rotation === 90) {
        offsetX = -world.cellWidthSize;
      } else if(bmp.rotation === 180) {
        offsetY = -world.cellHeightSize;
        offsetX = -world.cellWidthSize;
      }
      bmp.x = coords.x - world.cellWidthSize / 2 - offsetX;
      bmp.y = coords.y - world.cellHeightSize / 2 - offsetY;
      // update stage will render next frame
      stage.update();
    }
  };
  
  // draw items
  var drawMapItems = function() {
    var width = world.map.length, height = world.map[0].length;
    var x = 0, y = 0;
    for(x = 0 ; x < width; x++) {
      for(y = 0; y < height; y++) {
        if(world.map[x][y]) {
          // add BMP instance to stage display list.
          stage.addChild(world.map[x][y].graphics);
          // update stage will render next frame
          stage.update();
        }
      }
    }
  };
  
  // create the static items
  var createStaticItems = function() {
    var maxW = world.cellsOnWidth - 1, maxH = world.cellsOnHeight - 1, item = null;
    var i = 0, itemsNr = difficultyLevel * maxW * maxH * 0.01;
    var bmp = null, mapPosition = null, realPosition = null;
    // create top-bottom map margins
    for(i = 0; i <= maxW; i++) {
      // top row
      createItemOnMap(Item.Type.OBSTACLE, 0, i, maxH);
      // bottom row
      createItemOnMap(Item.Type.OBSTACLE, 0, i, 0);
    }
    // create left-right map margins
    for(i = 1; i < maxH; i++) {
      // left row
      createItemOnMap(Item.Type.OBSTACLE, 0, 0, i);
      // bottom row
      createItemOnMap(Item.Type.OBSTACLE, 0, maxW, i);
    }
    // create the additional obstacles on the map
    for(i = 0; i < itemsNr; i++) {
      mapPosition = world.generateRandomPosition(snake.body);
      createItemOnMap(Item.Type.OBSTACLE, 0, mapPosition.x, mapPosition.y);
    }
  };
  
  // create item to be placed on the given map coordinates
  var createItemOnMap = function(type, value, x, y) {
    var realPosition = null, bmp = null, imgPath = null;
    
    switch(type) {
      case Item.Type.OBSTACLE: 
        imgPath = "media/images/obstacle.png";
        break;
    };
    realPosition = world.getCellRealCoordinates(x, y);
    bmp = new createjs.Bitmap(imgPath);
    bmp.x = realPosition.x - world.cellWidthSize / 2;
    bmp.y = realPosition.y - world.cellHeightSize / 2;
    item = new Item(Item.Type.OBSTACLE, 0, bmp);
    world.addItem(item, x, y);
  };
};

// Finished loading the HTML Document, start playing then...
window.addEventListener("load", function() {
  var game = new Game(), queue = new createjs.LoadQueue();

  // load graphic assets
  queue.addEventListener("complete", function() {
    game.wallItemImg = queue.getResult("wall");
    game.snakeHead = queue.getResult("snakeHead");
    game.snakeBody = queue.getResult("snakeBody");
    
    // load sound assets
    createjs.Sound.registerSound("media/sounds/game.mp3|media/sounds/game.ogg", "game");
    createjs.Sound.registerSound("media/sounds/ouch.mp3|media/sounds/ouch.ogg", "ouch");
    createjs.Sound.addEventListener("complete", function() {
      game.init();
      game.play();
    });
  });
  queue.loadManifest([
    {id: "wall", src: "media/images/obstacle.png"},
    {id: "snakeHead", src: "media/images/snake-head.png"},
    {id: "snakeBody", src: "media/images/snake-body.png"}
  ]);
});