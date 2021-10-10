import { PeerConfiguration } from "./peer";
import { EventEmitter } from "events";
export default class PartialPeer extends EventEmitter {
    private readonly peerConnection;
    private readonly receiverSocket;
    constructor(peerConfiguration?: PeerConfiguration, dataChannelInit?: RTCDataChannelInit);
    close(): void;
    createOffer(): Promise<RTCSessionDescriptionInit>;
    recceiveOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit>;
    recceiveAnswer(answer: RTCSessionDescriptionInit): Promise<void>;
    addCandidate(candidate: RTCIceCandidateInit | RTCIceCandidate): Promise<void>;
    private onIceCandidate;
    private onCompleteConnection;
}
