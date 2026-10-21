import readline from 'readline';
import OutputFormatter from './outputFormatter';
import OutputInterface from './outputInterface';

function strip_tags(str: string): string {
    return str.replace(/<[^>]*>/g, '');
}

/**
 * Class OutputHandler.
 */
class OutputHandler {

    public output: any;

    $verbosity;

    $formatter;

    /**
     * Create a new instance.
     * @param {*} $verbosity
     * @param {*} $decorated
     * @param {*} $formatter
     */
    constructor($verbosity: any = OutputInterface.VERBOSITY_NORMAL, $decorated: boolean = true, $formatter: any = null) {
        this.$verbosity = $verbosity || OutputInterface.VERBOSITY_NORMAL;
        this.$formatter = $formatter || new OutputFormatter();
        this.$formatter.setDecorated($decorated);
    }

    /**
     * setFormatter method.
     * @param {*} $formatter
     * @returns {any}
     */
    public setFormatter($formatter: any) {
        this.$formatter = $formatter;
    }

    /**
     * getFormatter method.
     * @returns {any}
     */
    public getFormatter() {
        return this.$formatter;
    }

    /**
     * setDecorated method.
     * @param {*} $decorated
     * @returns {any}
     */
    public setDecorated($decorated: any) {
        this.$formatter.setDecorated($decorated);
    }

    /**
     * isDecorated method.
     * @returns {any}
     */
    public isDecorated() {
        return this.$formatter.isDecorated();
    }

    /**
     * setVerbosity method.
     * @param {*} $level
     * @returns {any}
     */
    public setVerbosity($level: any) {
        this.$verbosity = $level;
    }

    /**
     * getVerbosity method.
     * @returns {any}
     */
    public getVerbosity() {
        return this.$verbosity;
    }

    /**
     * isQuiet method.
     * @returns {any}
     */
    public isQuiet() {
        return OutputInterface.VERBOSITY_QUIET === this.$verbosity;
    }

    /**
     * isVerbose method.
     * @returns {any}
     */
    public isVerbose() {
        return OutputInterface.VERBOSITY_VERBOSE <= this.$verbosity;
    }

    /**
     * isVeryVerbose method.
     * @returns {any}
     */
    public isVeryVerbose() {
        return OutputInterface.VERBOSITY_VERY_VERBOSE <= this.$verbosity;
    }

    /**
     * isDebug method.
     * @returns {any}
     */
    public isDebug() {
        return OutputInterface.VERBOSITY_DEBUG <= this.$verbosity;
    }

    /**
     * writeln method.
     * @param {*} $messages
     * @param {*} $options
     * @returns {any}
     */
    public writeln($messages: any, $options: any = OutputInterface.OUTPUT_NORMAL) {
        return this.write($messages, true, $options);
    }

    /**
     * write method.
     * @param {*} $messages
     * @param {*} $newline
     * @param {*} $options
     * @returns {any}
     */
    public write($messages: any, $newline: boolean = false, $options: any = OutputInterface.OUTPUT_NORMAL) {

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

    /**
     * newLine method.
     * @param {*} $count
     * @returns {any}
     */
    public newLine($count: number = 1) {
        let $message = '\n'.repeat($count)
        process.stdout.write($message)
        return this
    }

    /**
     * confirm method.
     * @param {*} $question
     * @param {*} $default
     * @returns {any}
     */
    public confirm($question: any, $default: boolean = false) {
        return this.question($question).then((res: any) => {
            if (String(res).toLowerCase() == 'y') {
                return $default || true
            } else {
                return $default || false
            }
        })
    }

    /**
     * ask method.
     * @param {*} $question
     * @param {*} $default
     * @returns {any}
     */
    public ask($question: any, $default: any = null) {
        return this.question($question).then((res: any) => {
            return res || $default;
        });
    }

    /**
     * question method.
     * @param {*} $question
     * @returns {any}
     */
    public question($question: any) {
        return new Promise((resolve, reject) => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.question($question, function (answer) {
                rl.close();
                resolve(answer)
            })
        })

    }

    /**
     * doWrite method.
     * @param {*} $message
     * @param {*} $newline
     * @returns {any}
     */
    public doWrite($message: string, $newline: any) {
        process.stdout.write(Buffer.from($message))
        if ($newline)
            this.newLine()
        return this
    }

}
export default OutputHandler;