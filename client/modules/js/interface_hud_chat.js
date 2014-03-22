(function() {

  this.define('Interface/HUD/Chat', function(exports) {
    var Socket, body, disable, dom, enable, escape, field, listen, messages, mode, post, send;
    Socket = this.require('Transport/Socket');
    dom = atom.dom;
    messages = null;
    field = null;
    body = null;
    mode = null;
    escape = function(string) {
      if (unsafe.test(string)) {
        return string.replace(unsafe, '');
      } else {
        return string;
      }
    };
    post = function(sender, text) {
      return dom.create('section').addClass('message').text("" + sender + ": " + text).appendTo(messages);
    };
    send = function() {
      var text;
      if (!(text = escape(field.text())).trim().length) {
        return;
      }
      field.text('');
      post('Me', text);
      return Socket.send("chat::" + mode, text);
    };
    listen = function(chanel) {
      return Socket.listen("chat::" + chanel, function(message) {
        return post(message.name, message.text);
      });
    };
    disable = function(chanel) {
      return Socket.disable("chat::" + chanel);
    };
    enable = function(chanel) {
      return Socket.enable("chat::" + chanel);
    };
    exports["switch"] = function(place) {
      body.removeClass('hidden');
      disable(mode);
      mode = place;
      listen(mode);
      return messages.find('*').destroy();
    };
    exports.hide = function() {
      return body.addClass('hidden');
    };
    return exports.build = function(place) {
      if (place == null) {
        place = 'global';
      }
      mode = place;
      body = dom.create('section').attr('id', 'chat').appendTo(document.body);
      dom.create('section').addClass('header').appendTo(body);
      messages = dom.create('section').addClass('messages').appendTo(body);
      field = dom.create('section').addClass('field').attr('contenteditable', 'true').appendTo(body);
      field.bind('keypress', function(event) {
        if (event.keyCode === 13) {
          return send();
        }
      });
      return listen(mode);
    };
  });

}).call(this);
