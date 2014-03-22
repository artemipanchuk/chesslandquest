#### ———————————————————————————————————————
##   Canvas/Master
#### Provides canvas control
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Canvas/Master', (exports) ->

	[Projection, Controls, Objects, Scenes] =
		@require 'Canvas/Projection',
		         'Canvas/Controls',
		         'Canvas/Objects',
		         'Canvas/Scenes'

	App =
		@require 'LibCanvas/App'

#### ———————————————————————————————————————

	# • Initial function;
	#
	# `settings (object)`
	exports.initialize = ->
		@app = new App
			size     : Projection.size
			appendTo : document.body

		Module.initialize @app for Module in [Scenes, Objects, Controls]

#### ———————————————————————————————————————