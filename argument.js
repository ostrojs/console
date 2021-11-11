const commander = require('commander')

class Argument{
	constructor(){
		this.$handler = new commander.Argument(...arguments);
		this.$handler.argOptional()
	}
	choices(){
		this.$handler.choices(...arguments)
		return this
	}
	default(){
		this.$handler.default(...arguments)
		return this
	}
	required(){
		this.$handler.argRequired()
		return this
	}
}

module.exports = Argument