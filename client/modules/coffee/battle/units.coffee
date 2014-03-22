#### ———————————————————————————————————————
##   Battle/Units
#### Provides units control
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Battle/Units', (exports) ->

#### ———————————————————————————————————————

	CanvasObjects =
		@require 'Canvas/Objects'

	ScenesTileset =
		@require 'Scenes/Tileset'

#### ———————————————————————————————————————

	units = opponent : {}, own : {}

	n = 0

#### ———————————————————————————————————————

	exports.register = ({side, cell, point, rank, key}) ->
		unless key
			key = n+1 ; ++n

		units[side][key] = {key, rank, cell, point}

		CanvasObjects.register
			type : 'figure/unit'
			data : {point, key}

		return key

	exports.update = ({side, key, point, cell}) ->
		origin = units[side][key] ; {point:old} = origin

		path = ScenesTileset.createPath old, point

		CanvasObjects.move
			type : 'figure/unit'
			key  : key
			path : path

		origin.cell  = cell
		origin.point = point

	exports.drop = ({side, key}) ->
		delete units[side][key]

		CanvasObjects.drop
			type : 'figure/unit'
			key  : key

	exports.get = (side, key, property) ->
		switch undefined
			when key
				return units[side]
			when property
				return units[side][key]
			else
				return units[side][key][property]