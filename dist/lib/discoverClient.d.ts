import Peer, { PeerConfiguration } from "./peer";
import { ServerMessageTypes } from "./enums";
import { EventEmitter } from "events";
import { IMessage } from "./message";
import { NetworkConfig, ReadonlyNetwork } from "./network";
export interface DiscoveryClientConfig {
    path: string;
    port: number;
    secure: boolean;
    params?: [
        param: string,
        value: string
    ][];
}
interface DiscoveryClient {
    on(event: 'connection', listener: (linkid: string, peer: Peer) => void): this;
    on(event: 'open', listener: () => void): this;
    on(event: 'emptylinkserver', listener: () => void): this;
    on(event: 'configurationError', listener: (message: IMessage<ServerMessageTypes>) => void): this;
    on(event: 'communicationError', listener: (message: IMessage<ServerMessageTypes>) => void): this;
}
declare class DiscoveryClient extends EventEmitter {
    private readonly webSocket;
    private readonly peerFactory;
    private readonly network;
    constructor(linkServerConfig: DiscoveryClientConfig, networkConfig?: NetworkConfig, peerConfiguration?: PeerConfiguration);
    discover(amount: number): ReadonlyNetwork;
    close(): void;
    private onPeerConnection;
    private onPeerIceCandidate;
    private onConnectionOpen;
    private onConnectionClose;
    private send;
    private handleMessage;
}
export default DiscoveryClient;
