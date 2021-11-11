const InvalidArgumentException = require('@ostro/support/exceptions/invalidArgumentException')
const OutputFormatterStyle = require('./outputFormatterStyle')

class OutputFormatterStyleStack {

    constructor($emptyStyle = null) {
        this.$emptyStyle = $emptyStyle || new OutputFormatterStyle();
        this.$styles = [];
    }

    reset() {
        this.$styles = [];
    }

    push($style) {
        this.$styles.push($style);
    }

    pop($style = null) {
        if (empty(this.$styles)) {
            return this.$emptyStyle;
        }

        if (null === $style) {
            return this.$styles.pop();
        }
        this.$styles = this.$styles.reverse()
        for (let $i = 0; $i < this.$styles.length; $i++) {
            let $stackedStyle = this.$styles[$i]

            if ($style.apply('') === $stackedStyle.apply('')) {
                this.$styles = this.$styles.slice(0, $i);

                return $stackedStyle;
            }
        }

        throw new InvalidArgumentException('Incorrectly nested style tag found.');
    }

    getCurrent() {
        if (empty(this.$styles)) {
            return this.$emptyStyle;
        }

        return this.$styles[this.$styles.length - 1];
    }

    setEmptyStyle($emptyStyle) {
        this.$emptyStyle = $emptyStyle;

        return this;
    }

    getEmptyStyle() {
        return this.$emptyStyle;
    }
}

module.exports = OutputFormatterStyleStack