(function() {
  var Accounts, GameServer, PC, Scenes, Templator, UT, Units, Validator, about, contentTypeTable, ensureIncomingData, ensurePost, ensureSession, extensionPattern, fillers, handlers, idPattern, redirect, responseCharacter, responseHTML, responseJSON, responseMessage, responseSession, versions;

  module.paths = module.parent.paths;

  Validator = require('http_validator');

  Templator = require('http_templator');

  Accounts = require('http_accounts');

  GameServer = require('game_server');

  Scenes = require('game_scenes');

  Units = require('game_units');

  PC = require('game_pc');

  UT = require('utility');

  extensionPattern = /\.(js|html|css|png|ttf|otf|ico)/;

  contentTypeTable = {
    '.js': 'text/javascript',
    '.html': 'text/html',
    '.css': 'text/css',
    '.png': 'image/png',
    '.otf': 'font/opentype',
    '.ttf': 'font/ttf'
  };

  about = function(subject) {
    return "Warning: invalid " + subject;
  };

  idPattern = /[^;=]+$/;

  ensureSession = function(request) {
    var array, cookie, cookies, f, i, session, _i, _len, _ref, _step;
    cookie = request.headers.cookie;
    if (!cookie) {
      return false;
    }
    cookies = {};
    _ref = array = cookie.split(/\=|;\s?/);
    for (i = _i = 0, _len = _ref.length, _step = 2; _i < _len; i = _i += _step) {
      f = _ref[i];
      cookies[f] = array[i + 1];
    }
    session = cookies.id;
    if (session && Accounts.checkActuality(session)) {
      return session;
    } else {
      return false;
    }
  };

  ensurePost = function(request) {
    return request.method === 'POST';
  };

  ensureIncomingData = function(chunk) {
    var data;
    if (chunk.length > 256) {
      log('HTTP: Corrupted incoming data. Interrupting.', 'critical');
      return false;
    }
    try {
      data = JSON.parse(chunk);
    } catch (exception) {
      log('JSON: Corrupted request. Interrupting.', 'critical');
      return false;
    }
    return data;
  };

  redirect = function(url, response) {
    response.writeHead(302, {
      'location': url
    });
    return response.end();
  };

  responseHTML = function(path, response) {
    response.statusCode = 200;
    response.setHeader('content-type', 'text/html');
    return UT.responseFile(path, response);
  };

  responseMessage = function(message, response, code) {
    if (code == null) {
      code = 200;
    }
    response.statusCode = code;
    return UT.responseText(message, response);
  };

  responseJSON = function(data, response, code) {
    var message;
    if (code == null) {
      code = 200;
    }
    message = JSON.stringify(data);
    return responseMessage(message, response, code);
  };

  responseSession = function(details, response) {
    var session;
    session = Accounts.openSession(details);
    return responseMessage(session, response);
  };

  responseCharacter = function(name, response) {
    return PC.selectCharacter(name, function(character) {
      return responseMessage(character, response);
    });
  };

  versions = {
    'template': function(name, callback) {
      return Templator.getVersion(name, function(actual) {
        return callback(actual);
      });
    },
    'scene': function(name, callback) {
      return Scenes.getVersion(name, function(actual) {
        return callback(actual);
      });
    }
  };

  fillers = {
    'characters': function(request, callback) {
      var session, username;
      if (!(session = ensureSession(request))) {
        responseMessage(about('session'), response, 406);
        return;
      }
      username = Accounts.discoverUsernameById(session);
      return PC.getCharactersByOwner(username, function(characters) {
        return callback({
          characters: characters
        });
      });
    }
  };

  handlers = {
    '/': function(request, response) {
      if (ensureSession(request)) {
        return redirect('/game', response);
      } else {
        return responseHTML('client/pages/index.html', response);
      }
    },
    '/signup': function(request, response) {
      return responseHTML('client/pages/signup.html', response);
    },
    '/account/sign-in': function(request, response) {
      if (!ensurePost(request)) {
        responseMessage(about('method'), response, 406);
        return;
      }
      return request.addListener('data', function(chunk) {
        var form;
        if (!(form = ensureIncomingData(chunk))) {
          responseMessage(about('structure'), response, 406);
          return;
        }
        return Validator.parseSignin(form, function(status) {
          var password, username, _ref;
          if (status === true) {
            _ref = form.slice(0, 2).map(function(field) {
              return field.value;
            }), username = _ref[0], password = _ref[1];
            return responseSession({
              username: username,
              password: password
            }, response);
          } else {
            return responseJSON(status, response, 406);
          }
        });
      });
    },
    '/account/sign-out': function(request, response) {
      var session;
      if (!(session = ensureSession(request))) {
        responseMessage(about('session'), response, 406);
        return;
      }
      Accounts.closeSession(session);
      response.statusCode = 200;
      return response.end();
    },
    '/account/sign-up': function(request, response) {
      if (!ensurePost(request)) {
        responseMessage(about('method'), response, 406);
        return;
      }
      return request.addListener('data', function(chunk) {
        var form;
        if (!(form = ensureIncomingData(chunk))) {
          responseMessage(about('structure'), response, 406);
          return;
        }
        return Validator.parseSignup(form, function(status) {
          var date, password, username, _ref;
          if (status === true) {
            _ref = [form[0], form[1], form[3]].map(function(field) {
              return field.value;
            }), username = _ref[0], password = _ref[1], date = _ref[2];
            Accounts.createAccount({
              username: username,
              password: password,
              date: date
            });
            return responseSession({
              username: username,
              password: password
            }, response);
          } else {
            return responseJSON(status, response, 406);
          }
        });
      });
    },
    '/account/details': function(request, response) {
      var session, username;
      if (!(session = ensureSession(request))) {
        responseMessage(about('session'), response, 406);
        return;
      }
      username = Accounts.discoverUsernameById(session);
      return PC.getCharactersByOwner(username, function(characters) {
        return responseJSON({
          characters: characters
        }, response);
      });
    },
    '/game': function(request, response) {
      if (ensureSession(request)) {
        return responseHTML('client/pages/game.html', response);
      } else {
        return redirect('/', response);
      }
    },
    '/game/create-character': function(request, response) {
      if (!ensurePost(request)) {
        responseMessage(about('method'), response, 406);
        return;
      }
      return request.addListener('data', function(chunk) {
        var form, session;
        if (!(session = ensureSession(request))) {
          responseMessage(about('session'), response, 406);
          return;
        }
        if (!(form = ensureIncomingData(chunk))) {
          responseMessage(about('structure'), response, 406);
          return;
        }
        return Validator.parseCharacterCreation(form, function(status) {
          var name, owner;
          if (status === true) {
            name = form[0].value;
            owner = Accounts.discoverUsernameById(session);
            PC.createCharacter({
              name: name,
              owner: owner
            });
            return responseCharacter(name, response);
          } else {
            return responseJSON(status, response, 406);
          }
        });
      });
    },
    '/game/select-character': function(request, response) {
      if (!ensurePost(request)) {
        responseMessage(about('method'), response, 406);
        return;
      }
      return request.addListener('data', function(chunk) {
        var form, owner, session;
        if (!(session = ensureSession(request))) {
          responseMessage(about('session'), response, 406);
          return;
        }
        if (!(form = ensureIncomingData(chunk))) {
          responseMessage(about('structure'), response, 406);
          return;
        }
        owner = Accounts.discoverUsernameById(session);
        return Validator.parseCharacterSelection(form, owner, function(status) {
          var name;
          if (status === true) {
            name = form[0].value;
            return responseCharacter(name, response);
          } else {
            return responseJSON(status, response, 406);
          }
        });
      });
    },
    '/401': function(request, response) {
      return responseHTML('client/pages/401.html', response);
    },
    '/403': function(request, response) {
      return responseHTML('client/pages/403.html', response);
    },
    '/404': function(request, response) {
      return responseHTML('client/pages/404.html', response);
    },
    '/version': function(request, response) {
      if (!ensurePost(request)) {
        responseMessage(about('method'), response, 406);
        return;
      }
      return request.addListener('data', function(key) {
        var check, name, type, _ref;
        _ref = key.split('/'), type = _ref[0], name = _ref[1];
        if ((check = versions[type]) != null) {
          return check(name, function(actual) {
            return responseMessage(actual, response);
          });
        } else {
          return responseMessage(about('request'), response, 406);
        }
      });
    },
    '/template': function(request, response) {
      if (!ensurePost(request)) {
        responseMessage(about('method'), response, 406);
        return;
      }
      return request.addListener('data', function(name) {
        return Templator.get(name, function(code) {
          if (!code) {
            responseMessage(about('request'), response, 406);
            return;
          }
          return responseMessage(code, response);
        });
      });
    },
    'resource': function(path, request, response) {
      var contentType, extension, _ref;
      extension = (_ref = extensionPattern.exec(path)) != null ? _ref[0] : void 0;
      contentType = contentTypeTable[extension] || 'text/plain';
      path = path.replace(/\//, '');
      response.setHeader('content-type', contentType);
      return UT.responseResource(path, request, response);
    }
  };

  module.exports = handlers;

}).call(this);
