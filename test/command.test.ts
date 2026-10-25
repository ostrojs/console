import { describe, test, expect, jest } from "@jest/globals";
const _Command = require('../src/command');
const Command = _Command.default || _Command;

class TestCommand extends Command {
    get $signature() {
        return 'test:run';
    }

    get $description() {
        return 'Test command execution';
    }

    handle() {
        return 'handled';
    }
}

describe('Command Unit Tests', () => {

    test('Command signature and description are defined in subclass', () => {
        const cmd = new TestCommand();
        expect(cmd.$signature).toBe('test:run');
        expect(cmd.$description).toBe('Test command execution');
    });

    test('Base Command throws error when $signature and $description are not overridden', () => {
        const baseCmd = new Command();
        expect(() => baseCmd.$signature).toThrow('$signature must be defined');
        expect(() => baseCmd.$description).toThrow('$description must be defined');
    });

    test('Command sets and gets application instance', () => {
        const cmd = new TestCommand();
        const mockApp = { call: jest.fn() };
        cmd.setApp(mockApp);
        expect(cmd.getApp()).toBe(mockApp);
    });

    test('Command createArgument and createOption produce instance helpers', () => {
        const cmd = new TestCommand();
        const arg = cmd.createArgument('user');
        const opt = cmd.createOption('-f, --force');
        expect(arg).toBeDefined();
        expect(opt).toBeDefined();
    });

});
