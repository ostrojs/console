class HasParameters {

    specifyParameters() {

        for (let $arguments of this.getArguments()) {
            if ($arguments instanceof InputArgument) {
                this.getDefinition().addArgument($arguments);
            } else {
                this.addArgument(...Object.values($arguments));
            }
        }

        for (let $options of this.getOptions()) {
            if ($options instanceof InputOption) {
                this.getDefinition().addOption($options);
            } else {
                this.addOption(...Object.values($options));
            }
        }
    }

    getArguments() {
        return {};
    }

    getOptions() {
        return {};
    }
}

module.exports = HasParameters