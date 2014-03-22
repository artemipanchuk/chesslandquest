(function() {
  var DB, UT, online;

  module.paths = module.parent.paths;

  DB = require('db');

  UT = require('utility');

  online = {};

  module.exports = {
    checkAccountExistence: function(username, callback) {
      return DB.within('accounts', function(array) {
        return callback(array.some(function(account) {
          return account.username === username;
        }));
      });
    },
    createAccount: function(account) {
      log("Creating account: " + account.username + " — " + account.password);
      return DB.insert('accounts', account);
    },
    checkAccount: function(username, password, callback) {
      return DB.within('accounts', function(array) {
        return callback(array.some(function(account) {
          return account.username === username && account.password === password;
        }));
      });
    },
    openSession: function(account) {
      var accountₒ, sessionID, username;
      username = account.username;
      for (sessionID in online) {
        accountₒ = online[sessionID];
        if (username === accountₒ.username) {
          return sessionID;
        }
      }
      sessionID = UT.generateID();
      online[sessionID] = account;
      log("Sign in — " + username + " with " + sessionID);
      return sessionID;
    },
    checkActuality: function(id) {
      return !!online[id];
    },
    discoverUsernameById: function(id) {
      var account;
      if (account = online[id]) {
        return account.username;
      } else {
        log('DB: Corrupted id #{id}. Interrupting.', 'critical');
        return null;
      }
    },
    closeSession: function(id) {
      if (online[id]) {
        log("Sign out — " + id);
        return delete online[id];
      }
    }
  };

}).call(this);
