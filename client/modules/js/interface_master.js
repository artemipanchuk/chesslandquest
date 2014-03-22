(function() {

  this.define('Interface/Master', function(exports) {
    var HUD, Preparer, level, _ref;
    _ref = this.require('Interface/Preparer', 'Interface/HUD/Master'), Preparer = _ref[0], HUD = _ref[1];
    level = null;
    exports.preparePreparationInterface = function() {
      if (level === 'preparer') {
        return;
      }
      Preparer.build();
      return level = 'preparer';
    };
    exports.prepareHUD = function(callback) {
      if (level === 'hud') {
        callback();
        return;
      }
      Preparer.clean(function() {
        return callback();
      });
      HUD.build();
      return level = 'hud';
    };
    return exports.switchHUD = function(settings) {
      return HUD["switch"](settings);
    };
  });

}).call(this);
