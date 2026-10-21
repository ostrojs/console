import { isset, sprintf, count, env } from '@ostro/support/function';
import InvalidArgumentException from '@ostro/support/exceptions/invalidArgumentException';

/**
 * Class Color.
 */
class Color {

    public static COLORS: Record<string, number> = {
        'black': 0,
        'red': 1,
        'green': 2,
        'yellow': 3,
        'blue': 4,
        'magenta': 5,
        'cyan': 6,
        'white': 7,
        'default': 9,
    };

    public static BRIGHT_COLORS: Record<string, number> = {
        'gray': 0,
        'bright-red': 1,
        'bright-green': 2,
        'bright-yellow': 3,
        'bright-blue': 4,
        'bright-magenta': 5,
        'bright-cyan': 6,
        'bright-white': 7,
    };

    public static AVAILABLE_OPTIONS: Record<string, { set: number; unset: number }> = {
        'bold': { 'set': 1, 'unset': 22 },
        'underscore': { 'set': 4, 'unset': 24 },
        'blink': { 'set': 5, 'unset': 25 },
        'reverse': { 'set': 7, 'unset': 27 },
        'conceal': { 'set': 8, 'unset': 28 },
    };

    public $options: Record<string, { set: number; unset: number }> = {};
    public $foreground: string | number = '';
    public $background: string | number = '';

    /**
     * Create a new instance.
     * @param $foreground - Foreground color name or hex.
     * @param $background - Background color name or hex.
     * @param $options - Array of style options.
     */
    constructor($foreground: string = '', $background: string = '', $options: string[] = []) {
        this.$foreground = this.parseColor($foreground);
        this.$background = this.parseColor($background, true);

        for (const $option of $options) {
            if (!isset((this.constructor as typeof Color).AVAILABLE_OPTIONS[$option])) {
                throw new InvalidArgumentException(sprintf('Invalid option specified: "%s". Expected one of (%s).', $option, Object.keys((this.constructor as typeof Color).AVAILABLE_OPTIONS).join(', ')));
            }

            this.$options[$option] = (this.constructor as typeof Color).AVAILABLE_OPTIONS[$option];
        }
    }

    /**
     * Apply color to text.
     * @param $text - Text to color.
     * @returns Formatted colored text.
     */
    public apply($text: string): string {
        return this.set() + $text + this.unset();
    }

    /**
     * Get ANSI set code sequence.
     * @returns ANSI set escape code.
     */
    public set(): string {
        const $setCodes: (string | number)[] = [];
        if ('' !== this.$foreground) {
            $setCodes.push(this.$foreground);
        }
        if ('' !== this.$background) {
            $setCodes.push(this.$background);
        }
        for (const $option in this.$options) {
            $setCodes.push(this.$options[$option]['set']);
        }

        if (0 === count($setCodes)) {
            return '';
        }

        return sprintf("\x1b[%sm", $setCodes.join(';'));
    }

    /**
     * Get ANSI unset code sequence.
     * @returns ANSI unset escape code.
     */
    public unset(): string {
        const $unsetCodes: (string | number)[] = [];
        if ('' !== this.$foreground) {
            $unsetCodes.push(39);
        }
        if ('' !== this.$background) {
            $unsetCodes.push(49);
        }
        for (const $option in this.$options) {
            $unsetCodes.push(this.$options[$option]['unset']);
        }
        if (0 === count($unsetCodes)) {
            return '';
        }

        return sprintf("\x1b[%sm", $unsetCodes.join(';'));
    }

    /**
     * Parse color string to ANSI code.
     * @param $color - Color string.
     * @param $background - Whether this is background color.
     * @returns ANSI color code string.
     */
    public parseColor($color: string, $background: boolean = false): string {
        if ('' === $color) {
            return '';
        }

        if ('#' === $color[0]) {
            $color = $color.substring(1);

            if (3 === $color.length) {
                $color = $color[0] + $color[0] + $color[1] + $color[1] + $color[2] + $color[2];
            }

            if (6 !== $color.length) {
                throw new InvalidArgumentException(sprintf('Invalid "%s" color.', $color));
            }

            return ($background ? '4' : '3') + this.convertHexColorToAnsi(parseInt($color, 16));
        }

        if (isset((this.constructor as typeof Color).COLORS[$color])) {
            return ($background ? '4' : '3') + (this.constructor as typeof Color).COLORS[$color];
        }

        if (isset((this.constructor as typeof Color).BRIGHT_COLORS[$color])) {
            return ($background ? '10' : '9') + (this.constructor as typeof Color).BRIGHT_COLORS[$color];
        }

        throw new InvalidArgumentException(sprintf('Invalid "%s" color; expected one of (%s).', $color, Object.keys((this.constructor as typeof Color).COLORS).concat(Object.keys((this.constructor as typeof Color).BRIGHT_COLORS)).join(',')));
    }

    /**
     * Convert hex color to ANSI sequence.
     * @param $color - Numeric color value.
     * @returns ANSI color code string.
     */
    public convertHexColorToAnsi($color: number): string {
        const $r = ($color >> 16) & 255;
        const $g = ($color >> 8) & 255;
        const $b = $color & 255;

        if ('truecolor' !== env('COLORTERM')) {
            return String(this.degradeHexColorToAnsi($r, $g, $b));
        }

        return sprintf('8;2;%d;%d;%d', $r, $g, $b);
    }

    /**
     * Degrade hex color to ANSI.
     * @param $r - Red channel.
     * @param $g - Green channel.
     * @param $b - Blue channel.
     * @returns Degraded ANSI code.
     */
    public degradeHexColorToAnsi($r: number, $g: number, $b: number): number {
        if (0 === Math.round(this.getSaturation($r, $g, $b) / 50)) {
            return 0;
        }

        return (Math.round($b / 255) << 2) | (Math.round($g / 255) << 1) | Math.round($r / 255);
    }

    /**
     * Calculate color saturation.
     * @param $r - Red channel.
     * @param $g - Green channel.
     * @param $b - Blue channel.
     * @returns Saturation percentage.
     */
    public getSaturation($r: number, $g: number, $b: number): number {
        $r = $r / 255;
        $g = $g / 255;
        $b = $b / 255;
        const $v = Math.max($r, $g, $b);
        const $diff = $v - Math.min($r, $g, $b);
        if (0 === $diff) {
            return 0;
        }

        return $diff * 100 / $v;
    }
}

export default Color;