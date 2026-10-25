import { Argument as CommanderArgument } from 'commander';

/**
 * Class Argument.
 */
class Argument {
    public $handler: CommanderArgument;

    /**
     * Create a new instance.
     * @param name - The argument name.
     * @param description - The argument description.
     */
    constructor(name: string, description?: string) {
        this.$handler = new CommanderArgument(name, description);
        this.$handler.argOptional();
    }

    /**
     * Set the allowed choices for the argument.
     * @param values - The allowed choices.
     * @returns The argument instance.
     */
    public choices(values: readonly string[]): this {
        this.$handler.choices(values as string[]);
        return this;
    }

    /**
     * Set the default value for the argument.
     * @param value - The default value.
     * @param description - Description of the default value.
     * @returns The argument instance.
     */
    public default(value: unknown, description?: string): this {
        this.$handler.default(value, description);
        return this;
    }

    /**
     * Mark the argument as required.
     * @returns The argument instance.
     */
    public required(): this {
        this.$handler.argRequired();
        return this;
    }
}

export default Argument;