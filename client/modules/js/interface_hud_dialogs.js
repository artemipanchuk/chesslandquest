(function() {

  this.define('Interface/HUD/Dialogs', function(exports) {
    var Socket, Templator, body, build, byColon, clean, destroy, dialogs, dom, wrap,
      _this = this;
    Socket = this.require('Transport/Socket');
    Templator = this.require('Interface/Templator');
    dom = atom.dom;
    body = dom().body;
    body.delegate('.close', 'click', function() {
      return clean();
    });
    body.delegate('.unit-item', 'click', function(event) {
      var FPPC, army, coll, cost, points, rank, target;
      FPPC = _this.require('Characters/FPPC');
      target = event.target;
      rank = target.parentElement.id;
      coll = dom(target);
      cost = parseInt(dom(target).get().nextSibling.textContent);
      if (coll.hasClass('lack')) {
        return;
      }
      points = FPPC.get('points');
      army = FPPC.get('army');
      points -= cost;
      army.push(rank);
      FPPC.update('points', points);
      FPPC.update('army', army);
      dom('.dialog').find('.unit-item').each(function(element) {
        var tr;
        tr = element.parentElement;
        cost = parseInt(element.nextSibling.textContent);
        if (cost > points) {
          return dom(tr).addClass('lack');
        }
      });
      return Socket.send('transaction::unit', rank);
    });
    Socket.listen('transaction::unit', function(status) {});
    wrap = function(code) {
      return dom.create('section').html(code).find('.dialog').appendTo(body);
    };
    dialogs = {
      'wait': function() {
        var dialog;
        dialog = dom.create('section').addClass('wait dialog').appendTo(body);
        return dom.create('h2').text('Please, wait').appendTo(dialog);
      },
      'place': {
        'market-units': function() {
          return Templator.provide('dialog::market-units', function(code) {
            var FPPC, points;
            wrap(code);
            FPPC = _this.require('Characters/FPPC');
            points = FPPC.get().points;
            return dom('.dialog').find('.unit-item').each(function(element) {
              var cost, tr;
              tr = element.parentElement;
              cost = parseInt(element.nextSibling.textContent);
              if (cost > points) {
                return dom(tr).addClass('lack');
              }
            });
          });
        }
      },
      'menu': {
        'experience': function() {},
        'inventory': function() {},
        'army': function() {}
      },
      'character': {
        'npc': function(_arg) {
          var CharactersNPC, dialog, name, opponent, quantity, sectionUnits, uname, unit, units, _i, _len, _ref, _ref1, _results;
          name = _arg.name;
          CharactersNPC = _this.require('Characters/NPC');
          opponent = CharactersNPC.get(name);
          dialog = dom.create('section').addClass('npc dialog').appendTo(document.body);
          dom.create('h2').text("" + (name.ucfirst()) + " the Computer").appendTo(dialog);
          sectionUnits = dom.create('section').addClass('units-case').appendTo(dialog);
          dom.create('button').addClass('close').text('Close').appendTo(dialog).bind('click', function() {
            return dialog.destroy();
          });
          dom.create('button').addClass('fight').text('Fight!').appendTo(dialog).bind('click', function() {
            Socket.send('battle::call', {
              type: 'npc',
              name: name
            });
            dialog.destroy();
            return build('wait');
          });
          units = {};
          _ref = opponent.army;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            uname = _ref[_i];
            if ((_ref1 = units[uname]) == null) {
              units[uname] = 0;
            }
            ++units[uname];
          }
          _results = [];
          for (unit in units) {
            quantity = units[unit];
            dom.create('span').addClass('rank').text(unit).appendTo(sectionUnits);
            _results.push(dom.create('span').addClass('quantity').text(quantity).appendTo(sectionUnits));
          }
          return _results;
        },
        'tppc': function(_arg) {
          var CharactersTPPC, dialog, name, opponent, quantity, sectionUnits, unit, unitName, units, _i, _len, _name, _ref, _ref1, _results;
          name = _arg.name;
          CharactersTPPC = _this.require('Characters/TPPC');
          opponent = CharactersTPPC.get(name);
          console.dir(opponent);
          dialog = dom.create('section').addClass('tppc dialog').appendTo(document.body);
          dom.create('h2').text("General " + (name.ucfirst())).appendTo(dialog);
          sectionUnits = dom.create('section').addClass('units-case').appendTo(dialog);
          dom.create('button').addClass('close').text('Close').appendTo(dialog).bind('click', function() {
            return dialog.destroy();
          });
          dom.create('button').addClass('fight').text('Fight').appendTo(dialog).bind('click', function() {
            Socket.send('battle::call', {
              type: 'tppc',
              name: name
            });
            dialog.destroy();
            return build('wait');
          });
          units = {};
          units.general = "" + (name.ucfirst()) + " of " + opponent.experience.rank;
          _ref = opponent.army;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            unit = _ref[_i];
            if ((_ref1 = units[_name = unitName = unit.stats.name]) == null) {
              units[_name] = 0;
            }
            ++units[unitName];
          }
          _results = [];
          for (unit in units) {
            quantity = units[unit];
            dom.create('span').addClass('rank').text(unit).appendTo(sectionUnits);
            _results.push(dom.create('span').addClass('quantity').text(quantity).appendTo(sectionUnits));
          }
          return _results;
        }
      },
      'battle': {
        'reject': function() {
          var dialog;
          clean();
          dialog = dom.create('section').addClass('battle-reject dialog').appendTo(document.body);
          dom.create('h2').addClass('headerMessage').text('Sorry, your battle call was rejected').appendTo(dialog);
          return dom.create('button').addClass('close').text('Close').appendTo(dialog).bind('click', function() {
            return dialog.destroy();
          });
        },
        'call': function(_arg) {
          var CharactersTPPC, dialog, name, opponent, quantity, sectionUnits, unit, unitName, units, _i, _len, _name, _ref, _ref1, _results;
          name = _arg.name;
          CharactersTPPC = _this.require('Characters/TPPC');
          opponent = CharactersTPPC.get(name);
          dialog = dom.create('section').addClass('battle-call dialog').appendTo(document.body);
          dom.create('h2').text("General " + (name.ucfirst()) + " is calling you for a battle").appendTo(dialog);
          sectionUnits = dom.create('section').addClass('units-case').appendTo(dialog);
          dom.create('button').addClass('reject').text('Reject').appendTo(dialog).bind('click', function() {
            dialog.destroy();
            return Socket.send('battle::answer', false);
          });
          dom.create('button').addClass('accept').text('Accept').appendTo(dialog).bind('click', function() {
            dialog.destroy();
            build('wait');
            return Socket.send('battle::answer', true);
          });
          units = {};
          units.general = "" + (name.ucfirst()) + " of " + opponent.experience.rank;
          _ref = opponent.army;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            unit = _ref[_i];
            if ((_ref1 = units[_name = unitName = unit.stats.name]) == null) {
              units[_name] = 0;
            }
            ++units[unitName];
          }
          _results = [];
          for (unit in units) {
            quantity = units[unit];
            dom.create('span').addClass('rank').text(unit).appendTo(sectionUnits);
            _results.push(dom.create('span').addClass('quantity').text(quantity).appendTo(sectionUnits));
          }
          return _results;
        },
        'end': function(_arg, callback) {
          var casualties, dialog, points, quantity, reason, result, sectionUnits, unit, units, _i, _len, _ref,
            _this = this;
          reason = _arg.reason, result = _arg.result;
          dialog = dom.create('section').addClass('battle-end dialog').appendTo(document.body);
          dom.create('h2').text("" + (reason.ucfirst()) + "!").appendTo(dialog);
          points = result.points, casualties = result.casualties;
          units = {};
          dom.create('p').addClass('points-case').text("Gained points: " + points).appendTo(dialog);
          for (_i = 0, _len = casualties.length; _i < _len; _i++) {
            unit = casualties[_i];
            if ((_ref = units[unit]) == null) {
              units[unit] = 0;
            }
            ++units[unit];
          }
          sectionUnits = dom.create('section').addClass('units-case').appendTo(dialog);
          for (unit in units) {
            quantity = units[unit];
            dom.create('span').addClass('rank').text(unit).appendTo(sectionUnits);
            dom.create('span').addClass('quantity').text(quantity).appendTo(sectionUnits);
          }
          return dom.create('button').addClass('accept').text('Accept').appendTo(dialog).bind('click', function() {
            dialog.destroy();
            return callback();
          });
        }
      }
    };
    exports.clean = clean = function() {
      return dom('section.dialog').destroy();
    };
    byColon = '::';
    exports.build = build = function(type, settings, callback) {
      var depth, _base, _name;
      depth = type.split(byColon);
      if (depth.length === 1) {
        return typeof dialogs[type] === "function" ? dialogs[type](settings, callback) : void 0;
      } else {
        return typeof (_base = dialogs[depth[0]])[_name = depth[1]] === "function" ? _base[_name](settings, callback) : void 0;
      }
    };
    exports.view = function(text, exact) {
      var h1;
      h1 = dom.create('h1').text(text).appendTo(document.body);
      if (exact != null) {
        h1.addClass(exact);
      }
      return wait(2000, function() {
        h1.addClass('vanishing');
        return wait(750, function() {
          return h1.destroy();
        });
      });
    };
    return exports.destroy = destroy = function(type) {
      return dom('section.dialog.#{type}').destroy();
    };
  });

}).call(this);
