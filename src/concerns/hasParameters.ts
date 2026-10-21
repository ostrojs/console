declare const InputArgument: any;
declare const InputOption: any;

/**
 * Class HasParameters.
 */
class HasParameters {
    public declare getDefinition: any;
    public declare addArgument: any;
    public declare addOption: any;

    /**
     * specifyParameters method.
     * @returns {any}
     */
    public specifyParameters() {

        for (let $arguments of this.getArguments()) {
            if (typeof InputArgument !== 'undefined' && $arguments instanceof InputArgument) {
                this.getDefinition().addArgument($arguments);
            } else {
                this.addArgument(...Object.values($arguments as any));
            }
        }

        for (let $options of this.getOptions()) {
            if (typeof InputOption !== 'undefined' && $options instanceof InputOption) {
                this.getDefinition().addOption($options);
            } else {
                this.addOption(...Object.values($options as any));
            }
        }
    }

    /**
     * getArguments method.
     * @returns {any}
     */
    public getArguments(): any[] {
        return [];
    }

    /**
     * getOptions method.
     * @returns {any}
     */
    public getOptions(): any[] {
        return [];
    }
}

export default HasParameters;