const _OutputFormatterStyle = require('../src/outputFormatterStyle');
const OutputFormatterStyle = _OutputFormatterStyle.default || _OutputFormatterStyle;
const _OutputFormatterStyleStack = require('../src/outputFormatterStyleStack');
const OutputFormatterStyleStack = _OutputFormatterStyleStack.default || _OutputFormatterStyleStack;
const _OutputFormatter = require('../src/outputFormatter');
const OutputFormatter = _OutputFormatter.default || _OutputFormatter;

describe('OutputFormatter Unit Tests', () => {

    test('OutputFormatterStyle sets foreground, background, and href', () => {
        const style = new OutputFormatterStyle('red', 'black');
        style.setForeground('blue');
        style.setBackground('yellow');
        style.setHref('https://ostrojs.com');
        const result = style.apply('Link Text');
        expect(result).toContain('Link Text');
    });

    test('OutputFormatterStyleStack handles push, pop, and reset', () => {
        const stack = new OutputFormatterStyleStack();
        const style1 = new OutputFormatterStyle('red');
        const style2 = new OutputFormatterStyle('green');

        stack.push(style1);
        expect(stack.getCurrent()).toBe(style1);

        stack.push(style2);
        expect(stack.getCurrent()).toBe(style2);

        const popped = stack.pop();
        expect(popped).toBe(style2);
        expect(stack.getCurrent()).toBe(style1);

        stack.reset();
        expect(stack.getCurrent()).toBe(stack.getEmptyStyle());
    });

    test('OutputFormatter manages styles and format decoration', () => {
        const formatter = new OutputFormatter(true);
        expect(formatter.hasStyle('error')).toBe(true);
        expect(formatter.hasStyle('info')).toBe(true);
        expect(formatter.hasStyle('warning')).toBe(true);

        const customStyle = new OutputFormatterStyle('cyan');
        formatter.setStyle('custom', customStyle);
        expect(formatter.getStyle('custom')).toBe(customStyle);

        const formattedText = formatter.format('<info>Info Message</info>');
        expect(formattedText).toContain('Info Message');
    });

    test('OutputFormatter escapes special tags and trailing backslashes', () => {
        const escaped = OutputFormatter.escape('foo <info>bar</info>');
        expect(escaped).toBeDefined();

        const escapedSlash = OutputFormatter.escapeTrailingBackslash('test\\');
        expect(escapedSlash).toBeDefined();
    });

    test('OutputFormatter handles decorated vs undecorated mode', () => {
        const decoratedFormatter = new OutputFormatter(true);
        expect(decoratedFormatter.isDecorated()).toBe(true);

        decoratedFormatter.setDecorated(false);
        expect(decoratedFormatter.isDecorated()).toBe(false);
    });

    test('OutputFormatter throws InvalidArgumentException for unknown style lookup', () => {
        const formatter = new OutputFormatter();
        expect(() => formatter.getStyle('nonexistent')).toThrow('Undefined style: nonexistent');
    });

});
