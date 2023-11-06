var { parseArgsStringToArgv } = require('string-argv');
const commander = require('commander');
const InputHandler = require('./inputHandler')
const OutputHandler = require('./outputHandler')
const Command = require('./command')
const CommandNotFoundException = require('./exceptions/commandNotFoundException')
const lodash = require("lodash")

class Application {

    static $bootstrappers = [];
    $commands = [];

    constructor($app) {
        this.$app = $app;
        this.setAutoExit(1);
        commander.exitOverride();
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
        const commandArguments = $command.slice(1, $command.length)
        if (Array.isArray($arguments)) {
            $arguments = $arguments.concat(commandArguments);
        }
        if (!this.has($command)) {
            throw new CommandNotFoundException(`The command ${$command} does not exist.`);
        }
        return this.run(
            $command.concat(commandArguments.concat(lodash.flatten(this.createInputFromArguments($arguments))))
        );

    }
    createInputFromArguments($arguments) {
        if (Array.isArray($arguments)) {
            return $arguments.map(arg => this.createInputFromArguments(arg))
        }

        if (typeof $arguments === 'object') {
            return Object.entries($arguments).map(([key, value]) => {
                if (value === true) {
                    return key;
                } else {
                    if (key.startsWith('-')) {
                        return `${key}=${value}`;
                    } else {
                        return { [key]: value }

                    }
                }
            });
        }
        return $arguments
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

    parseArgument(arg) {
        if (Array.isArray(arg)) {
            const [key, value] = arg;
            return { key, value };
        }
        else if (typeof arg === 'object') {
            const [key, value] = Object.entries(arg).pop();
            return { key, value };
        } else if (typeof arg === 'string') {
            return {
                value: arg
            }
        }
    }

    add(command) {
        if (command instanceof Command != true) {
            throw new Error(`Instance of [@ostro/console/command] was not available on [${command.constructor.name}]`)
        }
        const self = this;
        this.$commands.push(command.$signature);
        let options = command.$options || [];
        let commandArguments = command.$arguments || [];
        let cmd = commander.command(command.$signature);

        cmd.description(command.$description);

        for (let option of options) {
            cmd.addOption(option.$handler);
        }

        for (let argument of commandArguments) {
            cmd.addArgument(argument.$handler);
        }
        command.setApp(this.$app);
        command.setConsole(this);
        cmd.action(function (arg) {
            const processedArgs = this.processedArgs.filter(v => v);
            let args = {};
            let opts = this.opts();

            processedArgs.forEach((arg, i) => {
                const { key, value } = self.parseArgument(arg);
                const cmdArg = this._args.find(arg => arg._name == key);
                if (key && key == cmdArg?._name) {
                    args[key] = value;
                } else {
                    if (!key) {
                        args[cmdArg?._name || this._args[i]?._name] = processedArgs[i] || null;
                    }
                }
            });


            let newCommand = Object.create(command);
            command.input = new InputHandler(args, opts);
            command.output = new OutputHandler();
            return newCommand.handle()

        })
    }
}

module.exports = Application
