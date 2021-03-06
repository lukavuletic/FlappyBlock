// declaration of variables to be used globally
var myGamePiece;
var myObstacles = [];
var myScore;
var myBackgroundImage;
var name;
var difficulty;

// main functions that manipulate canvas
var myGameArea = {
    // create canvas element, actual game area
    canvas : document.createElement("canvas"),

    // append canvas characteristics
    start : function() {
        this.canvas.width = 480;
        this.canvas.height = 270;
        this.context = this.canvas.getContext("2d");

        // insert canvas as first element in <body> tag
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);

        // initialize frame counter to 0
        this.frameNo = 0;
        // start the interval and call updateGameArea each 20 ms
        this.interval = setInterval(updateGameArea, difficulty);

        // check if the key is pressed/held down
        window.addEventListener('keydown', function(e){
            myGameArea.key = (myGameArea.key || []);
            myGameArea.key[e.keyCode] = true;
        })
        // check if the key is not pressed/held down
        window.addEventListener('keyup', function(e){
            myGameArea.key[e.keyCode] = false;
        })

        // create components on the canvas
        myGamePiece = new component(30, 30, "red", 10, 120);
        myScore = new component("30px", "Consolas", "black", 280, 40, "text");
        myBackgroundImage = new component(480, 270, "lightgray", 0, 0);
    },

    // clears canvas
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    // stops the interval and alerts the user with his score
    stop : function() {
        clearInterval(this.interval);
        if(confirm(`Game over ${name}!
Your score: ${Math.floor((myGameArea.frameNo/150)-2)}
Play again?`)){

            //removes the canvas, resets game data, empties key array
            myGameArea.canvas.parentNode.removeChild(myGameArea.canvas);
            myGamePiece = 0;
            myObstacles = [];
            myScore = 0;
            myBackgroundImage = 0;
            difficulty = 0;
            myGameArea.key = [];

            // reruns the game
            chooseDifficulty();
        }
    }
}

// return boolean every nth ms
everyInterval = (n) => {
    if((myGameArea.frameNo / n) % 1 == 0){
        // confirms the nth ms
        return true;
    }else{
        return false;
    }
}

// defines components within canvas element
function component(width, height, color, x, y, type) {
    // used for text box in canvas to confirm the data type
    this.type = type;

    // used for our flappy block
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y; 
    this.speedX = 0;
    this.speedY = 0;

    // used for making gravity work
    this.gravity = .05;
    this.gravitySpeed = 0;

    // updates context of canvas
    this.update = function(){
        ctx = myGameArea.context;

        // text datatype ? update text element : update canvas
        // checks if text area is actually text
        if(this.type == "text"){
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        }else{            
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    // updates position of the flappy block
    this.newPos = function() {
        // accelerates gravity speed on y axis, x is constantly moving
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;

        // call hitBottom
        this.hitBottom();
        // call hitTop to check if flappy block would go to minus height on y axis
        this.hitTop();
    }

    // check if flappy block would go over canvas height on y axis (bottom of canvas)
    this.hitBottom = function(){
        // check if block is below bottom, if so set it to max height minus its height
        let rockBottom = myGameArea.canvas.height - this.height;
        if(this.y > rockBottom){
            this.y = rockBottom;

            // set gravity speed to 0 so block moves instantly as button is pressed
            // otherwise gravity speed increases and has to be brought back to 0
            this.gravitySpeed = 0;
        }
    }

    // check if flappy block would go below canvas height on y axis (top of canvas)
    this.hitTop = function(){
        // check if block is above top, if so set it to min height
        let rockTop = 0;
        if(this.y < rockTop){
            this.y = rockTop;

            // set gravity speed to 0 so block moves instantly as button is pressed
            // otherwise gravity speed increases and has to be brought back to 0
            this.gravitySpeed = 0;
        }
    }

    // call when collision happens with otherobj
    this.crashWith = function(otherobj) {
        // set position of the block
        let myleft = this.x;
        let myright = this.x + this.width;
        let mytop = this.y;
        let mybottom = this.y + this.height;

        // set position of other object
        let otherleft = otherobj.x;
        let otherright = otherobj.x + otherobj.width;
        let othertop = otherobj.y;
        let otherbottom = otherobj.y + otherobj.height;

        // collision naturally happened
        let crash = true;

        // changes the crash result if block and object don't touch each other
        if((mybottom < othertop) ||
            (mytop > otherbottom) ||
            (myright < otherleft) ||
            (myleft > otherright)){
                crash = false;
        }

        //return result
        return crash;
    }
}

// change gravity speed
accelerate = (n) => {
    myGamePiece.gravity = n;
}
  
// constantly refreshes game area
updateGameArea = () => {
    // check if block has crashed with any obstacle from i-th myObstacles array
    // if it did, stop the game
    for(i = 0; i < myObstacles.length; i++){
        if(myGamePiece.crashWith(myObstacles[i])){
            myGameArea.stop();
            return;
        }
    }    

    // clear screen so 'movement' doesn't leave trail
    myGameArea.clear();

    // set block speed to 0 each frame so controls work intendendly
    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;

    // count frames
    myGameArea.frameNo++;

    // trigger on 1st and 150th frame
    if(myGameArea.frameNo == 1 || everyInterval(150)){
        // define starting x position for new frame
        let x = myGameArea.canvas.width;

        // define min and max height of each obstacle
        minHeight = 20;
        maxHeight = 200;

        // define random height for each obstacle
        height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);

        // define min and max gap between bottom and top of the obstacle
        minGap = 50;
        maxGap = 200;

        // define random gap size for each obstacle
        gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);

        // push top of the obstacle into myObstacles array
        /* 10 of width, random height, green color, on most-right of the canvas,
        on top of the canvas */
        myObstacles.push(new component(10, height, "green", x, 0));

        // push bottom of the obstacle into myObstacles array
        /* 10 of width, width of canvas - random height - gap, green color, 
        on most-right of the canvas, start on random height (end of top obstacle) +
        the gap */
        myObstacles.push(new component(10, x - height - gap, "green", x, height + gap));
    }

    // creates and updates background 
    myBackgroundImage.newPos();
    myBackgroundImage.update();

    // move obstacles to the left on x axis
    for(i = 0; i < myObstacles.length; i++){
        myObstacles[i].x -= 1;
        myObstacles[i].update();
    }

    // when the key is pressed decelerate, when not accelerate - towards gravity
    if(myGameArea.key && myGameArea.key[38]){
        accelerate(-.2);
    }else{
        accelerate(.1);
    }

    // score screen, start counting from 1 since time passes until block passes first obstacle
    if(Math.floor((myGameArea.frameNo/150)-2) < 1){
        myScore.text = "SCORE: 0";
    }else{
        myScore.text = "SCORE: " + Math.floor((myGameArea.frameNo/150)-2);
    }    

    // call functions to update the canvas
    myScore.update();
    
    myGamePiece.newPos();
    myGamePiece.update();
}

