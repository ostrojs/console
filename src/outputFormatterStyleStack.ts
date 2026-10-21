import { empty } from '@ostro/support/function';
import InvalidArgumentException from '@ostro/support/exceptions/invalidArgumentException';
import OutputFormatterStyle from './outputFormatterStyle';

/**
 * Class OutputFormatterStyleStack.
 */
class OutputFormatterStyleStack {

    public $emptyStyle: OutputFormatterStyle;
    public $styles: OutputFormatterStyle[];

    /**
     * Create a new instance.
     * @param $emptyStyle - Default empty style.
     */
    constructor($emptyStyle: OutputFormatterStyle | null = null) {
        this.$emptyStyle = $emptyStyle || new OutputFormatterStyle();
        this.$styles = [];
    }

    /**
     * Reset the style stack.
     */
    public reset(): void {
        this.$styles = [];
    }

    /**
     * Push a style onto the stack.
     * @param $style - Style to push.
     */
    public push($style: OutputFormatterStyle): void {
        this.$styles.push($style);
    }

    /**
     * Pop a style from the stack.
     * @param $style - Specific style to pop to, or null for top style.
     * @returns The popped style.
     */
    public pop($style: OutputFormatterStyle | null = null): OutputFormatterStyle {
        if (empty(this.$styles)) {
            return this.$emptyStyle;
        }

        if (null === $style) {
            return this.$styles.pop()!;
        }
        this.$styles = this.$styles.reverse();
        for (let $i = 0; $i < this.$styles.length; $i++) {
            const $stackedStyle = this.$styles[$i];

            if ($style.apply('') === $stackedStyle.apply('')) {
                this.$styles = this.$styles.slice(0, $i);

                return $stackedStyle;
            }
        }

        throw new InvalidArgumentException('Incorrectly nested style tag found.');
    }

    /**
     * Get the current top style.
     * @returns The current active style.
     */
    public getCurrent(): OutputFormatterStyle {
        if (empty(this.$styles)) {
            return this.$emptyStyle;
        }

        return this.$styles[this.$styles.length - 1];
    }

    /**
     * Set the empty fallback style.
     * @param $emptyStyle - Empty style.
     * @returns The stack instance.
     */
    public setEmptyStyle($emptyStyle: OutputFormatterStyle): this {
        this.$emptyStyle = $emptyStyle;

        return this;
    }

    /**
     * Get the empty fallback style.
     * @returns The empty style.
     */
    public getEmptyStyle(): OutputFormatterStyle {
        return this.$emptyStyle;
    }
}

export default OutputFormatterStyleStack;