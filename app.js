// declaration of variables to be used globally
var myGamePiece;
var myObstacles = [];
var myScore;

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
        this.interval = setInterval(updateGameArea, 20);

        // check if the key is pressed/held down
        window.addEventListener('keydown', function(e){
            myGameArea.key = (myGameArea.key || []);
            myGameArea.key[e.keyCode] = true;
        })
        // check if the key is not pressed/held down
        window.addEventListener('keyup', function(e){
            myGameArea.key[e.keyCode] = false;
        })
    },

    // clears canvas
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    // stops the interval and alerts with score
    stop : function() {
        clearInterval(this.interval);
        alert(`Game over!
Your score: ${Math.floor((myGameArea.frameNo/150)-2)}`
        );
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
        }
    }

    // check if flappy block would go below canvas height on y axis (top of canvas)
    this.hitTop = function(){
        // check if block is above top, if so set it to min height
        let rockTop = 0;
        if(this.y < rockTop){
            this.y = rockTop;
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

// IFFE function for starting the game
(startGame = () => {
    myGameArea.start();

    // create components on the canvas
    myGamePiece = new component(30, 30, "red", 10, 120);
    myScore = new component("30px", "Consolas", "black", 280, 40, "text");
}) ();