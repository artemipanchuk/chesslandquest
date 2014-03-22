require.main.paths.push './server/submodules'

fs = require 'fs'

{exec} = require 'child_process'

colors = require 'colors'
watch  = require 'watch'
cs     = require 'coffee-script'

colors.setTheme
	'positive' : 'green'
	'ordinary' : 'yellow'
	'critical' : 'red'

Array::last = ->
	return @[@length-1]

log = (message, code, error) ->
	f = (value) ->
		return value < 10 and "0#{value}" or "#{value}"

	actualTime = (d = new Date) ->
		date = "#{f(d.getMonth()+1)}/#{f(d.getDate())}/#{d.getFullYear()}"
		time = "#{f(d.getHours())}:#{f(d.getMinutes())}:#{f(d.getSeconds())}"

		return "#{date} #{time}"

	space = ->
		return [1..19].map(->' ').join ''

	if typeof code isnt 'undefined'
		console.log "|#{actualTime()[code]}| #{message[code]}"
		console.log "|#{space()}| #{error.toString()[code]}" if error
	else
		console.log "|#{actualTime()}| #{message}"

sources = [
	'client/modules',
	'server/modules',
	'loader'
]

cleanJavascript = (ondone) ->
	log 'Cleaning javascript'

	exec "rm -r $(find -name 'js')", ->
		do ondone

cleanDocumentation = (ondone) ->
	log 'Cleaning documentation'

	exec "rm -r documentation/client documentation/server documentation/loader", ->
		do ondone

task 'document', 'document sources', ->
	log 'Generating documentation'

	cleanDocumentation ->
		exec 'mkdir documentation'

		sources.forEach (path) ->
			exec "mkdir documentation/#{path}"
			exec "docco #{path}/coffee/* -o documentation/#{path} -c documentation/docco.css"

task 'watch', 'watch coffee files', ->
	log 'Watching: coffee files', 'positive'

	log 'Compiling javascript'

	errors = {}

	compile = (path, output) ->
		fs.readFile path, 'utf8', (error, code) ->
			if error
				log 'Error reading file', 'critical', error
				return

			index = null
			parts = path.split '/'

			parts.some (p, i) ->
				if p is 'coffee'
					return index = i+1

			name = parts[index...].join('_')

			name = name.replace '.coffee', '.js'

			try
				compiled = cs.compile code
			catch error
				errors[path] = true

				log "Error compiling: #{path}", 'ordinary', error
				return

			filename = path.split(/\//g).last().replace('.coffee', '.js')

			fs.writeFile "#{output}/#{name}", compiled, (error) ->
				if error
					log 'Error writing file', 'critical', error
				else if errors[path] and delete errors[path]
					log "Compiled: \"#{path}\"", 'positive'
				else
					log "Compiled: \"#{path}\""

	monitor = (path, output) ->
		watch.createMonitor path, (monitor) ->
			monitor.on 'changed', (path, current, previous) ->
				compile path, output

			for path of monitor.files
				compile path, output if /\.coffee/.test path

	cleanJavascript ->
		sources.forEach (directory) ->
			[path, output] = ("#{directory}/#{language}" for language in ['coffee', 'js'])

			exec "mkdir #{output}"

			monitor path, output
