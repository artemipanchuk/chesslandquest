#### ———————————————————————————————————————
##   Characters/FPPC
#### Provides interface to act FPPC
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Characters/FPPC', (exports) ->

	[CanvasControls, CanvasObjects] =
		@require 'Canvas/Controls',
		         'Canvas/Objects'

	ScenesTileset =
		@require 'Scenes/Tileset'

	Socket =
		@require 'Transport/Socket'

#### ———————————————————————————————————————

	orders = ['fppc::register', 'fppc::drop', 'fppc::move']
	self   = null

	move = (to) ->
		from = self.point
		path = ScenesTileset.createPath from, to

		return unless path

		Socket.send 'fppc::move', to

		CanvasObjects.move
			type : 'figure/fppc'
			link : self

			key  : self.name
			path : path

#### ———————————————————————————————————————

	exports.listen = ->
		CanvasControls.addMouseAction 'click', move

	exports.enable  = ->
		CanvasControls.addMouseAction 'click', move

	exports.disable = ->
		CanvasControls.removeMouseAction 'click', move

	exports.register = (character) ->
		self = character ; {name, point} = self

		object = CanvasObjects.register
			type : 'figure/fppc'
			data :
				key   : name
				point : point

		CanvasControls.subscribe object
		CanvasControls.addDialog object, 'character::fppc', self

		wait 1, ->
			CanvasControls.observe object.point

	exports.calculate = ->
		radius = self.rank ; ways = []

		radius.times (i) -> 
			++i ; ways.push [
				[ 0,  i],
				[ i,  0],
				[ i,  i],
				[-i, -i],
				[ 0, -i],
				[-i,  0],
				[-i,  i],
				[ i, -i]
			]...

		return ways

	exports.get = (what)->
		return if what? then self[what] else self

	exports.update = (field, value) ->
		self[field] = value

#### ———————————————————————————————————————