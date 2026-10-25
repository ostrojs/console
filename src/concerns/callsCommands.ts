/**
 * Class CallsCommands.
 */
class CallsCommands {
    public declare output: any;

    public getConsole(): any {
        return null;
    }

    /**
     * callCommand method.
     * @param {*} $command
     * @param {*} $arguments
     * @returns {any}
     */
    public callCommand($command: any, $arguments: Record<string, any> = {}) {
        return this.runCommand($command, $arguments, this.output);
    }

    /**
     * call method.
     * @returns {any}
     */
    public call(...args: any[]) {
        return (this.callCommand as (...a: unknown[]) => unknown)(...args)
    }

    /**
     * runCommand method.
     * @param {*} $command
     * @param {*} $arguments
     * @param {*} $output
     * @returns {any}
     */
    public runCommand($command: any, $arguments: any, $output?: any) {
        const $console = this.getConsole()
        return $console.callCommand(
            $command, $arguments, $output
        );
    }
}

export default CallsCommands;
