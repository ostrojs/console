class OutputInterface{

	static get VERBOSITY_QUIET(){
        return 16;
    }
    
    static get VERBOSITY_NORMAL(){
        return 32;
    }
    
    static get VERBOSITY_VERBOSE(){
        return 64;
    }
    
    static get VERBOSITY_VERY_VERBOSE(){
        return 128;
    }
    
    static get VERBOSITY_DEBUG(){
        return 256;
    }

    static get OUTPUT_NORMAL(){
        return 1;
    }
    
    static get OUTPUT_RAW(){
        return 2;
    }
    
    static get OUTPUT_PLAIN(){
        return 4;
    }
    
}

module.exports = OutputInterface