// function that prompts you to enter the name
enterName = () => {
    // prompt that requires name
    let txt = prompt("Please enter your name: ", "Enter name here!");
    if(name == null || name == ""){
        name = 'You did not choose a name';
    }else{
        name = txt;
    }
    
    // leads you to choose difficulty screen
    chooseDifficulty();
}

// lets you choose the game difficulty
chooseDifficulty = () => {
    // creates flavor text and inserts it into body
    let gameDiffTxt = document.createElement("h1");
    gameDiffTxt.innerHTML = "Choose the difficulty!";
    document.body.insertAdjacentElement('beforebegin', gameDiffTxt);

    // creates 3 buttons for choosing the difficulty and inserting them into body
    let buttonEasyGameDiff = document.createElement("button");
    buttonEasyGameDiff.innerHTML = "Easy";
    let buttonMediumGameDiff = document.createElement("button");
    buttonMediumGameDiff.innerHTML = "Medium";
    let buttonHardGameDiff = document.createElement("button");
    buttonHardGameDiff.innerHTML = "Hard";
    document.body.insertAdjacentElement('beforeend', buttonEasyGameDiff);
    document.body.insertAdjacentElement('beforeend', buttonMediumGameDiff);
    document.body.insertAdjacentElement('beforeend', buttonHardGameDiff);

    // on click sets the interval speed, removes elements and starts the game
    buttonEasyGameDiff.addEventListener("click", function(){
        difficulty = 20;
        hideElementsOnStart(gameDiffTxt, buttonEasyGameDiff, buttonMediumGameDiff, buttonHardGameDiff);
        myGameArea.start();
    });
    buttonMediumGameDiff.addEventListener("click", function(){
        difficulty = 15;
        hideElementsOnStart(gameDiffTxt, buttonEasyGameDiff, buttonMediumGameDiff, buttonHardGameDiff);
        myGameArea.start();
    });
    buttonHardGameDiff.addEventListener("click", function(){
        difficulty = 10;
        hideElementsOnStart(gameDiffTxt, buttonEasyGameDiff, buttonMediumGameDiff, buttonHardGameDiff);
        myGameArea.start();
    });
}

// function to remove elements when difficulty is chosen
hideElementsOnStart = (txt, button1, button2, button3) => {
    this.txt = txt;
    txt.parentNode.removeChild(txt);
    this.button1 = button1;
    button1.parentNode.removeChild(button1);
    this.button2 = button2;
    button2.parentNode.removeChild(button2);
    this.button3 = button3;
    button3.parentNode.removeChild(button3);
}

// IFFE function for starting the game
(startGame = () => {
    enterName();    
}) ();