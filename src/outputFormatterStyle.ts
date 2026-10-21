import { env, unset } from '@ostro/support/function';
import Color from './color';

/**
 * Class OutputFormatterStyle.
 */
class OutputFormatterStyle {

    public $color: Color;
    public $foreground: string;
    public $background: string;
    public $options: string[];
    public $href: string | null = null;
    public $handlesHrefGracefully: boolean | null = null;

    /**
     * Create a new instance.
     * @param $foreground - Foreground color.
     * @param $background - Background color.
     * @param $options - Style options.
     */
    constructor($foreground: string | null = null, $background: string | null = null, $options: string[] = []) {
        this.$foreground = $foreground || '';
        this.$background = $background || '';
        this.$options = $options;
        this.$color = new Color(this.$foreground, this.$background, this.$options);
    }

    /**
     * Set foreground color.
     * @param $color - Color name or hex.
     */
    public setForeground($color: string | null = null): void {
        this.$color = new Color(this.$foreground = $color || '', this.$background, this.$options);
    }

    /**
     * Set background color.
     * @param $color - Color name or hex.
     */
    public setBackground($color: string | null = null): void {
        this.$color = new Color(this.$foreground, this.$background = $color || '', this.$options);
    }

    /**
     * Set hyperlink URL.
     * @param $url - URL for hyperlink.
     */
    public setHref($url: string): void {
        this.$href = $url;
    }

    /**
     * Set a style option.
     * @param $option - Option name (e.g. 'bold').
     */
    public setOption($option: string): void {
        this.$options.push($option);
        this.$color = new Color(this.$foreground, this.$background, this.$options);
    }

    /**
     * Unset a style option.
     * @param $option - Option name.
     */
    public unsetOption($option: string): void {
        const $pos = this.$options.indexOf($option);
        if (-1 !== $pos) {
            unset(this.$options, $pos);
            this.$options.splice($pos, 1);
        }

        this.$color = new Color(this.$foreground, this.$background, this.$options);
    }

    /**
     * Set all style options.
     * @param $options - Array of option names.
     */
    public setOptions($options: string[]): void {
        this.$color = new Color(this.$foreground, this.$background, this.$options = $options);
    }

    /**
     * Apply style to text.
     * @param $text - Text to format.
     * @returns Formatted text.
     */
    public apply($text: string): string {
        if (null === this.$handlesHrefGracefully) {
            this.$handlesHrefGracefully = 'JetBrains-JediTerm' !== env('TERMINAL_EMULATOR') &&
                (!env('KONSOLE_VERSION') || Number(env('KONSOLE_VERSION')) > 201100);
        }

        if (null !== this.$href && this.$handlesHrefGracefully) {
            $text = `\0o33]8;;${this.$href}\0o33\\${$text}\0o33]8;;\0o33\\`;
        }
        return this.$color.apply($text);
    }
}

export default OutputFormatterStyle;