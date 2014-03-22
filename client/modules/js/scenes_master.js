(function() {

  this.define('Scenes/Master', function(exports) {
    var Battle, Global, _ref;
    _ref = this.require('Scenes/Global', 'Scenes/Battle'), Global = _ref[0], Battle = _ref[1];
    exports.buildGlobalScene = function(settings) {
      if (settings != null) {
        return Global.build(settings);
      } else {
        return Global.buildActual();
      }
    };
    return exports.buildBattleScene = function(settings) {
      return Battle.build(settings);
    };
  });

}).call(this);
