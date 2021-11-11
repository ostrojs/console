const OutputFormatterStyle = require('../outputFormatterStyle')
const OutputInterface = require('../outputInterface')
const CollectionInterface = require('@ostro/contracts/collection/collect')
const Table = require('../helpers/table')

class Interaction {

    get $verbosity() {
        return OutputInterface.VERBOSITY_NORMAL
    }
    get $verbosityMap() {
        return {
            'v': OutputInterface.VERBOSITY_VERBOSE,
            'vv': OutputInterface.VERBOSITY_VERY_VERBOSE,
            'vvv': OutputInterface.VERBOSITY_DEBUG,
            'quiet': OutputInterface.VERBOSITY_QUIET,
            'normal': OutputInterface.VERBOSITY_NORMAL,
        }
    }

    hasArgument($name) {
        return this.input.hasArgument($name);
    }

    argument($key = null) {
        if ($key == null) {
            return this.input.getArguments();
        }

        return this.input.getArgument($key);
    }

    arguments() {
        return this.argument();
    }

    hasOption($name) {
        return this.input.hasOption($name);
    }

    option($key = null) {
        if ($key == null) {
            return this.input.getOption();
        }
        return this.input.getOption($key);
    }

    options() {
        return this.option();
    }

    confirm($question, $default = false) {
        return this.output.confirm($question, $default);
    }

    ask($question, $default = null) {
        return this.output.ask($question, $default);
    }

    anticipate($question, $choices, $default = null) {
        return this.askWithCompletion($question, $choices, $default);
    }

    table($headers, $rows, $tableStyle = 'default', $columnStyles = []) {
        let $table = new Table(this.output);

        if ($rows instanceof CollectionInterface) {
            $rows = $rows.toArray();
        }

        $table.setHeaders($headers).setRows($rows).setStyle($tableStyle);

        for (let $columnIndex in $columnStyles) {
            let $columnStyle = $columnStyles[$columnIndex]
            $table.setColumnStyle($columnIndex, $columnStyle);
        }

        $table.render();
    }

    info($string, $verbosity = null) {
        return this.line($string, 'info', $verbosity);
    }

    line($string, $style = null, $verbosity = null) {
        let $styled = $style ? `<${$style}>${$string}</${$style}>` : $string;

        return this.output.writeln($styled, this.parseVerbosity($verbosity));
    }

    comment($string, $verbosity = null) {
        return this.line($string, 'comment', $verbosity);
    }

    question($string, $verbosity = null) {
        return this.output.question($string, $verbosity);
    }

    error($string, $verbosity = null) {
        return this.line($string, 'error', $verbosity);
    }

    success($string, $verbosity = null) {
        return this.line($string, 'success', $verbosity);
    }

    warn($string, $verbosity = null) {
        if (!this.output.getFormatter().hasStyle('warning')) {
            $style = new OutputFormatterStyle('yellow');

            this.output.getFormatter().setStyle('warning', $style);
        }

        return this.line($string, 'warning', $verbosity);
    }

    alert($string) {
        $length = $string + 12;

        this.comment($string.replace('*', $length));
        this.comment('*     ' + $string + '     *');
        this.comment($string.replace('*', $length));

        return this.newLine();
    }

    newLine($count = 1) {
        return this.output.newLine($count);
    }

    setInput($input) {
        return this.input = $input;
    }

    setOutput($output) {
        return this.output = $output;
    }

    getOutput() {
        return this.output;
    }

    confirmToProceed() {
        return this.confirm('Are you sure want to process ? (y/n) : ')
    }

    setVerbosity($level) {
        return this.verbosity = this.parseVerbosity($level);
    }

    parseVerbosity($level = null) {
        if ($level && isset(this.$verbosityMap[$level])) {
            $level = this.$verbosityMap[$level];
        } else if (!Number.isInteger($level)) {
            $level = this.$verbosity;
        }

        return $level;
    }
}

module.exports = Interaction