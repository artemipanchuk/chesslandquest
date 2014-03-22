module.paths = module.parent.paths

Crypto = require 'crypto'
Fs     = require 'fs'

Colors = require 'colors'

Colors.setTheme
	'positive' : 'green'
	'ordinary' : 'yellow'
	'critical' : 'red'

#### Global functions

global.log = (message, code, error) ->
	f = (value) ->
		return value < 10 and "0#{value}" or "#{value}"

	actualTime = (d = new Date) ->
		date = "#{f(d.getMonth()+1)}/#{f(d.getDate())}/#{d.getFullYear()}"
		time = "#{f(d.getHours())}:#{f(d.getMinutes())}:#{f(d.getSeconds())}"

		return "#{date} #{time}"

	space = ->
		return [1..19].map(-> ' ').join ''

	if typeof code isnt 'undefined'
		console.log "|#{actualTime()[code]}| #{message[code]}"
		console.log "|#{space()}| #{error.toString()[code]}" if error
	else
		console.log "|#{actualTime()}| #{message}"

global.rlog = (data) ->
	console.log data

Number::times = (iterator) ->
	for i in [0...@]
		iterator i

global.clone = (x) ->
	return JSON.parse JSON.stringify x

global.summary = (object) ->
	return Object.keys(object).length

Function::get = (property, callback) ->
	@::__defineGetter__ property, callback
	
Function::set = (property, callback) ->
	@::__defineSetter__ property, callback

responseFile = (path, response) ->
	Fs.readFile path, (error, data) ->
		if error
			log "Error reading file: #{path}", 'ordinary'
			return

		response.end data

Utility =

	# Http
	responseFile : (path, response) ->
		responseFile path, response

	responseText : (text, response) ->
		response.end text

	responseResource : (path, request, response) ->
		Fs.stat path, (error, stats) ->
			if error
				response.writeHead 302,
					'location' : '/404'

				do response.end

				log "HTTP: Unknown resource — #{path}", 'ordinary'

				return

			modified = true

			try
				clientTime = new Date request.headers['if-modified-since']
				response.setHeader 'last-modified', stats.mtime

				if clientTime >= stats.mtime
					modified = false

			catch exception
				log exception

			if modified
				response.statusCode = 200
				response.setHeader 'last-modified', stats.mtime

				responseFile path, response
			else
				response.statusCode = 304

				do response.end

	# Crypto
	encrypt : (data) ->
		return Crypto.createHash('sha1').update(data).digest('hex')

	generateID : ->
		return @encrypt new Date + Math.random()

	version : (path, callback) ->
		Fs.stat path, (error, stats) =>
			if error
				callback no ; return

			callback @encrypt stats.mtime.toString()

	hash : (data, key) ->
		return Crypto.createHmac('sha1', key).update(data).digest('hex')

module.exports = Utility