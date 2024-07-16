let board;
let boardWidth = window.innerWidth - 2; // Adjust to screen width
let boardHeight = window.innerHeight - 2; // Adjust to screen height
let context;

// bird
let birdWidth = 34; // width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

// pipes
let pipeArray = [];
let pipeWidth = 64; // width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// score images
let scoreImages = []; // Array to hold score images
let totalPipesToPass = 12; // Total pipes to pass
let currentScore = 0; // Current score

// physics
let velocityX = -4; // pipes moving left speed
let velocityY = 2; // bird jump speed
let gravity = 0.2;

let gameOver = false;
let winTheGame = false;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); // used for drawing on the board

    // Load bird image
    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    };

    // Load pipe images
    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    // Load score images
    for (let i = 0; i <= totalPipesToPass; i++) {
        let scoreImage = new Image();
        scoreImage.src = `./authenticity/${i}.png`;
        scoreImages.push(scoreImage);
    }

    requestAnimationFrame(update);
    setInterval(placePipes, 2000); // every 2 seconds
    document.addEventListener("keydown", moveBird);
    document.addEventListener("click", moveBird);
};

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        displayGameOver();
        return;
    }
    if (winTheGame) {
        displayWin();
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // Draw bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); // apply gravity to current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    // Draw pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
        
        
        // Score logic
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            currentScore = currentScore + 0.5;
            pipe.passed = true;
        }

        // Collision detection
        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }

        context.drawImage(scoreImages[Math.round(currentScore)], pipe.x-70, pipe.y-340, 200, 200);
    }

    // Clear off-screen pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); // removes first element from the array
    }

    // Check if game is won
    if (currentScore >= totalPipesToPass) {
        winTheGame = true;
    }

    // Draw current score progress
    // let scoreImageIndex = Math.min(currentScore - 1, totalPipesToPass);
    // let centerX = 100;
    let centerY = 0;
    // context.drawImage(scoreImages[scoreImageIndex], centerX, centerY, 200, 200);

    // Draw score images
    for (let i = 0; i < currentScore; i++) {
        let xPos = 28 * i; // Adjust x position based on score index
        context.drawImage(scoreImages[i], xPos, centerY, 150, 150); // Draw each score image
    }

}

function placePipes() {
    if (gameOver || currentScore >= totalPipesToPass) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 2;

    // Top pipe
    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(topPipe);

    // Bottom pipe
    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if ((gameOver || winTheGame) && e.target.id !== "playAgainButton") {
        return;
    }

    if (e.code == "Space" || e.type == "click") {
        if (gameOver || winTheGame) {
            resetGame();
        } else {
            velocityY = -6; // Jump velocity
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

function displayGameOver() {
    context.fillStyle = "white";
    context.fillRect(0, 0, board.width, board.height);
    context.fillStyle = "#232323";
    context.font = "45px sans-serif";
    context.textAlign = "center";

    let centerX = -20;
    let centerY = 400;

    context.drawImage(scoreImages[12], centerX, centerY - 210, 460, 154);
    context.fillText("GAME OVER", centerX + 230, centerY);
    context.fillText("Score is : " + currentScore, centerX + 230, centerY + 110);

    document.getElementById("playAgainButton").style.display = "block"; // Show the play again button
}

function displayWin() {
    context.fillStyle = "white";
    context.fillRect(0, 0, board.width, board.height);
    context.fillStyle = "#232323";
    context.font = "45px sans-serif";
    context.textAlign = "center";

    let centerX = -20;
    let centerY = 400;

    context.drawImage(scoreImages[12], centerX, centerY - 210, 460, 154);
    context.fillText("YOU WIN!!!", centerX + 230, centerY);
    context.fillText("PERFECT!!", centerX + 230, centerY + 110);

    document.getElementById("playAgainButton").style.display = "block"; // Show the play again button
}

function resetGame() {
    bird.y = birdY;
    pipeArray = [];
    currentScore = 0;
    velocityY = 0;
    gameOver = false;
    winTheGame = false;

    document.getElementById("playAgainButton").style.display = "none"; // Hide the play again button
}
