(function() {

  this.define('Interface/HUD/Arranger', function(exports) {
    var Dialogs, Preloader, body, deselect, dom, mode, selected, store, unitsCase,
      _this = this;
    Dialogs = this.require('Interface/HUD/Dialogs');
    Preloader = this.require('Transport/Preloader');
    dom = atom.dom;
    unitsCase = null;
    selected = null;
    body = null;
    mode = false;
    store = function(name, select) {
      var icon, image;
      image = Preloader.get("" + name + "i");
      icon = dom(image).addClass(name).appendTo(unitsCase).bind('click', function(event) {
        deselect();
        icon.addClass('selected');
        selected = name;
        return mode = true;
      });
      if (select != null) {
        return icon.addClass('selected');
      }
    };
    deselect = function() {
      unitsCase.find('.selected').removeClass('selected');
      selected = null;
      return mode = false;
    };
    exports.destroy = function() {
      var CanvasControls;
      CanvasControls = _this.require('Canvas/Controls');
      body.destroy();
      return CanvasControls.removeMouseAction('click');
    };
    exports.visualize = function(status) {
      body.find('.status-indicator').toggleClass('').addClass(status ? 'valid' : 'invalid');
      if (!status) {
        return Dialogs.view('Invalid set', 'yellow');
      }
    };
    return exports.build = function() {
      var BattleBoard, BattleMaster, CanvasControls, CharactersFPPC, controlCase, rank, reserve, self, units, _fn, _i, _len, _ref;
      CharactersFPPC = _this.require('Characters/FPPC');
      CanvasControls = _this.require('Canvas/Controls');
      _ref = _this.require('Battle/Master', 'Battle/Board'), BattleMaster = _ref[0], BattleBoard = _ref[1];
      reserve = [];
      units = CharactersFPPC.get('army');
      self = CharactersFPPC.get();
      Dialogs.view('Arrange your units on the board');
      body = dom.create('section').attr('id', 'arranger').appendTo(document.body);
      controlCase = dom.create('section').addClass('control-case').appendTo(body);
      dom.create('button').text('Ready').appendTo(controlCase).bind('click', function() {
        return BattleMaster.submit();
      });
      dom.create('section').addClass('status-indicator').appendTo(controlCase);
      unitsCase = dom.create('section').addClass('units-case').appendTo(body).bind('mousedown', function(event) {
        if (event.button === 2) {
          return deselect();
        }
      });
      console.dir(units);
      _fn = function() {
        return store(rank);
      };
      for (_i = 0, _len = units.length; _i < _len; _i++) {
        rank = units[_i];
        _fn();
      }
      store('general');
      return CanvasControls.addMouseAction('click', function(point) {
        if (mode === true) {
          return BattleBoard.place(selected, point, function(old) {
            if (old) {
              store(old);
            }
            selected = null;
            mode = false;
            return unitsCase.find('.selected').destroy();
          });
        } else {
          return BattleBoard.pick(point, function(picked) {
            selected = picked;
            mode = true;
            return store(picked, true);
          });
        }
      });
    };
  });

}).call(this);
