import { describe, test, expect } from "@jest/globals";
const _Argument = require('../src/argument');
const Argument = _Argument.default || _Argument;
const _Option = require('../src/option');
const Option = _Option.default || _Option;

describe('Argument and Option Unit Tests', () => {

    test('Argument initializes and chains configuration methods', () => {
        const arg = new Argument('name', 'User name description');
        expect(arg.$handler).toBeDefined();

        const chainedArg = arg.choices(['admin', 'user']).default('user').required();
        expect(chainedArg).toBe(arg);
    });

    test('Option initializes and chains configuration methods', () => {
        const opt = new Option('-e, --env <environment>', 'Environment name');
        expect(opt.$handler).toBeDefined();

        const chainedOpt = opt.choices(['dev', 'prod']).default('dev').hideHelp().required();
        expect(chainedOpt).toBe(opt);
    });

});
