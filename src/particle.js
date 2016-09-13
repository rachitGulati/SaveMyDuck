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