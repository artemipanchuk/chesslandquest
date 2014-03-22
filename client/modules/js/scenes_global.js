(function() {

  this.define('Scenes/Global', function(exports) {
    var Tileset;
    Tileset = this.require('Scenes/Tileset');
    return exports.build = function(_arg) {
      var name, scene;
      name = _arg.name, scene = _arg.scene;
      return Tileset.process(scene);
    };
  });

}).call(this);
