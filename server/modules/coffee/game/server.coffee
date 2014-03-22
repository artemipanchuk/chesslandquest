#### ———————————————————————————————————————
##   GAME Server
#### Runs and provides GAME Server interface
#### ———————————————————————————————————————

module.paths = module.parent.paths

Accounts = require 'http_accounts'
Battles  = require 'game_battles'
Scenes   = require 'game_scenes'
Units    = require 'game_units'
NPC      = require 'game_npc'
PC       = require 'game_pc'

WebSocketServer = do ->
	WebSocket = require 'websocket'

	return WebSocket.Server

#### ———————————————————————————————————————

#### Log messages

error =
	json : 'WebSocket: Corrupted JSON. Interrupting.'
	data : 'WebSocket: Corrupted data. Interrupting.'

#### ———————————————————————————————————————

#### Characters

# Player characters online (by keys)
pcs  = {}

# Non-Player characters (by names)
npcs = {}

#### ———————————————————————————————————————

#### All possible requests

requests =
	# Client requests game state
	'state' : (id, pc, ws) ->
		character = PC.getCharacterById id

		unless character
			drop ws ; log error.json, 'critical'

			return

		{name, location} = character

		# Save it to hash
		unless summary (pc = pcs[key ws])
			pc = pcs[key ws] = {id, ws, name, location}

		unless character.point
			Scenes.getGlobalScene location, (scene) ->
				point = character.point = scene.exports.markers.spawn

				PC.update name, 'point', point

				send 'state', character, ws
		else
			send 'state', character, ws

		# Distribute information about new PC
		distribute 'tppc::register', character, pc

	'units' : (nothing, pc, ws) ->
		Units.requestAll (units) ->
			send 'units', units, ws

	'scene' : (nothing, {id}, ws) ->
		character = PC.getCharacterById id

		Scenes.getGlobalScene character.location, (scene) ->
			send 'scene', scene.exports, ws

	'transaction' :
		'unit' : (rank, {id}, ws) ->
			price     = Units.evaluateUnit rank
			character = PC.getCharacterById id

			if character.points > price
				character.points -= price
				character.army.push rank

				{name, army, points} = character

				PC.update name, 'points', points
				PC.update name, 'army',   army

				send 'transaction::unit', yes, ws
			else
				send 'transaction::unit', no, ws

	# All requests associated with chat
	'chat' :
		'global' : (text, pc, ws) ->
			{id, name} = pc

			text = escape text

			distribute 'chat::global', {name, text}, pc

		'battle' : (text, pc, ws) ->
			{id, name} = pc

			text = escape text

			opponent = Battles.getOpponent name

			send 'chat::battle', {name, text}, findPC(opponent).ws

	# All requests associated with battles
	'battle' :

		# Client calls opponent for a battle
		'call' : (data, pc, ws) ->
			{type, name} = data

			# `pc` is initiator;
			# `name` is the name of his opponent;
			# `type` is so

			if Battles.checkFighters pc.name, name
				send 'battle::answer', Battles.rejection, ws ; return

			initiator = PC.getCharacterById pc.id

			if type is 'npc'
				unless opponent = npcs[name]
					drop ws ; log error.json, 'critical' ; return

				settings = Battles.createBattleWithNPC initiator, opponent

				Scenes.getBattleScene settings, (scene) ->
					settings.scene = scene
					settings.type  = 'npc'

					send 'battle', settings, ws

			else if type is 'tppc'
				unless opponent = findPC name
					drop ws ; log error.json, 'critical' ; return

				# Mark initiator waiting for opponent
				Battles.addWaiter name, initiator

				battleCall =
					name : initiator.name

				# Ask opponent for decision
				send 'battle::call', battleCall, opponent.ws

		# Opponent answers the call
		'answer' : (decision, {name, id}, wso) ->
			initiator = Battles.getWaiter   name
			opponent  = PC.getCharacterById id

			# Get initiator ws
			{ws:wsi} = findPC initiator.name

			if decision is yes
				settings = Battles.createBattleWithPC initiator, opponent

				Scenes.getBattleScene settings, (scene) ->
					settings.scene = scene
					settings.type  = 'pc'

					# Tell them about positive acception
					send 'battle', settings, ws for ws in [wsi, wso]
			else
				# Tell initiator about rejection
				send 'battle', Battles.rejection, wsi

		# Fighter sends his set
		'set' : (set, {name, id}, ws) ->
			character = PC.getCharacterById id

			# Get battle key by fighter name to use it further (improving performance)
			bkey = Battles.key name ; return unless bkey

			# Get home cells by key
			home = Battles.get bkey, 'home'
			left = []

			for index, unit of set
				left.push unit.rank

			if left.length is 0
				send 'battle::set', false, ws ; return

			for index, unit of set
				if unit.rank in character.army or unit.rank is 'general'
					{x, y} = unit.cell

					unless (home.some (cell) -> cell.x is x and cell.y is y)
						send 'battle::set', false, ws ; return
					else
						for rank, index in left when rank is unit.rank
							left.splice index, 1 ; break

			if left.length > 0
				send 'battle::set', false, ws ; return
			else
				send 'battle::set',  true, ws

			# `ready` means, that enemy has submited set
			ready = Battles.set bkey, 'set', {name, set}

			if ready
				sets = Battles.get bkey, 'sets'

				if wso = findPC(opponent = Battles.getOpponent(name))?.ws

					# Send sets to each fighter
					send 'battle::start', sets[opponent], ws
					send 'battle::start', sets[name], wso

					distribute 'tppc::drop', name
					distribute 'tppc::drop', opponent

					# Tell first fighter about his turn
					send 'battle::turn', null, wso

				else
					for side of sets
						if side isnt name
							opponent = side
							set = sets[side] ; break

					# Send set to fighter
					send 'battle::start', set, ws

					distribute 'tppc::drop', name
					distribute ' npc::drop', opponent

					# Tell fighter about his turn
					send 'battle::turn',  null, ws

		# Fighter sends turn state
		'turn' : (turn, {name}, ws) ->
			return unless (bkey = Battles.key name)?

			Battles.accept bkey, name, turn, (answer, next)->
				# Passed nothing => need to count up results
				unless answer
					Battles.close bkey, (sides, winner, npc) ->
						for name_, result of sides
							{ws} = findPC name_

							if winner
								reason = if name_ is winner then 'victory' else 'defeat'
							else
								reason = 'stalemate'

							send 'battle::end', {reason, result}, ws

						if npc
							pctargets = getPCsNear respawned

							send 'npc::drop', npc, pc.ws for pc in pctargets

							NPC.kill npc, (respawned) ->
								npcs[respawned.name] = respawned

								pctargets = getPCsNear respawned

								send 'npc::register', respawned, pc.ws for pc in pctargets

				# Passed only `turn` => human plays against machine
				else unless next
					send 'battle::turn', answer, ws

				# Passed `turn` and `next` player => human plays against other human
				else
					{ws:wso} = findPC next

					send 'battle::turn', answer, wso

	# All requests associated with client himself
	'fppc' :

		# Request locals
		'locals' : (nothing, pc, ws) ->
			# Get other characters on same scene
			pctargets  = getPCsNear  pc
			npctargets = getNPCsNear pc

			# Send existing PCs to new PC
			send 'tppc::register', pctarget, ws for  pctarget in  pctargets

			# Send existing NPCs to new PC
			send 'npc::register', npctarget, ws for npctarget in npctargets

		# Client moves
		'move' : (point, pc, ws) ->
			{id, name} = pc

			# Distribute information about PC move
			distribute 'tppc::move', {name, point}, pc

			# Update server information
			PC.update name, 'point', point

