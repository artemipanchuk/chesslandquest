#### ———————————————————————————————————————
##   Canvas/Projection
#### Provides projection
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Canvas/Projection', (exports) ->

	[Projection, Point3D, Point, Size] =
		@require 'LibCanvas/IsometricEngine/Projection',
		         'LibCanvas/Point3D',
		         'LibCanvas/Point'
		         'LibCanvas/Size'

#### ———————————————————————————————————————

	# Store client's window parametres
	{innerWidth:width, innerHeight:height} = window

	exports.padding = padding = 200
	exports.screen  = screen  = new Size width, height
	exports.size    = size    = new Size  4700, 2900

	projection = new Projection
		factor : [0.866, 0.5, 1],
		start  : [padding, padding+size.y/2],
		size   : 1

#### ———————————————————————————————————————

	exports.to3D = (point2D) ->
		point3D = projection.to3D point2D

		point3D.x = point3D.x.floor()
		point3D.y = point3D.y.floor()

		return point3D

	# • Export translate function for other modules;
	#
	# `coordinates (LibCanvas/Point)`
	exports.translatePoint = (point3D) ->
		if point3D instanceof Array
			point3D = new Point3D point3D.first, point3D.second

		point2D = projection.toIsometric point3D

		return point2D

	proportion = 1.075
	exports.translateTile = (polygon, keep = false) ->
		polygon.scale proportion, polygon.center unless keep

		polygon.points = polygon.points.map (point3D) ->
			return projection.toIsometric point3D

		return polygon

#### ———————————————————————————————————————