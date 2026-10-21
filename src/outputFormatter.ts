import { isset, strlen, rtrim, str_replace, ltrim } from '@ostro/support/function';
import { lower } from '@ostro/support/string';
import InvalidArgumentException from '@ostro/support/exceptions/invalidArgumentException';
import OutputFormatterStyle from './outputFormatterStyle';
import OutputFormatterStyleStack from './outputFormatterStyleStack';

/**
 * Class OutputFormatter.
 */
class OutputFormatter {
    public $decorated: boolean;
    public $styles: Record<string, OutputFormatterStyle> = {};
    public $styleStack: OutputFormatterStyleStack;

    /**
     * Escape special characters in text.
     * @param $text - Text to escape.
     * @returns Escaped text.
     */
    public static escape($text: string): string {
        $text = $text.replace(/([^\\\\]?)</g, '$1\\<');
        return this.escapeTrailingBackslash($text);
    }

    /**
     * Escape trailing backslashes.
     * @param $text - Text with possible trailing backslash.
     * @returns Processed text.
     */
    public static escapeTrailingBackslash($text: string): string {
        if ($text.endsWith('\\')) {
            const $len = strlen($text);
            $text = rtrim($text, '\\');
            $text = str_replace("\x1b", '', $text);
            $text += "\x1b".repeat($len - strlen($text));
        }

        return $text;
    }

    /**
     * Create a new instance.
     * @param $decorated - Whether decorated output is enabled.
     * @param $styles - Initial styles map.
     */
    constructor($decorated: boolean = false, $styles: Record<string, OutputFormatterStyle> = {}) {
        this.$decorated = $decorated;

        this.setStyle('error', new OutputFormatterStyle('white', 'red'));
        this.setStyle('info', new OutputFormatterStyle('green'));
        this.setStyle('success', new OutputFormatterStyle('green'));
        this.setStyle('warning', new OutputFormatterStyle('yellow'));
        this.setStyle('comment', new OutputFormatterStyle('yellow'));
        this.setStyle('question', new OutputFormatterStyle('black', 'cyan'));

        for (const $name in $styles) {
            this.setStyle($name, $styles[$name]);
        }

        this.$styleStack = new OutputFormatterStyleStack();
    }

    /**
     * Set decorated mode.
     * @param $decorated - Decorated flag.
     */
    public setDecorated($decorated: boolean): void {
        this.$decorated = $decorated;
    }

    /**
     * Check if output is decorated.
     * @returns True if decorated.
     */
    public isDecorated(): boolean {
        return this.$decorated;
    }

    /**
     * Register a style.
     * @param $name - Style name.
     * @param $style - Style instance.
     */
    public setStyle($name: string, $style: OutputFormatterStyle): void {
        this.$styles[lower($name)] = $style;
    }

    /**
     * Check if a style is registered.
     * @param $name - Style name.
     * @returns True if style exists.
     */
    public hasStyle($name: string): boolean {
        return isset(this.$styles[lower($name)]);
    }

    /**
     * Get a registered style.
     * @param $name - Style name.
     * @returns Style instance.
     */
    public getStyle($name: string): OutputFormatterStyle {
        if (!this.hasStyle($name)) {
            throw new InvalidArgumentException('Undefined style: ' + $name);
        }

        return this.$styles[lower($name)];
    }

    /**
     * Format a message.
     * @param $message - Message with style tags.
     * @returns Formatted message.
     */
    public format($message: string): string {
        return this.formatAndWrap($message, 0);
    }