#### ———————————————————————————————————————

getPCsNear = (initiator) ->
	vector = []

	if ({id} = initiator)?
		for sec, pc of pcs
			if pc.id isnt id and pc.location is initiator.location
				vector.push PC.getCharacterById pc.id
	else
		for sec, pc of pcs
			if pc.location is initiator.location
				vector.push PC.getCharacterById pc.id

	return vector

getNPCsNear = (initiator) ->
	vector = []

	for name, npc of npcs
		if npc.location is initiator.location
			vector.push npc

	return vector

findPC = (name) ->
	for sec, pc of pcs when pc.name is name then return pc

	return null

send = (subject, data, ws) ->
	ws.send "#{subject} #{JSON.stringify data}" if ws

distribute = (subject, data, initiator = {}) ->
	if initiator
		for sec, pc of pcs
			if pc.id isnt initiator.id
				send subject, data, pc.ws
	else
		for sec, pc of pcs then send subject, data, pc.ws

# Whitelist
unsafe = /[^a-zA-Zа-яА-Я.,!?—\- ]/g
escape = (string) ->
	if unsafe.test string
		return string.replace unsafe, ''
	else
		return string

key = (ws) -> return ws.upgradeReq.headers['sec-websocket-key']

# • Ensure that client has signed in;
#
# `ws (ws)` —> `(bool)`
idPattern = /[^;=]+$/
ensureSession = (ws) ->
	{cookie} = ws.upgradeReq.headers

	return no unless cookie

	cookies = {}

	for f, i in array = cookie.split /\=|;\s?/ by 2
		cookies[f] = array[i+1]

	session = cookies.id

	if session and Accounts.checkActuality session
		return yes
	else
		return no

#### ———————————————————————————————————————

#### Handling

bySpace = ' '
byColon = '::'
handle = (message, ws) ->
	incoming = message.split bySpace

	unless pc = pcs[key ws]
		drop ws ; log error.data, 'critical'

		return

	command = incoming[0].split byColon

	if command.length is 1
		process = requests[command[0]]
	else
		process = requests[command[0]]?[command[1]]

	unless process
		drop ws ; log error.data, 'critical'

		return

	if incoming.length > 2
		chunk = incoming[1...].join bySpace
	else
		chunk = incoming[1]

	try
		data = JSON.parse chunk

	catch exception
		drop ws ; log error.json, 'critical'

		return

	process data, pc, ws

drop = (ws) ->
	ws.send 'Client has provocated an error' ; do ws.close

#### ———————————————————————————————————————

GAMEServer =
	use : (HTTPServer) ->
		log 'GAME: Running on 80', 'positive'

		NPC.generate (npc) ->
			npcs[npc.name] = npc

		(new WebSocketServer server : HTTPServer).on 'connection', (ws) ->
			unless ensureSession ws
				drop ws

				return

			pcs[key ws] = {}

			ws.on 'message', (message) ->
				handle message, ws

			ws.on 'close', ->
				{id, name} = pcs[sec = key ws]

				if bkey = Battles.key name
					Battles.close bkey, (sides, winner) ->
						for name_, result of sides when name_ isnt name
							{ws} = findPC name_

							send 'battle::end',
								reason : 'leave',
								result : result, ws

						return

				delete pcs[sec]

				distribute 'tppc::drop', name

#### ———————————————————————————————————————

module.exports = GAMEServer