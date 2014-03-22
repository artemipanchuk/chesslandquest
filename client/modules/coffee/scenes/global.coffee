#### ———————————————————————————————————————
##   Scenes/Global
#### Global scenes management
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Scenes/Global', (exports) ->

	Tileset =
		@require 'Scenes/Tileset'

#### ———————————————————————————————————————

	exports.build = ({name, scene}) ->
		Tileset.process scene

#### ———————————————————————————————————————