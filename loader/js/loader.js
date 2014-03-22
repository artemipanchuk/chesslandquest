(function() {
  var XHR,
    __slice = [].slice;

  this.call = function() {
    var args, scope;
    scope = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return scope.apply(null, args);
  };

  XHR = (function() {
    var current, defaults, get, ok, ready;
    current = window.location.toString();
    get = 'GET';
    ready = 4;
    ok = 200;
    defaults = {
      method: get,
      async: true,
      url: current
    };
    return function(options) {
      var mode, request, responseHandler;
      request = new XMLHttpRequest;
      options.onLoad = options.onLoad || null;
      options.onError = options.onError || null;
      mode = (typeof options.mode === 'undefined') || (options.mode === true) ? true : false;
      request.open(options.method || defaults.method, options.url || defaults.url, mode);
      responseHandler = function() {
        if (request.readyState === ready) {
          if (request.status === ok) {
            if (options.onLoad) {
              return options.onLoad(request.response);
            }
          } else {
            if (options.onError) {
              return options.onError(request.response);
            }
          }
        }
      };
      request.send(null);
      if (mode) {
        return request.onreadystatechange = responseHandler;
      } else {
        return call(responseHandler);
      }
    };
  })();

  this.Loader = (function() {
    var evaluateLibrary, evaluateScript, evaluateWarrant, extensionPattern, finalize, libraryPattern, load, onfinish, request, requestCSS, requestJS, sandbox, warrant;
    libraryPattern = /\/library\//g;
    requestJS = function(url, handler, mode) {
      return XHR({
        url: url,
        mode: mode,
        onLoad: function(code) {
          if (libraryPattern.test(url)) {
            evaluateLibrary(code);
          } else {
            evaluateScript(code);
          }
          if (handler) {
            return handler.call(sandbox);
          }
        },
        onError: function() {
          return console.log("Loader: Failed to load " + url);
        }
      });
    };
    requestCSS = function(url) {
      var head, node;
      node = document.createElement('link');
      head = document.head;
      node.rel = 'stylesheet';
      node.href = "" + url;
      return head.appendChild(node);
    };
    extensionPattern = /\.\w+$/;
    request = function(url, handler, mode) {
      var extension;
      extension = extensionPattern.exec(url)[0];
      url = "/client/" + url;
      switch (extension) {
        case '.js':
          return requestJS(url, handler, mode);
        case '.css':
          return requestCSS(url);
        default:
          throw new Error('Unresolved extension');
      }
    };
    load = function(files, handlers, mode) {
      if (handlers == null) {
        handlers = {};
      }
      return files.forEach(function(url) {
        return request(url, handlers[url], mode);
      });
    };
    onfinish = function() {};
    evaluateScript = function(code) {
      return eval(code);
    };
    evaluateLibrary = function(code) {
      return eval(code);
    };
    evaluateWarrant = function(code) {
      var files, handlers;
      eval(code);
      files = this.files, handlers = this.handlers;
      if (files.a) {
        load(files.a, handlers);
      }
      if (files.s) {
        load(files.s, handlers, false);
      }
      if (handlers != null ? handlers.onfinish : void 0) {
        onfinish = handlers.onfinish;
      }
      return finalize();
    };
    finalize = function() {
      if (onfinish) {
        onfinish.call(sandbox);
      }
      return console.log('Loader: Done');
    };
    sandbox = {
      define: function(module, implement) {
        var a, b, c, depth, imports, length, _base, _ref, _ref1, _ref2;
        depth = module.split('/');
        imports = {};
        if (typeof implement === 'function') {
          implement.call(this, imports);
        } else {
          imports = implement;
        }
        length = depth.length;
        if (length === 1) {
          return this[depth[0]] = imports;
        } else if (length === 2) {
          a = depth[0], b = depth[1];
          if ((_ref = this[a]) == null) {
            this[a] = {};
          }
          return this[a][b] = imports;
        } else if (length === 3) {
          a = depth[0], b = depth[1], c = depth[2];
          if ((_ref1 = this[a]) == null) {
            this[a] = {};
          }
          if ((_ref2 = (_base = this[a])[b]) == null) {
            _base[b] = {};
          }
          return this[a][b][c] = imports;
        }
      },
      require: function() {
        var depth, modules,
          _this = this;
        modules = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (modules.length === 1) {
          depth = modules[0].split('/');
          if (depth.length > 1) {
            return depth.reduce(function(a, b, index) {
              if (index === 1) {
                return _this[a][b];
              } else {
                return a[b];
              }
            });
          } else {
            return this[depth[0]];
          }
        } else {
          return modules.map(function(name) {
            return _this.require(name);
          });
        }
      }
    };
    warrant = {};
    return call(function() {
      var page;
      page = (function() {
        page = location.pathname.replace('/', '').replace(/\//g, '_');
        if (page.length === 0) {
          page = 'index';
        }
        return "loader/js/" + page + ".js";
      })();
      evaluateWarrant = evaluateWarrant.bind(warrant);
      evaluateScript = evaluateScript.bind(sandbox);
      return XHR({
        url: page,
        onLoad: evaluateWarrant
      });
    });
  })();

}).call(this);