    /**
     * Format and wrap a message to width.
     * @param $message - Message string.
     * @param $width - Maximum width.
     * @returns Formatted wrapped string.
     */
    public formatAndWrap($message: string, $width: number = 0): string {
        let $offset = 0;
        let $output = '';
        let $currentLineLength = 0;
        const regx = new RegExp('<(([a-z][^<>]*)|\/([a-z][^<>]*)?)>', 'g');
        let $match: RegExpExecArray | null;

        while (($match = regx.exec($message)) !== null) {
            const $pos = $match.index;
            const $text = $match[0];
            let $tag: string;

            if (0 !== $pos && '\\' === $message[$pos - 1]) {
                continue;
            }

            $output += this.applyCurrentStyle($message.slice($offset, $pos), $output, $width, $currentLineLength);
            $offset = $pos + $text.length;
            const $open = '/' !== $text[1];
            if ($open) {
                $tag = $match[2];
            } else {
                $tag = $match[2] || '';
            }

            if (!$open && !$tag) {
                this.$styleStack.pop();
            } else {
                const $style = this.createStyleFromString($tag);

                if (null === $style) {
                    $output += this.applyCurrentStyle($text, $output, $width, $currentLineLength);
                } else if ($open) {
                    this.$styleStack.push($style);
                } else {
                    this.$styleStack.pop($style);
                }
            }
        }

        $output += this.applyCurrentStyle($message.slice($offset), $output, $width, $currentLineLength);

        return $output.replace('\\<', '<');
    }

    /**
     * Get the style stack.
     * @returns Style stack instance.
     */
    public getStyleStack(): OutputFormatterStyleStack {
        return this.$styleStack;
    }

    /**
     * Create style from string specification.
     * @param $string - Style specification string.
     * @returns Style instance or null.
     */
    public createStyleFromString($string: string): OutputFormatterStyle | null {
        if (isset(this.$styles[$string])) {
            return this.$styles[$string];
        }
        const $matches = [...$string.matchAll(/([^=]+)=([^;]+)(;|$)/g)];
        if (!$matches || $matches.length === 0) {
            return null;
        }

        const $style = new OutputFormatterStyle();
        for (const $match of $matches) {
            const key = $match[1].toLowerCase();
            const val = $match[2];
            if ('fg' === key) {
                $style.setForeground(val.toLowerCase());
            } else if ('bg' === key) {
                $style.setBackground(val.toLowerCase());
            } else if ('href' === key) {
                $style.setHref(val);
            } else if ('options' === key) {
                const $optionsMatches = [...val.matchAll(/([^,;]+)/g)];
                for (const $opt of $optionsMatches) {
                    $style.setOption($opt[1]);
                }
            } else {
                return null;
            }
        }
        return $style;
    }

    /**
     * Apply current stack style to text chunk.
     * @param $text - Text chunk.
     * @param $current - Current formatted output.
     * @param $width - Line wrap width.
     * @param $currentLineLength - Current line length tracker.
     * @returns Styled chunk.
     */
    public applyCurrentStyle($text: string, $current: string, $width: number, $currentLineLength: number): string {
        if ('' === $text) {
            return '';
        }

        if (!$width) {
            return this.isDecorated() ? this.$styleStack.getCurrent().apply($text) : $text;
        }

        if (!$currentLineLength && '' !== $current) {
            $text = ltrim($text);
        }

        let $prefix = '';
        if ($currentLineLength) {
            const $i = $width - $currentLineLength;
            $prefix = $text.slice(0, $i) + "\n";
            $text = $text.slice($i);
        }

        const $matches = [...$text.matchAll(/~(\\n)$~/g)];
        $text = ($prefix + $text).replace(new RegExp('~([^\\n]{' + $width + '})\\ *~'), "$1\n");
        $text = rtrim($text, "\n") + ($matches[1] ? $matches[1][0] : '');

        if (!$currentLineLength && '' !== $current && "\n" !== $current.slice(-1)) {
            $text = "\n" + $text;
        }

        const $lines = $text.split("\n");

        for (const $line of $lines) {
            $currentLineLength += $line.length;
            if ($width <= $currentLineLength) {
                $currentLineLength = 0;
            }
        }

        if (this.isDecorated()) {
            for (let $i = 0; $i < $lines.length; $i++) {
                $lines[$i] = this.$styleStack.getCurrent().apply($lines[$i]);
            }
        }

        return $lines.join("\n");
    }
}

export default OutputFormatter;