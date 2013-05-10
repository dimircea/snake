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
  var snake = new Snake(5, 5);
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
  this.init = function() {
    // start playing the sound
    createjs.Sound.play("game", "none", 0, 0, -1);
    // register keyboard events
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
  };

  // the method that trigger the update on each clock tick
  var update = function(e) {
    var bodyCollision = false, itemCollision = false, mapPosition = null;
    var snakeHead = snake.body[snake.body.length - 1];
    var playTime = parseInt(e.runTime / 1000);
    // snake will move one step in the current direction
    snake.move();
    itemCollision = world.checkCollision(snake.body);
    bodyCollision = snake.checkBodyCollision();
     if(itemCollision !==null) console.log(itemCollision);
    if(bodyCollision || (itemCollision !== null && itemCollision.type === Item.Type.OBSTACLE)) {
      self.stop();
      createjs.Sound.play("ouch");
    } else if(itemCollision !== null && itemCollision.type !== Item.Type.OBSTACLE) {
      score += itemCollision.value;
      world.removeItem(snakeHead.x, snakeHead.y);
      stage.removeChild(itemCollision.graphics)
      foodItemAvailable = false;
      createjs.Sound.play("ouch");
    }
    // redraw the snake
    drawSnake();
    
    // create dynamic items
    if(!foodItemAvailable && playTime !== 0 && playTime % 3 === 0) {
      mapPosition = world.generateRandomPosition(snake.body);
      createItemOnMap(Item.Type.APPLE, difficultyLevel * 5, mapPosition.x, mapPosition.y);
      foodItemAvailable = true;
    }

    // redraw scene
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
    var realPosition = null, bmp = null, img = null;
    
    switch(type) {
      case Item.Type.OBSTACLE: 
        img = self.images["obstacle"];
        break;
      case Item.Type.APPLE: 
        img = self.images["apple"];
        break;
      case Item.Type.CHERRY: 
        img = self.images["cherry"];
        break;
      case Item.Type.MAGIC: 
        img = self.images["magic"];
        break;
    };
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
};

// Finished loading the HTML Document, start playing then...
window.addEventListener("load", function() {
  var game = new Game(), queue = new createjs.LoadQueue();
  
  // load sound assets
  createjs.Sound.registerSound("media/sounds/game.mp3|media/sounds/game.ogg", "game");
  createjs.Sound.registerSound("media/sounds/ouch.mp3|media/sounds/ouch.ogg", "ouch");

  // load graphic assets
  queue.addEventListener("complete", function() {
    game.images["obstacle"] = queue.getResult("obstacle");
    game.images["snakeHead"] = queue.getResult("snakeHead");
    game.images["snakeBody"] = queue.getResult("snakeBody");
    game.images["apple"] = queue.getResult("apple");
    game.images["cherry"] = queue.getResult("cherry");
    // graphics loaded, so lets start playing
    game.init();
    game.play();
  });
  queue.loadManifest([
    {id: "obstacle", src: "media/images/obstacle.png"},
    {id: "snakeHead", src: "media/images/snake-head.png"},
    {id: "snakeBody", src: "media/images/snake-body.png"},
    {id: "apple", src: "media/images/apple.png"},
    {id: "cherry", src: "media/images/cherry.png"},
  ]);
});