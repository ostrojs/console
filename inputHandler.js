class InputHandler{

	$arguments={};
	$options = {};

	constructor(argument,options){
		this.$arguments = argument;
		this.$options = options;
	}

	option(name){
		return name?this.$options[name] :this.$options
	}

	argument(name){
		return name?this.$arguments[name] :this.$arguments
	}

	getOption(name){
		return this.option(name)
	}

	setOption(key,value){
		this.$options[key] = value 
		return this
	}

	setArgument(key,value){
		this.$arguments[key] = value 
		return this
	}

	getArgument(key,value){
		return this.argument(key,value)
	}
	hasOption(name){
		return Boolean(this.option(name))
	}

}

module.exports = InputHandler 