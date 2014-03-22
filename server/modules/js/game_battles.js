(function() {
  var ABattle, AI, NPC, NPCBattle, PC, PCBattle, UT, Units, battles, exports, max, npcs, opponents, pcs, rejection, waiting,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  module.paths = module.parent.paths;

  Units = require('game_units');

  NPC = require('game_npc');

  PC = require('game_pc');

  AI = require('game_ai');

  UT = require('utility');

  ABattle = (function() {

    ABattle.prototype.exactActionType = function(_arg, opponent) {
      var key, x, y, _ref, _ref1;
      x = _arg.x, y = _arg.y;
      switch (true) {
        case ((_ref = this.matrix[y]) != null ? _ref[x] : void 0) === null:
          return ['move'];
        case this.sets[opponent][key = (_ref1 = this.matrix[y]) != null ? _ref1[x] : void 0] != null:
          return ['attack', key];
        default:
          return false;
      }
    };

    function ABattle(_arg) {
      var initial, initiator, opponent, property, _ref, _ref1,
        _this = this;
      this.type = _arg.type, this.sides = _arg.sides, this.size = _arg.size;
      _ref = this.sides, initiator = _ref[0], opponent = _ref[1];
      this.sets = {};
      this.status = true;
      this.matrix = [];
      this.size.times(function(y) {
        _this.matrix[y] = [];
        return _this.size.times(function(x) {
          return _this.matrix[y][x] = null;
        });
      });
      _ref1 = {
        'casualties': [],
        'points': 0
      };
      for (property in _ref1) {
        initial = _ref1[property];
        this[property] = {};
        this[property][opponent] = initial;
        this[property][initiator] = initial;
      }
    }

    ABattle.prototype.set = function(_arg) {
      var cell, key, name, rank, set, size, _ref, _results;
      set = _arg.set, name = _arg.name;
      if (name === this.starter) {
        return this.sets[name] = set;
      } else {
        size = this.size;
        this.sets[name] = {};
        _results = [];
        for (key in set) {
          _ref = set[key], rank = _ref.rank, cell = _ref.cell;
          _results.push(this.sets[name][-key] = {
            rank: rank,
            cell: {
              x: size - cell.x - 1,
              y: cell.y
            }
          });
        }
        return _results;
      }
    };

    ABattle.get('home', function() {
      var _this = this;
      return (function() {
        var home, size;
        size = _this.size;
        home = [];
        size.times(function(y) {
          return (size / 4).times(function(x) {
            return home.push({
              x: x,
              y: y
            });
          });
        });
        return home;
      })();
    });

    return ABattle;

  })();

  NPCBattle = (function(_super) {

    __extends(NPCBattle, _super);

    NPCBattle.prototype.generateMachineSet = function() {
      var army, cell, index, key, name, set, x, y, _i, _len, _ref;
      name = this.sides[1];
      set = {};
      army = NPC.get(name, 'army');
      _ref = this.home;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        cell = _ref[index];
        if (index === army.length) {
          break;
        }
        x = cell.x, y = cell.y;
        x = this.size - x - 1;
        this.matrix[y][x] = key = -index - 1;
        set[key] = {
          rank: army[index],
          cell: {
            x: x,
            y: y
          }
        };
      }
      return this.sets[name] = set;
    };

    function NPCBattle(_arg) {
      this.type = _arg.type, this.sides = _arg.sides, this.size = _arg.size;
      NPCBattle.__super__.constructor.apply(this, arguments);
      this.generateMachineSet();
      this.starter = this.sides[0];
    }

    NPCBattle.prototype.set = function(_arg) {
      var cell, key, name, set;
      set = _arg.set, name = _arg.name;
      for (key in set) {
        cell = set[key].cell;
        this.matrix[cell.y][cell.x] = key;
      }
      NPCBattle.__super__.set.apply(this, arguments);
      return true;
    };

    NPCBattle.prototype.accept = function(name, _arg, callback) {
      var action, answer, cell, cellₙ, key, keyₜ, opponent, rank, rankₜ, size, status, turn, _ref, _ref1;
      key = _arg.key, turn = _arg.turn;
      _ref = this.sets[name][key], rank = _ref.rank, cell = _ref.cell;
      size = this.size;
      cellₙ = {
        x: cell.x + turn.x,
        y: cell.y + turn.y
      };
      opponent = this.sides[1];
      _ref1 = this.exactActionType(cellₙ, opponent), action = _ref1[0], keyₜ = _ref1[1];
      if (rank === 'general') {
        status = Units.validateGeneralAction(name, turn);
      } else {
        status = Units.validateUnitAction(rank, action, turn);
      }
      if (status === true) {
        if (action === 'attack') {
          rankₜ = this.sets[opponent][keyₜ].rank;
          this.casualties[opponent].push(rankₜ);
          this.points[name] += Units.evaluateUnit(rankₜ);
          delete this.sets[opponent][keyₜ];
          if (!Object.keys(this.sets[opponent]).length) {
            this.winner = name;
            callback();
            return;
          }
        }
        this.matrix[cell.y][cell.x] = null;
        this.matrix[cellₙ.y][cellₙ.x] = key;
        this.sets[name][key].cell = cellₙ;
        answer = AI.analyze(this);
        if (answer.result === 'checkmate') {
          this.winner = opponent;
          callback(answer);
          return callback();
        } else if (answer.result === 'stalemate') {
          this.winner = false;
          callback();
        } else {
          return callback(answer);
        }
      }
    };

    return NPCBattle;

  })(ABattle);

  PCBattle = (function(_super) {

    __extends(PCBattle, _super);

    function PCBattle(_arg) {
      this.type = _arg.type, this.sides = _arg.sides, this.size = _arg.size;
      PCBattle.__super__.constructor.apply(this, arguments);
    }

    PCBattle.prototype.set = function(_arg) {
      var cell, key, name, set, _ref, _ref1;
      set = _arg.set, name = _arg.name;
      if ((_ref = this.next) == null) {
        this.next = (_ref1 = this.starter) != null ? _ref1 : this.starter = name;
      }
      for (key in set) {
        cell = set[key].cell;
        if (name === this.starter) {
          this.matrix[cell.y][cell.x] = +key;
        } else {
          this.matrix[cell.y][this.size - cell.x - 1] = -key;
        }
      }
      PCBattle.__super__.set.apply(this, arguments);
      return !!this.sets[opponents[name]];
    };

    PCBattle.prototype.accept = function(name, _arg, callback) {
      var action, cell, cellₙ, key, keyₙ, keyₜ, opponent, points, rank, rankₜ, size, status, turn, turnₙ, _ref, _ref1;
      key = _arg.key, turn = _arg.turn;
      if (name === this.starter) {
        keyₙ = +key;
        turnₙ = {
          x: turn.x,
          y: turn.y
        };
      } else {
        keyₙ = -key;
        turnₙ = {
          x: -turn.x,
          y: turn.y
        };
      }
      _ref = this.sets[name][keyₙ], rank = _ref.rank, cell = _ref.cell;
      size = this.size;
      cellₙ = {
        x: cell.x + turnₙ.x,
        y: cell.y + turnₙ.y
      };
      opponent = opponents[name];
      _ref1 = this.exactActionType(cellₙ, opponent), action = _ref1[0], keyₜ = _ref1[1];
      if (rank === 'general') {
        status = Units.validateGeneralAction(name, turnₙ);
      } else {
        status = Units.validateUnitAction(rank, action, turnₙ);
      }
      if (status === true) {
        if (action === 'attack') {
          rankₜ = this.sets[opponent][keyₜ].rank;
          if (rankₜ === 'general') {
            points = Units.evaluateGeneral(name);
          } else {
            points = Units.evaluateUnit(rank);
          }
          this.casualties[opponent].push(rankₜ);
          this.points[name] += points;
          if (rankₜ === 'general') {
            this.winner = name;
            callback();
          }
        }
        this.matrix[cell.y][cell.x] = null;
        this.matrix[cellₙ.y][cellₙ.x] = keyₙ;
        this.sets[name][keyₙ].cell = cellₙ;
        return callback({
          turn: turnₙ,
          key: keyₙ
        }, opponent);
      }
    };

    return PCBattle;

  })(ABattle);

  pcs = [];

  npcs = [];

  battles = {};

  opponents = {};

  waiting = {};

  rejection = {
    status: false
  };

  max = function(a, b) {
    if (a > b) {
      return a;
    } else {
      return b;
    }
  };

  exports = {
    rejection: rejection,
    getOpponent: function(name) {
      return opponents[name] || null;
    },
    getWaiter: function(who) {
      var whom;
      whom = waiting[who];
      delete waiting[who];
      return whom;
    },
    key: function(name) {
      var battle, key;
      for (key in battles) {
        battle = battles[key];
        if (__indexOf.call(battle.sides, name) >= 0) {
          return key;
        }
      }
      return null;
    },
    get: function(key, property) {
      var _ref;
      return ((_ref = battles[key]) != null ? _ref[property] : void 0) || null;
    },
    set: function(key, property, value) {
      return battles[key][property](value);
    },
    accept: function(key, name, data, callback) {
      return battles[key].accept(name, data, function(next, answer) {
        return callback(next, answer);
      });
    },
    close: function(key, callback) {
      var army, battle, casualties, character, dead, index, points, side, sides, unit, winner, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1;
      battle = battles[key];
      winner = battle.winner;
      sides = {};
      if (battle instanceof PCBattle) {
        _ref = battle.sides;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          side = _ref[_i];
          sides[side] = {
            'casualties': casualties = battle.casualties[side],
            'points': points = battle.points[side]
          };
          character = PC.getCharacterByName(side);
          for (_j = 0, _len1 = casualties.length; _j < _len1; _j++) {
            dead = casualties[_j];
            _ref1 = (army = character.army, character);
            for (index = _k = 0, _len2 = _ref1.length; _k < _len2; index = ++_k) {
              unit = _ref1[index];
              if (unit === dead) {
                army.splice(index, 1);
                break;
              }
            }
          }
          PC.update(side, 'army', army);
          PC.update(side, 'points', character.points + points);
        }
      } else {
        side = battle.sides[0];
        sides[side] = {
          'casualties': casualties = battle.casualties[side],
          'points': points = battle.points[side]
        };
        character = PC.getCharacterByName(side);
        army = character.army;
        for (_l = 0, _len3 = casualties.length; _l < _len3; _l++) {
          dead = casualties[_l];
          for (index = _m = 0, _len4 = army.length; _m < _len4; index = ++_m) {
            unit = army[index];
            if (unit === dead) {
              army.splice(index, 1);
              break;
            }
          }
        }
        PC.update(side, 'army', army);
        PC.update(side, 'points', character.points + points);
      }
      callback(sides, winner);
      return delete battles[key];
    },
    addWaiter: function(who, forWhom) {
      return waiting[who] = forWhom;
    },
    checkFighters: function(initiator, opponent) {
      return (waiting[initiator] != null) || (waiting[opponent] != null);
    },
    createBattleWithNPC: function(pc, npc) {
      var alpha, size, _ref, _ref1;
      if ((_ref = pc.name, __indexOf.call(pcs, _ref) >= 0) || (_ref1 = npc.name, __indexOf.call(npcs, _ref1) >= 0)) {
        return rejection;
      }
      alpha = max(pc.army.length + 1, npc.army.length);
      if (alpha < 4) {
        size = 4;
      } else {
        size = alpha + 3 - (alpha - 1) % 4;
      }
      return battles[UT.generateID()] = new NPCBattle({
        sides: [pc.name, npc.name],
        size: size
      });
    },
    createBattleWithPC: function(pci, pco) {
      var alpha, namei, nameo, size;
      namei = pci.name;
      nameo = pco.name;
      if (__indexOf.call(pcs, namei) >= 0 || __indexOf.call(pcs, nameo) >= 0) {
        return rejection;
      }
      opponents[namei] = nameo;
      opponents[nameo] = namei;
      pcs.push(pci.name);
      pcs.push(pco.name);
      alpha = max(pci.army.length + 1, pco.army.length + 1);
      if (alpha < 4) {
        size = 4;
      } else {
        size = alpha + 3 - (alpha - 1) % 4;
      }
      return battles[UT.generateID()] = new PCBattle({
        sides: [namei, nameo],
        size: size
      });
    }
  };

  module.exports = exports;

}).call(this);
