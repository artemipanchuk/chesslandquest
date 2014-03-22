(function() {

  this.define('Interface/HUD/Master', function(exports) {
    var Arranger, Chat, Dialogs, Extensions, Menu, _ref;
    Dialogs = this.require('Interface/HUD/Dialogs');
    Extensions = (_ref = this.require('Interface/HUD/Arranger', 'Interface/HUD/Menu', 'Interface/HUD/Chat'), Arranger = _ref[0], Menu = _ref[1], Chat = _ref[2], _ref);
    exports.build = function() {
      var E, _i, _len, _ref1, _results;
      _ref1 = [Menu, Chat];
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        E = _ref1[_i];
        _results.push(E.build());
      }
      return _results;
    };
    exports["switch"] = function(settings) {
      switch (settings.mode) {
        case 'battle':
          Dialogs.clean();
          Arranger.build();
          Menu["switch"]('battle');
          if (settings.type === 'pc') {
            return Chat["switch"]('battle');
          } else {
            return Chat.hide();
          }
          break;
        case 'global':
          Menu["switch"]('global');
          return Chat["switch"]('global');
      }
    };
    return exports.dialog = function(type, settings, callback) {
      return Dialogs.build(type, settings, callback);
    };
  });

}).call(this);
