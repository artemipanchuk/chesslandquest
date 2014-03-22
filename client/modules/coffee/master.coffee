#### ———————————————————————————————————————
##   Master
#### Application interface
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Master', (exports) ->

	[
		CharactersMaster,
		InterfaceMaster,
		CanvasMaster,
		BattleMaster,
		ScenesMaster,
		UnitsMaster
	] =
		@require 'Characters/Master',
		         'Interface/Master',
		         'Canvas/Master',
		         'Battle/Master',
		         'Scenes/Master',
		         'Units/Master'

	Socket =
		@require 'Transport/Socket'

	Transport =
		@require 'Transport/Master'

#### ———————————————————————————————————————

	game = null

#### ———————————————————————————————————————

	prepareState = (character) ->
		{location:name} = character

		# Rebuild interface for state
		InterfaceMaster.prepareHUD ->
			Transport.request {type:'scene', name}, (scene) ->
				ScenesMaster.buildGlobalScene {name, scene}

				Socket.send 'fppc::locals', {}

				CharactersMaster.registerPlayer character

	prepareBattle = (settings) ->
		BattleMaster.startBattle settings, ->
			# Disable listeners for global scene,
			# now they are unactual
			Socket.disable 'battle'

			# Disable handlers for global scene,
			# now they are unactual
			CharactersMaster.disable()

			# Switch interface to battle
			InterfaceMaster.switchHUD
				mode : 'battle'
				type : settings.type

			# Build battle scene
			ScenesMaster.buildBattleScene settings

	endBattle = (settings) ->
		BattleMaster.endBattle settings, ->
			# Enable listeners for global scene,
			# now they are actual
			Socket.enable 'battle'

			# Enable handlers for global scene,
			# now they are actual
			CharactersMaster.enable()

			# Request actual state
			Socket.send 'state', game

#### ———————————————————————————————————————

	# • Prepare application;
	exports.prepare = ->
		# Build preparation interface
		InterfaceMaster.preparePreparationInterface()

		# Listen for game state (disposable)
		Socket.listen 'state', prepareState

		# Listen for battle state
		Socket.listen 'battle', prepareBattle

		# Listen for battle state
		Socket.listen 'battle::end', endBattle

	# • Game;
	#
	# `id (string)`
	exports.game = (id) ->
		Master.initialize() for Master in [
			CanvasMaster,
			CharactersMaster,
			BattleMaster,
			UnitsMaster
		]

		game = id

		Socket.send 'state', game

#### ———————————————————————————————————————