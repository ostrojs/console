const CommandNotFoundExceptionContract = require('@ostro/contracts/console/commandNotFoundException')
class CommandNotFoundException extends CommandNotFoundExceptionContract{
   
    constructor(message) {
        super();
        this.name = this.constructor.name;
        this.message =  message;
        this.status =  500;
        Error.captureStackTrace(this, this.constructor);      
    }

}

module.exports = CommandNotFoundException