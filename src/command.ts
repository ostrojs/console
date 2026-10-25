import type { ICommand } from '@ostro/contracts/console/command';

import Argument from './argument';
import Option from './option';
import CommandContracts from '@ostro/contracts/console/command';
import { implement } from '@ostro/support/function';
import Interaction from './concerns/intraction';
import HasParameters from './concerns/hasParameters';
import CallCommands from './concerns/callsCommands';

/**
 * Class Command.
 */
class Command extends implement(CommandContracts, Interaction, CallCommands, HasParameters) implements ICommand {
    public declare $app: any;
    public declare $console: any;

    public get $signature(): any {
        throw Error('$signature must be defined');
    }
    public set $signature(val: any) {
        Object.defineProperty(this, '$signature', { value: val, writable: true, configurable: true });
    }

    public get $description(): any {
        throw Error('$description must be defined');
    }
    public set $description(val: any) {
        Object.defineProperty(this, '$description', { value: val, writable: true, configurable: true });
    }

    public get $options(): any {
        return [];
    }
    public set $options(val: any) {
        Object.defineProperty(this, '$options', { value: val, writable: true, configurable: true });
    }

    public get $arguments(): any {
        return [];
    }
    public set $arguments(val: any) {
        Object.defineProperty(this, '$arguments', { value: val, writable: true, configurable: true });
    }

    /**
     * Determine if the application is using TypeScript.
     *
     * @returns {boolean}
     */
    public isTypeScript(): boolean {
        if (!this.$app) {
            return false;
        }
        try {
            if (this.$app['config']) {
                const configVal = typeof this.$app['config'].get === 'function' ?
                    this.$app['config'].get('app.typescript') :
                    this.$app['config']['app.typescript'];
                if (typeof configVal === 'boolean') {
                    return configVal;
                }
            }
        } catch (_) {}

        if (typeof this.$app.basePath !== 'function') {
            return false;
        }
        try {
            const fs = require('node:fs');
            return fs.existsSync(this.$app.basePath('tsconfig.json')) ||
                fs.existsSync(this.$app.basePath('tsconfig.build.json')) ||
                fs.existsSync(this.$app.basePath('app.ts'));
        } catch {
            return false;
        }
    }

    /**
     * createArgument method.
     * @returns {any}
     */
    public createArgument(name: string, description?: string) {
        return new Argument(name, description);
    }

    /**
     * createOption method.
     * @returns {any}
     */
    public createOption(flags: string, description?: string) {
        return new Option(flags, description);
    }

    /**
     * getApp method.
     * @returns {any}
     */
    public getApp() {
        return this.$app;
    }

    /**
     * setApp method.
     * @param {*} $app
     * @returns {any}
     */
    public setApp($app: any) {
        this.$app = $app;
    }

    /**
     * setConsole method.
     * @param {*} $console
     * @returns {any}
     */
    public setConsole($console: any) {
        this.$console = $console
    }

    /**
     * getConsole method.
     * @returns {any}
     */
    public getConsole() {
        return this.$console
    }

    /**
     * execute method.
     * @returns {any}
     */
    public execute() {
        let $method = typeof this['handle'] == 'function' ? 'handle' : '__invoke';
        return this.$app.call(this, $method);
    }
    /**
     * __invoke method.
     * @returns {any}
     */
    public __invoke() {
        throw Error('class should have either handle or __invike function')
    }
}

export default Command;