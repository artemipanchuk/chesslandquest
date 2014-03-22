(function() {

  this.files = {
    a: ['stylesheets/css/signup.css', 'submodules/kalendae/build/kalendae.css', 'submodules/kalendae/build/kalendae.js'],
    s: ['submodules/atomjs/atom-full-compiled.js', 'submodules/crypto/crypto.js', 'modules/js/utility.js', 'modules/js/interface_validator.js']
  };

  this.handlers = {
    'submodules/kalendae/build/kalendae.js': function() {
      return new Kalendae.Input('formCalendar', {
        months: 2
      });
    },
    'onfinish': function() {
      var Validator, dom, form;
      dom = atom.dom;
      Validator = this.require('Interface/Validator');
      form = dom('#signupForm');
      form.bind('keypress', function(event) {
        if (event.keyCode === 13) {
          return Validator.submitSignup(form);
        }
      });
      return form.find('button').bind('click', function() {
        return Validator.submitSignup(form);
      });
    }
  };

}).call(this);
