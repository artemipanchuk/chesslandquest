(function() {

  this.define('Interface/Preparer', function(exports) {
    var Templator, Validator, ajax, create, dom, root, show, _ref;
    _ref = this.require('Interface/Validator', 'Interface/Templator'), Validator = _ref[0], Templator = _ref[1];
    dom = atom.dom, ajax = atom.ajax;
    root = dom('#root');
    root.css({
      height: window.innerHeight - 200
    });
    window.onresize = function() {
      return root.css({
        height: this.innerHeight - 200
      });
    };
    root.delegate('.deeper', 'click', function(event) {
      dom('.screen').addClass('upper');
      return wait(750, function() {
        return create[event.target.id]();
      });
    });
    root.delegate('.back', 'click', function() {
      dom('.screen').addClass('lower');
      return wait(750, function() {
        return create.starter();
      });
    });
    root.delegate('.signout', 'click', function() {
      return Validator.submitSignout();
    });
    root.delegate('.submit', 'click', function(event) {
      var action;
      action = event.target.id.ucfirst();
      return Validator["submitCharacter" + action](dom('.pseudoform'));
    });
    show = function() {
      return dom('.screen').get().className = 'screen';
    };
    create = {
      starter: function() {
        return Templator.provide('screen::starter', function(code) {
          root.html(code);
          return show();
        });
      },
      selection: function() {
        return Templator.provide('screen::selection', function(code) {
          root.html(code);
          show();
          return root.delegate('li', 'click', function(event) {
            var target;
            target = event.target;
            root.find('li').removeClass('selected');
            target.className = 'selected';
            return dom('input[type=hidden]').attr({
              value: target.textContent
            });
          });
        });
      },
      creation: function() {
        return Templator.provide('screen::creation', function(code) {
          root.html(code);
          return show();
        });
      }
    };
    exports.build = function() {
      return create.starter();
    };
    return exports.clean = function(callback) {
      dom('.screen').addClass('upper');
      dom('.container').addClass('vanishing');
      dom.create('section').addClass('fader').appendTo(document.body);
      return wait(1000, function() {
        dom('.container').destroy();
        dom(document.body).addClass('game-mode');
        dom('.fader').destroy();
        return callback();
      });
    };
  });

}).call(this);
