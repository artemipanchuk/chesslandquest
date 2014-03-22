(function() {
  var MongoDB, connection, db;

  module.paths = module.parent.paths;

  MongoDB = require('mongodb');

  db = (function() {
    var Db, Server, database, server;
    Server = MongoDB.Server, Db = MongoDB.Db;
    server = new Server('127.0.0.1', 27017, {
      auto_reconnect: true,
      poolSize: 4
    });
    database = new Db('primary', server, {
      safe: true,
      w: 0,
      native_parser: false
    });
    return database;
  })();

  connection = null;

  db.open(function(error, current) {
    if (error) {
      log('DB: Unknown database');
      return;
    }
    return connection = current;
  });

  module.exports = {
    within: function(collection, callback) {
      return connection.collection(collection, function(error, collection) {
        if (error) {
          log('DB: Unknown collection');
          return;
        }
        return collection.find({}, {}, function(error, cursor) {
          return cursor.toArray(function(error, items) {
            return callback(items);
          });
        });
      });
    },
    insert: function(collection, object) {
      return connection.collection(collection, function(error, collection) {
        if (error) {
          log('DB: Unknown collection');
          return;
        }
        return collection.insert(object);
      });
    },
    update: function(collection, query, object) {
      return connection.collection(collection, function(error, collection) {
        if (error) {
          log('DB: Unknown collection');
          return;
        }
        return collection.update(query, object);
      });
    },
    remove: function(collection, object) {
      return connection.collection(collection, function(error, collection) {
        return collection.remove(object);
      });
    }
  };

}).call(this);
