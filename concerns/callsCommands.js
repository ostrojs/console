const Collection = require('@ostro/support/collection')
class CallsCommands {

    callCommand($command, $arguments = []) {
        $command = $command.split(' ');
        $arguments = $command.slice(1, $command.length).concat($arguments);
        $command = $command[0];
        return this.runCommand($command, $arguments, this.output);
    }

    call(){
        return this.callCommand(...arguments)
    }

    callSilent($command, $arguments = []) {
        return this.runCommand($command, $arguments, new NullOutput);
    }

    callSilently($command, $arguments = []) {
        return this.callSilent($command, $arguments);
    }

    runCommand($command, $arguments, $output) {
        $arguments['command'] = $command
        return this.getConsole().run(
            this.createInputFromArguments($arguments), $output
        );
    }

    createInputFromArguments($arguments) {

        let command = Collection.make(Object.keys($arguments).map((key) => {
            if (key.startsWith('-')) {
                return [key, $arguments[key]]
            } else {
                return [$arguments[key]]
            }
        })).flatten().filter().all()
        return command.slice(-1).concat(command.slice(0, -1))
    }

    context() {
        return collect(this.option()).only([
            'ansi',
            'no-ansi',
            'no-interaction',
            'quiet',
            'verbose',
        ]).filter().mapWithKeys(function($value, $key) {
            return {
                [`--${$key}`]: $value };
        }).all();
    }
}

module.exports = CallsCommands