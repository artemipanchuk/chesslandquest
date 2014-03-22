#### ———————————————————————————————————————
##   Battle/Board
#### Provides battle board control
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Battle/Board', (exports) ->

	Point =
		@require 'LibCanvas/Point'

	[Projection, Controls, Scenes] =
		@require 'Canvas/Projection',
		         'Canvas/Controls',
		         'Canvas/Scenes'

	UnitsMaster =
		@require 'Units/Master'

	Units =
		@require 'Battle/Units'

#### ———————————————————————————————————————

	# Chessboard size
	size = null

	# Working mode (by default)
	mode = null

	# Cell size
	cellSize = null

	# Chessboard cells state
	matrix = []

	# Available cells for arranger
	home = []

#### ———————————————————————————————————————

	divide = (point) ->
		{floor} = Math

		cell =
			x : floor(point.x/cellSize)-1
			y : floor(point.y/cellSize)-1

		return cell

	place =
		arranger : (x, y, rank, callback) ->
			return unless home.some (point) -> point.x is x and point.y is y

			point = new Point [
				(x+1.5)*cellSize,
				(y+1.5)*cellSize
			]

			if key = matrix[y][x]
				callback Units.get 'own', key, 'rank'
			else
				callback()

			matrix[y][x] = Units.register
				side  : 'own'
				cell  : {x, y}
				point : point
				rank  : rank

		fight : (x, y, key, callback) ->
			target = matrix[y][x]

			switch true
				when Units.get('opponent', target)?
					callback 'attack', {x, y}, (old) ->
						matrix[old.y][old.x] = null

						# Apply new key
						matrix[y][x] = key

						# Drop opponent's unit
						Units.drop
							side : 'opponent'
							key  : target

						# Calculate point by cell
						point = new Point [
							(x+1.5)*cellSize,
							(y+1.5)*cellSize
						]

						# Then update information
						Units.update
							side  : 'own'
							key   :  key

							point : point
							cell  : {x, y}

				when unit = Units.get('own', target)
					callback 'change', unit

				else
					callback 'move', {x, y}, (old) ->
						matrix[old.y][old.x] = null

						# Apply new key
						matrix[y][x] = key

						# Calculate point by cell
						point = new Point [
							(x+1.5)*cellSize,
							(y+1.5)*cellSize
						]

						# Then update information
						Units.update
							side  : 'own'
							key   :  key

							point : point
							cell  : {x, y}

	pick =
		arranger : (x, y, key, callback) ->
			rank = Units.get 'own', key, 'rank'

			matrix[y][x] = null

			Units.drop
				side : 'own'
				key  :  key

			callback rank

		fight : (x, y, key, callback) ->
			if unit = Units.get 'own', key
				#move   = UnitsMaster.get active.rank, 'move'
				#attack = UnitsMaster.get active.rank, 'move'

				callback unit

#### ———————————————————————————————————————

	exports.configure = (settings) ->
		{size} = settings ; {size:cellSize} = Scenes

		mode = 'arranger'

		size.times (y) ->
			matrix[y] = []

			size.times (x) ->
				matrix[y][x] = null

		size.times (y) ->
			(size/4).times (x) ->
				home.push {x, y}

		for {x, y} in home
			Scenes.effect
				point :  {x:x+1, y:y+1}
				name  : 'white'

		# Translate camera to center point of the board
		wait 1, ->
			Controls.observe Projection.translatePoint [a=(size+1)*cellSize/2, a]

	exports.place = (key, point, callback) ->
		{x, y} = divide point

		if 0 <= x < size and 0 <= y < size
			place[mode] x, y, key, callback

	exports.pick = (point, callback) ->
		{x, y} = divide point

		if key = matrix[y]?[x]
			pick[mode] x, y, key, callback

	exports.make = ({key, turn}) ->
		if key > 0
			turn.x = -turn.x ; key = -key

		{cell, point} = Units.get 'opponent', key

		x = cell.x+turn.x
		y = cell.y+turn.y

		matrix[cell.y][cell.x] = null

		if matrix[y][x]?
			Units.drop
				side : 'own'
				key  : matrix[y][x]

		matrix[y][x] = key

		# Calculate point by cell
		point = new Point [
			(x+1.5)*cellSize,
			(y+1.5)*cellSize
		]

		# Then update information
		Units.update
			side  : 'opponent'
			key   : key

			point : point
			cell  : {x, y}

	exports.accept = (set) ->
		Scenes.cleanEffects()

		mode = 'fight'

		for key, {cell, rank} of set
			if key > 0
				cell.x = size-cell.x-1 ; key = -key

			x = cellSize*(cell.x+1.5)
			y = cellSize*(cell.y+1.5)

			point = new Point [x, y]

			matrix[cell.y][cell.x] = Units.register
				point : point
				side  : 'opponent'
				cell  : cell
				rank  : rank
				key   : key

#### ———————————————————————————————————————