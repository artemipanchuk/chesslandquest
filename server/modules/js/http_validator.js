(function() {
  var Accounts, GameServer, PC, UT, Validator, allowed, verifyAccount, verifyAccountExistence, verifyCharacterExistence, verifyCharacterOnwnership, verifyCharacters, verifyDate, verifyFormat, verifyFullness, verifyHMAC,
    __slice = [].slice;

  module.paths = module.parent.paths;

  Accounts = require('http_accounts');

  GameServer = require('game_server');

  PC = require('game_pc');

  UT = require('utility');

  verifyFormat = function(form, n, mistakes) {
    if (form.length !== n) {
      mistakes.push({
        'message': 'Invalid format',
        'selector': form[0].selector
      });
      return 'invalid';
    }
  };

  verifyFullness = function(form, mistakes) {
    return form.forEach(function(field) {
      if (field.value.length === 0) {
        return mistakes.push({
          'message': 'Must be filled',
          'selector': field.selector
        });
      }
    });
  };

  allowed = /[a-zA-Z\d. ]+/g;

  verifyCharacters = function() {
    var fields, mistakes, _i;
    fields = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), mistakes = arguments[_i++];
    return fields.forEach(function(field) {
      if (field.value.replace(allowed, '').length !== 0) {
        return mistakes.push({
          'message': 'Invalid characters',
          'selector': field.selector
        });
      }
    });
  };

  verifyDate = function(field, mistakes) {
    var date, value;
    value = field.value;
    if (value) {
      date = new Date(value);
      date.setDate(date.getDate() + 1);
      if (date.toString() === 'Invalid Date' || date > new Date) {
        return mistakes.push({
          'message': 'Invalid date',
          'selector': 'input#formCalendar'
        });
      }
    }
  };

  verifyAccountExistence = function(field, mistakes, callback) {
    return Accounts.checkAccountExistence(field.value, function(status) {
      if (status) {
        mistakes.push({
          'message': 'Already exists',
          'selector': field.selector
        });
      }
      return callback();
    });
  };

  verifyCharacterExistence = function(field, mistakes, callback) {
    return PC.checkCharacterExistence(field.value, function(status) {
      if (status) {
        mistakes.push({
          'message': 'Already exists',
          'selector': field.selector
        });
      }
      return callback();
    });
  };

  verifyCharacterOnwnership = function(name, owner, mistakes, callback) {
    return PC.checkCharacterOwnership(name.value, owner, function(status) {
      if (!status) {
        mistakes.push({
          'message': 'Ownership required',
          'selector': name.selector
        });
      }
      return callback();
    });
  };

  verifyHMAC = function(form, mistakes) {
    var digest, serverDigest, username;
    digest = form.pop();
    username = form[0].value;
    serverDigest = UT.hash(JSON.stringify(form), username);
    if (serverDigest !== digest) {
      return mistakes.push({
        'message': 'Attack detected',
        'selector': form[0].selector
      });
    }
  };

  verifyAccount = function(username, password, mistakes, callback) {
    return Accounts.checkAccount(username.value, password.value, function(status) {
      if (!status) {
        mistakes.push({
          'message': 'Incorrect details',
          'selector': 'input#formLogin, input#formPassword'
        });
      }
      return callback();
    });
  };

  Validator = {
    parseSignin: function(form, callback) {
      var digest, format, mistakes, password, username;
      mistakes = [];
      format = verifyFormat(form, 3, mistakes);
      if (format === 'invalid') {
        callback(mistakes);
      }
      username = form[0], password = form[1], digest = form[2];
      verifyHMAC(form, mistakes);
      verifyFullness(form, mistakes);
      verifyCharacters(username, password, mistakes);
      return verifyAccount(username, password, mistakes, function() {
        return callback(mistakes.length ? mistakes : true);
      });
    },
    parseSignup: function(form, callback) {
      var date, format, mistakes, password, repeat, username;
      mistakes = [];
      format = verifyFormat(form, 5, mistakes);
      if (format === 'invalid') {
        callback(mistakes);
      }
      username = form[0], password = form[1], repeat = form[2], date = form[3];
      verifyHMAC(form, mistakes);
      verifyFullness(form, mistakes);
      verifyCharacters(username, password, mistakes);
      verifyDate(date, mistakes);
      return verifyAccountExistence(username, mistakes, function() {
        return callback(mistakes.length ? mistakes : true);
      });
    },
    parseCharacterCreation: function(form, callback) {
      var format, mistakes, name;
      mistakes = [];
      format = verifyFormat(form, 2, mistakes);
      if (format === 'invalid') {
        callback(mistakes);
      }
      name = form[0];
      verifyHMAC(form, mistakes);
      verifyFullness(form, mistakes);
      verifyCharacters(name, mistakes);
      return verifyCharacterExistence(name, mistakes, function() {
        return callback(mistakes.length ? mistakes : true);
      });
    },
    parseCharacterSelection: function(form, owner, callback) {
      var format, mistakes, name;
      mistakes = [];
      format = verifyFormat(form, 2, mistakes);
      if (format === 'invalid') {
        callback(mistakes);
      }
      name = form[0];
      verifyHMAC(form, mistakes);
      verifyFullness(form, mistakes);
      verifyCharacters(name, mistakes);
      return verifyCharacterOnwnership(name, owner, mistakes, function() {
        return callback(mistakes.length ? mistakes : true);
      });
    }
  };

  module.exports = Validator;

}).call(this);
