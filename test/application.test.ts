const _Application = require('../src/application');
const Application = _Application.default || _Application;
const _Command = require('../src/command');
const Command = _Command.default || _Command;

class TestAppCommand extends Command {
    get $signature() {
        return 'app:test';
    }

    get $description() {
        return 'Test application command';
    }

    handle() {
        return 'app:test executed';
    }
}

describe('Application Unit Tests', () => {

    test('Application initializes and sets autoExit', () => {
        const app = new Application({});
        expect(app.getAutoExit()).toBe(0);

        app.setAutoExit(1);
        expect(app.getAutoExit()).toBe(1);
        app.setAutoExit(0);
    });

    test('Application registers commands and checks availability', () => {
        const app = new Application({});
        const cmd = new TestAppCommand();
        app.add(cmd);
        expect(app.has(app.parseCommand('app:test'))).toBe(true);
    });

    test('Application throws CommandNotFoundException for unregistered command', () => {
        const app = new Application({});
        expect(() => app.call('nonexistent:command')).toThrow();
    });

});
