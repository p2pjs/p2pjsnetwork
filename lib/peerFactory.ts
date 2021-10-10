import Peer, { PeerConfiguration } from "./peer";
import Logger from "./logger";
import { EventEmitter } from "events";
import PartialPeer from "./partialPeer";
import { AnswerPayload, CandidatePayload, OfferPayload } from "./payloads";
import IDictionary from "./dictionary";
import { size } from "lodash";

interface PeerFactory {
  on(
    event: "icecandidate",
    listener: (linkId: string, candidate: RTCIceCandidate) => void
  ): this;
  on(event: "connection", listener: (linkId: string, peer: Peer) => void): this;
  on(event: "expire", listener: (linkId: string) => void): this;
}

class PeerFactory extends EventEmitter {
  private readonly peerConfiguration?: PeerConfiguration;
  private garbageCollectorInterval?: number;
  private readonly partialPeers: IDictionary<PartialPeer> = {};

  constructor(peerConfiguration?: PeerConfiguration) {
    super();
    this.peerConfiguration = peerConfiguration;
    this.startGarbageCollector();
  }

  private startGarbageCollector() {
    if (!this.garbageCollectorInterval) {
      this.garbageCollectorInterval = setInterval(
        this.collectGarbage.bind(this),
        60000
      );
    }
  }

  private collectGarbage() {
    Logger.log("Collecting peerFactory garbage...");
    for (var linkId in this.partialPeers) {
      if (new Date() > this.partialPeers[linkId].ttl) {
        this.partialPeers[linkId].close();
        delete this.partialPeers[linkId];
        this.emit("expire", linkId);
      }
    }
    if (size(this.partialPeers) === 0) {
      clearInterval(this.garbageCollectorInterval);
      this.garbageCollectorInterval = undefined;
    }
  }

  close() {
    for (var linkId in this.partialPeers) {
      this.partialPeers[linkId].close();
      delete this.partialPeers[linkId];
    }
  }

  async createOffer(linkId: string) {
    const newPartialPeer = new PartialPeer(this.peerConfiguration);
    this.onEvents(newPartialPeer, linkId);
    this.partialPeers[linkId] = newPartialPeer;
    this.startGarbageCollector();
    return await newPartialPeer.createOffer();
  }

  async recceiveOffer(
    payload: OfferPayload
  ): Promise<RTCSessionDescriptionInit> {
    const newPartialPeer = new PartialPeer(this.peerConfiguration);
    this.onEvents(newPartialPeer, payload.linkId);
    this.partialPeers[payload.linkId] = newPartialPeer;
    this.startGarbageCollector();
    return await newPartialPeer.recceiveOffer(payload.offer);
  }

  async receiveAnswer(payload: AnswerPayload): Promise<void> {
    if (payload.linkId in this.partialPeers) {
      const partialPeer = this.partialPeers[payload.linkId]!;
      await partialPeer.recceiveAnswer(payload.answer);
    } else {
      Logger.error("Answer recceived in unknown link id");
    }
  }

  async recceiveCandidate(payload: CandidatePayload): Promise<void> {
    if (payload.linkId in this.partialPeers) {
      const partialPeer = this.partialPeers[payload.linkId]!;
      await partialPeer.addCandidate(payload.candidate);
    } else {
      Logger.error("Candidate recceived in unknown link id");
    }
  }

  private onEvents(newPartialPeer: PartialPeer, linkId: string) {
    newPartialPeer.on("icecandidate", (candidate: RTCIceCandidate) => {
      this.emit("icecandidate", linkId, candidate);
    });
    newPartialPeer.on("completeConnection", (peer: Peer) => {
      newPartialPeer.removeAllListeners();
      delete this.partialPeers[linkId];
      this.emit("connection", linkId, peer);
    });
  }
}

export default PeerFactory;
