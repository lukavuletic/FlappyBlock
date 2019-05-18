var myGamePiece;
var myObstacles = [];
var myScore;

startGame = () => {
    myGameArea.start();
    myGamePiece = new component(30, 30, "red", 10, 120);
    myScore = new component("30px", "Consolas", "black", 280, 40, "text");
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 480;
        this.canvas.height = 270;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
        window.addEventListener('keydown', function(e){
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = true;
        })
        window.addEventListener('keyup', function(e){
            myGameArea.keys[e.keyCode] = false;
        })
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() {
        clearInterval(this.interval);
    }
}

everyInterval = (n) => {
    if((myGameArea.frameNo / n) % 1 == 0){
        return true;
    }else{
        return false;
    }
}

function component(width, height, color, x, y, type) {
    this.type = type;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y; 
    this.speedX = 0;
    this.speedY = 0;
    this.gravity = .05;
    this.gravitySpeed = 0;
    this.update = function(){
        ctx = myGameArea.context;
        if(this.type == "text"){
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        }else{            
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    this.newPos = function() {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.hitBottom();
    }
    this.hitBottom = function(){
        var rockbottom = myGameArea.canvas.height - this.height;
        if(this.y > rockbottom){
            this.y = rockbottom;
        }
    }
    this.crashWith = function(otherobj) {
        let myleft = this.x;
        let myright = this.x + this.width;
        let mytop = this.y;
        let mybottom = this.y + this.height;
        let otherleft = otherobj.x;
        let otherright = otherobj.x + otherobj.width;
        let othertop = otherobj.y;
        let otherbottom = otherobj.y + otherobj.height;
        let crash = true;
        if((mybottom < othertop) ||
            (mytop > otherbottom) ||
            (myright < otherleft) ||
            (myleft > otherright)){
                crash = false;
        }
        return crash;
    }
}

accelerate = (n) => {
    myGamePiece.gravity = n;
}
  
updateGameArea = () => {
    let x, y;
    for(i = 0; i < myObstacles.length; i++){
        if(myGamePiece.crashWith(myObstacles[i])){
            myGameArea.stop();
            return;
        }
    }    
    myGameArea.clear();
    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;
    myGameArea.frameNo++;
    myObstacles.x -= 1;
    if(myGameArea.frameNo == 1 || everyInterval(150)){
        x = myGameArea.canvas.width;
        minHeight = 20;
        maxHeight = 200;
        height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
        minGap = 50;
        maxGap = 200;
        gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
        myObstacles.push(new component(10, height, "green", x, 0));
        myObstacles.push(new component(10, x - height - gap, "green", x, height + gap));
    }
    for(i = 0; i < myObstacles.length; i++){
        myObstacles[i].x -= 1;
        myObstacles[i].update();
    }
    if(myGameArea.keys && myGameArea.keys[38]){
        accelerate(-.2);
    }else{
        accelerate(.1);
    }
    if(Math.floor((myGameArea.frameNo/150)-2) < 1){
        myScore.text = "SCORE: 0";
    }else{
        myScore.text = "SCORE: " + Math.floor((myGameArea.frameNo/150)-2);
    }    
    myScore.update();
    myGamePiece.newPos();
    myGamePiece.update();
}