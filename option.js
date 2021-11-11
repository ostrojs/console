const commander = require('commander')
class Option{
	constructor(){
		this.$handler = new commander.Option(...arguments);
	}
	hideHelp(){
		this.$handler.hideHelp(...arguments)
		return this
	}
	default(){
		this.$handler.default(...arguments)
		return this
	}
	choices(){
		this.$handler.choices(...arguments)	
		return this
	}
	required(){
		this.$handler.makeOptionMandatory()
		return this
	}
}
module.exports = Option