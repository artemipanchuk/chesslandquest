#### ———————————————————————————————————————
##   Characters/Master
#### Provides interface to control characters logical data
#### ———————————————————————————————————————

#### Description

# There are three classes of characters:
#
# * First Person Player Character (FPPC) — Client, that runs the game
# * Third Person Player Character (TPPC) — Other client, that plays online
# * Non Player Character (NPC)           — Ingame character, controlled by AI

#### ———————————————————————————————————————

@define 'Characters/Master', (exports) ->

	[Controls, FPPC, TPPC, NPC] =
		@require 'Characters/Controls',
		         'Characters/FPPC',
		         'Characters/TPPC',
		         'Characters/NPC'

	CanvasObjects =
		@require 'Canvas/Objects'

#### ———————————————————————————————————————

	# • Initial function;
	#
	# `id (string)`, `callback (function)`
	exports.initialize = ->
		Module.listen() for Module in [FPPC, TPPC, NPC]

	exports.registerPlayer = (character) ->
		FPPC.register character

	exports.disable = ->
		Module.disable() for Module in [FPPC, TPPC, NPC]

	exports.enable = ->
		Module.enable()  for Module in [FPPC, TPPC, NPC]

#### ———————————————————————————————————————