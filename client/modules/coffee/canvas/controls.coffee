#### ———————————————————————————————————————
##   Canvas/Controls
#### Provides application control for client
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Canvas/Controls', (exports) ->

	[MouseHandler, LayerShift, Mouse, Point] =
		@require 'LibCanvas/App/MouseHandler',
		         'LibCanvas/App/LayerShift',
		         'LibCanvas/Mouse',
		         'LibCanvas/Point'

	Projection =
		@require 'Canvas/Projection'

	HUD =
		@require 'Interface/HUD/Master'

#### ———————————————————————————————————————

	ASearch =
		@require 'LibCanvas/App/ElementsMouseSearch'

	class Search extends ASearch
		constructor : ->
			@elements = []

		findByPoint : (point) ->
			coordinate = point.clone().move linkToShift(), true

			for element in @elements
				if element.isTriggerPoint coordinate
					return [element]

			return []

#### ———————————————————————————————————————

	mouse        = null
	layerShifts  = null
	mouseHandler = null

	{size, screen, padding} = Projection

	window.oncontextmenu = Mouse.prevent

	# • Add application scrolling function;
	#
	# `app (LibCanvas/App)`
	addScrollingFunctionTo = (app) ->
		# First of all,
		# shift all layers to initial position
		layerShifts = app.layers.map (layer) ->
			layerShift = new LayerShift layer

			layerShift.setLimitShift
				from : [screen.x-size.x, screen.y-size.y-padding]
				to   : [0, 0]

		mouse = new Mouse app.container.bounds

		# Now add new event handler
		mouse.events.add 'move', (event, mouse) ->
			{clientX:x, clientY:y} = event

			if x < 5
				xs = 10
			else if x > screen.x - 5
				xs = -10

			if y < 5
				ys = 10
			else if y > screen.y - 5
				ys = -10

			if xs or ys
				scroll [xs or 0, ys or 0]

	scroll = (vector) ->
		layerShifts.forEach (layerShift) ->
			layerShift.addShift vector

#### ———————————————————————————————————————

	exports.linkToShift = linkToShift = ->
		return layerShifts.first.shift

	exports.clean = ->
		layerShifts.forEach (layerShift) ->
			layerShift.setShift new Point 0, 0

	exports.observe = (point) ->
		point.reverse()

		point.x += screen.x/2 ; point.y += screen.y/2

		layerShifts.forEach (layerShift) ->
			layerShift.setShift point

	# • Initial function;
	#
	# `settings (object)`
	exports.initialize = (app) ->
		addScrollingFunctionTo app

		mouseHandler = new MouseHandler
			search : new Search
			app    : app
			mouse  : mouse

	exports.subscribe = (element) ->
		mouseHandler.subscribe element

	exports.addDialog = (element, type, settings) ->
		element.events.add 'click', (event) ->
			if event.button is 2
				HUD.dialog "#{type}", settings

	exports.addInteractive = (element, action, callback) ->
		element.events.add action, callback

	exports.addMouseAction = (event, callback) ->
		mouse.events.add event, (event, mouse) ->
			point = mouse.point.clone()
			shift = linkToShift()

			point.x -= shift.x
			point.y -= shift.y

			point = Projection.to3D point

			callback point

	exports.removeMouseAction = (event) ->
		mouse.events.remove event

	exports.addKeyboardAction = (event, callback) ->

#### ———————————————————————————————————————