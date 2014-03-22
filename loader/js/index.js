(function() {

  this.files = {
    a: ['stylesheets/css/index.css'],
    s: ['submodules/crypto/crypto.js', 'submodules/atomjs/atom-full-compiled.js', 'modules/js/utility.js', 'modules/js/interface_validator.js']
  };

  this.handlers = {
    'onfinish': function() {
      var Validator, dom, form;
      dom = atom.dom;
      Validator = this.require('Interface/Validator');
      form = dom('#loginForm');
      form.bind('keypress', function(event) {
        if (event.keyCode === 13) {
          return Validator.submitSignin(form);
        }
      });
      return form.find('button').bind('click', function() {
        return Validator.submitSignin(form);
      });
    }
  };

}).call(this);
