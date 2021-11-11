const Argument = require('./argument')
const Option = require('./option')
const CommandContracts = require('@ostro/contracts/console/command')
const { implement } = require('@ostro/support/function')
const Interaction = require('./concerns/intraction')
const HasParameters = require('./concerns/hasParameters')
const CallCommands = require('./concerns/callsCommands')

class Command extends implement(CommandContracts, Interaction, CallCommands, HasParameters) {

    get $signature() {
        throw Error('$signature must be defined')
    }

    get $description() {
        throw Error('$description must be defined')
    }

    get $options() {
        return []
    }

    get $arguments() {
        return []
    }

    createArgument() {
        return new Argument(...arguments)
    }

    createOption() {
        return new Option(...arguments)
    }

    getApp() {
        return this.$app;
    }

    setApp($app) {
        this.$app = $app;
    }

    setConsole($console) {
        this.$console = $console
    }

    getConsole() {
        return this.$console
    }

    execute() {
        let $method = typeof this['handle'] == 'function' ? 'handle' : '__invoke';
        return this.$app.call(this, $method);
    }
    __invoke() {
        throw Error('class should have either handle or __invike function')
    }
}

module.exports = Command