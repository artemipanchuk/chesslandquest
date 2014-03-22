#### ———————————————————————————————————————
##   Scenes/Tileset
#### Provides interface to manage tile engine
#### ———————————————————————————————————————

#### Tiles

# Every tile could have many variations

# Note, that there are 2 types of tiles:

# Weak
weak = ['g']

# Strong
strong = ['e', 'r', 'l', 'd']

# All strong tiles have their 2 (side and corner)
# special transition tiles,
# that apply to neighbor weak tiles

# Weak tiles are usual tiles and may be overlayed
# with strong tile transition

#### ———————————————————————————————————————

@define 'Scenes/Tileset', (exports) ->

	CanvasScenes =
		@require 'Canvas/Scenes'

	Pathfinder =
		@require 'Scenes/Pathfinder'

	Point =
		@require 'LibCanvas/Point'

#### ———————————————————————————————————————

	height = null
	width  = null

#### ———————————————————————————————————————

	# • Get transition sides of strong tile;
	#
	# `tile (string)`, `x (number`, `y (number)`, `matrix (array[][])`
	getPotentialSides = (tile, x, y, matrix) ->
		potential = {}

		# Top
		if y > 0 and matrix[y-1][x] not in strong
			potential[1] =
				x : x
				y : y-1

		# Right
		if x < width-1 and matrix[y][x+1] not in strong
			potential[2] =
				x : x+1
				y : y

		# Bottom
		if y < height-1 and matrix[y+1][x] not in strong
			potential[3] =
				x : x
				y : y+1

		# Left
		if x > 0 and matrix[y][x-1] not in strong
			potential[4] =
				x : x-1
				y : y

		return potential

	# • Get transition corners of strong tile;
	#
	# `tile (string)`, `x (number`, `y (number)`, `matrix (array[][])`
	getPotentialCorners = (tile, x, y, sides, matrix) ->
		potential = {}

		# Top right
		if y > 0 and x < width-1 and matrix[y-1][x+1] not in strong
			potential[1] =
				x : x+1
				y : y-1

		# Bottom right
		if x < width-1 and y < height-1 and matrix[y+1][x+1] not in strong
			potential[2] =
				x : x+1
				y : y+1

		# Bottom left
		if x > 0 and y < height-1 and matrix[y+1][x-1] not in strong
			potential[3] =
				x : x-1
				y : y+1

		# Top left
		if y > 0 and x > 0 and matrix[y-1][x-1] not in strong
			potential[4] =
				x : x-1
				y : y-1

		occupied = [1, 2, 3, 4].filter (c) -> !sides[c]

		for position in occupied
			if position is 1
				delete potential[1]
				delete potential[4]
			else
				delete potential[position]
				delete potential[position-1]

		return potential

	# • Process strong tile;
	#
	# `tile (string)`, `x (number`, `y (number)`, `matrix (array[][])`
	processStrong = (tile, x, y, matrix) ->
		CanvasScenes.projectTile {tile, x, y}

		sides   = getPotentialSides   tile,  x, y, matrix
		corners = getPotentialCorners tile,  x, y, sides, matrix

		for transitions, index in [sides, corners]
			for position, cell of transitions
				angle = switch position
					when '1' then  π
					when '2' then -π/2
					when '3' then  0
					when '4' then  π/2

				type = switch index
					when 0 then 's'
					when 1 then 'c'

				CanvasScenes.projectTransition
					texture : "#{tile}#{type}"
					angle   : angle
					x : cell.x
					y : cell.y

	# • Process weak tile;
	#
	# `tile (string)`, `x (number`, `y (number)`
	processWeak = (tile, x, y) ->
		CanvasScenes.projectTile {tile, x, y}

	processObject = (settings) ->
		{width, height, x, y} = settings

		if width and height
			for xₒ in [x..x+width]
				for yₒ in [y..y+height]
					Pathfinder.close xₒ, yₒ
		else
			Pathfinder.close x, y

		CanvasScenes.projectObject settings

#### ———————————————————————————————————————

	exports.createPath = (from, to) ->
		{size} = CanvasScenes

		exactX = to.x%size
		exactY = to.y%size

		from = CanvasScenes.getCellByPoint(new Point from)?.point
		to   = CanvasScenes.getCellByPoint(new Point to  )?.point

		return unless from and to

		path = Pathfinder.find from, to

		return no unless path.length

		path = path.map (step) ->
			return CanvasScenes.getCellOf step

		path.last.first += exactX-25
		path.last.last  += exactY-25

		path = path[1...]

		return path

	exports.process = (scene, clean) ->
		{matrix} = scene

		CanvasScenes.clean() unless clean

		height = matrix.length
		width  = matrix.first.length

		Pathfinder.update matrix, width, height

		for row, y in matrix
			for value, x in row when value isnt 'i'
				tile = switch value
					when 'g' then 'grass'
					when 'e' then 'earth'
					when 'r' then 'road'
					when 'l' then 'light'
					when 'd' then 'dark'

				if value in strong
					processStrong tile, x, y, matrix
				else
					processWeak   tile, x, y

		for object in scene.objects
			processObject object

		CanvasScenes.complete()

		return {width, height}

#### ———————————————————————————————————————