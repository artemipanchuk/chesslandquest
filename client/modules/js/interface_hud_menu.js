(function() {

  this.define('Interface/HUD/Menu', function(exports) {
    var Dialogs, body, categories, dom, mode,
      _this = this;
    Dialogs = this.require('Interface/HUD/Dialogs');
    dom = atom.dom;
    mode = null;
    body = null;
    categories = ['Experience', 'Inventory', 'Army'];
    exports["switch"] = function(place) {
      return mode = place;
    };
    return exports.build = function(place) {
      var topic, _fn, _i, _len;
      if (place == null) {
        place = 'global';
      }
      mode = place;
      body = dom.create('section').attr('id', 'menu').appendTo(document.body);
      dom.create('section').addClass('header').appendTo(body);
      _fn = function() {
        return dom.create('section').attr('id', "menu" + topic).addClass('item').text(topic).appendTo(body).bind('click', function() {
          return Dialogs.build("menu:" + (topic.toLowerCase()));
        });
      };
      for (_i = 0, _len = categories.length; _i < _len; _i++) {
        topic = categories[_i];
        _fn();
      }
      return dom.create('section').attr('id', 'signout').addClass('item').text('Sign out').appendTo(body).bind('click', function() {
        var Validator;
        Validator = _this.require('Interface/Validator');
        return Validator.submitSignout();
      });
    };
  });

}).call(this);
