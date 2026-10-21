/**
 * Class InputHandler.
 */
class InputHandler{

	$arguments={};
	$options = {};

	/**
	 * Create a new instance.
	 * @param {*} argument
	 * @param {*} options
	 */
	constructor(argument,options){
		this.$arguments = argument;
		this.$options = options;
	}

	/**
	 * option method.
	 * @param {*} name
	 * @returns {any}
	 */
	option(name){
		return name?this.$options[name] :this.$options
	}

	/**
	 * argument method.
	 * @param {*} name
	 * @returns {any}
	 */
	argument(name){
		return name?this.$arguments[name] :this.$arguments
	}

	/**
	 * getOption method.
	 * @param {*} name
	 * @returns {any}
	 */
	getOption(name){
		return this.option(name)
	}

	/**
	 * setOption method.
	 * @param {*} key
	 * @param {*} value
	 * @returns {any}
	 */
	setOption(key,value){
		this.$options[key] = value 
		return this
	}

	/**
	 * setArgument method.
	 * @param {*} key
	 * @param {*} value
	 * @returns {any}
	 */
	setArgument(key,value){
		this.$arguments[key] = value 
		return this
	}

	/**
	 * getArgument method.
	 * @param {*} key
	 * @returns {any}
	 */
	getArgument(key?: any){
		return this.argument(key)
	}
	/**
	 * hasOption method.
	 * @param {*} name
	 * @returns {any}
	 */
	hasOption(name){
		return Boolean(this.option(name))
	}

}

export default InputHandler; 