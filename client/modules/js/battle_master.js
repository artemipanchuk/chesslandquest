(function() {

  this.define('Battle/Master', function(exports) {
    var Arranger, Board, HUD, Regulator, Socket, Units, engage, listen, _ref, _ref1,
      _this = this;
    _ref = this.require('Battle/Regulator', 'Battle/Board', 'Battle/Units'), Regulator = _ref[0], Board = _ref[1], Units = _ref[2];
    _ref1 = this.require('Interface/HUD/Arranger', 'Interface/HUD/Master'), Arranger = _ref1[0], HUD = _ref1[1];
    Socket = this.require('Transport/Socket');
    listen = function() {
      Socket.listen('battle::call', function(information) {
        return HUD.dialog('battle::call', information);
      });
      Socket.listen('battle::set', function(status) {
        return Arranger.visualize(status);
      });
      return Socket.listen('battle::start', function(set) {
        Arranger.destroy();
        Board.accept(set);
        return Regulator.start();
      });
    };
    engage = function(_arg) {
      var size;
      size = _arg.size;
      return Board.configure({
        size: size
      });
    };
    exports.startBattle = function(battle, callback) {
      if (battle.status === true) {
        Socket.disable('battle::call');
        callback();
        return engage(battle);
      } else {
        return HUD.dialog('battle::reject', battle);
      }
    };
    exports.endBattle = function(battle, callback) {
      var FPPC, army, character, dead, index, points, result, unit, _i, _j, _len, _len1, _ref2;
      HUD.dialog('battle::end', battle, callback);
      result = battle.result;
      FPPC = _this.require('Characters/FPPC');
      character = FPPC.get();
      army = character.army, points = character.points;
      points += result.points;
      _ref2 = result.casualties;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        dead = _ref2[_i];
        for (index = _j = 0, _len1 = army.length; _j < _len1; index = ++_j) {
          unit = army[index];
          if (unit === dead) {
            army.splice(index, 1);
            break;
          }
        }
      }
      FPPC.update('points', points);
      FPPC.update('army', army);
      return Regulator.stop();
    };
    exports.initialize = function() {
      return listen();
    };
    return exports.submit = function() {
      return Socket.send('battle::set', Units.get('own'));
    };
  });

}).call(this);
