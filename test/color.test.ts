const _Color = require('../src/color');
const Color = _Color.default || _Color;

describe('Color Unit Tests', () => {

    test('Color formats text with foreground and background colors', () => {
        const color = new Color('red', 'yellow');
        const formatted = color.apply('Hello World');
        expect(formatted).toContain('Hello World');
        expect(formatted).toContain('\x1b[');
    });

    test('Color handles options such as bold', () => {
        const color = new Color('green', '', ['bold']);
        const formatted = color.apply('Bold Green');
        expect(formatted).toContain('Bold Green');
    });

    test('Color throws InvalidArgumentException for invalid option', () => {
        expect(() => new Color('red', '', ['invalid_option'])).toThrow('Invalid option specified');
    });

    test('Color throws InvalidArgumentException for invalid color name', () => {
        expect(() => new Color('invalid_color')).toThrow('Invalid "invalid_color" color');
    });

});
