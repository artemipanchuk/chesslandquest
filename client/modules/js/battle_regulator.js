(function() {

  this.define('Battle/Regulator', function(exports) {
    var Board, Controls, Scenes, Socket, Units, UnitsMaster, actions, active, mode, next, _ref, _ref1;
    _ref = this.require('Canvas/Controls', 'Canvas/Scenes'), Controls = _ref[0], Scenes = _ref[1];
    _ref1 = this.require('Battle/Board', 'Battle/Units'), Board = _ref1[0], Units = _ref1[1];
    UnitsMaster = this.require('Units/Master');
    Socket = this.require('Transport/Socket');
    mode = null;
    active = null;
    next = null;
    actions = {
      move: function(cell, callback) {
        var turn;
        turn = {
          x: cell.x - active.cell.x,
          y: cell.y - active.cell.y
        };
        if (UnitsMaster.validate(active.rank, 'move', turn)) {
          Socket.send('battle::turn', {
            turn: turn,
            key: active.key
          });
          callback(active.cell);
          mode = false;
          active = null;
          return next = false;
        }
      },
      attack: function(cell, callback) {
        var turn;
        turn = {
          x: cell.x - active.cell.x,
          y: cell.y - active.cell.y
        };
        if (UnitsMaster.validate(active.rank, 'attack', turn)) {
          Socket.send('battle::turn', {
            turn: turn,
            key: active.key
          });
          callback(active.cell);
          mode = false;
          active = null;
          return next = false;
        }
      },
      change: function(target) {
        return active = Units.get('own', target);
      }
    };
    exports.start = function() {
      mode = false;
      Socket.listen('battle::turn', function(turn) {
        next = true;
        if (turn == null) {
          return;
        }
        return wait(500, function() {
          return Board.make(turn);
        });
      });
      return Controls.addMouseAction('click', function(point) {
        if (!next) {
          return;
        }
        if (mode === false) {
          return Board.pick(point, function(picked) {
            mode = true;
            return active = picked;
          });
        } else {
          return Board.place(active.key, point, function(type, argument, callback) {
            return actions[type](argument, callback);
          });
        }
      });
    };
    return exports.stop = function() {
      Socket.disable('battle::turn');
      return Controls.removeMouseAction('click');
    };
  });

}).call(this);
