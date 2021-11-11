const Color = require('./color')

class OutputFormatterStyle {

    $color;

    $foreground;

    $background;

    $options;

    $href = null;
    
    $handlesHrefGracefully = null;

    constructor($foreground = null, $background = null, $options = []) {
        this.$foreground = $foreground || '';
        this.$background = $background || '';
        this.$color = new Color(this.$foreground, this.$background, this.$options = $options);
    }

    setForeground($color = null) {
        this.$color = new Color(this.$foreground = $color || '', this.$background, this.$options);
    }

    setBackground($color = null) {
        this.$color = new Color(this.$foreground, this.$background = $color || '', this.$options);
    }

    setHref($url) {
        this.$href = $url;
    }

    setOption($option) {
        this.$options.push($option);
        this.$color = new Color(this.$foreground, this.$background, this.$options);
    }

    unsetOption($option) {
        let $pos = this.$options.indexOf($option);
        if (false !== $pos) {
            unset(this.$options[$pos]);
        }

        this.$color = new Color(this.$foreground, this.$background, this.$options);
    }

    setOptions($options) {
        this.$color = new Color(this.$foreground, this.$background, this.$options = $options);
    }

    apply($text) {

        if (null === this.$handlesHrefGracefully) {
            this.$handlesHrefGracefully = 'JetBrains-JediTerm' !== env('TERMINAL_EMULATOR') &&
                (!env('KONSOLE_VERSION') || env('KONSOLE_VERSION') > 201100);
        }

        if (null !== this.$href && this.$handlesHrefGracefully) {
            $text = `\0o33]8;;${this.$href}\0o33\\${$text}\0o33]8;;\0o33\\`;
        }
        return this.$color.apply($text);
    }
}

module.exports = OutputFormatterStyle