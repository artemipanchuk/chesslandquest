#### ———————————————————————————————————————
##   Handlers
#### Provides HTTP requests handlers
#### ———————————————————————————————————————

module.paths = module.parent.paths

#### ———————————————————————————————————————

Validator = require 'http_validator'
Templator = require 'http_templator'
Accounts  = require 'http_accounts'

GameServer = require 'game_server'
Scenes     = require 'game_scenes'
Units      = require 'game_units'
PC         = require 'game_pc'

UT = require 'utility'

#### ———————————————————————————————————————

extensionPattern = /\.(js|html|css|png|ttf|otf|ico)/

contentTypeTable =
	'.js'   : 'text/javascript'
	'.html' : 'text/html'
	'.css'  : 'text/css'

	'.png'  : 'image/png'

	'.otf'  : 'font/opentype'
	'.ttf'  : 'font/ttf'

#### ———————————————————————————————————————

about = (subject) ->
	return "Warning: invalid #{subject}"

# • Ensure that client has signed in;
#
# `request (request)` —> `(string)` or `(bool)`
idPattern = /[^;=]+$/
ensureSession = (request) ->
	{cookie} = request.headers

	return no unless cookie

	cookies = {}

	for f, i in array = cookie.split /\=|;\s?/ by 2
		cookies[f] = array[i+1]

	session = cookies.id

	if session and Accounts.checkActuality session
		return session
	else
		return no

# • Ensure that request has post method;
#
# `request (request)` —> `(bool)`
ensurePost = (request) ->
	return request.method is 'POST'

# • Ensure that incoming data is valid;
#
# `chunk (string)` —> `(string)` or `(bool)`
ensureIncomingData = (chunk) ->
	if chunk.length > 256
		log 'HTTP: Corrupted incoming data. Interrupting.', 'critical'

		return no

	try
		data = JSON.parse chunk

	catch exception
		log 'JSON: Corrupted request. Interrupting.', 'critical'

		return no

	return data

# • Redirect client;
#
# `url (string), `response (itself)`
redirect = (url, response) ->
	response.writeHead 302,
		'location' : url

	response.end()

# • Response HTML file;
#
# `path (string)`, `response (itself)`
responseHTML = (path, response) ->
	response.statusCode = 200
	response.setHeader 'content-type', 'text/html'

	UT.responseFile path, response

# • Response text message;
#
# `message (string)`, `response (itself)`, `code (number or string)`*
responseMessage = (message, response, code = 200) ->
	response.statusCode = code

	UT.responseText message, response

# • Response JSON message;
#
# `data (object)`, `response (itself)`, `code (number or string)`
responseJSON = (data, response, code = 200) ->
	message = JSON.stringify data

	responseMessage message, response, code

# • Response session data;
#
# `details (object)`, `response (itself)`
responseSession = (details, response) ->
	session = Accounts.openSession details

	responseMessage session, response

# • Response character data;
#
# `name (string)`, `response (itself)`
responseCharacter = (name, response) ->
	PC.selectCharacter name, (character) ->
		responseMessage character, response

#### ———————————————————————————————————————

versions =
	'template' : (name, callback) ->
		Templator.getVersion name, (actual) ->
			callback actual

	'scene' : (name, callback) ->
		Scenes.getVersion name, (actual) ->
			callback actual

fillers =
	'characters' : (request, callback) ->
		unless session = ensureSession request
			responseMessage (about 'session'), response, 406 ; return

		username = Accounts.discoverUsernameById session
		PC.getCharactersByOwner username, (characters) ->
			callback {characters}

#### ———————————————————————————————————————

