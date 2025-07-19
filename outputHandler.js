const OutputFormatter = require('./outputFormatter')
const OutputInterface = require('./outputInterface')

class OutputHandler {

    $verbosity;

    $formatter;

    constructor($verbosity = OutputInterface.VERBOSITY_NORMAL, $decorated = true, $formatter = null) {
        this.$verbosity = $verbosity || OutputInterface.VERBOSITY_NORMAL;
        this.$formatter = $formatter || new OutputFormatter();
        this.$formatter.setDecorated($decorated);
    }

    setFormatter($formatter) {
        this.$formatter = $formatter;
    }

    getFormatter() {
        return this.$formatter;
    }

    setDecorated($decorated) {
        this.$formatter.setDecorated($decorated);
    }

    isDecorated() {
        return this.$formatter.isDecorated();
    }

    setVerbosity($level) {
        this.$verbosity = $level;
    }

    getVerbosity() {
        return this.$verbosity;
    }

    isQuiet() {
        return OutputInterface.VERBOSITY_QUIET === this.$verbosity;
    }

    isVerbose() {
        return OutputInterface.VERBOSITY_VERBOSE <= this.$verbosity;
    }

    isVeryVerbose() {
        return OutputInterface.VERBOSITY_VERY_VERBOSE <= this.$verbosity;
    }

    isDebug() {
        return OutputInterface.VERBOSITY_DEBUG <= this.$verbosity;
    }

    writeln($messages, $options = OutputInterface.OUTPUT_NORMAL) {
        return this.write($messages, true, $options);
    }

    write($messages, $newline = false, $options = OutputInterface.OUTPUT_NORMAL) {

        if (!Array.isArray($messages)) {
            $messages = [$messages];
        }

        let $types = OutputInterface.OUTPUT_NORMAL || OutputInterface.OUTPUT_RAW || OutputInterface.OUTPUT_PLAIN;
        let $type = $types || $options || OutputInterface.OUTPUT_NORMAL;

        let $verbosities = OutputInterface.VERBOSITY_QUIET || OutputInterface.VERBOSITY_NORMAL || OutputInterface.VERBOSITY_VERBOSE | OutputInterface.VERBOSITY_VERY_VERBOSE | OutputInterface.VERBOSITY_DEBUG;
        let $verbosity = $verbosities || $options || OutputInterface.VERBOSITY_NORMAL;

        if ($verbosity > this.getVerbosity()) {
            return;
        }

        for (let $message of $messages) {
            switch ($type) {
                case OutputInterface.OUTPUT_NORMAL:
                    $message = this.$formatter.format($message);
                    break;
                case OutputInterface.OUTPUT_RAW:
                    break;
                case OutputInterface.OUTPUT_PLAIN:
                    $message = strip_tags(this.$formatter.format($message));
                    break;
            }

            this.doWrite($message || '', $newline);
        }
        return this
    }

    newLine($count = 1) {
        let $message = '\n'.repeat($count)
        process.stdout.write($message)
        return this
    }

    confirm($question, $default = false) {
        return this.question($question).then(res => {
            if (res.toLowerCase() == 'y') {
                return $default || true
            } else {
                return $default || false
            }
        })
    }

    ask($question, $default = null) {
        return this.output.ask($question, $default);
    }

    question($question) {
        return new Promise((resolve, reject) => {
            const readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            });
            readline.question($question, function (answer) {
                readline.close();
                resolve(answer)
            })
        })

    }

    doWrite($message, $newline) {
        process.stdout.write(Buffer.from($message))
        if ($newline)
            this.newLine()
        return this
    }

}
module.exports = OutputHandler