#### ———————————————————————————————————————
##   Scene/Pathfinder
#### Provides find pathes on scene
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Scenes/Pathfinder', (exports) ->

#### ———————————————————————————————————————

	[AStarFinder, Grid] =
		@require 'PathFinding/AStarFinder',
		         'PathFinding/Grid'

#### ———————————————————————————————————————

	finder = null
	grid   = null

#### ———————————————————————————————————————

	exports.update = (matrix, width, height) ->
		table = []

		for row, y in matrix
			table[y] = []

			for value, x in row
				table[y][x] = 0

		finder = new AStarFinder
			allowDiagonal : yes

		grid = new Grid width, height, table

	exports.close = (x, y) ->
		grid.setWalkableAt x, y, no

	exports.find = (from, to) ->
		gridBackup = grid.clone()

		path = finder.findPath from.x, from.y, to.x, to.y, grid

		# Add part of cell to make ways through centers of cells
		path = path.map (s) -> return [s[0]+0.5, s[1]+0.5]

		grid = gridBackup

		return path

#### ———————————————————————————————————————