(function() {

  String.prototype.toHMAC = function(key) {
    return Crypto.HMAC(Crypto.SHA1, this, key);
  };

  String.prototype.toSHA1 = function() {
    return Crypto.SHA1(this);
  };

  this.define('Interface/Validator', function(exports) {
    var ajax, allowed, cookie, divide, dom, getRequest, notify, postRequest, submit, verifyCharacters, verifyDateFormat, verifyFieldMatch, verifyFullness,
      _this = this;
    ajax = atom.ajax, cookie = atom.cookie, dom = atom.dom;
    verifyFullness = function(form, mistakes) {
      return form.forEach(function(field) {
        if (field.value.length === 0) {
          return mistakes.push({
            'message': 'Must Be Filled',
            'selector': field.selector
          });
        }
      });
    };
    allowed = /[a-zA-Z\d. ]+/g;
    verifyCharacters = function(fields, mistakes) {
      return fields.forEach(function(field) {
        if (field.value.replace(allowed, '').length !== 0) {
          return mistakes.push({
            'message': 'Invalid Characters',
            'selector': field.selector
          });
        }
      });
    };
    verifyFieldMatch = function(fields, mistakes) {
      var etalon;
      etalon = fields[0].value;
      return fields.some(function(field) {
        if (field.value !== etalon) {
          return mistakes.push({
            'message': 'Fields Missmatch',
            'selector': field.selector
          });
        }
      });
    };
    verifyDateFormat = function(field, mistakes) {
      var date, value;
      value = field.value;
      if (value) {
        date = new Date(value);
        date.setDate(date.getDate() + 1);
        if (date.toString() === 'Invalid Date' || date > new Date) {
          return mistakes.push({
            'message': 'Invalid Date',
            'selector': 'input#formCalendar'
          });
        }
      }
    };
    divide = function(form) {
      var fields;
      fields = [];
      form.find('input').each(function(element, index) {
        return fields.push({
          'selector': "#" + element.id,
          'value': element.value
        });
      });
      return fields;
    };
    notify = function(form, mistakes) {
      dom('.fieldMessage').destroy();
      return mistakes.forEach(function(mistake) {
        var element, field, handler, message, messageText;
        messageText = mistake.message;
        field = dom(mistake.selector);
        element = field.first;
        field.addClass('invalid');
        message = dom.create('section').addClass('message').css({
          'top': element.offsetTop - 12.5,
          'left': element.offsetLeft + element.offsetWidth + 15
        }).text(messageText).appendTo(form);
        return field.bind('focus', handler = function() {
          field.removeClass('invalid');
          message.destroy();
          return field.unbind('focus', handler);
        });
      });
    };
    getRequest = function(url, callback) {
      return ajax({
        'method': 'get',
        'cache': 'false',
        'url': url,
        onLoad: callback
      });
    };
    postRequest = function(url, callback, data) {
      if (data == null) {
        data = '';
      }
      return ajax({
        'method': 'post',
        'type': 'plain',
        'cache': 'false',
        'url': url,
        'data': data,
        onLoad: callback
      });
    };
    submit = function(form, data, url, callback) {
      var chunk, digest;
      digest = (JSON.stringify(data)).toHMAC(data[0].value);
      data.push(digest);
      chunk = JSON.stringify(data);
      return ajax({
        'method': 'post',
        'type': 'plain',
        'cache': 'false',
        'url': url,
        'data': chunk,
        onLoad: callback,
        onError: function(xhr) {
          return notify(form, JSON.parse(xhr.target.response));
        }
      });
    };
    exports.submitSignout = function() {
      return postRequest('/account/sign-out', function(response) {
        cookie.del('id');
        cookie.del('character');
        return window.location = '/';
      });
    };
    exports.submitSignin = function(form) {
      var data, mistakes;
      data = divide(form);
      mistakes = [];
      verifyFullness(data, mistakes);
      verifyCharacters(data, mistakes);
      data[1].value = data[1].value.toSHA1();
      if (mistakes.length > 0) {
        return notify(form, mistakes);
      } else {
        return submit(form, data, '/account/sign-in', function(response) {
          cookie.set('id', response);
          return window.location = '/game';
        });
      }
    };
    exports.submitSignup = function(form) {
      var data, mistakes;
      data = divide(form);
      mistakes = [];
      verifyFullness(data, mistakes);
      verifyCharacters(data.slice(0, 2), mistakes);
      verifyFieldMatch(data.slice(1, 3), mistakes);
      verifyDateFormat(data[3], mistakes);
      data.splice(2, 1);
      data[1].value = data[1].value.toSHA1();
      if (mistakes.length > 0) {
        return notify(form, mistakes);
      } else {
        return submit(form, data, '/account/sign-up', function(response) {
          cookie.set('id', response);
          return window.location = '/game';
        });
      }
    };
    exports.submitCharacterCreation = function(form) {
      var Master, data, mistakes;
      Master = _this.require('Master');
      data = divide(form);
      mistakes = [];
      verifyFullness(data, mistakes);
      verifyCharacters(data, mistakes);
      if (mistakes.length > 0) {
        return notify(form, mistakes);
      } else {
        return submit(form, data, '/game/create-character', function(id) {
          return Master.game(id);
        });
      }
    };
    return exports.submitCharacterSelection = function(form) {
      var Master, data, mistakes;
      Master = _this.require('Master');
      data = divide(form);
      mistakes = [];
      verifyFullness(data, mistakes);
      verifyCharacters(data, mistakes);
      if (mistakes.length > 0) {
        return notify(form, mistakes);
      } else {
        return submit(form, data, '/game/select-character', function(id) {
          return Master.game(id);
        });
      }
    };
  });

}).call(this);
