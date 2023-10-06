var { parseArgsStringToArgv } = require('string-argv');
const commander = require('commander');
const InputHandler = require('./inputHandler')
const OutputHandler = require('./outputHandler')
const Command = require('./command')
const CommandNotFoundException = require('./exceptions/commandNotFoundException')

class Application {

    static $bootstrappers = [];
    $commands = [];

    constructor($app) {
        this.$app = $app;
        this.setAutoExit(1);
        commander.exitOverride(()=>{});
        commander.showSuggestionAfterError(true);

        this.bootstrap();
    }

    setAutoExit(status) {
        process.exitCode = status
    }

    getAutoExit() {
        return process.exitCode
    }

    run($input = []) {
        return commander.parseAsync($input, {
            from: 'user'
        })

    }

    call($command, $arguments = []) {
        $command = this.parseCommand($command);
        $command = $command.slice(0, 1);
        const commandArguments = $command.slice(1, $command.length).reduce((acc, item) => {
            const [key, value] = item.split('=');
            acc[key] = value ? value.replace(/["']/g, '') : true;
            return acc;
        }, {});
        if (Array.isArray($arguments)) {
            $arguments = $arguments.reduce((acc, item) => {
                const [key, value] = item.split('=');
                acc[key] = value ? value.replace(/["']/g, '') : true;
                return acc;
            }, {});
        }

        $arguments = Object.assign($arguments, commandArguments);
        if (!this.has($command)) {
            throw new CommandNotFoundException(`The command ${$command} does not exist.`);
        }
        return this.run(
            $command.concat(this.createInputFromArguments($arguments))
        );

    }
    createInputFromArguments($arguments) {
        return Object.entries($arguments).map(([key, value]) => (value === true ? key : `${key}=${value}`));
    }

    callCommand() {
        return this.call(...arguments)
    }

    has($command) {
        return this.$commands.includes($command[0])
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
            for (let $command in $commands) {
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

    add(command) {
        if (command instanceof Command != true) {
            throw new Error(`Instance of [@ostro/console/command] was not available on [${command.constructor.name}]`)
        }
        this.$commands.push(command.$signature)
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
        cmd.action(function (arg) {
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
}

module.exports = Application
