export declare enum LogLevel {
    Disabled = 0,
    Errors = 1,
    Warnings = 2,
    All = 3
}
declare class Logger {
    private crrLogLevel;
    get logLevel(): LogLevel;
    set logLevel(logLevel: LogLevel);
    log(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    setLogFunction(fn: (logLevel: LogLevel, ..._: any[]) => void): void;
    private print;
}
declare const _default: Logger;
export default _default;
