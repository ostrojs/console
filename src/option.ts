import { Option as CommanderOption } from 'commander';

/**
 * Class Option.
 */
class Option {
    public $handler: CommanderOption;

    /**
     * Create a new instance.
     * @param flags - The option flags (e.g. '-f, --force').
     * @param description - The option description.
     */
    constructor(flags: string, description?: string) {
        this.$handler = new CommanderOption(flags, description);
    }

    /**
     * Hide option from help.
     * @param hide - Whether to hide the option from help.
     * @returns The option instance.
     */
    public hideHelp(hide: boolean = true): this {
        this.$handler.hideHelp(hide);
        return this;
    }

    /**
     * Set the default value.
     * @param value - The default value.
     * @param description - Description of the default value.
     * @returns The option instance.
     */
    public default(value: unknown, description?: string): this {
        this.$handler.default(value, description);
        return this;
    }

    /**
     * Set the allowed choices.
     * @param values - The allowed choices.
     * @returns The option instance.
     */
    public choices(values: readonly string[]): this {
        this.$handler.choices(values as any);
        return this;
    }

    /**
     * Mark the option as mandatory.
     * @param mandatory - Whether the option is mandatory.
     * @returns The option instance.
     */
    public required(mandatory: boolean = true): this {
        this.$handler.makeOptionMandatory(mandatory);
        return this;
    }
}

export default Option;