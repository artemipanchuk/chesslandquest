#### ———————————————————————————————————————
##   Canvas/Scenes
#### Provides tile engine controller for scenes
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Canvas/Scenes', (exports) ->

	[Element, TileEngine, Rectangle, Point, Size] =
		@require 'LibCanvas/TileEngine/Element',
		         'LibCanvas/TileEngine',
		         'LibCanvas/Rectangle',
		         'LibCanvas/Point',
		         'LibCanvas/Size',

	Preloader =
		@require 'Transport/Preloader'

	[Projection, Controls, Objects] =
		@require 'Canvas/Projection',
		         'Canvas/Controls',
		         'Canvas/Objects'

#### ———————————————————————————————————————

	size = exports.size = 50
	area = new Size size, size
	zero = new Size 0, 0

	overlapsLayer = null
	tilesLayer    = null

	engine = new TileEngine
		size         : area
		cellSize     : area
		cellMargin   : zero
		defaultValue : 'no'

	# • Get random number;
	#
	# `n (number)` —> `(number)`
	variations = (n) ->
		Math.round(Math.random()*n)

	projectSingleObject = ({name, x, y}) ->
		Objects.register
			type : 'decoration/single'
			data :
				point : {x:(x+0.5)*size, y:(y+0.5)*size}
				name  : name

	projectMultiObject = ({name, x, y, width, height}) ->
		object = Objects.register
			type : 'decoration/multi'
			data :
				point : {x:(x+0.5)*size, y:(y+height+0.5)*size}
				name  : name

		Controls.subscribe object
		Controls.addDialog object, "place::#{name}", self

	projectEffect = ({name, point}) ->
		cell    = engine.getCellByIndex new Point point
		polygon = Projection.translateTile cell.rectangle.toPolygon()

		Objects.register
			type : "effect/#{name}"
			data :
				shape : polygon

	projectTile = ({texture, cell}) ->
		polygon = Projection.translateTile cell.rectangle.toPolygon()

		tilesLayer.ctx.projectiveImage
			image : Preloader.get texture
			to    : polygon

	projectTransition = ({x, y, angle, texture}) ->
		polygon = engine.getCellByIndex(new Point x, y).rectangle.toPolygon()

		polygon.rotate angle, polygon.center

		polygon = Projection.translateTile polygon

		overlapsLayer.ctx.projectiveImage
			image : Preloader.get texture
			to    : polygon

	engine.setMethod
		grass : (ctx, cell) ->
			projectTile
				texture : "grass#{variations 1}"
				cell    : cell

		earth : (ctx, cell) ->
			projectTile
				texture : "earth#{variations 1}"
				cell    : cell

		road : (ctx, cell) ->
			projectTile
				texture : "road#{variations 1}"
				cell    : cell

		dark : (ctx, cell) ->
			projectTile
				texture : "dark"
				cell    : cell

		light : (ctx, cell) ->
			projectTile
				texture : "light"
				cell    : cell

		no : ->

#### ———————————————————————————————————————

	exports.projectTile = ({tile, x, y}) ->
		engine.getCellByIndex(new Point x, y).value = tile

	exports.projectTransition = (settings) ->
		projectTransition settings

	exports.projectObject = (settings) ->
		if settings.width? and settings.height?
			projectMultiObject settings
		else
			projectSingleObject settings

	exports.getCellOf = (point) ->
		coordinates = point.clone().mul(size)

	exports.getCellByPoint = (point) ->
		return engine.getCellByPoint new Point point

	exports.clean = ->
		Controls.clean()
		Objects .clean()

		for cell in engine.cells
			cell.value = 'no'

		overlapsLayer.ctx.clearAll()
		tilesLayer.ctx.clearAll()

	exports.complete = ->
		for cell in engine.cells
			engine.updateCell cell

	exports.effect = (settings) ->
		projectEffect settings

	exports.cleanEffects = ->
		Objects.clean 'effect'

	# • Initial function;
	#
	# `settings (object)`
	exports.initialize = (app) ->
		{screen} = Projection

		pseudoLayer = app.createLayer
			zIndex : 0
			name   : 'pseudo'

		tilesLayer = app.createLayer
			zIndex : 0
			name   : 'tiles'

		overlapsLayer = app.createLayer
			zIndex : 1
			name   : 'overlaps'

		element = new Element pseudoLayer,
			engine : engine
			from   : new Point 0, 0

#### ———————————————————————————————————————