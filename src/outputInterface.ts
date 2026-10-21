/**
 * Class OutputInterface.
 */
class OutputInterface {

    /**
     * Verbosity level: quiet.
     * @returns Verbosity constant 16.
     */
    public static get VERBOSITY_QUIET(): number {
        return 16;
    }

    /**
     * Verbosity level: normal.
     * @returns Verbosity constant 32.
     */
    public static get VERBOSITY_NORMAL(): number {
        return 32;
    }

    /**
     * Verbosity level: verbose.
     * @returns Verbosity constant 64.
     */
    public static get VERBOSITY_VERBOSE(): number {
        return 64;
    }

    /**
     * Verbosity level: very verbose.
     * @returns Verbosity constant 128.
     */
    public static get VERBOSITY_VERY_VERBOSE(): number {
        return 128;
    }

    /**
     * Verbosity level: debug.
     * @returns Verbosity constant 256.
     */
    public static get VERBOSITY_DEBUG(): number {
        return 256;
    }

    /**
     * Output type: normal.
     * @returns Output type constant 1.
     */
    public static get OUTPUT_NORMAL(): number {
        return 1;
    }

    /**
     * Output type: raw.
     * @returns Output type constant 2.
     */
    public static get OUTPUT_RAW(): number {
        return 2;
    }

    /**
     * Output type: plain.
     * @returns Output type constant 4.
     */
    public static get OUTPUT_PLAIN(): number {
        return 4;
    }

}

export default OutputInterface;