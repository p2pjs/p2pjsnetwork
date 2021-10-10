import { EventEmitter } from "events";
import { IMessage } from "./message";
import { LogLevel } from "./logger";
import Peer from "./peer";
export interface NetworkConfig {
    logLevel?: LogLevel;
    garbageCollectorInterval?: number;
    idSaltLength?: number;
    messageLifespan?: number;
}
export interface ReadonlyNetwork {
}
interface Network {
    on(event: 'open', listener: () => void): this;
    on(event: 'connection', listener: (peerId: string, peer: Peer) => void): this;
    on(event: 'message', listener: (message: IMessage | any) => void): this;
    on(event: 'close', listener: (peerId: string, peer: Peer) => void): this;
}
declare class Network extends EventEmitter implements ReadonlyNetwork {
    private readonly networkConfig;
    private readonly garbageCollectorInterval;
    private readonly peers;
    private receivedIds;
    get availablePeers(): ReadonlyArray<Peer>;
    constructor(networkConfig?: NetworkConfig);
    private collectGarbage;
    close(): void;
    addPeer(peerId: string, peer: Peer): void;
    private connectionClosed;
    private handleMessage;
    private broadcastMessage;
    broadcast(type: string, payload: any): void;
}
export default Network;
