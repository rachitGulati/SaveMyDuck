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