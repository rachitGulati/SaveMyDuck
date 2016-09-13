(function(){
    'use strict';
    /*global jsfxr, sound_array, ctx, require, escape, cancelRequestAnimFrame, cancelRequestAnimFrame, updateExplosion, requestAnimFrame, createExplosion*/
    // jshint elision: true

    require('./jsfxr.js');
    require('./audiopanel.js');
    require('./particle.js');

    window.onload=function(){
      // RequestAnimFrame: a browser API for getting smooth animations
    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     ||  
        function( callback ){
          return window.setTimeout(callback, 1000 / 60);
        };
    })();

    window.cancelRequestAnimFrame = ( function() {
      return window.cancelAnimationFrame          ||
        window.webkitCancelRequestAnimationFrame    ||
        window.mozCancelRequestAnimationFrame       ||
        window.oCancelRequestAnimationFrame     ||
        window.msCancelRequestAnimationFrame        ||
        clearTimeout;
    } )();

    //Global Elements
    var canvas = document.getElementById('canvas');
    window.ctx = canvas.getContext('2d');
    var isPaused = false;
    var level=1;
    var gravity=4;
    var forceFactor=0.3;
    var mouseDown=false;
    var balls=[];
    var directionOfDuck=0;
    var over=0;
    var points=0;
    var lifes=3;
    var duckWords=["Ouccch!!","Uhh! This hurts!","Mind my head !","Balls are heavy !!"]
    var mousePos=[];
    // minimum and maximum ball limits.
    var minBall=2;
    var rangeBall=4;
    var levelColor = '#87CEEE';
    var init;

    var W = window.innerWidth, // Window's width
    H = window.innerHeight; // Window's height


    //Graphics Code
    function circle(x,y,r,c){
      
      var gradient = ctx.createRadialGradient(x, y, 5, x, y, r+2);
      gradient.addColorStop(1, c);
      ctx.fillStyle=gradient;
      ctx.beginPath();
      ctx.arc(x,y,r,0,2*Math.PI,true);
      
      ctx.fill();
      ctx.closePath();
    }

    function drawball(){
      this.vy+=gravity*0.1;
      this.x+=this.vx*0.1;
      this.y+=this.vy*0.1;
      //move the mall
      if(this.x+this.r>canvas.width){
        this.x=canvas.width-this.r;
        this.vx*=-1*this.b;
      }
      if(this.x-this.r<0){
        this.x=this.r;
        this.vx*=-1*this.b;
      }
      if(this.y+this.r>canvas.height){
        this.y=canvas.height-this.r;
        this.vy*=-1*this.b;
      }
      if(this.y-this.r<0){
        this.y=this.r;
        this.vy*=-1*this.b;
      }
      circle(this.x,this.y,this.r,this.c);
    }

    function Ball(positionX,positionY,velocityX,velocityY,radius,bounciness,color){
      this.x=positionX;
      this.y=positionY;
      this.vx=velocityX;
      this.vy=velocityY;
      this.r=radius;
      this.b=bounciness;
      this.c=color;

      this.draw=drawball;
    }
    
    function Duck(positionX,positionY,velocityX,velocityY,width,height){
      this.duckx=positionX;
      this.ducky=positionY;
      this.duckvx=velocityX;
      this.duckvy=velocityY;
      this.width=width;
      this.height=height;

      this.draw=drawduck;
    }
    
    var duckSave = new Duck(50,canvas.height-75,20,0,75,75);
    var duckWordsImg=new Image();

    duckWordsImg.src="images/duckling.png";

    function setPoint(){
      points+=10;
    }

    function random_color(){
      var letters="0123456789ABCDEF".split('');
      var color="#";
      for(var i=0;i<=5;i++){
        color+=letters[Math.round(Math.random()*15)];
      }

      return color;
    }

    var img = new Image();

    function drawduck(){
      ctx.beginPath();
      this.duckx-=this.duckvx*0.1;
      if(this.duckx+this.width>canvas.width){
        this.duckvx*=-1;
        this.duckx=canvas.width-75;
        directionOfDuck=1;
      }
      if(this.duckx-50<0){
        this.duckx=50;
        this.duckvx*=-1;
        directionOfDuck=0;
      }
      
      img.src = "images/duckling.png";
      
      if(directionOfDuck === 1){
        ctx.save();
        ctx.translate(0, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img,-this.duckx-75,this.ducky,this.width,this.height);  
        ctx.restore();
        
      }else{
        ctx.drawImage(img,this.duckx-12.5,this.ducky,this.width,this.height);  
      } 
      
    }

    //Objects
    function ballgenerator(){
      if(isPaused){
        return ;
      }
      for(var i=75;i<=canvas.width;i=i+(canvas.width/Math.round(Math.random()*minBall+rangeBall))){
        balls.push(new Ball(i,50,(Math.random()*100+20)*forceFactor,(Math.random()*100-20)*forceFactor,(20+Math.random()*30),0.9,random_color()));
      }
    }

    function animloop() {
      init = requestAnimFrame(animloop);
      if(!isPaused){
        game_loop();
      }
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function gameOver() {
      ctx.save();
      ctx.beginPath();
      ctx.font = "30px Latte";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.textBaseline = 'alphabetic';
      ctx.scale(1,1);
      ctx.fillStyle="white"
      ctx.wrapText("Game Over - You Have Scored "+points+" Points.\nYippi :) !", W/2, H/2 + 50 , window.innerWidth*0.7, 30);
      ctx.restore();
      // Stop the Animatio
      cancelRequestAnimFrame(init);
      over=1;
      document.getElementsByClassName('restart-button')[0].style.visibility = "visible";
      document.getElementsByClassName('tweet-button')[0].style.visibility = "visible";
    }
    function checkBlast(ball,i,evt){
      if(Math.pow((evt.pageX - ball.x),2) + Math.pow((evt.pageY - ball.y),2) < Math.pow(ball.r,2)){
        createExplosion(ball.x, ball.y, ball.c);
        ball.c="#f00";
        setTimeout(function(){

          balls.splice(i,1);
          setPoint();
        },70);
        
      }
    }

    function levelColorGenerator(color, percent) {   
      /*jslint bitwise: true */
      var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
      return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
    }

    function duckBallColliding(circle,rect){
      var distX = Math.abs(circle.x - rect.duckx-rect.width/2)+15;
      var distY = Math.abs(circle.y - rect.ducky-rect.height/2)+15;

      if (distX > (rect.width/2 + circle.r)) { return false; }
      if (distY > (rect.height/2 + circle.r)) { return false; }

      if (distX <= (rect.width/2)) { return true; } 
      if (distY <= (rect.height/2)) { return true; }

      var dx=distX-rect.width/2;
      var dy=distY-rect.height/2;
      return (dx*dx+dy*dy<=(circle.r*circle.r));
    }

    function checkDuckHit(duckSave, click){
      if((click.pageX >= duckSave.duckx) && (click.pageX <= duckSave.duckx + duckSave.width) &&
          (click.pageY >= duckSave.ducky) && (click.pageY <= duckSave.ducky + duckSave.height)){
          document.getElementById("canvas").style.background = '#5787e5';
          document.getElementsByClassName("callout")[0].classList.add("hit");
          isPaused=true;
          document.getElementsByClassName("callout")[0].innerHTML = 'WTF';
          sound_array.play('duck');
          ctx.drawImage(duckWordsImg,W/2-100,H/2,100,100);
          window.setTimeout(function(){
            isPaused=false;
            document.getElementById("canvas").style.background = levelColor;
            document.getElementsByClassName("callout")[0].classList.remove("hit");
          },1000);
      }
    }

    CanvasRenderingContext2D.prototype.wrapText = function (text, x, y, maxWidth, lineHeight) {

        var lines = text.split("\n");

        for (var i = 0; i < lines.length; i++) {

            var words = lines[i].split(' ');
            var line = '';

            for (var n = 0; n < words.length; n++) {
                var testLine = line + words[n] + ' ';
                var metrics = this.measureText(testLine);
                var testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    this.fillText(line, x, y);
                    line = words[n] + ' ';
                    y += lineHeight;
                }
                else {
                    line = testLine;
                }
            }

            this.fillText(line, x, y);
            y += lineHeight;
        }
    }

    //Event Handler
    function onMouseDown(evt){
      //TODO: Shot the ball.
      if(isPaused){
        return;
      }
      sound_array.play('shoot');
        // Variables for storing mouse position on click
        var mx = evt.pageX,
            my = evt.pageY;
        
        // Click start button
        if(evt.target.className === 'start-button') {
          duckSave=new Duck(50,canvas.height-75,20,0,75,75);
          document.getElementsByClassName("instruction-container")[0].style.visibility="hidden";
          (function(){     
              var sec = 5;  
              var id = window.setInterval(function() { 
                  switch(sec){
                    case 1:
                        document.getElementsByClassName("count")[0].innerHTML = "BLAST";
                        break;
                    case 2:
                        document.getElementsByClassName("count")[0].innerHTML = "LET'S";
                        break;
                    case 3:
                    case 4:
                    case 5:
                        document.getElementsByClassName("count")[0].innerHTML = sec;
                    break;    

                  }
                  if (sec === 0) {
                      clearInterval(id);
                      document.getElementsByClassName("count")[0].style.visibility="hidden"
                      ballgenerator();
                      window.setInterval(function(){
                        ballgenerator();
                      },5000+level*1000);
                      return;
                  }        
                   sec--;
              }, 1000)
          })();

          animloop(); 
          document.getElementsByClassName("start-button")[0].style.visibility="hidden"
        }
        
        // If the game is over, and the restart button is clicked
        if(over === 1) {
          if(evt.target.className === 'restart-button') {
            document.getElementsByClassName('restart-button')[0].style.visibility = "hidden";
            document.getElementsByClassName('tweet-button')[0].style.visibility = "hidden";
            balls=[];
            points=0;
            over = 0;
            level=1;
            lifes=3;
            minBall=2
            rangeBall=4;
            forceFactor=0.3;
            document.getElementById("canvas").style.background = '#87CEEE';
            directionOfDuck=0;
            duckSave=new Duck(50,canvas.height-75,20,0,75,75);
            animloop();
          }
          else if (evt.target.className === 'tweet-button'){
            var tweetText = 'Wanna Beat my score '+points+ '! in #SaveMyDuck at http://rachitgulati.com/SaveMyDuck/. It is an awesome game! crafted by @squiroid';
            tweetText = escape(tweetText);
            var tweet_url = 'https://twitter.com/intent/tweet?text='+tweetText;
            document.getElementsByClassName('tweet-button')[0].setAttribute('href', tweet_url);
          }
        }
        for(var i=0;i<balls.length;i++){
          checkBlast(balls[i],i,evt);
        }
        checkDuckHit(duckSave, evt);
    }

    function resizeWindow(evt){
      isPaused=false;
      canvas.height = window.innerHeight;
      canvas.width = window.innerWidth;
      if(duckSave && isPaused === false && window.getComputedStyle(document.getElementsByClassName("start-button")[0]).visibility === "hidden"){
        duckSave.ducky=canvas.height-75;
        duckSave.draw();
      }
      isPaused=true;
    }

    document.addEventListener("mousedown",function(e){
      onMouseDown(e);
    });

    window.addEventListener("blur",function(e){
      isPaused=true;
    });

    window.addEventListener("focus",function(e){
      isPaused=false;
    });

    document.addEventListener("click",function(e){
      createExplosion(e.clientX, e.clientY, "#CB7013");
    });

    document.addEventListener("keydown",function(e){
      if(over){
        return;
      }
      if(e.keyCode===32){
        isPaused=!isPaused;
      }
    });

    window.addEventListener("resize",function(e){
      resizeWindow(e);
    });        

    function collision(){
      for(var i=0;i<balls.length;i++){
        if (duckBallColliding(balls[i],duckSave)===true) {
          
          createExplosion(balls[i].x, balls[i].y, '#f00');
          
          balls.splice(i,1);
          lifes--;

          sound_array.play('duck');
          if(lifes>=1){
            document.getElementById("canvas").style.background = '#5787e5';
            document.getElementsByClassName("callout")[0].innerHTML = duckWords[Math.floor(Math.random()*3)];
            document.getElementsByClassName("callout")[0].classList.add("hit");        
            isPaused=true;
            ctx.drawImage(duckWordsImg,W/2-100,H/2,100,100);
            
            window.setTimeout(function(){
              isPaused=false;
              document.getElementById("canvas").style.background = levelColor;
              document.getElementsByClassName("callout")[0].classList.remove("hit");
            },1000);

          }
          else if(lifes===0){
            sound_array.play('duck');
            gameOver();
          }
        }
      }
      
    }
    function definelevel(){
      if(points/200-level===0){
        level++;
        lifes+=2;
        forceFactor+=0.05;
        minBall+=1;
        rangeBall+=1;
        
        document.getElementById("canvas").style.background = '#5FBA7D';
        document.getElementsByClassName("callout")[0].innerHTML = 'Congrats You Are On Level '+level;
        document.getElementsByClassName("callout")[0].classList.add("levelUp");
        
        ctx.drawImage(duckWordsImg,W/2-100,H/2,100,100);

        isPaused = true;
        
        window.setTimeout(function(){
            isPaused=false;
            levelColor = levelColorGenerator(levelColor, 5);
            document.getElementById("canvas").style.background = levelColor;
            document.getElementsByClassName("callout")[0].classList.remove("levelUp");
            balls = [];
            cancelRequestAnimFrame(init);
            animloop();
          },1000);
      }
    }
    //Game loop
    function game_loop(){
      var i;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      duckSave.draw();
      
      for(i=0;i<balls.length;i++){
        balls[i].draw();
      }
      collision();
      updateExplosion(1000/60);
      definelevel();
      ctx.save();
      ctx.fillStyle = "white";
      ctx.font = "30px Latte";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.textBaseline = 'alphabetic';
      ctx.scale(1,1);
      if(window.innerWidth<500){
        ctx.fillText("SCORE: "+points,W-80,50);  
      }
      else{
        ctx.fillText("SCORE: "+points,W/2,50);
      }
      
      for(i=0;i<lifes;i++){
        var duckLife=new Duck(W/2-50+i*40,70,0,0,40,40);
        duckLife.draw();
      }
      ctx.fillStyle = "white";
      ctx.fillText("LEVEL: "+level,80,50);
      ctx.restore();
    }

    }

})();