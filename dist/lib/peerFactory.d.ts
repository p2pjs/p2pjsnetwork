import Peer, { PeerConfiguration } from "./peer";
import { EventEmitter } from "events";
import { AnswerPayload, CandidatePayload, OfferPayload } from "./payloads";
interface PeerFactory {
    on(event: 'icecandidate', listener: (linkId: string, candidate: RTCIceCandidate) => void): this;
    on(event: 'connection', listener: (linkId: string, peer: Peer) => void): this;
}
declare class PeerFactory extends EventEmitter {
    private readonly peerConfiguration?;
    private readonly partialPeers;
    constructor(peerConfiguration?: PeerConfiguration);
    close(): void;
    createOffer(linkId: string): Promise<RTCSessionDescriptionInit>;
    recceiveOffer(payload: OfferPayload): Promise<RTCSessionDescriptionInit>;
    receiveAnswer(payload: AnswerPayload): Promise<void>;
    recceiveCandidate(payload: CandidatePayload): Promise<void>;
    private onEvents;
}
export default PeerFactory;
