#### ———————————————————————————————————————
##   Canvas/Objects
#### Provides objects classes
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Canvas/Objects', (exports) ->

	[Projection, Animations] =
		@require 'Canvas/Projection',
		         'Canvas/Animations'

	[Element, Rectangle, Point] =
		@require 'LibCanvas/App/Element',
		         'LibCanvas/Rectangle',
		         'LibCanvas/Point'

	Preloader = @require 'Transport/Preloader'

#### ———————————————————————————————————————

	shift = null
	layer = null

	class AElement extends Element
		@get 'point', ->
			return @shape.center.clone()

		@get 'zIndex', ->
			return @shape.points[2].y

		@get 'changed', ->
			return @previousBoundingShape isnt null

		constructor : ({data}) ->
			{point:@point3D} = data

			super layer

		configure : ->
			{point3D, name} = @

			Animations.create name

			@shape ?= do =>
				point    = Projection.translatePoint point3D
				point.y -= @height-12.5
				point.x -= @width/2

				rectangle = new Rectangle
					from : point
					size : {@width, @height}

				return rectangle.toPolygon()

			layer.ctx.projectiveImage
				image : @image
				to    : @shape.clone().move shift

			delete @point3D ; force()

		clearPrevious : (ctx) ->
			if @changed
				ctx.clearRect @previousBoundingShape.move shift

		renderTo : (ctx, resources) ->
			if @changed
				ctx.projectiveImage
					image : @image
					to    : @shape.clone().move shift

	class StaticElement extends AElement

	class DynamicElement extends AElement
		move : (path, onstep) ->
			{name, shape, height} = @

			Animations.reset name

			redraw = @redraw.bind @

			for step in path then do ->
				vector = null
				target = Projection.translatePoint step

				next = step

				Animations.add
					target : name
					length : 250

					pre : (part) ->
						base   = new Point shape.center.x, shape.center.y+17
						vector = base.diff(target).mul(part)

					tick : ->
						shape.move vector

						do redraw

					finish : if onstep then -> onstep next

		destroy : ->
			Animations.reset name

			super

	class Decoration extends StaticElement
		constructor : ({@type, data}) ->
			@image = Preloader.get data.name

			{@width, @height} = @image

			super

	class MultiDecoration extends Decoration
		@get 'zIndex', ->
			return @shape.points[3].y-15

		constructor : ({@type, data}) ->
			super

	class SingleDecoration extends Decoration
		constructor : ({@type, data}) ->
			super

	class Effect extends StaticElement
		@get 'zIndex', ->
			return 0

		constructor : ({@type, data}) ->
			@image = Preloader.get @type.split('/')[1]

			{@width, @height} = @image ; {@shape} = data

			super

	class Figure extends DynamicElement
		width  : 50
		height : 64

		constructor : ({@type, data}) ->
			@image = Preloader.get 'character'
			@key   = "#{@type}/#{data.key}"

			super

	find = (key) ->
		for element in layer.elements
			if element.key is key
				return element

	clean = ->
		{elements} = layer

		while elements.first?
			elements.first.destroy()
			elements.shift()

		layer.ctx.clearAll()

	cleanBy = (type) ->
		{elements} = layer ; type = new RegExp type

		target = elements.filter (element) -> type.test element.type

		target.forEach (element) ->
			wait 0, -> element.destroy()

		force()

	force = ->
		layer.draw()

	exports.initialize = (app) ->
		layer = app.createLayer
			name         : 'objects'
			intersection : 'all'
			invoke       : true
			zIndex       : 3

	patterns =
		decoration :
			single : /decoration\/single/
			multi  : /decoration\/multi/
		figure     : /figure\/.*/
		effect     : /effect\/.*/

	exports.register = ({type, data}) =>
		shift ?= @require('Canvas/Controls').linkToShift()

		switch yes
			when patterns.decoration.single.test type
				return new SingleDecoration {type, data}

			when patterns.decoration.multi.test type
				return new MultiDecoration {type, data}

			when patterns.figure.test type
				return new Figure {type, data}

			when patterns.effect.test type
				return new Effect {type, data}

			else
				return null

	exports.drop = ({type, key}) ->
		find("#{type}/#{key}").destroy()

	exports.move = ({type, key, link, path}) ->
		find("#{type}/#{key}").move path, if link then (point) ->
			link.point = point

	exports.clean = (type) ->
		if type?
			cleanBy type
		else
			clean()