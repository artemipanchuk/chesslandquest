@files =
	a : [
		'stylesheets/css/game-preparer.css',
		'stylesheets/css/game-hud.css',

		'submodules/camanjs/dist/caman.full.min.js'
	]

	s : [
		'submodules/crypto/crypto.js',
		'submodules/atomjs/atom-full-compiled.js',
		'submodules/libcanvas/libcanvas-full-compiled.js',
		'submodules/pathfinding/lib/pathfinding-browser.min.js',

		'modules/js/utility.js',

		#### Transport —————————————————————————————

		'modules/js/transport_socket.js',
		'modules/js/transport_preloader.js',
		'modules/js/transport_master.js',

		#### Interface —————————————————————————————

		'modules/js/interface_validator.js',
		'modules/js/interface_templator.js',
		'modules/js/interface_preparer.js',

		'modules/js/interface_hud_dialogs.js',
		'modules/js/interface_hud_arranger.js',
		'modules/js/interface_hud_menu.js',
		'modules/js/interface_hud_chat.js',
		'modules/js/interface_hud_master.js',

		'modules/js/interface_master.js',

		#### Canvas ————————————————————————————————

		'modules/js/canvas_projection.js',
		'modules/js/canvas_animations.js',
		'modules/js/canvas_controls.js',
		'modules/js/canvas_objects.js',
		'modules/js/canvas_scenes.js',
		'modules/js/canvas_master.js',

		#### Scene —————————————————————————————————

		'modules/js/scenes_pathfinder.js',
		'modules/js/scenes_tileset.js',
		'modules/js/scenes_global.js',
		'modules/js/scenes_battle.js',
		'modules/js/scenes_master.js',

		#### Characters ————————————————————————————

		'modules/js/characters_fppc.js',
		'modules/js/characters_tppc.js',
		'modules/js/characters_npc.js',
		'modules/js/characters_master.js',

		#### Units —————————————————————————————————

		'modules/js/units_master.js',

		#### Battle ————————————————————————————————

		'modules/js/battle_units.js',
		'modules/js/battle_board.js',
		'modules/js/battle_regulator.js',
		'modules/js/battle_master.js',

		#### Master ————————————————————————————————

		'modules/js/master.js'
	]

@handlers =
	'submodules/pathfinding/lib/pathfinding-browser.min.js' : ->
		@define 'PathFinding', (exports) ->
			for key, value of PF
				exports[key] = value

		delete window.PF

	'submodules/libcanvas/libcanvas-full-compiled.js' : ->
		@define 'LibCanvas', (exports) ->
			LibCanvas.extract exports

		delete window.LibCanvas

	'onfinish' : ->
		Master =
			@require 'Master'

		Preloader =
			@require 'Transport/Preloader'

		Preloader.initialize ->
			Master.prepare()