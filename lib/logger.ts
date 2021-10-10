const LOG_PREFIX = 'P2PJSNetwork: ';

export enum LogLevel {
    Disabled,
    Errors,
    Warnings,
    All
}

class Logger {
    private crrLogLevel = LogLevel.Disabled;

    get logLevel(): LogLevel { return this.crrLogLevel; }

    set logLevel(logLevel: LogLevel) { this.crrLogLevel = logLevel; }

    log(...args: any[]) {
        if (this.crrLogLevel >= LogLevel.All) {
            this.print(LogLevel.All, ...args);
        }
    }

    warn(...args: any[]) {
        if (this.crrLogLevel >= LogLevel.Warnings) {
            this.print(LogLevel.Warnings, ...args);
        }
    }

    error(...args: any[]) {
        if (this.crrLogLevel >= LogLevel.Errors) {
            this.print(LogLevel.Errors, ...args);
        }
    }

    setLogFunction(fn: (logLevel: LogLevel, ..._: any[]) => void): void {
        this.print = fn;
    }

    private print(logLevel: LogLevel, ...rest: any[]): void {
        const copy = [LOG_PREFIX, ...rest];

        for (let i in copy) {
            if (copy[i] instanceof Error) {
                copy[i] = "(" + copy[i].name + ") " + copy[i].message;

            }
        }

        if (logLevel >= LogLevel.All) {
            console.log(...copy);
        } else if (logLevel >= LogLevel.Warnings) {
            console.warn("WARNING", ...copy);
        } else if (logLevel >= LogLevel.Errors) {
            console.error("ERROR", ...copy);
        }
    }
}

export default new Logger();