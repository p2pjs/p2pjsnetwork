import { EventEmitter } from "events";
import { ITracedMessage } from "./message";
export interface PeerConfiguration {
    rtcConfiguration?: RTCConfiguration;
}
interface Peer {
    on<TypeType = string, PayloadType = any>(event: 'message', cb: (message: ITracedMessage<TypeType, PayloadType>, peer: Peer) => void): this;
    on(event: 'close', cb: (peer: Peer) => void): this;
}
declare class Peer extends EventEmitter {
    private readonly peerConfiguration;
    private readonly peerConnection;
    private readonly receiverSocket;
    private readonly transmitterSocket;
    constructor(peerConnection: RTCPeerConnection, receiverSocket: RTCDataChannel, transmitterSocket: RTCDataChannel, peerConfiguration?: PeerConfiguration);
    private connectionStateHandler;
    sendTraced(message: ITracedMessage): void;
    send(type: string, payload: any): void;
    close(): void;
}
export default Peer;
