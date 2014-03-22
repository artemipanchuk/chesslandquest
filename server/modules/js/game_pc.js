(function() {
  var Accounts, DB, UT, defaults, online, table;

  module.paths = module.parent.paths;

  Accounts = require('http_accounts');

  DB = require('db');

  UT = require('utility');

  online = {};

  table = {};

  defaults = {
    location: 'field',
    points: 0,
    rank: 1,
    army: [],
    inventory: []
  };

  module.exports = {
    checkCharacterExistence: function(name, callback) {
      return DB.within('characters', function(array) {
        return callback(array.some(function(character) {
          return character.name === name;
        }));
      });
    },
    checkCharacterOwnership: function(name, owner, callback) {
      return DB.within('characters', function(array) {
        return callback(array.some(function(character) {
          return character.name === name && character.owner === owner;
        }));
      });
    },
    createCharacter: function(character) {
      var property, value;
      log("Creating character: " + character.name + " — " + character.owner);
      for (property in defaults) {
        value = defaults[property];
        character[property] = value;
      }
      return DB.insert('characters', character);
    },
    getCharactersByOwner: function(username, callback) {
      var targets;
      targets = [];
      return DB.within('characters', function(array) {
        var character, _i, _len;
        for (_i = 0, _len = array.length; _i < _len; _i++) {
          character = array[_i];
          if (character.owner === username) {
            targets.push(character);
          }
        }
        return callback(targets);
      });
    },
    getCharacterByName: function(name, callback) {
      if (callback == null) {
        return online[table[name]];
      }
      return DB.within('characters', function(array) {
        var character, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = array.length; _i < _len; _i++) {
          character = array[_i];
          if (character.name === name) {
            _results.push(callback(character));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
    },
    getCharacterById: function(id) {
      var character;
      if (character = online[id]) {
        return character;
      } else {
        log("DB: Corrupted character. Interrupting.", 'critical');
        return null;
      }
    },
    getCharacterNameById: function(id) {
      var character;
      if (character = online[id]) {
        return character.name;
      } else {
        log("DB: Corrupted character. Interrupting.", 'critical');
        return null;
      }
    },
    update: function(name, field, value) {
      var character;
      character = online[table[name]];
      character[field] = value;
      return DB.update('characters', {
        name: name
      }, character);
    },
    selectCharacter: function(name, callback) {
      var target;
      target = null;
      return DB.within('characters', function(array) {
        var character, id, _i, _len;
        for (_i = 0, _len = array.length; _i < _len; _i++) {
          character = array[_i];
          if (character.name === name) {
            target = character;
            break;
          }
        }
        id = UT.generateID();
        online[id] = target;
        table[name] = id;
        log("Select — " + name + " with " + id);
        return callback(id);
      });
    },
    deselectCharacter: function(id) {
      if (online[id]) {
        delete online[id];
        return log("Deselect — " + id);
      } else {
        log("DB: Corrupted character. Interrupting.", 'critical');
        return null;
      }
    }
  };

}).call(this);
