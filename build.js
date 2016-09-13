(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./audiopanel.js":2,"./jsfxr.js":3,"./particle.js":4}],2:[function(require,module,exports){
(function(){
    'use strict';
    /*global jsfxr, sound_array*/
    // jshint elision: true

    function AudioPanel() {
      this.sounds = {};
    }
    AudioPanel.prototype.add = function( key, count, settings ) {
      this.sounds[ key ] = [];
      settings.forEach( function( elem, index ) {
        this.sounds[ key ].push( {
          tick: 0,
          count: count,
          pool: []
        } );
        for( var i = 0; i < count; i++ ) {
          var audio = new Audio();
          audio.src = jsfxr( elem );
          this.sounds[ key ][ index ].pool.push( audio );
        }
      }, this );
    };
    AudioPanel.prototype.play = function( key ) {
      var sound = this.sounds[ key ];
      var soundData = sound.length > 1 ? sound[ Math.floor( Math.random() * sound.length ) ] : sound[ 0 ];
      soundData.pool[ soundData.tick ].play();
      soundData.tick = (soundData.tick < soundData.count - 1) ? soundData.tick+1 :0;
    };

    window.sound_array = new AudioPanel();

    sound_array.add( 'duck', 10,
      [
        [1,,0.271,,0.42,0.3916,,0.2406,,,,,,,,0.5803,,,1,,,,,0.5]
      ]
    );

    sound_array.add( 'shoot', 5,
      [
        [0,,0.01,,0.4384,0.2,,0.12,0.28,1,0.65,,,0.0419,,,,,1,,,,,0.3]
      ]
    );

    sound_array.add( 'bacground', 3,
      [
        [1,0.6833,0.2075,0.2863,0.5029,0.5722,,-0.0042,0.3611,0.1632,,-0.7731,0.1208,0.0591,-0.7166,0.5238,0.6006,0.1746,0.8248,-0.0543,0.426,0.4644,-0.7863,0.5],
        [1,0.6833,0.2307,0.3037,0.5029,0.575,,0.041,0.3611,0.1632,,-0.7731,0.1208,0.1047,-0.7166,0.5238,0.5821,0.1956,0.8016,-0.0398,0.4149,0.433,-0.7863,0.5],
        [1,0.6833,0.2307,0.3037,0.5029,0.575,,0.041,0.3611,0.1632,,-0.7731,0.1208,0.1047,-0.7166,0.5238,0.5821,0.1956,0.8016,-0.0398,0.4149,0.433,-0.7863,0.5],
        [1,0.6833,0.2307,0.3037,0.5029,0.575,,0.041,0.3611,0.1632,,-0.7731,0.1208,0.1047,-0.7166,0.5238,0.5821,0.1956,0.8016,-0.0398,0.4149,0.433,-0.7863,0.5]
      ]
    );
})();
},{}],3:[function(require,module,exports){
function SfxrParams(){this.setSettings=function(r){for(var a=0;24>a;a++)this[String.fromCharCode(97+a)]=r[a]||0;this.c<.01&&(this.c=.01);var t=this.b+this.c+this.e;if(.18>t){var e=.18/t;this.b*=e,this.c*=e,this.e*=e}}}function SfxrSynth(){this._params=new SfxrParams;var r,a,t,e,s,n,i,h,f,c,o,v;this.reset=function(){var r=this._params;e=100/(r.f*r.f+.001),s=100/(r.g*r.g+.001),n=1-r.h*r.h*r.h*.01,i=-r.i*r.i*r.i*1e-6,r.a||(o=.5-r.n/2,v=5e-5*-r.o),h=1+r.l*r.l*(r.l>0?-.9:10),f=0,c=1==r.m?0:(1-r.m)*(1-r.m)*2e4+32},this.totalReset=function(){this.reset();var e=this._params;return r=e.b*e.b*1e5,a=e.c*e.c*1e5,t=e.e*e.e*1e5+12,3*((r+a+t)/3|0)},this.synthWave=function(u,b){var w=this._params,m=1!=w.s||w.v,y=w.v*w.v*.1,g=1+3e-4*w.w,k=w.s*w.s*w.s*.1,S=1+1e-4*w.t,l=1!=w.s,p=w.x*w.x,d=w.g,x=w.q||w.r,A=w.r*w.r*w.r*.2,q=w.q*w.q*(w.q<0?-1020:1020),M=w.p?((1-w.p)*(1-w.p)*2e4|0)+32:0,_=w.d,U=w.j/2,j=w.k*w.k*.01,C=w.a,P=r,R=1/r,W=1/a,z=1/t,B=5/(1+w.u*w.u*20)*(.01+k);B>.8&&(B=.8),B=1-B;for(var D,E,F,G,H,I,J=!1,K=0,L=0,N=0,O=0,Q=0,T=0,V=0,X=0,Y=0,Z=0,$=new Array(1024),rr=new Array(32),ar=$.length;ar--;)$[ar]=0;for(var ar=rr.length;ar--;)rr[ar]=2*Math.random()-1;for(var ar=0;b>ar;ar++){if(J)return ar;if(M&&++Y>=M&&(Y=0,this.reset()),c&&++f>=c&&(c=0,e*=h),n+=i,e*=n,e>s&&(e=s,d>0&&(J=!0)),E=e,U>0&&(Z+=j,E*=1+Math.sin(Z)*U),E|=0,8>E&&(E=8),C||(o+=v,0>o?o=0:o>.5&&(o=.5)),++L>P)switch(L=0,++K){case 1:P=a;break;case 2:P=t}switch(K){case 0:N=L*R;break;case 1:N=1+2*(1-L*W)*_;break;case 2:N=1-L*z;break;case 3:N=0,J=!0}x&&(q+=A,F=0|q,0>F?F=-F:F>1023&&(F=1023)),m&&g&&(y*=g,1e-5>y?y=1e-5:y>.1&&(y=.1)),I=0;for(var tr=8;tr--;){if(V++,V>=E&&(V%=E,3==C))for(var er=rr.length;er--;)rr[er]=2*Math.random()-1;switch(C){case 0:H=o>V/E?.5:-.5;break;case 1:H=1-V/E*2;break;case 2:G=V/E,G=6.28318531*(G>.5?G-1:G),H=1.27323954*G+.405284735*G*G*(0>G?1:-1),H=.225*((0>H?-1:1)*H*H-H)+H;break;case 3:H=rr[Math.abs(32*V/E|0)]}m&&(D=T,k*=S,0>k?k=0:k>.1&&(k=.1),l?(Q+=(H-T)*k,Q*=B):(T=H,Q=0),T+=Q,O+=T-D,O*=1-y,H=O),x&&($[X%1024]=H,H+=$[(X-F+1024)%1024],X++),I+=H}I*=.125*N*p,u[ar]=I>=1?32767:-1>=I?-32768:32767*I|0}return b}}var synth=new SfxrSynth;window.jsfxr=function(r){synth._params.setSettings(r);var a=synth.totalReset(),t=new Uint8Array(4*((a+1)/2|0)+44),e=2*synth.synthWave(new Uint16Array(t.buffer,44),a),s=new Uint32Array(t.buffer,0,44);s[0]=1179011410,s[1]=e+36,s[2]=1163280727,s[3]=544501094,s[4]=16,s[5]=65537,s[6]=44100,s[7]=88200,s[8]=1048578,s[9]=1635017060,s[10]=e,e+=44;for(var n=0,i="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",h="data:audio/wav;base64,";e>n;n+=3){var f=t[n]<<16|t[n+1]<<8|t[n+2];h+=i[f>>18]+i[f>>12&63]+i[f>>6&63]+i[63&f]}return h};
},{}],4:[function(require,module,exports){
(function(){
    'use strict';
    
    /*global ctx*/
        
    /*
     * A single explosion particle
     */
    function Particle ()
    {
      this.scale = 1.0;
      this.x = 0;
      this.y = 0;
      this.radius = 20;
      this.color = "#000";
      this.velocityX = 0;
      this.velocityY = 0;
      this.scaleSpeed = 0.5;

      this.update = function(ms)
      {
        // shrinking
        this.scale -= this.scaleSpeed * ms / 1000.0;

        if (this.scale <= 0)
        {
          this.scale = 0;
        }
        // moving away from explosion center
        this.x += this.velocityX * ms/1000.0;
        this.y += this.velocityY * ms/1000.0;
      };

      this.draw = function(ctx)
      {
        // translating the 2D context to the particle coordinates
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);

        // drawing a filled circle in the particle's local space
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI*2, true);
        ctx.closePath();

        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.restore();
      };
    }

    /*Collision effect particles*/
    var particles = [];

    function randomFloat (min, max){
      return min + Math.random()*(max-min);
    }

    /*
     * Advanced Explosion effect
     * Each particle has a different size, move speed and scale speed.
     * 
     * Parameters:
     *  x, y - explosion center
     *  color - particles' color
     */
    window.createExplosion = function (x, y, color)
    {
      var minSize = 10;
      var maxSize = 30;
      var count = 10;
      var minSpeed = 60.0;
      var maxSpeed = 200.0;
      var minScaleSpeed = 1.0;
      var maxScaleSpeed = 4.0;

      for (var angle=0; angle<360; angle += Math.round(360/count))
      {
        var particle = new Particle();

        particle.x = x;
        particle.y = y;

        particle.radius = randomFloat(minSize, maxSize);

        particle.color = color;

        particle.scaleSpeed = randomFloat(minScaleSpeed, maxScaleSpeed);

        var speed = randomFloat(minSpeed, maxSpeed);

        particle.velocityX = speed * Math.cos(angle * Math.PI / 180.0);
        particle.velocityY = speed * Math.sin(angle * Math.PI / 180.0);

        particles.push(particle);
      }
    };

    window.updateExplosion =  function (frameDelay)
    {
      // update and draw particles
      for (var i=0; i<particles.length; i++)
      {
        var particle = particles[i];

        particle.update(frameDelay);
        particle.draw(ctx);
      }
    };

})();
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9teXNjcmlwdCIsIi9Vc2Vycy9yYWNoaXQvRG9jdW1lbnRzL215L2dhbWVzL3NhdmVfbXlfZHVjay9zcmMvYXVkaW9wYW5lbC5qcyIsIi9Vc2Vycy9yYWNoaXQvRG9jdW1lbnRzL215L2dhbWVzL3NhdmVfbXlfZHVjay9zcmMvanNmeHIuanMiLCIvVXNlcnMvcmFjaGl0L0RvY3VtZW50cy9teS9nYW1lcy9zYXZlX215X2R1Y2svc3JjL3BhcnRpY2xlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbGZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbigpe1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICAvKmdsb2JhbCBqc2Z4ciwgc291bmRfYXJyYXksIGN0eCwgcmVxdWlyZSwgZXNjYXBlLCBjYW5jZWxSZXF1ZXN0QW5pbUZyYW1lLCBjYW5jZWxSZXF1ZXN0QW5pbUZyYW1lLCB1cGRhdGVFeHBsb3Npb24sIHJlcXVlc3RBbmltRnJhbWUsIGNyZWF0ZUV4cGxvc2lvbiovXG4gICAgLy8ganNoaW50IGVsaXNpb246IHRydWVcblxuICAgIHJlcXVpcmUoJy4vanNmeHIuanMnKTtcbiAgICByZXF1aXJlKCcuL2F1ZGlvcGFuZWwuanMnKTtcbiAgICByZXF1aXJlKCcuL3BhcnRpY2xlLmpzJyk7XG5cbiAgICB3aW5kb3cub25sb2FkPWZ1bmN0aW9uKCl7XG4gICAgICAvLyBSZXF1ZXN0QW5pbUZyYW1lOiBhIGJyb3dzZXIgQVBJIGZvciBnZXR0aW5nIHNtb290aCBhbmltYXRpb25zXG4gICAgd2luZG93LnJlcXVlc3RBbmltRnJhbWUgPSAoZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgICB8fCBcbiAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCBcbiAgICAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSAgICB8fCBcbiAgICAgICAgd2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgICB8fCBcbiAgICAgICAgd2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICB8fCAgXG4gICAgICAgIGZ1bmN0aW9uKCBjYWxsYmFjayApe1xuICAgICAgICAgIHJldHVybiB3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKTtcbiAgICAgICAgfTtcbiAgICB9KSgpO1xuXG4gICAgd2luZG93LmNhbmNlbFJlcXVlc3RBbmltRnJhbWUgPSAoIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSAgICAgICAgICB8fFxuICAgICAgICB3aW5kb3cud2Via2l0Q2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgIHx8XG4gICAgICAgIHdpbmRvdy5tb3pDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgICAgfHxcbiAgICAgICAgd2luZG93Lm9DYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgIHx8XG4gICAgICAgIHdpbmRvdy5tc0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgICAgfHxcbiAgICAgICAgY2xlYXJUaW1lb3V0O1xuICAgIH0gKSgpO1xuXG4gICAgLy9HbG9iYWwgRWxlbWVudHNcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xuICAgIHdpbmRvdy5jdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICB2YXIgaXNQYXVzZWQgPSBmYWxzZTtcbiAgICB2YXIgbGV2ZWw9MTtcbiAgICB2YXIgZ3Jhdml0eT00O1xuICAgIHZhciBmb3JjZUZhY3Rvcj0wLjM7XG4gICAgdmFyIG1vdXNlRG93bj1mYWxzZTtcbiAgICB2YXIgYmFsbHM9W107XG4gICAgdmFyIGRpcmVjdGlvbk9mRHVjaz0wO1xuICAgIHZhciBvdmVyPTA7XG4gICAgdmFyIHBvaW50cz0wO1xuICAgIHZhciBsaWZlcz0zO1xuICAgIHZhciBkdWNrV29yZHM9W1wiT3VjY2NoISFcIixcIlVoaCEgVGhpcyBodXJ0cyFcIixcIk1pbmQgbXkgaGVhZCAhXCIsXCJCYWxscyBhcmUgaGVhdnkgISFcIl1cbiAgICB2YXIgbW91c2VQb3M9W107XG4gICAgLy8gbWluaW11bSBhbmQgbWF4aW11bSBiYWxsIGxpbWl0cy5cbiAgICB2YXIgbWluQmFsbD0yO1xuICAgIHZhciByYW5nZUJhbGw9NDtcbiAgICB2YXIgbGV2ZWxDb2xvciA9ICcjODdDRUVFJztcbiAgICB2YXIgaW5pdDtcblxuICAgIHZhciBXID0gd2luZG93LmlubmVyV2lkdGgsIC8vIFdpbmRvdydzIHdpZHRoXG4gICAgSCA9IHdpbmRvdy5pbm5lckhlaWdodDsgLy8gV2luZG93J3MgaGVpZ2h0XG5cblxuICAgIC8vR3JhcGhpY3MgQ29kZVxuICAgIGZ1bmN0aW9uIGNpcmNsZSh4LHkscixjKXtcbiAgICAgIFxuICAgICAgdmFyIGdyYWRpZW50ID0gY3R4LmNyZWF0ZVJhZGlhbEdyYWRpZW50KHgsIHksIDUsIHgsIHksIHIrMik7XG4gICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMSwgYyk7XG4gICAgICBjdHguZmlsbFN0eWxlPWdyYWRpZW50O1xuICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgY3R4LmFyYyh4LHksciwwLDIqTWF0aC5QSSx0cnVlKTtcbiAgICAgIFxuICAgICAgY3R4LmZpbGwoKTtcbiAgICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcmF3YmFsbCgpe1xuICAgICAgdGhpcy52eSs9Z3Jhdml0eSowLjE7XG4gICAgICB0aGlzLngrPXRoaXMudngqMC4xO1xuICAgICAgdGhpcy55Kz10aGlzLnZ5KjAuMTtcbiAgICAgIC8vbW92ZSB0aGUgbWFsbFxuICAgICAgaWYodGhpcy54K3RoaXMucj5jYW52YXMud2lkdGgpe1xuICAgICAgICB0aGlzLng9Y2FudmFzLndpZHRoLXRoaXMucjtcbiAgICAgICAgdGhpcy52eCo9LTEqdGhpcy5iO1xuICAgICAgfVxuICAgICAgaWYodGhpcy54LXRoaXMucjwwKXtcbiAgICAgICAgdGhpcy54PXRoaXMucjtcbiAgICAgICAgdGhpcy52eCo9LTEqdGhpcy5iO1xuICAgICAgfVxuICAgICAgaWYodGhpcy55K3RoaXMucj5jYW52YXMuaGVpZ2h0KXtcbiAgICAgICAgdGhpcy55PWNhbnZhcy5oZWlnaHQtdGhpcy5yO1xuICAgICAgICB0aGlzLnZ5Kj0tMSp0aGlzLmI7XG4gICAgICB9XG4gICAgICBpZih0aGlzLnktdGhpcy5yPDApe1xuICAgICAgICB0aGlzLnk9dGhpcy5yO1xuICAgICAgICB0aGlzLnZ5Kj0tMSp0aGlzLmI7XG4gICAgICB9XG4gICAgICBjaXJjbGUodGhpcy54LHRoaXMueSx0aGlzLnIsdGhpcy5jKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBCYWxsKHBvc2l0aW9uWCxwb3NpdGlvblksdmVsb2NpdHlYLHZlbG9jaXR5WSxyYWRpdXMsYm91bmNpbmVzcyxjb2xvcil7XG4gICAgICB0aGlzLng9cG9zaXRpb25YO1xuICAgICAgdGhpcy55PXBvc2l0aW9uWTtcbiAgICAgIHRoaXMudng9dmVsb2NpdHlYO1xuICAgICAgdGhpcy52eT12ZWxvY2l0eVk7XG4gICAgICB0aGlzLnI9cmFkaXVzO1xuICAgICAgdGhpcy5iPWJvdW5jaW5lc3M7XG4gICAgICB0aGlzLmM9Y29sb3I7XG5cbiAgICAgIHRoaXMuZHJhdz1kcmF3YmFsbDtcbiAgICB9XG4gICAgXG4gICAgZnVuY3Rpb24gRHVjayhwb3NpdGlvblgscG9zaXRpb25ZLHZlbG9jaXR5WCx2ZWxvY2l0eVksd2lkdGgsaGVpZ2h0KXtcbiAgICAgIHRoaXMuZHVja3g9cG9zaXRpb25YO1xuICAgICAgdGhpcy5kdWNreT1wb3NpdGlvblk7XG4gICAgICB0aGlzLmR1Y2t2eD12ZWxvY2l0eVg7XG4gICAgICB0aGlzLmR1Y2t2eT12ZWxvY2l0eVk7XG4gICAgICB0aGlzLndpZHRoPXdpZHRoO1xuICAgICAgdGhpcy5oZWlnaHQ9aGVpZ2h0O1xuXG4gICAgICB0aGlzLmRyYXc9ZHJhd2R1Y2s7XG4gICAgfVxuICAgIFxuICAgIHZhciBkdWNrU2F2ZSA9IG5ldyBEdWNrKDUwLGNhbnZhcy5oZWlnaHQtNzUsMjAsMCw3NSw3NSk7XG4gICAgdmFyIGR1Y2tXb3Jkc0ltZz1uZXcgSW1hZ2UoKTtcblxuICAgIGR1Y2tXb3Jkc0ltZy5zcmM9XCJpbWFnZXMvZHVja2xpbmcucG5nXCI7XG5cbiAgICBmdW5jdGlvbiBzZXRQb2ludCgpe1xuICAgICAgcG9pbnRzKz0xMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByYW5kb21fY29sb3IoKXtcbiAgICAgIHZhciBsZXR0ZXJzPVwiMDEyMzQ1Njc4OUFCQ0RFRlwiLnNwbGl0KCcnKTtcbiAgICAgIHZhciBjb2xvcj1cIiNcIjtcbiAgICAgIGZvcih2YXIgaT0wO2k8PTU7aSsrKXtcbiAgICAgICAgY29sb3IrPWxldHRlcnNbTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpKjE1KV07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb2xvcjtcbiAgICB9XG5cbiAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG5cbiAgICBmdW5jdGlvbiBkcmF3ZHVjaygpe1xuICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgdGhpcy5kdWNreC09dGhpcy5kdWNrdngqMC4xO1xuICAgICAgaWYodGhpcy5kdWNreCt0aGlzLndpZHRoPmNhbnZhcy53aWR0aCl7XG4gICAgICAgIHRoaXMuZHVja3Z4Kj0tMTtcbiAgICAgICAgdGhpcy5kdWNreD1jYW52YXMud2lkdGgtNzU7XG4gICAgICAgIGRpcmVjdGlvbk9mRHVjaz0xO1xuICAgICAgfVxuICAgICAgaWYodGhpcy5kdWNreC01MDwwKXtcbiAgICAgICAgdGhpcy5kdWNreD01MDtcbiAgICAgICAgdGhpcy5kdWNrdngqPS0xO1xuICAgICAgICBkaXJlY3Rpb25PZkR1Y2s9MDtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaW1nLnNyYyA9IFwiaW1hZ2VzL2R1Y2tsaW5nLnBuZ1wiO1xuICAgICAgXG4gICAgICBpZihkaXJlY3Rpb25PZkR1Y2sgPT09IDEpe1xuICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICBjdHgudHJhbnNsYXRlKDAsIDApO1xuICAgICAgICBjdHguc2NhbGUoLTEsIDEpO1xuICAgICAgICBjdHguZHJhd0ltYWdlKGltZywtdGhpcy5kdWNreC03NSx0aGlzLmR1Y2t5LHRoaXMud2lkdGgsdGhpcy5oZWlnaHQpOyAgXG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgICAgIFxuICAgICAgfWVsc2V7XG4gICAgICAgIGN0eC5kcmF3SW1hZ2UoaW1nLHRoaXMuZHVja3gtMTIuNSx0aGlzLmR1Y2t5LHRoaXMud2lkdGgsdGhpcy5oZWlnaHQpOyAgXG4gICAgICB9IFxuICAgICAgXG4gICAgfVxuXG4gICAgLy9PYmplY3RzXG4gICAgZnVuY3Rpb24gYmFsbGdlbmVyYXRvcigpe1xuICAgICAgaWYoaXNQYXVzZWQpe1xuICAgICAgICByZXR1cm4gO1xuICAgICAgfVxuICAgICAgZm9yKHZhciBpPTc1O2k8PWNhbnZhcy53aWR0aDtpPWkrKGNhbnZhcy53aWR0aC9NYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkqbWluQmFsbCtyYW5nZUJhbGwpKSl7XG4gICAgICAgIGJhbGxzLnB1c2gobmV3IEJhbGwoaSw1MCwoTWF0aC5yYW5kb20oKSoxMDArMjApKmZvcmNlRmFjdG9yLChNYXRoLnJhbmRvbSgpKjEwMC0yMCkqZm9yY2VGYWN0b3IsKDIwK01hdGgucmFuZG9tKCkqMzApLDAuOSxyYW5kb21fY29sb3IoKSkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFuaW1sb29wKCkge1xuICAgICAgaW5pdCA9IHJlcXVlc3RBbmltRnJhbWUoYW5pbWxvb3ApO1xuICAgICAgaWYoIWlzUGF1c2VkKXtcbiAgICAgICAgZ2FtZV9sb29wKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY2FudmFzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgY2FudmFzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuICAgIGZ1bmN0aW9uIGdhbWVPdmVyKCkge1xuICAgICAgY3R4LnNhdmUoKTtcbiAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgIGN0eC5mb250ID0gXCIzMHB4IExhdHRlXCI7XG4gICAgICBjdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcbiAgICAgIGN0eC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xuICAgICAgY3R4LnRleHRCYXNlbGluZSA9ICdhbHBoYWJldGljJztcbiAgICAgIGN0eC5zY2FsZSgxLDEpO1xuICAgICAgY3R4LmZpbGxTdHlsZT1cIndoaXRlXCJcbiAgICAgIGN0eC53cmFwVGV4dChcIkdhbWUgT3ZlciAtIFlvdSBIYXZlIFNjb3JlZCBcIitwb2ludHMrXCIgUG9pbnRzLlxcbllpcHBpIDopICFcIiwgVy8yLCBILzIgKyA1MCAsIHdpbmRvdy5pbm5lcldpZHRoKjAuNywgMzApO1xuICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICAgIC8vIFN0b3AgdGhlIEFuaW1hdGlvXG4gICAgICBjYW5jZWxSZXF1ZXN0QW5pbUZyYW1lKGluaXQpO1xuICAgICAgb3Zlcj0xO1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncmVzdGFydC1idXR0b24nKVswXS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCd0d2VldC1idXR0b24nKVswXS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNoZWNrQmxhc3QoYmFsbCxpLGV2dCl7XG4gICAgICBpZihNYXRoLnBvdygoZXZ0LnBhZ2VYIC0gYmFsbC54KSwyKSArIE1hdGgucG93KChldnQucGFnZVkgLSBiYWxsLnkpLDIpIDwgTWF0aC5wb3coYmFsbC5yLDIpKXtcbiAgICAgICAgY3JlYXRlRXhwbG9zaW9uKGJhbGwueCwgYmFsbC55LCBiYWxsLmMpO1xuICAgICAgICBiYWxsLmM9XCIjZjAwXCI7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblxuICAgICAgICAgIGJhbGxzLnNwbGljZShpLDEpO1xuICAgICAgICAgIHNldFBvaW50KCk7XG4gICAgICAgIH0sNzApO1xuICAgICAgICBcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsZXZlbENvbG9yR2VuZXJhdG9yKGNvbG9yLCBwZXJjZW50KSB7ICAgXG4gICAgICAvKmpzbGludCBiaXR3aXNlOiB0cnVlICovXG4gICAgICB2YXIgZj1wYXJzZUludChjb2xvci5zbGljZSgxKSwxNiksdD1wZXJjZW50PDA/MDoyNTUscD1wZXJjZW50PDA/cGVyY2VudCotMTpwZXJjZW50LFI9Zj4+MTYsRz1mPj44JjB4MDBGRixCPWYmMHgwMDAwRkY7XG4gICAgICByZXR1cm4gXCIjXCIrKDB4MTAwMDAwMCsoTWF0aC5yb3VuZCgodC1SKSpwKStSKSoweDEwMDAwKyhNYXRoLnJvdW5kKCh0LUcpKnApK0cpKjB4MTAwKyhNYXRoLnJvdW5kKCh0LUIpKnApK0IpKS50b1N0cmluZygxNikuc2xpY2UoMSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHVja0JhbGxDb2xsaWRpbmcoY2lyY2xlLHJlY3Qpe1xuICAgICAgdmFyIGRpc3RYID0gTWF0aC5hYnMoY2lyY2xlLnggLSByZWN0LmR1Y2t4LXJlY3Qud2lkdGgvMikrMTU7XG4gICAgICB2YXIgZGlzdFkgPSBNYXRoLmFicyhjaXJjbGUueSAtIHJlY3QuZHVja3ktcmVjdC5oZWlnaHQvMikrMTU7XG5cbiAgICAgIGlmIChkaXN0WCA+IChyZWN0LndpZHRoLzIgKyBjaXJjbGUucikpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgICBpZiAoZGlzdFkgPiAocmVjdC5oZWlnaHQvMiArIGNpcmNsZS5yKSkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgICAgaWYgKGRpc3RYIDw9IChyZWN0LndpZHRoLzIpKSB7IHJldHVybiB0cnVlOyB9IFxuICAgICAgaWYgKGRpc3RZIDw9IChyZWN0LmhlaWdodC8yKSkgeyByZXR1cm4gdHJ1ZTsgfVxuXG4gICAgICB2YXIgZHg9ZGlzdFgtcmVjdC53aWR0aC8yO1xuICAgICAgdmFyIGR5PWRpc3RZLXJlY3QuaGVpZ2h0LzI7XG4gICAgICByZXR1cm4gKGR4KmR4K2R5KmR5PD0oY2lyY2xlLnIqY2lyY2xlLnIpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjaGVja0R1Y2tIaXQoZHVja1NhdmUsIGNsaWNrKXtcbiAgICAgIGlmKChjbGljay5wYWdlWCA+PSBkdWNrU2F2ZS5kdWNreCkgJiYgKGNsaWNrLnBhZ2VYIDw9IGR1Y2tTYXZlLmR1Y2t4ICsgZHVja1NhdmUud2lkdGgpICYmXG4gICAgICAgICAgKGNsaWNrLnBhZ2VZID49IGR1Y2tTYXZlLmR1Y2t5KSAmJiAoY2xpY2sucGFnZVkgPD0gZHVja1NhdmUuZHVja3kgKyBkdWNrU2F2ZS5oZWlnaHQpKXtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc1wiKS5zdHlsZS5iYWNrZ3JvdW5kID0gJyM1Nzg3ZTUnO1xuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJjYWxsb3V0XCIpWzBdLmNsYXNzTGlzdC5hZGQoXCJoaXRcIik7XG4gICAgICAgICAgaXNQYXVzZWQ9dHJ1ZTtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiY2FsbG91dFwiKVswXS5pbm5lckhUTUwgPSAnV1RGJztcbiAgICAgICAgICBzb3VuZF9hcnJheS5wbGF5KCdkdWNrJyk7XG4gICAgICAgICAgY3R4LmRyYXdJbWFnZShkdWNrV29yZHNJbWcsVy8yLTEwMCxILzIsMTAwLDEwMCk7XG4gICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlzUGF1c2VkPWZhbHNlO1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW52YXNcIikuc3R5bGUuYmFja2dyb3VuZCA9IGxldmVsQ29sb3I7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiY2FsbG91dFwiKVswXS5jbGFzc0xpc3QucmVtb3ZlKFwiaGl0XCIpO1xuICAgICAgICAgIH0sMTAwMCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELnByb3RvdHlwZS53cmFwVGV4dCA9IGZ1bmN0aW9uICh0ZXh0LCB4LCB5LCBtYXhXaWR0aCwgbGluZUhlaWdodCkge1xuXG4gICAgICAgIHZhciBsaW5lcyA9IHRleHQuc3BsaXQoXCJcXG5cIik7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICB2YXIgd29yZHMgPSBsaW5lc1tpXS5zcGxpdCgnICcpO1xuICAgICAgICAgICAgdmFyIGxpbmUgPSAnJztcblxuICAgICAgICAgICAgZm9yICh2YXIgbiA9IDA7IG4gPCB3b3Jkcy5sZW5ndGg7IG4rKykge1xuICAgICAgICAgICAgICAgIHZhciB0ZXN0TGluZSA9IGxpbmUgKyB3b3Jkc1tuXSArICcgJztcbiAgICAgICAgICAgICAgICB2YXIgbWV0cmljcyA9IHRoaXMubWVhc3VyZVRleHQodGVzdExpbmUpO1xuICAgICAgICAgICAgICAgIHZhciB0ZXN0V2lkdGggPSBtZXRyaWNzLndpZHRoO1xuICAgICAgICAgICAgICAgIGlmICh0ZXN0V2lkdGggPiBtYXhXaWR0aCAmJiBuID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpbGxUZXh0KGxpbmUsIHgsIHkpO1xuICAgICAgICAgICAgICAgICAgICBsaW5lID0gd29yZHNbbl0gKyAnICc7XG4gICAgICAgICAgICAgICAgICAgIHkgKz0gbGluZUhlaWdodDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmUgPSB0ZXN0TGluZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuZmlsbFRleHQobGluZSwgeCwgeSk7XG4gICAgICAgICAgICB5ICs9IGxpbmVIZWlnaHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvL0V2ZW50IEhhbmRsZXJcbiAgICBmdW5jdGlvbiBvbk1vdXNlRG93bihldnQpe1xuICAgICAgLy9UT0RPOiBTaG90IHRoZSBiYWxsLlxuICAgICAgaWYoaXNQYXVzZWQpe1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzb3VuZF9hcnJheS5wbGF5KCdzaG9vdCcpO1xuICAgICAgICAvLyBWYXJpYWJsZXMgZm9yIHN0b3JpbmcgbW91c2UgcG9zaXRpb24gb24gY2xpY2tcbiAgICAgICAgdmFyIG14ID0gZXZ0LnBhZ2VYLFxuICAgICAgICAgICAgbXkgPSBldnQucGFnZVk7XG4gICAgICAgIFxuICAgICAgICAvLyBDbGljayBzdGFydCBidXR0b25cbiAgICAgICAgaWYoZXZ0LnRhcmdldC5jbGFzc05hbWUgPT09ICdzdGFydC1idXR0b24nKSB7XG4gICAgICAgICAgZHVja1NhdmU9bmV3IER1Y2soNTAsY2FudmFzLmhlaWdodC03NSwyMCwwLDc1LDc1KTtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiaW5zdHJ1Y3Rpb24tY29udGFpbmVyXCIpWzBdLnN0eWxlLnZpc2liaWxpdHk9XCJoaWRkZW5cIjtcbiAgICAgICAgICAoZnVuY3Rpb24oKXsgICAgIFxuICAgICAgICAgICAgICB2YXIgc2VjID0gNTsgIFxuICAgICAgICAgICAgICB2YXIgaWQgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7IFxuICAgICAgICAgICAgICAgICAgc3dpdGNoKHNlYyl7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJjb3VudFwiKVswXS5pbm5lckhUTUwgPSBcIkJMQVNUXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImNvdW50XCIpWzBdLmlubmVySFRNTCA9IFwiTEVUJ1NcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImNvdW50XCIpWzBdLmlubmVySFRNTCA9IHNlYztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7ICAgIFxuXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBpZiAoc2VjID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImNvdW50XCIpWzBdLnN0eWxlLnZpc2liaWxpdHk9XCJoaWRkZW5cIlxuICAgICAgICAgICAgICAgICAgICAgIGJhbGxnZW5lcmF0b3IoKTtcbiAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhbGxnZW5lcmF0b3IoKTtcbiAgICAgICAgICAgICAgICAgICAgICB9LDUwMDArbGV2ZWwqMTAwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgfSAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgc2VjLS07XG4gICAgICAgICAgICAgIH0sIDEwMDApXG4gICAgICAgICAgfSkoKTtcblxuICAgICAgICAgIGFuaW1sb29wKCk7IFxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJzdGFydC1idXR0b25cIilbMF0uc3R5bGUudmlzaWJpbGl0eT1cImhpZGRlblwiXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIElmIHRoZSBnYW1lIGlzIG92ZXIsIGFuZCB0aGUgcmVzdGFydCBidXR0b24gaXMgY2xpY2tlZFxuICAgICAgICBpZihvdmVyID09PSAxKSB7XG4gICAgICAgICAgaWYoZXZ0LnRhcmdldC5jbGFzc05hbWUgPT09ICdyZXN0YXJ0LWJ1dHRvbicpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3Jlc3RhcnQtYnV0dG9uJylbMF0uc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCd0d2VldC1idXR0b24nKVswXS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgICAgICAgIGJhbGxzPVtdO1xuICAgICAgICAgICAgcG9pbnRzPTA7XG4gICAgICAgICAgICBvdmVyID0gMDtcbiAgICAgICAgICAgIGxldmVsPTE7XG4gICAgICAgICAgICBsaWZlcz0zO1xuICAgICAgICAgICAgbWluQmFsbD0yXG4gICAgICAgICAgICByYW5nZUJhbGw9NDtcbiAgICAgICAgICAgIGZvcmNlRmFjdG9yPTAuMztcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FudmFzXCIpLnN0eWxlLmJhY2tncm91bmQgPSAnIzg3Q0VFRSc7XG4gICAgICAgICAgICBkaXJlY3Rpb25PZkR1Y2s9MDtcbiAgICAgICAgICAgIGR1Y2tTYXZlPW5ldyBEdWNrKDUwLGNhbnZhcy5oZWlnaHQtNzUsMjAsMCw3NSw3NSk7XG4gICAgICAgICAgICBhbmltbG9vcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmIChldnQudGFyZ2V0LmNsYXNzTmFtZSA9PT0gJ3R3ZWV0LWJ1dHRvbicpe1xuICAgICAgICAgICAgdmFyIHR3ZWV0VGV4dCA9ICdXYW5uYSBCZWF0IG15IHNjb3JlICcrcG9pbnRzKyAnISBpbiAjU2F2ZU15RHVjayBhdCBodHRwOi8vcmFjaGl0Z3VsYXRpLmNvbS9TYXZlTXlEdWNrLy4gSXQgaXMgYW4gYXdlc29tZSBnYW1lISBjcmFmdGVkIGJ5IEBzcXVpcm9pZCc7XG4gICAgICAgICAgICB0d2VldFRleHQgPSBlc2NhcGUodHdlZXRUZXh0KTtcbiAgICAgICAgICAgIHZhciB0d2VldF91cmwgPSAnaHR0cHM6Ly90d2l0dGVyLmNvbS9pbnRlbnQvdHdlZXQ/dGV4dD0nK3R3ZWV0VGV4dDtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3R3ZWV0LWJ1dHRvbicpWzBdLnNldEF0dHJpYnV0ZSgnaHJlZicsIHR3ZWV0X3VybCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvcih2YXIgaT0wO2k8YmFsbHMubGVuZ3RoO2krKyl7XG4gICAgICAgICAgY2hlY2tCbGFzdChiYWxsc1tpXSxpLGV2dCk7XG4gICAgICAgIH1cbiAgICAgICAgY2hlY2tEdWNrSGl0KGR1Y2tTYXZlLCBldnQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2l6ZVdpbmRvdyhldnQpe1xuICAgICAgaXNQYXVzZWQ9ZmFsc2U7XG4gICAgICBjYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgY2FudmFzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICBpZihkdWNrU2F2ZSAmJiBpc1BhdXNlZCA9PT0gZmFsc2UgJiYgd2luZG93LmdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInN0YXJ0LWJ1dHRvblwiKVswXSkudmlzaWJpbGl0eSA9PT0gXCJoaWRkZW5cIil7XG4gICAgICAgIGR1Y2tTYXZlLmR1Y2t5PWNhbnZhcy5oZWlnaHQtNzU7XG4gICAgICAgIGR1Y2tTYXZlLmRyYXcoKTtcbiAgICAgIH1cbiAgICAgIGlzUGF1c2VkPXRydWU7XG4gICAgfVxuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLGZ1bmN0aW9uKGUpe1xuICAgICAgb25Nb3VzZURvd24oZSk7XG4gICAgfSk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIixmdW5jdGlvbihlKXtcbiAgICAgIGlzUGF1c2VkPXRydWU7XG4gICAgfSk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImZvY3VzXCIsZnVuY3Rpb24oZSl7XG4gICAgICBpc1BhdXNlZD1mYWxzZTtcbiAgICB9KTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLGZ1bmN0aW9uKGUpe1xuICAgICAgY3JlYXRlRXhwbG9zaW9uKGUuY2xpZW50WCwgZS5jbGllbnRZLCBcIiNDQjcwMTNcIik7XG4gICAgfSk7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLGZ1bmN0aW9uKGUpe1xuICAgICAgaWYob3Zlcil7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmKGUua2V5Q29kZT09PTMyKXtcbiAgICAgICAgaXNQYXVzZWQ9IWlzUGF1c2VkO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIixmdW5jdGlvbihlKXtcbiAgICAgIHJlc2l6ZVdpbmRvdyhlKTtcbiAgICB9KTsgICAgICAgIFxuXG4gICAgZnVuY3Rpb24gY29sbGlzaW9uKCl7XG4gICAgICBmb3IodmFyIGk9MDtpPGJhbGxzLmxlbmd0aDtpKyspe1xuICAgICAgICBpZiAoZHVja0JhbGxDb2xsaWRpbmcoYmFsbHNbaV0sZHVja1NhdmUpPT09dHJ1ZSkge1xuICAgICAgICAgIFxuICAgICAgICAgIGNyZWF0ZUV4cGxvc2lvbihiYWxsc1tpXS54LCBiYWxsc1tpXS55LCAnI2YwMCcpO1xuICAgICAgICAgIFxuICAgICAgICAgIGJhbGxzLnNwbGljZShpLDEpO1xuICAgICAgICAgIGxpZmVzLS07XG5cbiAgICAgICAgICBzb3VuZF9hcnJheS5wbGF5KCdkdWNrJyk7XG4gICAgICAgICAgaWYobGlmZXM+PTEpe1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW52YXNcIikuc3R5bGUuYmFja2dyb3VuZCA9ICcjNTc4N2U1JztcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJjYWxsb3V0XCIpWzBdLmlubmVySFRNTCA9IGR1Y2tXb3Jkc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMyldO1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImNhbGxvdXRcIilbMF0uY2xhc3NMaXN0LmFkZChcImhpdFwiKTsgICAgICAgIFxuICAgICAgICAgICAgaXNQYXVzZWQ9dHJ1ZTtcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoZHVja1dvcmRzSW1nLFcvMi0xMDAsSC8yLDEwMCwxMDApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICBpc1BhdXNlZD1mYWxzZTtcbiAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW52YXNcIikuc3R5bGUuYmFja2dyb3VuZCA9IGxldmVsQ29sb3I7XG4gICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJjYWxsb3V0XCIpWzBdLmNsYXNzTGlzdC5yZW1vdmUoXCJoaXRcIik7XG4gICAgICAgICAgICB9LDEwMDApO1xuXG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYobGlmZXM9PT0wKXtcbiAgICAgICAgICAgIHNvdW5kX2FycmF5LnBsYXkoJ2R1Y2snKTtcbiAgICAgICAgICAgIGdhbWVPdmVyKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICB9XG4gICAgZnVuY3Rpb24gZGVmaW5lbGV2ZWwoKXtcbiAgICAgIGlmKHBvaW50cy8yMDAtbGV2ZWw9PT0wKXtcbiAgICAgICAgbGV2ZWwrKztcbiAgICAgICAgbGlmZXMrPTI7XG4gICAgICAgIGZvcmNlRmFjdG9yKz0wLjA1O1xuICAgICAgICBtaW5CYWxsKz0xO1xuICAgICAgICByYW5nZUJhbGwrPTE7XG4gICAgICAgIFxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc1wiKS5zdHlsZS5iYWNrZ3JvdW5kID0gJyM1RkJBN0QnO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiY2FsbG91dFwiKVswXS5pbm5lckhUTUwgPSAnQ29uZ3JhdHMgWW91IEFyZSBPbiBMZXZlbCAnK2xldmVsO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiY2FsbG91dFwiKVswXS5jbGFzc0xpc3QuYWRkKFwibGV2ZWxVcFwiKTtcbiAgICAgICAgXG4gICAgICAgIGN0eC5kcmF3SW1hZ2UoZHVja1dvcmRzSW1nLFcvMi0xMDAsSC8yLDEwMCwxMDApO1xuXG4gICAgICAgIGlzUGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpc1BhdXNlZD1mYWxzZTtcbiAgICAgICAgICAgIGxldmVsQ29sb3IgPSBsZXZlbENvbG9yR2VuZXJhdG9yKGxldmVsQ29sb3IsIDUpO1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW52YXNcIikuc3R5bGUuYmFja2dyb3VuZCA9IGxldmVsQ29sb3I7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiY2FsbG91dFwiKVswXS5jbGFzc0xpc3QucmVtb3ZlKFwibGV2ZWxVcFwiKTtcbiAgICAgICAgICAgIGJhbGxzID0gW107XG4gICAgICAgICAgICBjYW5jZWxSZXF1ZXN0QW5pbUZyYW1lKGluaXQpO1xuICAgICAgICAgICAgYW5pbWxvb3AoKTtcbiAgICAgICAgICB9LDEwMDApO1xuICAgICAgfVxuICAgIH1cbiAgICAvL0dhbWUgbG9vcFxuICAgIGZ1bmN0aW9uIGdhbWVfbG9vcCgpe1xuICAgICAgdmFyIGk7XG4gICAgICBjdHguY2xlYXJSZWN0KDAsMCxjYW52YXMud2lkdGgsY2FudmFzLmhlaWdodCk7XG4gICAgICBkdWNrU2F2ZS5kcmF3KCk7XG4gICAgICBcbiAgICAgIGZvcihpPTA7aTxiYWxscy5sZW5ndGg7aSsrKXtcbiAgICAgICAgYmFsbHNbaV0uZHJhdygpO1xuICAgICAgfVxuICAgICAgY29sbGlzaW9uKCk7XG4gICAgICB1cGRhdGVFeHBsb3Npb24oMTAwMC82MCk7XG4gICAgICBkZWZpbmVsZXZlbCgpO1xuICAgICAgY3R4LnNhdmUoKTtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBcIndoaXRlXCI7XG4gICAgICBjdHguZm9udCA9IFwiMzBweCBMYXR0ZVwiO1xuICAgICAgY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XG4gICAgICBjdHgudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcbiAgICAgIGN0eC50ZXh0QmFzZWxpbmUgPSAnYWxwaGFiZXRpYyc7XG4gICAgICBjdHguc2NhbGUoMSwxKTtcbiAgICAgIGlmKHdpbmRvdy5pbm5lcldpZHRoPDUwMCl7XG4gICAgICAgIGN0eC5maWxsVGV4dChcIlNDT1JFOiBcIitwb2ludHMsVy04MCw1MCk7ICBcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgIGN0eC5maWxsVGV4dChcIlNDT1JFOiBcIitwb2ludHMsVy8yLDUwKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgZm9yKGk9MDtpPGxpZmVzO2krKyl7XG4gICAgICAgIHZhciBkdWNrTGlmZT1uZXcgRHVjayhXLzItNTAraSo0MCw3MCwwLDAsNDAsNDApO1xuICAgICAgICBkdWNrTGlmZS5kcmF3KCk7XG4gICAgICB9XG4gICAgICBjdHguZmlsbFN0eWxlID0gXCJ3aGl0ZVwiO1xuICAgICAgY3R4LmZpbGxUZXh0KFwiTEVWRUw6IFwiK2xldmVsLDgwLDUwKTtcbiAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgfVxuXG4gICAgfVxuXG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICAvKmdsb2JhbCBqc2Z4ciwgc291bmRfYXJyYXkqL1xuICAgIC8vIGpzaGludCBlbGlzaW9uOiB0cnVlXG5cbiAgICBmdW5jdGlvbiBBdWRpb1BhbmVsKCkge1xuICAgICAgdGhpcy5zb3VuZHMgPSB7fTtcbiAgICB9XG4gICAgQXVkaW9QYW5lbC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oIGtleSwgY291bnQsIHNldHRpbmdzICkge1xuICAgICAgdGhpcy5zb3VuZHNbIGtleSBdID0gW107XG4gICAgICBzZXR0aW5ncy5mb3JFYWNoKCBmdW5jdGlvbiggZWxlbSwgaW5kZXggKSB7XG4gICAgICAgIHRoaXMuc291bmRzWyBrZXkgXS5wdXNoKCB7XG4gICAgICAgICAgdGljazogMCxcbiAgICAgICAgICBjb3VudDogY291bnQsXG4gICAgICAgICAgcG9vbDogW11cbiAgICAgICAgfSApO1xuICAgICAgICBmb3IoIHZhciBpID0gMDsgaSA8IGNvdW50OyBpKysgKSB7XG4gICAgICAgICAgdmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCk7XG4gICAgICAgICAgYXVkaW8uc3JjID0ganNmeHIoIGVsZW0gKTtcbiAgICAgICAgICB0aGlzLnNvdW5kc1sga2V5IF1bIGluZGV4IF0ucG9vbC5wdXNoKCBhdWRpbyApO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzICk7XG4gICAgfTtcbiAgICBBdWRpb1BhbmVsLnByb3RvdHlwZS5wbGF5ID0gZnVuY3Rpb24oIGtleSApIHtcbiAgICAgIHZhciBzb3VuZCA9IHRoaXMuc291bmRzWyBrZXkgXTtcbiAgICAgIHZhciBzb3VuZERhdGEgPSBzb3VuZC5sZW5ndGggPiAxID8gc291bmRbIE1hdGguZmxvb3IoIE1hdGgucmFuZG9tKCkgKiBzb3VuZC5sZW5ndGggKSBdIDogc291bmRbIDAgXTtcbiAgICAgIHNvdW5kRGF0YS5wb29sWyBzb3VuZERhdGEudGljayBdLnBsYXkoKTtcbiAgICAgIHNvdW5kRGF0YS50aWNrID0gKHNvdW5kRGF0YS50aWNrIDwgc291bmREYXRhLmNvdW50IC0gMSkgPyBzb3VuZERhdGEudGljaysxIDowO1xuICAgIH07XG5cbiAgICB3aW5kb3cuc291bmRfYXJyYXkgPSBuZXcgQXVkaW9QYW5lbCgpO1xuXG4gICAgc291bmRfYXJyYXkuYWRkKCAnZHVjaycsIDEwLFxuICAgICAgW1xuICAgICAgICBbMSwsMC4yNzEsLDAuNDIsMC4zOTE2LCwwLjI0MDYsLCwsLCwsLDAuNTgwMywsLDEsLCwsLDAuNV1cbiAgICAgIF1cbiAgICApO1xuXG4gICAgc291bmRfYXJyYXkuYWRkKCAnc2hvb3QnLCA1LFxuICAgICAgW1xuICAgICAgICBbMCwsMC4wMSwsMC40Mzg0LDAuMiwsMC4xMiwwLjI4LDEsMC42NSwsLDAuMDQxOSwsLCwsMSwsLCwsMC4zXVxuICAgICAgXVxuICAgICk7XG5cbiAgICBzb3VuZF9hcnJheS5hZGQoICdiYWNncm91bmQnLCAzLFxuICAgICAgW1xuICAgICAgICBbMSwwLjY4MzMsMC4yMDc1LDAuMjg2MywwLjUwMjksMC41NzIyLCwtMC4wMDQyLDAuMzYxMSwwLjE2MzIsLC0wLjc3MzEsMC4xMjA4LDAuMDU5MSwtMC43MTY2LDAuNTIzOCwwLjYwMDYsMC4xNzQ2LDAuODI0OCwtMC4wNTQzLDAuNDI2LDAuNDY0NCwtMC43ODYzLDAuNV0sXG4gICAgICAgIFsxLDAuNjgzMywwLjIzMDcsMC4zMDM3LDAuNTAyOSwwLjU3NSwsMC4wNDEsMC4zNjExLDAuMTYzMiwsLTAuNzczMSwwLjEyMDgsMC4xMDQ3LC0wLjcxNjYsMC41MjM4LDAuNTgyMSwwLjE5NTYsMC44MDE2LC0wLjAzOTgsMC40MTQ5LDAuNDMzLC0wLjc4NjMsMC41XSxcbiAgICAgICAgWzEsMC42ODMzLDAuMjMwNywwLjMwMzcsMC41MDI5LDAuNTc1LCwwLjA0MSwwLjM2MTEsMC4xNjMyLCwtMC43NzMxLDAuMTIwOCwwLjEwNDcsLTAuNzE2NiwwLjUyMzgsMC41ODIxLDAuMTk1NiwwLjgwMTYsLTAuMDM5OCwwLjQxNDksMC40MzMsLTAuNzg2MywwLjVdLFxuICAgICAgICBbMSwwLjY4MzMsMC4yMzA3LDAuMzAzNywwLjUwMjksMC41NzUsLDAuMDQxLDAuMzYxMSwwLjE2MzIsLC0wLjc3MzEsMC4xMjA4LDAuMTA0NywtMC43MTY2LDAuNTIzOCwwLjU4MjEsMC4xOTU2LDAuODAxNiwtMC4wMzk4LDAuNDE0OSwwLjQzMywtMC43ODYzLDAuNV1cbiAgICAgIF1cbiAgICApO1xufSkoKTsiLCJmdW5jdGlvbiBTZnhyUGFyYW1zKCl7dGhpcy5zZXRTZXR0aW5ncz1mdW5jdGlvbihyKXtmb3IodmFyIGE9MDsyND5hO2ErKyl0aGlzW1N0cmluZy5mcm9tQ2hhckNvZGUoOTcrYSldPXJbYV18fDA7dGhpcy5jPC4wMSYmKHRoaXMuYz0uMDEpO3ZhciB0PXRoaXMuYit0aGlzLmMrdGhpcy5lO2lmKC4xOD50KXt2YXIgZT0uMTgvdDt0aGlzLmIqPWUsdGhpcy5jKj1lLHRoaXMuZSo9ZX19fWZ1bmN0aW9uIFNmeHJTeW50aCgpe3RoaXMuX3BhcmFtcz1uZXcgU2Z4clBhcmFtczt2YXIgcixhLHQsZSxzLG4saSxoLGYsYyxvLHY7dGhpcy5yZXNldD1mdW5jdGlvbigpe3ZhciByPXRoaXMuX3BhcmFtcztlPTEwMC8oci5mKnIuZisuMDAxKSxzPTEwMC8oci5nKnIuZysuMDAxKSxuPTEtci5oKnIuaCpyLmgqLjAxLGk9LXIuaSpyLmkqci5pKjFlLTYsci5hfHwobz0uNS1yLm4vMix2PTVlLTUqLXIubyksaD0xK3IubCpyLmwqKHIubD4wPy0uOToxMCksZj0wLGM9MT09ci5tPzA6KDEtci5tKSooMS1yLm0pKjJlNCszMn0sdGhpcy50b3RhbFJlc2V0PWZ1bmN0aW9uKCl7dGhpcy5yZXNldCgpO3ZhciBlPXRoaXMuX3BhcmFtcztyZXR1cm4gcj1lLmIqZS5iKjFlNSxhPWUuYyplLmMqMWU1LHQ9ZS5lKmUuZSoxZTUrMTIsMyooKHIrYSt0KS8zfDApfSx0aGlzLnN5bnRoV2F2ZT1mdW5jdGlvbih1LGIpe3ZhciB3PXRoaXMuX3BhcmFtcyxtPTEhPXcuc3x8dy52LHk9dy52KncudiouMSxnPTErM2UtNCp3Lncsaz13LnMqdy5zKncucyouMSxTPTErMWUtNCp3LnQsbD0xIT13LnMscD13Lngqdy54LGQ9dy5nLHg9dy5xfHx3LnIsQT13LnIqdy5yKncuciouMixxPXcucSp3LnEqKHcucTwwPy0xMDIwOjEwMjApLE09dy5wPygoMS13LnApKigxLXcucCkqMmU0fDApKzMyOjAsXz13LmQsVT13LmovMixqPXcuayp3LmsqLjAxLEM9dy5hLFA9cixSPTEvcixXPTEvYSx6PTEvdCxCPTUvKDErdy51KncudSoyMCkqKC4wMStrKTtCPi44JiYoQj0uOCksQj0xLUI7Zm9yKHZhciBELEUsRixHLEgsSSxKPSExLEs9MCxMPTAsTj0wLE89MCxRPTAsVD0wLFY9MCxYPTAsWT0wLFo9MCwkPW5ldyBBcnJheSgxMDI0KSxycj1uZXcgQXJyYXkoMzIpLGFyPSQubGVuZ3RoO2FyLS07KSRbYXJdPTA7Zm9yKHZhciBhcj1yci5sZW5ndGg7YXItLTspcnJbYXJdPTIqTWF0aC5yYW5kb20oKS0xO2Zvcih2YXIgYXI9MDtiPmFyO2FyKyspe2lmKEopcmV0dXJuIGFyO2lmKE0mJisrWT49TSYmKFk9MCx0aGlzLnJlc2V0KCkpLGMmJisrZj49YyYmKGM9MCxlKj1oKSxuKz1pLGUqPW4sZT5zJiYoZT1zLGQ+MCYmKEo9ITApKSxFPWUsVT4wJiYoWis9aixFKj0xK01hdGguc2luKFopKlUpLEV8PTAsOD5FJiYoRT04KSxDfHwobys9diwwPm8/bz0wOm8+LjUmJihvPS41KSksKytMPlApc3dpdGNoKEw9MCwrK0spe2Nhc2UgMTpQPWE7YnJlYWs7Y2FzZSAyOlA9dH1zd2l0Y2goSyl7Y2FzZSAwOk49TCpSO2JyZWFrO2Nhc2UgMTpOPTErMiooMS1MKlcpKl87YnJlYWs7Y2FzZSAyOk49MS1MKno7YnJlYWs7Y2FzZSAzOk49MCxKPSEwfXgmJihxKz1BLEY9MHxxLDA+Rj9GPS1GOkY+MTAyMyYmKEY9MTAyMykpLG0mJmcmJih5Kj1nLDFlLTU+eT95PTFlLTU6eT4uMSYmKHk9LjEpKSxJPTA7Zm9yKHZhciB0cj04O3RyLS07KXtpZihWKyssVj49RSYmKFYlPUUsMz09QykpZm9yKHZhciBlcj1yci5sZW5ndGg7ZXItLTspcnJbZXJdPTIqTWF0aC5yYW5kb20oKS0xO3N3aXRjaChDKXtjYXNlIDA6SD1vPlYvRT8uNTotLjU7YnJlYWs7Y2FzZSAxOkg9MS1WL0UqMjticmVhaztjYXNlIDI6Rz1WL0UsRz02LjI4MzE4NTMxKihHPi41P0ctMTpHKSxIPTEuMjczMjM5NTQqRysuNDA1Mjg0NzM1KkcqRyooMD5HPzE6LTEpLEg9LjIyNSooKDA+SD8tMToxKSpIKkgtSCkrSDticmVhaztjYXNlIDM6SD1ycltNYXRoLmFicygzMipWL0V8MCldfW0mJihEPVQsayo9UywwPms/az0wOms+LjEmJihrPS4xKSxsPyhRKz0oSC1UKSprLFEqPUIpOihUPUgsUT0wKSxUKz1RLE8rPVQtRCxPKj0xLXksSD1PKSx4JiYoJFtYJTEwMjRdPUgsSCs9JFsoWC1GKzEwMjQpJTEwMjRdLFgrKyksSSs9SH1JKj0uMTI1Kk4qcCx1W2FyXT1JPj0xPzMyNzY3Oi0xPj1JPy0zMjc2ODozMjc2NypJfDB9cmV0dXJuIGJ9fXZhciBzeW50aD1uZXcgU2Z4clN5bnRoO3dpbmRvdy5qc2Z4cj1mdW5jdGlvbihyKXtzeW50aC5fcGFyYW1zLnNldFNldHRpbmdzKHIpO3ZhciBhPXN5bnRoLnRvdGFsUmVzZXQoKSx0PW5ldyBVaW50OEFycmF5KDQqKChhKzEpLzJ8MCkrNDQpLGU9MipzeW50aC5zeW50aFdhdmUobmV3IFVpbnQxNkFycmF5KHQuYnVmZmVyLDQ0KSxhKSxzPW5ldyBVaW50MzJBcnJheSh0LmJ1ZmZlciwwLDQ0KTtzWzBdPTExNzkwMTE0MTAsc1sxXT1lKzM2LHNbMl09MTE2MzI4MDcyNyxzWzNdPTU0NDUwMTA5NCxzWzRdPTE2LHNbNV09NjU1Mzcsc1s2XT00NDEwMCxzWzddPTg4MjAwLHNbOF09MTA0ODU3OCxzWzldPTE2MzUwMTcwNjAsc1sxMF09ZSxlKz00NDtmb3IodmFyIG49MCxpPVwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrL1wiLGg9XCJkYXRhOmF1ZGlvL3dhdjtiYXNlNjQsXCI7ZT5uO24rPTMpe3ZhciBmPXRbbl08PDE2fHRbbisxXTw8OHx0W24rMl07aCs9aVtmPj4xOF0raVtmPj4xMiY2M10raVtmPj42JjYzXStpWzYzJmZdfXJldHVybiBofTsiLCIoZnVuY3Rpb24oKXtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgLypnbG9iYWwgY3R4Ki9cbiAgICAgICAgXG4gICAgLypcbiAgICAgKiBBIHNpbmdsZSBleHBsb3Npb24gcGFydGljbGVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBQYXJ0aWNsZSAoKVxuICAgIHtcbiAgICAgIHRoaXMuc2NhbGUgPSAxLjA7XG4gICAgICB0aGlzLnggPSAwO1xuICAgICAgdGhpcy55ID0gMDtcbiAgICAgIHRoaXMucmFkaXVzID0gMjA7XG4gICAgICB0aGlzLmNvbG9yID0gXCIjMDAwXCI7XG4gICAgICB0aGlzLnZlbG9jaXR5WCA9IDA7XG4gICAgICB0aGlzLnZlbG9jaXR5WSA9IDA7XG4gICAgICB0aGlzLnNjYWxlU3BlZWQgPSAwLjU7XG5cbiAgICAgIHRoaXMudXBkYXRlID0gZnVuY3Rpb24obXMpXG4gICAgICB7XG4gICAgICAgIC8vIHNocmlua2luZ1xuICAgICAgICB0aGlzLnNjYWxlIC09IHRoaXMuc2NhbGVTcGVlZCAqIG1zIC8gMTAwMC4wO1xuXG4gICAgICAgIGlmICh0aGlzLnNjYWxlIDw9IDApXG4gICAgICAgIHtcbiAgICAgICAgICB0aGlzLnNjYWxlID0gMDtcbiAgICAgICAgfVxuICAgICAgICAvLyBtb3ZpbmcgYXdheSBmcm9tIGV4cGxvc2lvbiBjZW50ZXJcbiAgICAgICAgdGhpcy54ICs9IHRoaXMudmVsb2NpdHlYICogbXMvMTAwMC4wO1xuICAgICAgICB0aGlzLnkgKz0gdGhpcy52ZWxvY2l0eVkgKiBtcy8xMDAwLjA7XG4gICAgICB9O1xuXG4gICAgICB0aGlzLmRyYXcgPSBmdW5jdGlvbihjdHgpXG4gICAgICB7XG4gICAgICAgIC8vIHRyYW5zbGF0aW5nIHRoZSAyRCBjb250ZXh0IHRvIHRoZSBwYXJ0aWNsZSBjb29yZGluYXRlc1xuICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICBjdHgudHJhbnNsYXRlKHRoaXMueCwgdGhpcy55KTtcbiAgICAgICAgY3R4LnNjYWxlKHRoaXMuc2NhbGUsIHRoaXMuc2NhbGUpO1xuXG4gICAgICAgIC8vIGRyYXdpbmcgYSBmaWxsZWQgY2lyY2xlIGluIHRoZSBwYXJ0aWNsZSdzIGxvY2FsIHNwYWNlXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgY3R4LmFyYygwLCAwLCB0aGlzLnJhZGl1cywgMCwgTWF0aC5QSSoyLCB0cnVlKTtcbiAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xuICAgICAgICBjdHguZmlsbCgpO1xuXG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8qQ29sbGlzaW9uIGVmZmVjdCBwYXJ0aWNsZXMqL1xuICAgIHZhciBwYXJ0aWNsZXMgPSBbXTtcblxuICAgIGZ1bmN0aW9uIHJhbmRvbUZsb2F0IChtaW4sIG1heCl7XG4gICAgICByZXR1cm4gbWluICsgTWF0aC5yYW5kb20oKSoobWF4LW1pbik7XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBBZHZhbmNlZCBFeHBsb3Npb24gZWZmZWN0XG4gICAgICogRWFjaCBwYXJ0aWNsZSBoYXMgYSBkaWZmZXJlbnQgc2l6ZSwgbW92ZSBzcGVlZCBhbmQgc2NhbGUgc3BlZWQuXG4gICAgICogXG4gICAgICogUGFyYW1ldGVyczpcbiAgICAgKiAgeCwgeSAtIGV4cGxvc2lvbiBjZW50ZXJcbiAgICAgKiAgY29sb3IgLSBwYXJ0aWNsZXMnIGNvbG9yXG4gICAgICovXG4gICAgd2luZG93LmNyZWF0ZUV4cGxvc2lvbiA9IGZ1bmN0aW9uICh4LCB5LCBjb2xvcilcbiAgICB7XG4gICAgICB2YXIgbWluU2l6ZSA9IDEwO1xuICAgICAgdmFyIG1heFNpemUgPSAzMDtcbiAgICAgIHZhciBjb3VudCA9IDEwO1xuICAgICAgdmFyIG1pblNwZWVkID0gNjAuMDtcbiAgICAgIHZhciBtYXhTcGVlZCA9IDIwMC4wO1xuICAgICAgdmFyIG1pblNjYWxlU3BlZWQgPSAxLjA7XG4gICAgICB2YXIgbWF4U2NhbGVTcGVlZCA9IDQuMDtcblxuICAgICAgZm9yICh2YXIgYW5nbGU9MDsgYW5nbGU8MzYwOyBhbmdsZSArPSBNYXRoLnJvdW5kKDM2MC9jb3VudCkpXG4gICAgICB7XG4gICAgICAgIHZhciBwYXJ0aWNsZSA9IG5ldyBQYXJ0aWNsZSgpO1xuXG4gICAgICAgIHBhcnRpY2xlLnggPSB4O1xuICAgICAgICBwYXJ0aWNsZS55ID0geTtcblxuICAgICAgICBwYXJ0aWNsZS5yYWRpdXMgPSByYW5kb21GbG9hdChtaW5TaXplLCBtYXhTaXplKTtcblxuICAgICAgICBwYXJ0aWNsZS5jb2xvciA9IGNvbG9yO1xuXG4gICAgICAgIHBhcnRpY2xlLnNjYWxlU3BlZWQgPSByYW5kb21GbG9hdChtaW5TY2FsZVNwZWVkLCBtYXhTY2FsZVNwZWVkKTtcblxuICAgICAgICB2YXIgc3BlZWQgPSByYW5kb21GbG9hdChtaW5TcGVlZCwgbWF4U3BlZWQpO1xuXG4gICAgICAgIHBhcnRpY2xlLnZlbG9jaXR5WCA9IHNwZWVkICogTWF0aC5jb3MoYW5nbGUgKiBNYXRoLlBJIC8gMTgwLjApO1xuICAgICAgICBwYXJ0aWNsZS52ZWxvY2l0eVkgPSBzcGVlZCAqIE1hdGguc2luKGFuZ2xlICogTWF0aC5QSSAvIDE4MC4wKTtcblxuICAgICAgICBwYXJ0aWNsZXMucHVzaChwYXJ0aWNsZSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHdpbmRvdy51cGRhdGVFeHBsb3Npb24gPSAgZnVuY3Rpb24gKGZyYW1lRGVsYXkpXG4gICAge1xuICAgICAgLy8gdXBkYXRlIGFuZCBkcmF3IHBhcnRpY2xlc1xuICAgICAgZm9yICh2YXIgaT0wOyBpPHBhcnRpY2xlcy5sZW5ndGg7IGkrKylcbiAgICAgIHtcbiAgICAgICAgdmFyIHBhcnRpY2xlID0gcGFydGljbGVzW2ldO1xuXG4gICAgICAgIHBhcnRpY2xlLnVwZGF0ZShmcmFtZURlbGF5KTtcbiAgICAgICAgcGFydGljbGUuZHJhdyhjdHgpO1xuICAgICAgfVxuICAgIH07XG5cbn0pKCk7Il19
