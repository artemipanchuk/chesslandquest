(function() {
  var Accounts, Battles, GAMEServer, NPC, PC, Scenes, Units, WebSocketServer, byColon, bySpace, distribute, drop, ensureSession, error, escape, findPC, getNPCsNear, getPCsNear, handle, idPattern, key, npcs, pcs, requests, send, unsafe,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  module.paths = module.parent.paths;

  Accounts = require('http_accounts');

  Battles = require('game_battles');

  Scenes = require('game_scenes');

  Units = require('game_units');

  NPC = require('game_npc');

  PC = require('game_pc');

  WebSocketServer = (function() {
    var WebSocket;
    WebSocket = require('websocket');
    return WebSocket.Server;
  })();

  error = {
    json: 'WebSocket: Corrupted JSON. Interrupting.',
    data: 'WebSocket: Corrupted data. Interrupting.'
  };

  pcs = {};

  npcs = {};

  requests = {
    'state': function(id, pc, ws) {
      var character, location, name;
      character = PC.getCharacterById(id);
      if (!character) {
        drop(ws);
        log(error.json, 'critical');
        return;
      }
      name = character.name, location = character.location;
      if (!summary((pc = pcs[key(ws)]))) {
        pc = pcs[key(ws)] = {
          id: id,
          ws: ws,
          name: name,
          location: location
        };
      }
      if (!character.point) {
        Scenes.getGlobalScene(location, function(scene) {
          var point;
          point = character.point = scene.exports.markers.spawn;
          PC.update(name, 'point', point);
          return send('state', character, ws);
        });
      } else {
        send('state', character, ws);
      }
      return distribute('tppc::register', character, pc);
    },
    'units': function(nothing, pc, ws) {
      return Units.requestAll(function(units) {
        return send('units', units, ws);
      });
    },
    'scene': function(nothing, _arg, ws) {
      var character, id;
      id = _arg.id;
      character = PC.getCharacterById(id);
      return Scenes.getGlobalScene(character.location, function(scene) {
        return send('scene', scene.exports, ws);
      });
    },
    'transaction': {
      'unit': function(rank, _arg, ws) {
        var army, character, id, name, points, price;
        id = _arg.id;
        price = Units.evaluateUnit(rank);
        character = PC.getCharacterById(id);
        if (character.points > price) {
          character.points -= price;
          character.army.push(rank);
          name = character.name, army = character.army, points = character.points;
          PC.update(name, 'points', points);
          PC.update(name, 'army', army);
          return send('transaction::unit', true, ws);
        } else {
          return send('transaction::unit', false, ws);
        }
      }
    },
    'chat': {
      'global': function(text, pc, ws) {
        var id, name;
        id = pc.id, name = pc.name;
        text = escape(text);
        return distribute('chat::global', {
          name: name,
          text: text
        }, pc);
      },
      'battle': function(text, pc, ws) {
        var id, name, opponent;
        id = pc.id, name = pc.name;
        text = escape(text);
        opponent = Battles.getOpponent(name);
        return send('chat::battle', {
          name: name,
          text: text
        }, findPC(opponent).ws);
      }
    },
    'battle': {
      'call': function(data, pc, ws) {
        var battleCall, initiator, name, opponent, settings, type;
        type = data.type, name = data.name;
        if (Battles.checkFighters(pc.name, name)) {
          send('battle::answer', Battles.rejection, ws);
          return;
        }
        initiator = PC.getCharacterById(pc.id);
        if (type === 'npc') {
          if (!(opponent = npcs[name])) {
            drop(ws);
            log(error.json, 'critical');
            return;
          }
          settings = Battles.createBattleWithNPC(initiator, opponent);
          return Scenes.getBattleScene(settings, function(scene) {
            settings.scene = scene;
            settings.type = 'npc';
            return send('battle', settings, ws);
          });
        } else if (type === 'tppc') {
          if (!(opponent = findPC(name))) {
            drop(ws);
            log(error.json, 'critical');
            return;
          }
          Battles.addWaiter(name, initiator);
          battleCall = {
            name: initiator.name
          };
          return send('battle::call', battleCall, opponent.ws);
        }
      },
      'answer': function(decision, _arg, wso) {
        var id, initiator, name, opponent, settings, wsi;
        name = _arg.name, id = _arg.id;
        initiator = Battles.getWaiter(name);
        opponent = PC.getCharacterById(id);
        wsi = findPC(initiator.name).ws;
        if (decision === true) {
          settings = Battles.createBattleWithPC(initiator, opponent);
          return Scenes.getBattleScene(settings, function(scene) {
            var ws, _i, _len, _ref, _results;
            settings.scene = scene;
            settings.type = 'pc';
            _ref = [wsi, wso];
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              ws = _ref[_i];
              _results.push(send('battle', settings, ws));
            }
            return _results;
          });
        } else {
          return send('battle', Battles.rejection, wsi);
        }
      },
      'set': function(set, _arg, ws) {
        var bkey, character, home, id, index, left, name, opponent, rank, ready, sets, side, unit, wso, x, y, _i, _len, _ref, _ref1, _ref2;
        name = _arg.name, id = _arg.id;
        character = PC.getCharacterById(id);
        bkey = Battles.key(name);
        if (!bkey) {
          return;
        }
        home = Battles.get(bkey, 'home');
        left = [];
        for (index in set) {
          unit = set[index];
          left.push(unit.rank);
        }
        if (left.length === 0) {
          send('battle::set', false, ws);
          return;
        }
        for (index in set) {
          unit = set[index];
          if ((_ref = unit.rank, __indexOf.call(character.army, _ref) >= 0) || unit.rank === 'general') {
            _ref1 = unit.cell, x = _ref1.x, y = _ref1.y;
            if (!(home.some(function(cell) {
              return cell.x === x && cell.y === y;
            }))) {
              send('battle::set', false, ws);
              return;
            } else {
              for (index = _i = 0, _len = left.length; _i < _len; index = ++_i) {
                rank = left[index];
                if (!(rank === unit.rank)) {
                  continue;
                }
                left.splice(index, 1);
                break;
              }
            }
          }
        }
        if (left.length > 0) {
          send('battle::set', false, ws);
          return;
        } else {
          send('battle::set', true, ws);
        }
        ready = Battles.set(bkey, 'set', {
          name: name,
          set: set
        });
        if (ready) {
          sets = Battles.get(bkey, 'sets');
          if (wso = (_ref2 = findPC(opponent = Battles.getOpponent(name))) != null ? _ref2.ws : void 0) {
            send('battle::start', sets[opponent], ws);
            send('battle::start', sets[name], wso);
            distribute('tppc::drop', name);
            distribute('tppc::drop', opponent);
            return send('battle::turn', null, wso);
          } else {
            for (side in sets) {
              if (side !== name) {
                opponent = side;
                set = sets[side];
                break;
              }
            }
            send('battle::start', set, ws);
            distribute('tppc::drop', name);
            distribute(' npc::drop', opponent);
            return send('battle::turn', null, ws);
          }
        }
      },
      'turn': function(turn, _arg, ws) {
        var bkey, name;
        name = _arg.name;
        if ((bkey = Battles.key(name)) == null) {
          return;
        }
        return Battles.accept(bkey, name, turn, function(answer, next) {
          var wso;
          if (!answer) {
            return Battles.close(bkey, function(sides, winner, npc) {
              var name_, pc, pctargets, reason, result, _i, _len;
              for (name_ in sides) {
                result = sides[name_];
                ws = findPC(name_).ws;
                if (winner) {
                  reason = name_ === winner ? 'victory' : 'defeat';
                } else {
                  reason = 'stalemate';
                }
                send('battle::end', {
                  reason: reason,
                  result: result
                }, ws);
              }
              if (npc) {
                pctargets = getPCsNear(respawned);
                for (_i = 0, _len = pctargets.length; _i < _len; _i++) {
                  pc = pctargets[_i];
                  send('npc::drop', npc, pc.ws);
                }
                return NPC.kill(npc, function(respawned) {
                  var _j, _len1, _results;
                  npcs[respawned.name] = respawned;
                  pctargets = getPCsNear(respawned);
                  _results = [];
                  for (_j = 0, _len1 = pctargets.length; _j < _len1; _j++) {
                    pc = pctargets[_j];
                    _results.push(send('npc::register', respawned, pc.ws));
                  }
                  return _results;
                });
              }
            });
          } else if (!next) {
            return send('battle::turn', answer, ws);
          } else {
            wso = findPC(next).ws;
            return send('battle::turn', answer, wso);
          }
        });
      }
    },
    'fppc': {
      'locals': function(nothing, pc, ws) {
        var npctarget, npctargets, pctarget, pctargets, _i, _j, _len, _len1, _results;
        pctargets = getPCsNear(pc);
        npctargets = getNPCsNear(pc);
        for (_i = 0, _len = pctargets.length; _i < _len; _i++) {
          pctarget = pctargets[_i];
          send('tppc::register', pctarget, ws);
        }
        _results = [];
        for (_j = 0, _len1 = npctargets.length; _j < _len1; _j++) {
          npctarget = npctargets[_j];
          _results.push(send('npc::register', npctarget, ws));
        }
        return _results;
      },
      'move': function(point, pc, ws) {
        var id, name;
        id = pc.id, name = pc.name;
        distribute('tppc::move', {
          name: name,
          point: point
        }, pc);
        return PC.update(name, 'point', point);
      }
    }
  };

  getPCsNear = function(initiator) {
    var id, pc, sec, vector;
    vector = [];
    if ((id = initiator.id, initiator) != null) {
      for (sec in pcs) {
        pc = pcs[sec];
        if (pc.id !== id && pc.location === initiator.location) {
          vector.push(PC.getCharacterById(pc.id));
        }
      }
    } else {
      for (sec in pcs) {
        pc = pcs[sec];
        if (pc.location === initiator.location) {
          vector.push(PC.getCharacterById(pc.id));
        }
      }
    }
    return vector;
  };

  getNPCsNear = function(initiator) {
    var name, npc, vector;
    vector = [];
    for (name in npcs) {
      npc = npcs[name];
      if (npc.location === initiator.location) {
        vector.push(npc);
      }
    }
    return vector;
  };

  findPC = function(name) {
    var pc, sec;
    for (sec in pcs) {
      pc = pcs[sec];
      if (pc.name === name) {
        return pc;
      }
    }
    return null;
  };

  send = function(subject, data, ws) {
    if (ws) {
      return ws.send("" + subject + " " + (JSON.stringify(data)));
    }
  };

  distribute = function(subject, data, initiator) {
    var pc, sec, _results, _results1;
    if (initiator == null) {
      initiator = {};
    }
    if (initiator) {
      _results = [];
      for (sec in pcs) {
        pc = pcs[sec];
        if (pc.id !== initiator.id) {
          _results.push(send(subject, data, pc.ws));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    } else {
      _results1 = [];
      for (sec in pcs) {
        pc = pcs[sec];
        _results1.push(send(subject, data, pc.ws));
      }
      return _results1;
    }
  };

  unsafe = /[^a-zA-Zа-яА-Я.,!?—\- ]/g;

  escape = function(string) {
    if (unsafe.test(string)) {
      return string.replace(unsafe, '');
    } else {
      return string;
    }
  };

  key = function(ws) {
    return ws.upgradeReq.headers['sec-websocket-key'];
  };

  idPattern = /[^;=]+$/;

  ensureSession = function(ws) {
    var array, cookie, cookies, f, i, session, _i, _len, _ref, _step;
    cookie = ws.upgradeReq.headers.cookie;
    if (!cookie) {
      return false;
    }
    cookies = {};
    _ref = array = cookie.split(/\=|;\s?/);
    for (i = _i = 0, _len = _ref.length, _step = 2; _i < _len; i = _i += _step) {
      f = _ref[i];
      cookies[f] = array[i + 1];
    }
    session = cookies.id;
    if (session && Accounts.checkActuality(session)) {
      return true;
    } else {
      return false;
    }
  };

  bySpace = ' ';

  byColon = '::';

  handle = function(message, ws) {
    var chunk, command, data, incoming, pc, process, _ref;
    incoming = message.split(bySpace);
    if (!(pc = pcs[key(ws)])) {
      drop(ws);
      log(error.data, 'critical');
      return;
    }
    command = incoming[0].split(byColon);
    if (command.length === 1) {
      process = requests[command[0]];
    } else {
      process = (_ref = requests[command[0]]) != null ? _ref[command[1]] : void 0;
    }
    if (!process) {
      drop(ws);
      log(error.data, 'critical');
      return;
    }
    if (incoming.length > 2) {
      chunk = incoming.slice(1).join(bySpace);
    } else {
      chunk = incoming[1];
    }
    try {
      data = JSON.parse(chunk);
    } catch (exception) {
      drop(ws);
      log(error.json, 'critical');
      return;
    }
    return process(data, pc, ws);
  };

  drop = function(ws) {
    ws.send('Client has provocated an error');
    return ws.close();
  };

  GAMEServer = {
    use: function(HTTPServer) {
      log('GAME: Running on 80', 'positive');
      NPC.generate(function(npc) {
        return npcs[npc.name] = npc;
      });
      return (new WebSocketServer({
        server: HTTPServer
      })).on('connection', function(ws) {
        if (!ensureSession(ws)) {
          drop(ws);
          return;
        }
        pcs[key(ws)] = {};
        ws.on('message', function(message) {
          return handle(message, ws);
        });
        return ws.on('close', function() {
          var bkey, id, name, sec, _ref;
          _ref = pcs[sec = key(ws)], id = _ref.id, name = _ref.name;
          if (bkey = Battles.key(name)) {
            Battles.close(bkey, function(sides, winner) {
              var name_, result;
              for (name_ in sides) {
                result = sides[name_];
                if (!(name_ !== name)) {
                  continue;
                }
                ws = findPC(name_).ws;
                send('battle::end', {
                  reason: 'leave',
                  result: result
                }, ws);
              }
            });
          }
          delete pcs[sec];
          return distribute('tppc::drop', name);
        });
      });
    }
  };

  module.exports = GAMEServer;

}).call(this);