handlers =
	'/' : (request, response) ->
		if ensureSession request
			redirect '/game', response
		else
			responseHTML 'client/pages/index.html', response

	'/signup' : (request, response) ->
		responseHTML 'client/pages/signup.html', response

	'/account/sign-in' : (request, response) ->
		unless ensurePost request
			responseMessage (about 'method'), response, 406 ; return

		request.addListener 'data', (chunk) ->
			unless !!(form = ensureIncomingData chunk)
				responseMessage (about 'structure'), response, 406 ; return

			Validator.parseSignin form, (status) ->
				if status is yes
					[username, password] =
						form[0..1].map (field) ->
							return field.value

					responseSession {username, password}, response
				else
					responseJSON status, response, 406

	'/account/sign-out' : (request, response) ->
		unless session = ensureSession request
			responseMessage (about 'session'), response, 406 ; return

		Accounts.closeSession session

		response.statusCode = 200 ; response.end()

	'/account/sign-up' : (request, response) ->
		unless ensurePost request
			responseMessage (about 'method'), response, 406 ; return

		request.addListener 'data', (chunk) ->
			unless !!(form = ensureIncomingData chunk)
				responseMessage (about 'structure'), response, 406 ; return

			Validator.parseSignup form, (status) ->
				if status is yes
					[username, password, date] =
						[form[0], form[1], form[3]].map (field) ->
							return field.value

					Accounts.createAccount {username, password, date}

					responseSession {username, password}, response
				else
					responseJSON status, response, 406

	'/account/details' : (request, response) ->
		unless session = ensureSession request
			responseMessage (about 'session'), response, 406 ; return

		username = Accounts.discoverUsernameById session

		PC.getCharactersByOwner username, (characters) ->
			responseJSON {characters}, response

	'/game' : (request, response) ->
		if ensureSession request
			responseHTML 'client/pages/game.html', response
		else
			redirect '/', response

	'/game/create-character' : (request, response) ->
		unless ensurePost request
			responseMessage (about 'method'), response, 406 ; return

		request.addListener 'data', (chunk) ->
			unless session = ensureSession request
				responseMessage (about 'session'), response, 406 ; return

			unless form = ensureIncomingData chunk
				responseMessage (about 'structure'), response, 406 ; return

			Validator.parseCharacterCreation form, (status) ->
				if status is yes
					name  = form[0].value
					owner = Accounts.discoverUsernameById session

					PC.createCharacter {name, owner}

					responseCharacter name, response
				else
					responseJSON status, response, 406

	'/game/select-character' : (request, response) ->
		unless ensurePost request
			responseMessage (about 'method'), response, 406 ; return

		request.addListener 'data', (chunk) ->
			unless session = ensureSession request
				responseMessage (about 'session'), response, 406 ; return

			unless form = ensureIncomingData chunk
				responseMessage (about 'structure'), response, 406 ; return

			owner = Accounts.discoverUsernameById session

			Validator.parseCharacterSelection form, owner, (status) ->
				if status is yes
					name = form[0].value

					responseCharacter name, response
				else
					responseJSON status, response, 406

	'/401' : (request, response) ->
		responseHTML 'client/pages/401.html', response

	'/403' : (request, response) ->
		responseHTML 'client/pages/403.html', response

	'/404' : (request, response) ->
		responseHTML 'client/pages/404.html', response

	'/version' : (request, response) ->
		unless ensurePost request
			responseMessage (about 'method'), response, 406 ; return

		request.addListener 'data', (key) ->
			[type, name] = key.split '/'

			if (check = versions[type])?
				check name, (actual) ->
					responseMessage actual, response
			else
				responseMessage (about 'request'), response, 406

	'/template' : (request, response) ->
		unless ensurePost request
			responseMessage (about 'method'), response, 406 ; return

		request.addListener 'data', (name) ->
			Templator.get name, (code) ->
				unless code
					responseMessage (about 'request'), response, 406 ; return

				responseMessage code, response

	'resource' : (path, request, response) ->
		extension   = (extensionPattern.exec path)?[0]
		contentType = contentTypeTable[extension] or 'text/plain'

		path = path.replace /\//, ''

		response.setHeader 'content-type', contentType

		UT.responseResource path, request, response

#### ———————————————————————————————————————

module.exports = handlers