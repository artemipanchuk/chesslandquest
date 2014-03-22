#### ———————————————————————————————————————
##   Characters/NPC
#### Provides interface to act with NPCs
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Characters/NPC', (exports) ->

	[CanvasControls, CanvasObjects] =
		@require 'Canvas/Controls',
		         'Canvas/Objects'

	ScenesTileset =
		@require 'Scenes/Tileset'

	Socket =
		@require 'Transport/Socket'

#### ———————————————————————————————————————

	orders = ['npc::register', 'npc::drop', 'npc::move']
	logics = {}

	register = (character) ->
		{name, point} = character

		object = CanvasObjects.register
			type : 'figure/npc'
			data :
				key   : name
				point : point

		logics[name] = character

		autowalk name

		CanvasControls.subscribe object
		CanvasControls.addDialog object, 'character::npc', character

	move = ({name, point}) ->
		character = logics[name]

		from = character.point
		to   = point

		path = ScenesTileset.createPath from, to

		return unless path

		logics[name].point = to

		CanvasObjects.move
			type : 'figure/npc'

			key  : name
			path : path

	drop = (name) ->
		CanvasObjects.drop
			type : 'figure/npc'
			key  : name

		delete logics[name]

	autowalk = (name) ->
		each 5000, ->
			{point} = logics[name]

			vector =
				x : [-1, 0, 1].random*25
				y : [-1, 0, 1].random*25

			console.log point.x, point.y

			to =
				x : point.x+vector.x
				y : point.y+vector.y

			move {name, point:to}

#### ———————————————————————————————————————

	exports.disable = ->
		Socket.disable order for order in orders

	exports.enable = ->
		Socket.enable  order for order in orders

	exports.listen = ->
		Socket.listen 'npc::register', (character) ->
			register character

		Socket.listen 'npc::move', (course) ->
			move course

		Socket.listen 'npc::drop', (name) ->
			drop name

	exports.get = (name) ->
		return logics[name]

#### ———————————————————————————————————————