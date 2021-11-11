require('@ostro/support/helpers')
const OutputFormatterStyle = require('./outputFormatterStyle')
const OutputFormatterStyleStack = require('./outputFormatterStyleStack')

class OutputFormatter {
    $decorated;

    $styles = {};
    
    $styleStack;

    static escape($text) {
        $text = $text.replace('/([^\\\\]?)</', '$1\\<');

        return this.escapeTrailingBackslash($text);
    }

    static escapeTrailingBackslash($text) {
        if (str_ends_with($text, '\\')) {
            $len = strlen($text);
            $text = rtrim($text, '\\');
            $text = str_replace("\x1b", '', $text);
            $text += str_repeat("\x1b", $len - strlen($text));
        }

        return $text;
    }

    constructor($decorated = false, $styles = []) {
        this.$decorated = $decorated;

        this.setStyle('error', new OutputFormatterStyle('white', 'red'));
        this.setStyle('info', new OutputFormatterStyle('green'));
        this.setStyle('success', new OutputFormatterStyle('green'));
        this.setStyle('warning', new OutputFormatterStyle('yellow'));
        this.setStyle('comment', new OutputFormatterStyle('yellow'));
        this.setStyle('question', new OutputFormatterStyle('black', 'cyan'));

        for (let $name in $styles) {
            this.setStyle($name, $styles[$name]);
        }

        this.$styleStack = new OutputFormatterStyleStack();
    }

    setDecorated($decorated) {
        this.$decorated = $decorated;
    }

    isDecorated() {
        return this.$decorated;
    }

    setStyle($name, $style) {
        this.$styles[$name.toLowerCase()] = $style;
    }

    hasStyle($name) {
        return isset(this.$styles[strtolower($name)]);
    }

    getStyle($name) {
        if (!this.hasStyle($name)) {
            throw new InvalidArgumentException('Undefined style: ' + $name);
        }

        return this.$styles[strtolower($name)];
    }

    format($message) {
        return this.formatAndWrap($message, 0);
    }

    formatAndWrap($message, $width) {
        let $offset = 0;
        let $output = '';
        let $tagRegex = '[a-z][^<>]*';
        let $currentLineLength = 0;
        let regx = new RegExp(`<(([a-z][^<>]*)|\/([a-z][^<>]*)?)>`, 'g')
        let $matches = [...$message.matchAll(regx)]
        let $i = 0
        let $match
        while ($match = regx.exec($message)) {
            let $pos = $match.index;
            let $text = $match[0];
            let $tag
            if (0 != $pos && '\\' == $message[$pos - 1]) {
                continue;

            }
            $output += this.applyCurrentStyle($message.substr($offset, $pos - $offset), $output, $width, $currentLineLength);
            $offset = $pos + $text.length;
            let $open = '/' != $text[1]
            if ($open) {
                $tag = $match[2];
            } else {
                $tag = $match[2] || '';
            }

            if (!$open && !$tag) {

                this.$styleStack.pop();
            } else {
                let $style = this.createStyleFromString($tag)

                if (null === $style) {
                    $output += this.applyCurrentStyle($text, $output, $width, $currentLineLength);
                } else if ($open) {
                    this.$styleStack.push($style);
                } else {
                    this.$styleStack.pop($style);
                }
            }
        }

        $output += this.applyCurrentStyle($message.substr($offset), $output, $width, $currentLineLength);

        if ($output.includes("\x1b")) {
            return $output.replace('\\<', '<');
        }
        return $output.replace('\\<', '<');
    }

    getStyleStack() {
        return this.$styleStack;
    }

    createStyleFromString($string) {
        if (isset(this.$styles[$string])) {
            return this.$styles[$string];
        }
        let $matches = [...$string.matchAll(/([^=]+)=([^;]+)(;|$)/g)]
        if (!$matches) {
            return null;
        }

        let $style = new OutputFormatterStyle();
        for (let $match of $matches) {
            $match.shift();
            $match[0] = $match[0].toLowerCase();
            if ('fg' == $match[0]) {
                $style.setForeground($match[1].toLowerCase());
            } else if ('bg' == $match[0]) {
                $style.setBackground($match[1].toLowerCase());
            } else if ('href' === $match[0]) {
                $style.setHref($match[1]);
            } else if ('options' === $match[0]) {
                let $options = $match[1].matchAll(/([^,;]+)/g);
                $options = [...$options].shift();
                for (let $option of $options) {
                    $style.setOption($option);
                }
            } else {
                return null;
            }
        }
        return $style;
    }

    applyCurrentStyle($text, $current, $width, $currentLineLength) {
        if ('' === $text) {
            return '';
        }

        if (!$width) {
            return this.isDecorated() ? this.$styleStack.getCurrent().apply($text) : $text;
        }

        if (!$currentLineLength && '' !== $current) {
            $text = ltrim($text);
        }

        if ($currentLineLength) {
            $prefix = $text.substr(0, $i = $width - $currentLineLength) + "\n";
            $text = $text.substr($i);
        } else {
            $prefix = '';
        }
        $matches = $text.matchAll(/~(\\n)$~/, 'g')
        $text = $prefix.replace(new RegExp('~([^\\n]{' + $width + '})\\ *~'), "\$1\n", $text);
        $text = rtrim($text, "\n") + ($matches[1] || '');

        if (!$currentLineLength && '' !== $current && "\n" !== substr($current, -1)) {
            $text = "\n" + $text;
        }

        $lines = $text.split("\n");

        for (let $line of $lines) {
            $currentLineLength += $line.length;
            if ($width <= $currentLineLength) {
                $currentLineLength = 0;
            }
        }

        if (this.isDecorated()) {
            for (let $i in $lines) {
                $lines[$i] = this.$styleStack.getCurrent().apply($lines[$i]);
            }
        }

        return $lines.join("\n");
    }
}
module.exports = OutputFormatter