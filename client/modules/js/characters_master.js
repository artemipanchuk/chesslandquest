(function() {

  this.define('Characters/Master', function(exports) {
    var CanvasObjects, Controls, FPPC, NPC, TPPC, _ref;
    _ref = this.require('Characters/Controls', 'Characters/FPPC', 'Characters/TPPC', 'Characters/NPC'), Controls = _ref[0], FPPC = _ref[1], TPPC = _ref[2], NPC = _ref[3];
    CanvasObjects = this.require('Canvas/Objects');
    exports.initialize = function() {
      var Module, _i, _len, _ref1, _results;
      _ref1 = [FPPC, TPPC, NPC];
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        Module = _ref1[_i];
        _results.push(Module.listen());
      }
      return _results;
    };
    exports.registerPlayer = function(character) {
      return FPPC.register(character);
    };
    exports.disable = function() {
      var Module, _i, _len, _ref1, _results;
      _ref1 = [FPPC, TPPC, NPC];
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        Module = _ref1[_i];
        _results.push(Module.disable());
      }
      return _results;
    };
    return exports.enable = function() {
      var Module, _i, _len, _ref1, _results;
      _ref1 = [FPPC, TPPC, NPC];
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        Module = _ref1[_i];
        _results.push(Module.enable());
      }
      return _results;
    };
  });

}).call(this);
