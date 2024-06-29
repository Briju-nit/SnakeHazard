const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'gameContainer',
  backgroundColor: '#000',
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

const game = new Phaser.Game(config);
let snake;
let food;
let cursors;
let score = 0;
let scoreText;
let highScore = localStorage.getItem('highScore') || 0;
let highScoreText;
let direction = 'RIGHT';
let newDirection = 'RIGHT';
let moveInterval = 200;
let lastMoveTime = 0;

function preload() {
  this.load.image('food', 'assets/food.png');
  this.load.image('body', 'assets/body.png');
  this.load.audio('eat', 'assets/eat.mp3');
  this.load.audio('gameOver', 'assets/gameOver.mp3');
}

function create() {
  snake = this.physics.add.group();
  food = this.physics.add.sprite(Phaser.Math.Between(0, 39) * 20, Phaser.Math.Between(0, 29) * 20, 'food');
  cursors = this.input.keyboard.createCursorKeys();
  scoreText = this.add.text(16, 16, `Score: ${score}`, { fontSize: '32px', fill: '#fff' });
  highScoreText = this.add.text(16, 50, `High Score: ${highScore}`, { fontSize: '32px', fill: '#fff' });

  for (let i = 0; i < 3; i++) {
    snake.create(200 - i * 20, 200, 'body');
  }

  this.physics.add.collider(snake, food, eatFood, null, this);
  this.physics.add.collider(snake, snake, gameOver, null, this);
}

function update(time) {
  if (cursors.left.isDown && direction !== 'RIGHT') {
    newDirection = 'LEFT';
  } else if (cursors.right.isDown && direction !== 'LEFT') {
    newDirection = 'RIGHT';
  } else if (cursors.up.isDown && direction !== 'DOWN') {
    newDirection = 'UP';
  } else if (cursors.down.isDown && direction !== 'UP') {
    newDirection = 'DOWN';
  }

  if (time >= lastMoveTime + moveInterval) {
    direction = newDirection;
    moveSnake();
    lastMoveTime = time;
  }

  let head = snake.getChildren()[0];
  if (head.x < 0 || head.x >= config.width || head.y < 0 || head.y >= config.height) {
    gameOver();
  }
}

function moveSnake() {
  const head = snake.getChildren()[0];
  let newX = head.x;
  let newY = head.y;

  if (direction === 'LEFT') {
    newX -= 20;
  } else if (direction === 'RIGHT') {
    newX += 20;
  } else if (direction === 'UP') {
    newY -= 20;
  } else if (direction === 'DOWN') {
    newY += 20;
  }

  Phaser.Actions.ShiftPosition(snake.getChildren(), newX, newY, 1, true);

  if (checkSelfCollision()) {
    gameOver();
  }
}

function checkSelfCollision() {
  const head = snake.getChildren()[0];
  for (let i = 1; i < snake.getChildren().length; i++) {
    if (head.x === snake.getChildren()[i].x && head.y === snake.getChildren()[i].y) {
      return true;
    }
  }
  return false;
}

function eatFood() {
  score += 10;
  scoreText.setText(`Score: ${score}`);
  food.setPosition(Phaser.Math.Between(0, 39) * 20, Phaser.Math.Between(0, 29) * 20);
  let tail = snake.create(snake.getLast(true).x, snake.getLast(true).y, 'body');
  this.sound.play('eat');
}

function gameOver() {
  this.sound.play('gameOver');
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
  }
  highScoreText.setText(`High Score: ${highScore}`);
  this.scene.restart();
  score = 0;
}
