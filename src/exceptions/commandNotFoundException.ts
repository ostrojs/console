import CommandNotFoundExceptionContract from '@ostro/contracts/console/commandNotFoundException';

/**
 * Class CommandNotFoundException.
 */
class CommandNotFoundException extends CommandNotFoundExceptionContract {
    public name: string;
    public message: string;
    public status: number;

    /**
     * Create a new instance.
     * @param message - The exception message.
     */
    constructor(message: string) {
        super();
        this.name = this.constructor.name;
        this.message = message;
        this.status = 500;
        Error.captureStackTrace(this, this.constructor);
    }
}

export default CommandNotFoundException;