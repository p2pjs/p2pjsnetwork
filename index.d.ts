import EventEmmiter from 'events';

export = DiscoveryClient;

declare namespace DiscoveryClient {
    interface NetworkConfig {
        logLevel?: LogLevel,
        garbageCollectorInterval?: number,
        idSaltLength?: number,
        messageLifespan?: number
    }

    interface ReadonlyNetwork {
        readonly availablePeers: ReadonlyArray<Peer>;
        readonly networkConfig: Readonly<NetworkConfig>;
        broadcast: { (type: string, payload: any): void; }
        discover: { (amount: number): void };
        close: { (): void; }
        on(event: 'open', listener: () => void): this;
        on(event: 'connection', listener: (peerId: string, peer: Peer) => void): this;
        on(event: 'message', listener: (message: IMessage | any) => void): this;
        on(event: 'close', listener: (peerId: string, peer: Peer) => void): this;
    }

    interface DiscoveryClientConfig {
        path: string;
        port: number;
        secure: boolean;
        params?: [
            param: string,
            value: string
        ][];
    }

    interface PeerConfiguration {
        rtcConfiguration?: RTCConfiguration;
        messageIdLength: number;
    }

    enum LogLevel {
        Disabled,
        Errors,
        Warnings,
        All
    }

    interface IMessage<TypeType = string, PayloadType = any> {
        type: TypeType;
        payload: PayloadType;
    }

    interface IPeerMessage<TypeType = string, PayloadType = any> extends IMessage<TypeType, PayloadType> {
        id: string;
    }
}

interface Network {
    on(event: 'connection', listener: (peerId: string, peer: Peer) => void): this;
    on(event: 'message', listener: (message: IMessage | any) => void): this;
    on(event: 'close', listener: (peerId: string, peer: Peer) => void): this;
}

declare class Network extends EventEmitter {
    get availablePeers(): ReadonlyArray<Peer>;
    constructor(networkConfig?: DiscoveryClient.NetworkConfig);
    broadcast(type: string, payload: any): void;
    discover(amount: number);
    close(): void;
}

interface Peer {
    on(event: 'message', cb: (message: DiscoveryClient.IPeerMessage, peer: Peer) => void): this;
    on(event: 'close', cb: (peer: Peer) => void): this;
}

declare class Peer extends EventEmitter {
    constructor(peerConnection: RTCPeerConnection, receiverSocket: RTCDataChannel, transmitterSocket: RTCDataChannel, peerConfiguration?: DiscoveryClient.PeerConfiguration);
    sendTraced(message: ITracedMessage): void;
    send(type: string, payload: any): void;
}

interface DiscoveryClient {
    on(event: 'connection', listener: (linkid: string, peer: Peer) => void): this;
    on(event: 'open', listener: () => void): this;
    on(event: 'emptylinkserver', listener: () => void): this;
    on(event: 'configurationError', listener: (message: IMessage<ServerMessageTypes>) => void): this;
    on(event: 'communicationError', listener: (message: IMessage<ServerMessageTypes>) => void): this;
}

declare class DiscoveryClient extends EventEmitter {
    constructor(linkServerConfig: DiscoveryClient.DiscoveryClientConfig,
        networkConfig?: DiscoveryClient.NetworkConfig,
        peerConfiguration?: DiscoveryClient.PeerConfiguration);
    discover(amount: number): DiscoveryClient.ReadonlyNetwork;
    close();
}