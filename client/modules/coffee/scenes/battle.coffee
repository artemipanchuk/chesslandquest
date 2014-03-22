#### ———————————————————————————————————————
##   Scenes/Battle
#### Manages battle scenes logical data processing
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Scenes/Battle', (exports) ->

	Tileset =
		@require 'Scenes/Tileset'

#### ———————————————————————————————————————

	exports.build = ({scene}) ->
		Tileset.process scene

#### ———————————————————————————————————————