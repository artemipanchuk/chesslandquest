(function() {

  this.define('Master', function(exports) {
    var BattleMaster, CanvasMaster, CharactersMaster, InterfaceMaster, ScenesMaster, Socket, Transport, UnitsMaster, endBattle, game, prepareBattle, prepareState, _ref;
    _ref = this.require('Characters/Master', 'Interface/Master', 'Canvas/Master', 'Battle/Master', 'Scenes/Master', 'Units/Master'), CharactersMaster = _ref[0], InterfaceMaster = _ref[1], CanvasMaster = _ref[2], BattleMaster = _ref[3], ScenesMaster = _ref[4], UnitsMaster = _ref[5];
    Socket = this.require('Transport/Socket');
    Transport = this.require('Transport/Master');
    game = null;
    prepareState = function(character) {
      var name;
      name = character.location;
      return InterfaceMaster.prepareHUD(function() {
        return Transport.request({
          type: 'scene',
          name: name
        }, function(scene) {
          ScenesMaster.buildGlobalScene({
            name: name,
            scene: scene
          });
          Socket.send('fppc::locals', {});
          return CharactersMaster.registerPlayer(character);
        });
      });
    };
    prepareBattle = function(settings) {
      return BattleMaster.startBattle(settings, function() {
        Socket.disable('battle');
        CharactersMaster.disable();
        InterfaceMaster.switchHUD({
          mode: 'battle',
          type: settings.type
        });
        return ScenesMaster.buildBattleScene(settings);
      });
    };
    endBattle = function(settings) {
      return BattleMaster.endBattle(settings, function() {
        Socket.enable('battle');
        CharactersMaster.enable();
        return Socket.send('state', game);
      });
    };
    exports.prepare = function() {
      InterfaceMaster.preparePreparationInterface();
      Socket.listen('state', prepareState);
      Socket.listen('battle', prepareBattle);
      return Socket.listen('battle::end', endBattle);
    };
    return exports.game = function(id) {
      var Master, _i, _len, _ref1;
      _ref1 = [CanvasMaster, CharactersMaster, BattleMaster, UnitsMaster];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        Master = _ref1[_i];
        Master.initialize();
      }
      game = id;
      return Socket.send('state', game);
    };
  });

}).call(this);
