import { parseArgsStringToArgv } from 'string-argv';
import commander from 'commander';
import InputHandler from './inputHandler';
import OutputHandler from './outputHandler';
import Command from './command';
import CommandNotFoundException from './exceptions/commandNotFoundException';
import lodash from 'lodash';

/**
 * Class Application.
 */
class Application {

    static $bootstrappers: any[] = [];
    public $commands: any[] = [];
    public $app: any;
    public getCommand: any;

    /**
     * Create a new instance.
     * @param {*} $app
     */
    constructor($app?: any) {
        this.$app = $app;
        this.setAutoExit(0);
        (commander as any).exitOverride(()=>{});
        (commander as any).showSuggestionAfterError(true);

        this.bootstrap();
    }

    /**
     * setAutoExit method.
     * @param {*} status
     * @returns {any}
     */
    public setAutoExit(status: any) {
        process.exitCode = status
    }

    /**
     * getAutoExit method.
     * @returns {any}
     */
    public getAutoExit() {
        return process.exitCode
    }

    /**
     * run method.
     * @param {*} $input
     * @returns {any}
     */
    public run($input: any[] = []) {
        return (commander as any).parseAsync($input, {
            from: 'user'
        })

    }

    /**
     * call method.
     * @param {*} $command
     * @param {*} $arguments
     * @returns {any}
     */
    public call($command: any, $arguments: any[] = []) {
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
    /**
     * createInputFromArguments method.
     * @param {*} $arguments
     * @returns {any}
     */
    public createInputFromArguments($arguments: any) {
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

    /**
     * callCommand method.
     * @returns {any}
     */
    public callCommand(...args: any[]) {
        return (this.call as any)(...args)
    }

    /**
     * has method.
     * @param {*} $command
     * @returns {any}
     */
    public has($command: any) {
        return this.$commands.includes($command[0])
    }

    /**
     * getCommandName method.
     * @param {*} $input
     * @returns {any}
     */
    public getCommandName($input: any) {
        let $command = this.getCommand($input)._
        return $command.length ? $command[0] : ''
    }

    /**
     * bootstrap method.
     * @returns {any}
     */
    public bootstrap() {
        for (let $bootstrapper of Application.$bootstrappers) {
            $bootstrapper(this);
        }
    }

    /**
     * parseCommand method.
     * @param {*} $command
     * @returns {any}
     */
    public parseCommand($command: any) {
        return parseArgsStringToArgv($command)
    }

    /**
     * resolve method.
     * @param {*} $command
     * @returns {any}
     */
    public resolve($command: any) {
        return this.add(this.$app.make($command));
    }

    /**
     * resolveCommands method.
     * @param {*} $commands
     * @returns {any}
     */
    public resolveCommands($commands: any) {

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

    /**
     * addBootstraper method.
     * @static
     * @param {*} callback
     * @returns {any}
     */
    static addBootstraper(callback: Function) {
        this.$bootstrappers.push(callback)
    }

    /**
     * getApp method.
     * @returns {any}
     */
    public getApp() {
        return this.$app;
    }

    /**
     * parseArgument method.
     * @param {*} arg
     * @returns {any}
     */
    public parseArgument(arg: any) {
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

    /**
     * add method.
     * @param {*} command
     * @returns {any}
     */
    public add(command: any) {
        if (!command || (command instanceof Command != true && typeof command.$signature !== 'string' && typeof command.$signature !== 'function')) {
            throw new Error(`Instance of [@ostro/console/command] was not available on [${command?.constructor?.name}]`)
        }
        const self = this;
        this.$commands.push(command.$signature);
        let options = command.$options || [];
        let commandArguments = command.$arguments || [];
        let cmd = (commander as any).command(command.$signature);

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
            newCommand.input = new InputHandler(args, opts);
            newCommand.output = new OutputHandler();
            return newCommand.handle()
        })
    }
}

export default Application;
