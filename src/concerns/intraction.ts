import OutputFormatterStyle from '../outputFormatterStyle';
import OutputInterface from '../outputInterface';
import CollectionInterface from '@ostro/contracts/collection/collect';
import type { ICollection } from '@ostro/contracts/collection/collect';
import Table from '../helpers/table';
import { isset } from '@ostro/support/function';

/**
 * Class Interaction.
 */
class Interaction {
    public declare input: any;
    public declare output: any;
    public declare verbosity: any;
    public declare askWithCompletion: any;

    public get $verbosity() {
        return OutputInterface.VERBOSITY_NORMAL
    }
    public get $verbosityMap() {
        return {
            'v': OutputInterface.VERBOSITY_VERBOSE,
            'vv': OutputInterface.VERBOSITY_VERY_VERBOSE,
            'vvv': OutputInterface.VERBOSITY_DEBUG,
            'quiet': OutputInterface.VERBOSITY_QUIET,
            'normal': OutputInterface.VERBOSITY_NORMAL,
        }
    }

    /**
     * hasArgument method.
     * @param {*} $name
     * @returns {any}
     */
    public hasArgument($name: string) {
        return this.input.hasArgument($name);
    }

    /**
     * argument method.
     * @param {*} $key
     * @returns {any}
     */
    public argument($key: any = null) {
        if ($key == null) {
            return this.input.getArguments();
        }

        return this.input.getArgument($key);
    }

    /**
     * arguments method.
     * @returns {any}
     */
    public arguments() {
        return this.argument();
    }

    /**
     * hasOption method.
     * @param {*} $name
     * @returns {any}
     */
    public hasOption($name: string) {
        return this.input.hasOption($name);
    }

    /**
     * option method.
     * @param {*} $key
     * @returns {any}
     */
    public option($key: any = null) {
        if ($key == null) {
            return this.input.getOption();
        }
        return this.input.getOption($key);
    }

    /**
     * options method.
     * @returns {any}
     */
    public options() {
        return this.option();
    }

    /**
     * confirm method.
     * @param {*} $question
     * @param {*} $default
     * @returns {any}
     */
    public confirm($question: any, $default: boolean = false) {
        return this.output.confirm($question, $default);
    }

    /**
     * ask method.
     * @param {*} $question
     * @param {*} $default
     * @returns {any}
     */
    public ask($question: any, $default: any = null) {
        return this.output.ask($question, $default);
    }

    /**
     * anticipate method.
     * @param {*} $question
     * @param {*} $choices
     * @param {*} $default
     * @returns {any}
     */
    public anticipate($question: any, $choices: any, $default: any = null) {
        return this.askWithCompletion($question, $choices, $default);
    }

    /**
     * table method.
     * @param {*} $headers
     * @param {*} $rows
     * @param {*} $tableStyle
     * @param {*} $columnStyles
     * @returns {any}
     */
    public table($headers: Record<string, any>, $rows: any, $tableStyle: string = 'default', $columnStyles: any[] = []) {
        let $table = new Table(this.output);

        if ($rows instanceof CollectionInterface || (typeof ($rows as ICollection)?.toArray === 'function')) {
            $rows = ($rows as ICollection).toArray();
        }

        $table.setHeaders($headers).setRows($rows).setStyle($tableStyle);

        for (let $columnIndex in $columnStyles) {
            let $columnStyle = $columnStyles[$columnIndex]
            $table.setColumnStyle($columnIndex, $columnStyle);
        }

        $table.render();
    }

    /**
     * info method.
     * @param {*} $string
     * @param {*} $verbosity
     * @returns {any}
     */
    public info($string: any, $verbosity: any = null) {
        return this.line($string, 'info', $verbosity);
    }

    /**
     * line method.
     * @param {*} $string
     * @param {*} $style
     * @param {*} $verbosity
     * @returns {any}
     */
    public line($string: any, $style: any = null, $verbosity: any = null) {
        let $styled = $style ? `<${$style}>${$string}</${$style}>` : $string;

        return this.output.writeln($styled, this.parseVerbosity($verbosity));
    }

    /**
     * comment method.
     * @param {*} $string
     * @param {*} $verbosity
     * @returns {any}
     */
    public comment($string: any, $verbosity: any = null) {
        return this.line($string, 'comment', $verbosity);
    }

    /**
     * question method.
     * @param {*} $string
     * @param {*} $verbosity
     * @returns {any}
     */
    public question($string: any, $verbosity: any = null) {
        return this.output.question($string, $verbosity);
    }

    /**
     * error method.
     * @param {*} $string
     * @param {*} $verbosity
     * @returns {any}
     */
    public error($string: any, $verbosity: any = null) {
        return this.line($string, 'error', $verbosity);
    }

    /**
     * success method.
     * @param {*} $string
     * @param {*} $verbosity
     * @returns {any}
     */
    public success($string: any, $verbosity: any = null) {
        return this.line($string, 'success', $verbosity);
    }

    /**
     * warn method.
     * @param {*} $string
     * @param {*} $verbosity
     * @returns {any}
     */
    public warn($string: any, $verbosity: any = null) {
        if (!this.output.getFormatter().hasStyle('warning')) {
            const $style = new OutputFormatterStyle('yellow');

            this.output.getFormatter().setStyle('warning', $style);
        }

        return this.line($string, 'warning', $verbosity);
    }

    /**
     * alert method.
     * @param {*} $string
     * @returns {any}
     */
    public alert($string: any) {
        const $length = ($string ? $string.length : 0) + 12;

        this.comment('*'.repeat($length));
        this.comment('*     ' + $string + '     *');
        this.comment('*'.repeat($length));

        return this.newLine();
    }

    /**
     * newLine method.
     * @param {*} $count
     * @returns {any}
     */
    public newLine($count: number = 1) {
        return this.output.newLine($count);
    }

    /**
     * setInput method.
     * @param {*} $input
     * @returns {any}
     */
    public setInput($input: any) {
        return this.input = $input;
    }

    /**
     * setOutput method.
     * @param {*} $output
     * @returns {any}
     */
    public setOutput($output: any) {
        return this.output = $output;
    }

    /**
     * getOutput method.
     * @returns {any}
     */
    public getOutput() {
        return this.output;
    }

    /**
     * confirmToProceed method.
     * @returns {any}
     */
    public confirmToProceed() {
        return this.confirm('Are you sure want to process ? (y/n) : ')
    }

    /**
     * setVerbosity method.
     * @param {*} $level
     * @returns {any}
     */
    public setVerbosity($level: any) {
        return this.verbosity = this.parseVerbosity($level);
    }

    /**
     * parseVerbosity method.
     * @param {*} $level
     * @returns {any}
     */
    public parseVerbosity($level: any = null) {
        if ($level && isset(this.$verbosityMap[$level])) {
            $level = this.$verbosityMap[$level];
        } else if (!Number.isInteger($level)) {
            $level = this.$verbosity;
        }

        return $level;
    }
}

export default Interaction;