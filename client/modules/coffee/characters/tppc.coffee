#### ———————————————————————————————————————
##   Characters/TPPC
#### Provides interface to act with TPPCs
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Characters/TPPC', (exports) ->

	[CanvasControls, CanvasObjects] =
		@require 'Canvas/Controls',
		         'Canvas/Objects'

	ScenesTileset =
		@require 'Scenes/Tileset'

	Socket =
		@require 'Transport/Socket'

#### ———————————————————————————————————————

	orders = ['tppc::register', 'tppc::drop', 'tppc::move']
	logics = {}

	register = (character) ->
		{name, point} = character

		object = CanvasObjects.register
			type : 'figure/tppc'
			data :
				key   : name
				point : point

		logics[name] = character

		CanvasControls.subscribe object
		CanvasControls.addDialog object, 'character::tppc', character

	move = ({name, point}) ->
		character = logics[name]

		from = character.point
		to   = point

		path = ScenesTileset.createPath from, to

		return unless path

		CanvasObjects.move
			type : 'figure/tppc'
			link : character

			key  : name
			path : path

	drop = (name) ->
		CanvasObjects.drop
			type : 'figure/tppc'
			key  : name

		delete logics[name]

#### ———————————————————————————————————————

	exports.disable = ->
		Socket.disable order for order in orders

	exports.enable = ->
		Socket.enable  order for order in orders

	exports.listen = ->
		Socket.listen 'tppc::register', (character) ->
			register character

		Socket.listen 'tppc::move', (course) ->
			move course

		Socket.listen 'tppc::drop', (name) ->
			drop name

	exports.get = (name) ->
		return logics[name]

#### ———————————————————————————————————————