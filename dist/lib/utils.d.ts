export interface TimespanedId {
    salt: string;
    ttl: number;
}
export declare const randomId: (len: number) => string;
export declare const randomTimespanedId: (len: number, lifespan: number) => string;
export declare const decodeTimespanedId: (id: string) => TimespanedId;
