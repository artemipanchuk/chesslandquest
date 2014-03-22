(function() {

  this.define('Canvas/Master', function(exports) {
    var App, Controls, Objects, Projection, Scenes, _ref;
    _ref = this.require('Canvas/Projection', 'Canvas/Controls', 'Canvas/Objects', 'Canvas/Scenes'), Projection = _ref[0], Controls = _ref[1], Objects = _ref[2], Scenes = _ref[3];
    App = this.require('LibCanvas/App');
    return exports.initialize = function() {
      var Module, _i, _len, _ref1, _results;
      this.app = new App({
        size: Projection.size,
        appendTo: document.body
      });
      _ref1 = [Scenes, Objects, Controls];
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        Module = _ref1[_i];
        _results.push(Module.initialize(this.app));
      }
      return _results;
    };
  });

}).call(this);
