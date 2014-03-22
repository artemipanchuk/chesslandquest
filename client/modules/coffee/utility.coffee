#### ———————————————————————————————————————
##   Utility
#### Low-level features
#### ———————————————————————————————————————

#### ———————————————————————————————————————

#### Global

global = window

global.wait = (time, callback) ->
	setTimeout callback, time

global.each = (time, callback) ->
	setInterval callback, time

global.warn = (message) ->
	console.log message

global.π = Math.PI

global.unsafe = /[^a-zA-Zа-яА-Я.,!?—\- ]+/g

#### ———————————————————————————————————————

#### Function

# • Define setter;
#
# `property (string)`, `callback (function)`
Function::set = (property, callback) ->
	atom.accessors.define @::, property, 'set' : callback

# • Define getter;
#
# `property (string)`, `callback (function)`
Function::get = (property, callback) ->
	atom.accessors.define @::, property, 'get' : callback

# • Define setter and getter;
#
# `property (string)`, `options (object)`
Function::access = (property, options) ->
	atom.accessors.define @::, property,
		'get' : options.get
		'set' : options.set

#### ———————————————————————————————————————

#### Array

# • Access to first element;
Array.access 'first',
	get :     -> return if @length > 0 then @[0] else null
	set : (v) -> @[0] = v

# • Access to last element;
Array.access 'last',
	get :     -> return if (a=@length) > 0 then @[a-1] else null
	set : (v) -> @[(a = @length-1) > 0 and a or 0] = v

# • Access to second element;
Array.access 'second',
	get :     -> return if @length > 1 then @[1] else null
	set : (v) -> @[1] = val

# • Access to penult element;
Array.access 'penult',
	get :     -> return if (a=@length) > 1 then @[a-2] else null
	set : (v) -> @[(a = @length) > 2 and a-2 or 0] = v

#### ———————————————————————————————————————

# • Get Atom Collection for this selector;
#
# —> `(dom)`
String.get 'dom', ->
	return atom.dom "#{@}"

# • Get first character;
#
# —> `(string)`
String.get 'first', ->
	return @[0]

#### ———————————————————————————————————————

#### Number

Number::times = (iterator) ->
	for i in [0...@]
		iterator i