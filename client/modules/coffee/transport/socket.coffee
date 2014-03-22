#### ———————————————————————————————————————
##   Transport/Socket
#### WebSocket protocol interface
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Transport/Socket', (exports) ->

	socket = do ->
		socket = new WebSocket "ws://#{location.host}"

		send = WebSocket::send
		socket.send = (message) ->
			if @readyState is 1
				send.call @, message
			else
				resend = ->
					socket.send message

				wait 500, resend

		return socket

	bySpace = ' '

	disabled = {}
	orders   = {}

#### ———————————————————————————————————————

	handle =
		message : (event) ->
			incoming = event.data.split bySpace

			if accept = orders[incoming[0]]
				parsed = JSON.parse incoming[1..].join bySpace

				accept if parsed? then parsed

		close : (event) ->
			console.log 'WebSocket: Connection lost'

		error : (event) ->

		open : (event) ->
			console.log 'WebSocket: Connection established'

	socket.onmessage = handle.message
	socket.onclose   = handle.close
	socket.onerror   = handle.error
	socket.onopen    = handle.open

#### ———————————————————————————————————————

	exports.send = (subject, body) ->
		socket.send "#{subject} #{JSON.stringify body}"

	exports.disable = (subject) ->
		if subject
			disabled[subject] = orders[subject] ; delete orders[subject]

	exports.enable = (subject) ->
		orders[subject] ?= disabled[subject] ; delete disabled[subject]

	exports.listen = (subject, handle) ->
		orders[subject] = handle

#### ———————————————————————————————————————