var { parseArgsStringToArgv } = require('string-argv');
const commander = require('commander');
const InputHandler = require('./inputHandler')
const OutputHandler = require('./outputHandler')
const Command = require('./command')
const { debounce } = require('lodash')

class Application {

    static $bootstrappers = [];

    add(command) {
        if( command instanceof Command != true){
            throw new Error(`Instance of [@ostro/console/command] was not available on [${command.constructor.name}]`)
        }
        let options = command.$options || []
        let commandArguments = command.$arguments || []
        let cmd = commander.command(command.$signature)

        cmd.description(command.$description)

        for (let option of options) {
            cmd.addOption(option.$handler)
        }

        for (let argument of commandArguments) {
            cmd.addArgument(argument.$handler)
        }
        command.setApp(this.$app)
        command.setConsole(this)
        cmd.action(function(arg) {
            let obj = this.args[0]
            let args = {}
            let opts = this.opts()

            if (typeof obj == 'object') {
                for (let key in obj) {
                    let value = obj[key]
                    if (key.startsWith('-')) {
                        opts[key.replace('--', '')] = value
                    } else {
                        args[key] = value
                    }
                }
            } else {
                this._args.map((arg, i) => {
                    return args[arg._name] = this.processedArgs[i]
                })
            }

            let newCommand = Object.create(command)
            command.input = new InputHandler(args, opts)
            command.output = new OutputHandler()
            return newCommand.handle()

        })
    }

    constructor($app) {
        this.$app = $app;
        this.setAutoExit(1);
        this.bootstrap();
    }

    setAutoExit(status) {
        this.$exitCode = status
    }

    getAutoExit() {
        return this.$exitCode
    }

    async run($input = [], $output = null) {

        return commander.parseAsync($input, {
            from: 'user'
        })
    }

    getCommandName($input) {
        let $command = this.getCommand($input)._
        return $command.length ? $command[0] : ''
    }

    bootstrap() {
        for (let $bootstrapper of Application.$bootstrappers) {
            $bootstrapper(this);
        }
    }

    parseCommand($command) {
        return parseArgsStringToArgv($command)
    }

    resolve($command) {
        return this.add(this.$app.make($command));
    }

    resolveCommands($commands) {

        if (Array.isArray($commands)) {
            for (let $command of $commands) {
                this.resolve($command);
            }
        } else if (typeof $commands == 'object') {
            for (let command in $commands) {
                this.resolve($command);
            }
        } else {
            this.resolve($commands);
        }

        return this;
    }

    static addBootstraper(callback) {
        this.$bootstrappers.push(callback)
    }

    getApp() {
        return this.$app;
    }
}

module.exports = Application