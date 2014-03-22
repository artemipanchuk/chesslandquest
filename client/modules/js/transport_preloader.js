(function() {

  this.define('Transport/Preloader', function(exports) {
    var preloader;
    preloader = null;
    exports.initialize = function(callback) {
      return preloader = new atom.ImagePreloader({
        images: {
          grass0: 'client/textures/tiles.png [50:50]{0:0}',
          grass1: 'client/textures/tiles.png [50:50]{1:0}',
          road0: 'client/textures/tiles.png [50:50]{2:2}',
          road1: 'client/textures/tiles.png [50:50]{3:2}',
          roadc: 'client/textures/tiles.png [50:50]{2:3}',
          roads: 'client/textures/tiles.png [50:50]{3:3}',
          earth0: 'client/textures/tiles.png [50:50]{2:0}',
          earth1: 'client/textures/tiles.png [50:50]{3:0}',
          earthc: 'client/textures/tiles.png [50:50]{2:1}',
          earths: 'client/textures/tiles.png [50:50]{3:1}',
          light: 'client/textures/tiles.png [50:50]{0:1}',
          lightc: 'client/textures/tiles.png [50:50]{0:3}',
          lights: 'client/textures/tiles.png [50:50]{0:2}',
          dark: 'client/textures/tiles.png [50:50]{1:1}',
          darkc: 'client/textures/tiles.png [50:50]{1:3}',
          darks: 'client/textures/tiles.png [50:50]{1:2}',
          white: 'client/textures/tiles.png [50:50]{0:4}',
          tree1: 'client/textures/objects.png [100:138]{0:0}',
          tree2: 'client/textures/objects.png [100:138]{1:0}',
          tree3: 'client/textures/objects.png [100:138]{0:1}',
          'market-units': 'client/textures/market.png',
          privatei: 'client/textures/units.png [100:128]{0:0}',
          privatef: 'client/textures/units.png [100:128]{1:0}',
          generali: 'client/textures/character.png',
          generalf: 'client/textures/character.png',
          character: 'client/textures/character.png'
        },
        onReady: callback
      });
    };
    return exports.get = function(name) {
      return preloader.get(name);
    };
  });

}).call(this);
