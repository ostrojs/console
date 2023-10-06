class CallsCommands {

    callCommand($command, $arguments = {}) {
        return this.runCommand($command, $arguments, this.output);
    }

    call() {
        return this.callCommand(...arguments)
    }

    runCommand($command, $arguments) {
        const $console = this.getConsole()
        return $console.callCommand(
            $command, $arguments
        );
    }
}

module.exports = CallsCommands
