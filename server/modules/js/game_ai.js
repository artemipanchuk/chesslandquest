(function() {
  var Units, calculateState, calculateTurns, half, makeTurn;

  module.paths = module.parent.paths;

  Units = require('game_units');

  half = 0.5;

  calculateTurns = function(_arg, side) {
    var actor, attack, cell, isStarter, key, matrix, move, opponent, rank, sets, sides, size, starter, turns, x, xₜ, y, yₜ, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
    sets = _arg.sets, sides = _arg.sides, matrix = _arg.matrix, size = _arg.size, starter = _arg.starter;
    turns = [];
    _ref = [sides[side], sides[1 - side]], actor = _ref[0], opponent = _ref[1];
    _ref1 = sets[actor];
    for (key in _ref1) {
      _ref2 = _ref1[key], rank = _ref2.rank, cell = _ref2.cell;
      if (rank === 'general') {
        _ref3 = Units.getGeneralActions(actor), move = _ref3.move, attack = _ref3.attack;
      } else {
        _ref4 = Units.getUnitActions(rank), move = _ref4.move, attack = _ref4.attack;
      }
      x = cell.x, y = cell.y;
      isStarter = actor === starter;
      move = move.filter(function(_arg1) {
        var xₜ, yₜ, _ref5;
        xₜ = _arg1[0], yₜ = _arg1[1];
        return ((_ref5 = matrix[y + yₜ]) != null ? _ref5[x + (isStarter ? +xₜ : -xₜ)] : void 0) === null;
      });
      attack = attack.filter(function(_arg1) {
        var xₜ, yₜ, _ref5;
        xₜ = _arg1[0], yₜ = _arg1[1];
        return sets[opponent][(_ref5 = matrix[y + yₜ]) != null ? _ref5[x + (isStarter ? +xₜ : -xₜ)] : void 0] != null;
      });
      for (_i = 0, _len = move.length; _i < _len; _i++) {
        _ref5 = move[_i], xₜ = _ref5[0], yₜ = _ref5[1];
        turns.push({
          action: 'move',
          key: +key,
          turn: [x, y, x + (isStarter ? +xₜ : -xₜ), y + yₜ]
        });
      }
      for (_j = 0, _len1 = attack.length; _j < _len1; _j++) {
        _ref6 = attack[_j], xₜ = _ref6[0], yₜ = _ref6[1];
        turns.push({
          action: 'attack',
          key: +key,
          turn: [x, y, x + (isStarter ? +xₜ : -xₜ), y + yₜ]
        });
      }
    }
    return turns;
  };

  calculateState = function(state, side) {
    var actor, key, matrix, opponent, opposit, points, rank, sets, sides, turnsₐ, turnsₒ, _ref, _ref1;
    if (side == null) {
      side = 1;
    }
    opposit = 1 - side;
    matrix = state.matrix, sides = state.sides, sets = state.sets;
    _ref = [sides[side], sides[opposit]], actor = _ref[0], opponent = _ref[1];
    points = 0;
    turnsₐ = calculateTurns(state, side);
    turnsₒ = calculateTurns(state, opposit);
    _ref1 = sets[actor];
    for (key in _ref1) {
      rank = _ref1[key].rank;
      if (rank === 'general') {
        points += Units.evaluateGeneral(actor);
      } else {
        points += Units.evaluateUnit(rank);
      }
    }
    return points;
  };

  makeTurn = function(_arg, _arg1, side) {
    var action, actor, key, matrix, opponent, rank, sets, sides, size, starter, turn, x, xₙ, y, yₙ, _ref;
    sides = _arg.sides, matrix = _arg.matrix, sets = _arg.sets, size = _arg.size, starter = _arg.starter;
    action = _arg1.action, key = _arg1.key, turn = _arg1.turn;
    _ref = [sides[side], sides[1 - side]], actor = _ref[0], opponent = _ref[1];
    x = turn[0], y = turn[1], xₙ = turn[2], yₙ = turn[3];
    sets[actor][key].cell = {
      x: xₙ,
      y: yₙ
    };
    if (action === 'attack') {
      rank = sets[opponent][matrix[yₙ][xₙ]].rank;
      delete sets[opponent][matrix[yₙ][xₙ]];
    }
    matrix[y][x] = null;
    matrix[yₙ][xₙ] = key;
    if (action === 'attack') {
      return rank;
    }
  };

  module.exports = {
    analyze: function(state) {
      var action, analyze, copy, delta, final, i, key, matrix, max, nearest, rank, sets, sides, target, turn, turnsₒ, turnₒ, _i, _len, _ref;
      turnsₒ = calculateTurns(state, 1);
      if (turnsₒ.length === 0) {
        return {
          result: 'stalemate'
        };
      }
      max = -Infinity;
      target = null;
      nearest = 1;
      analyze = function(state, side, depth, index) {
        var copy, evaluation, i, turn, turns, _i, _len, _results;
        if (max === Infinity) {
          return;
        }
        turns = calculateTurns(state, side);
        if (depth === 1 || turns.length === 0) {
          evaluation = calculateState(state);
          if (depth >= nearest && evaluation >= max) {
            nearest = depth;
            target = index;
            max = evaluation;
          }
          return;
        }
        _results = [];
        for (i = _i = 0, _len = turns.length; _i < _len; i = ++_i) {
          turn = turns[i];
          copy = clone(state);
          makeTurn(copy, turn, side);
          _results.push(analyze(copy, 1 - side, depth - 1, index));
        }
        return _results;
      };
      for (i = _i = 0, _len = turnsₒ.length; _i < _len; i = ++_i) {
        turnₒ = turnsₒ[i];
        copy = clone(state);
        makeTurn(copy, turnₒ, 1);
        analyze(copy, 1, 5, i);
      }
      _ref = final = turnsₒ[target], action = _ref.action, key = _ref.key, turn = _ref.turn;
      rank = makeTurn(state, final, 1);
      delta = {
        x: turn[2] - turn[0],
        y: turn[3] - turn[1]
      };
      sets = state.sets, sides = state.sides, matrix = state.matrix;
      if (rank === 'general') {
        return {
          key: key,
          turn: delta,
          result: 'checkmate'
        };
      } else {
        return {
          key: key,
          turn: delta,
          result: 'normal'
        };
      }
    }
  };

}).call(this);
