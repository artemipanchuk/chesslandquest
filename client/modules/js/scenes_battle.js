(function() {

  this.define('Scenes/Battle', function(exports) {
    var Tileset;
    Tileset = this.require('Scenes/Tileset');
    return exports.build = function(_arg) {
      var scene;
      scene = _arg.scene;
      return Tileset.process(scene);
    };
  });

}).call(this);
