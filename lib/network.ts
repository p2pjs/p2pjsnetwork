import { EventEmitter } from "events";
import { IMessage, IRoutedMessage } from "./message";
import IDictionary from "./dictionary";
import { NetworkMessageTypes } from "./enums";
import Logger, { LogLevel } from "./logger";
import Peer, { PeerConfiguration } from "./peer";
import { ITracedMessage } from "./message";
import { sampleSize, last, size } from "lodash";
import { decodeTimespanedId, randomTimespanedId, TimespanedId } from "./utils";
import {
  AnswerPayload,
  CandidatePayload,
  DiscoverPayload,
  OfferPayload,
} from "./payloads";
import { peerConfiguration } from "./config";
import PeerFactory from "./peerFactory";
import logger from "./logger";

export interface NetworkConfig {
  logLevel?: LogLevel;
  garbageCollectorInterval?: number;
  idSaltLength?: number;
  messageLifespan?: number;
  maxPeerCount?: number;
  targetPeerCount?: number;
  minPeerCount?: number;
  avgOdds?: number;
  defaltDiscoverTargetDepth?: number;
  shoudAcceptPeer?: (
    network: ReadonlyNetwork,
    discoverPayload: Readonly<DiscoverPayload>
  ) => boolean;
}

export interface ReadonlyNetwork {
  readonly availablePeers: ReadonlyArray<Peer>;
  readonly networkConfig: Readonly<NetworkConfig>;
  broadcast: { (type: string, payload: any): void };
  discover: { (amount: number): void };
  close: { (): void };
  on(event: "open", listener: () => void): this;
  on(event: "connection", listener: (peerId: string, peer: Peer) => void): this;
  on(event: "message", listener: (message: IMessage | any) => void): this;
  on(event: "close", listener: (peerId: string, peer: Peer) => void): this;
}

interface Network {
  on(event: "open", listener: () => void): this;
  on(event: "connection", listener: (peerId: string, peer: Peer) => void): this;
  on(event: "message", listener: (message: IMessage | any) => void): this;
  on(event: "close", listener: (peerId: string, peer: Peer) => void): this;
}

class Network extends EventEmitter implements ReadonlyNetwork {
  readonly networkConfig: Readonly<NetworkConfig>;
  private garbageCollectorInterval?: number;
  private readonly peers: IDictionary<Peer> = {};
  private readonly candidates: IDictionary<string[]> = {};
  private readonly peerFactory: PeerFactory;
  private receivedIds: IDictionary<TimespanedId> = {};

  get availablePeers(): ReadonlyArray<Peer> {
    return Object.values(this.peers);
  }

  constructor(
    networkConfig?: NetworkConfig,
    peerConfiguration?: PeerConfiguration
  ) {
    super();
    this.networkConfig = {
      logLevel: LogLevel.Disabled,
      garbageCollectorInterval: 60000,
      idSaltLength: 8,
      messageLifespan: 300,
      maxPeerCount: 15,
      targetPeerCount: 7,
      minPeerCount: 3,
      avgOdds: 0.7,
      defaltDiscoverTargetDepth: 3,
      ...networkConfig,
    };
    Logger.logLevel = this.networkConfig.logLevel!;

    this.peerFactory = new PeerFactory(peerConfiguration);
    this.peerFactory.on("icecandidate", this.onPeerIceCandidate.bind(this));
    this.peerFactory.on("connection", this.onPeerConnection.bind(this));

    this.startGarbageCollector();
  }

  private startGarbageCollector() {
    if (!this.garbageCollectorInterval) {
      this.garbageCollectorInterval = setInterval(
        this.collectGarbage.bind(this),
        this.networkConfig.garbageCollectorInterval
      );
    }
  }

  private collectGarbage() {
    Logger.log("Collecting garbage...");
    Object.entries(this.receivedIds).forEach(([id, value]) => {
      if (new Date() > new Date(value.ttl)) {
        Logger.log(`Garbage id{${id}} collected`);
        delete this.receivedIds[id];
      }
    });
    if (size(this.receivedIds) === 0) {
      clearInterval(this.garbageCollectorInterval);
      this.garbageCollectorInterval = undefined;
    }
  }

  private addReceivedId(id: string) {
    this.receivedIds[id] = decodeTimespanedId(id);
    this.startGarbageCollector();
  }

  private onPeerConnection(linkId: string, peer: Peer) {
    delete this.candidates[linkId];
    this.addPeer(linkId, peer);
  }

  private onPeerIceCandidate(linkId: string, candidate: RTCIceCandidate) {
    Logger.log("Peer candidate recceived.");
    this.IceCandidate(linkId, candidate);
  }

  private broadcastMessage(message: ITracedMessage) {
    Object.entries(this.peers).forEach(([_, value]) => {
      value.sendTraced(message);
    });
  }

  private routeMessage(message: IRoutedMessage) {
    const crrLink = message.routeStack.pop();
    if (crrLink! in this.peers) {
      Logger.log(`Routing message to ${crrLink}`);
      this.peers[crrLink!].sendTraced({
        ...message,
        traceStack: [...message.traceStack, crrLink],
      } as IRoutedMessage);
    }
  }

  private offer(routeStack: string[]) {
    const crrLink = routeStack.pop();
    if (crrLink! in this.peers) {
      Logger.log(`Performing Offer to node ${crrLink}`);
      const linkId = Math.random().toString(36).substr(2);
      this.candidates[linkId] = [...routeStack, crrLink!];
      this.peerFactory.createOffer(linkId).then(offer => {
        this.peers[crrLink!].sendTraced({
          id: randomTimespanedId(
            this.networkConfig.idSaltLength!,
            this.networkConfig.messageLifespan!
          ),
          type: NetworkMessageTypes.Offer,
          routeStack,
          traceStack: [crrLink!],
          payload: {
            linkId,
            offer,
          },
        } as IRoutedMessage<string, OfferPayload>);
      });
    }
  }

  private answer(message: IRoutedMessage<string, OfferPayload>) {
    const crrLink = message.traceStack.pop();
    this.peerFactory.recceiveOffer(message.payload).then(answer => {
      Logger.log(`Performing Answer to node ${message.payload.linkId}`);
      this.candidates[message.payload.linkId] = message.traceStack;
      this.peers[crrLink!].sendTraced({
        id: randomTimespanedId(
          this.networkConfig.idSaltLength!,
          this.networkConfig.messageLifespan!
        ),
        type: NetworkMessageTypes.Answer,
        routeStack: message.traceStack,
        traceStack: [crrLink!],
        payload: {
          linkId: message.payload.linkId,
          answer,
        },
      } as IRoutedMessage<string, AnswerPayload>);
    });
  }

  private IceCandidate(linkId: string, candidate: RTCIceCandidate) {
    if (linkId in this.candidates) {
      const routeStack = this.candidates[linkId];
      const crrLink = routeStack.pop();
      if (crrLink! in this.peers) {
        Logger.log(`Send IceCandidate to node ${crrLink}`);
        this.peers[crrLink!].sendTraced({
          id: randomTimespanedId(
            this.networkConfig.idSaltLength!,
            this.networkConfig.messageLifespan!
          ),
          type: NetworkMessageTypes.Candidate,
          routeStack,
          traceStack: [crrLink!],
          payload: {
            linkId,
            candidate,
          },
        } as IRoutedMessage<string, CandidatePayload>);
      }
    }
  }

  private performDiscover(
    targetPeers: [key: string, value: Peer][],
    id: string,
    payload: DiscoverPayload
  ) {
    const samples = sampleSize(targetPeers, payload.amount);
    samples.forEach(([key, value], index) => {
      Logger.log(`Performing Discover in node ${key}`);
      value.sendTraced({
        id,
        type: NetworkMessageTypes.Discover,
        payload: {
          ...payload,
          routeStack: [...payload.routeStack, key],
          amount:
            Math.floor(payload.amount / samples.length) +
            (payload.amount % samples.length) * 0 ** index,
        },
      });
    });
  }

  //affinityNetwork
  //search

  private connectionClosed(peerId: string, peer: Peer) {
    delete this.peers[peerId];
    const crrPeerCount = size(this.peers);
    Logger.log(`${crrPeerCount} peers connected`);
    if (crrPeerCount <= this.networkConfig.minPeerCount!) {
      this.discover(this.networkConfig.targetPeerCount! - crrPeerCount);
    }
    this.emit("close", peerId, peer);
  }

  private handleMessage(
    message: ITracedMessage<NetworkMessageTypes>,
    [peerId, peer]: [string, Peer]
  ) {
    switch (message.type) {
      case NetworkMessageTypes.Broadcast:
        if (!(message.id in this.receivedIds)) {
          this.addReceivedId(message.id);
          this.broadcastMessage(message);
          this.emit("message", message.payload);
        }
        break;
      case NetworkMessageTypes.Discover: {
        if (!(message.id in this.receivedIds)) {
          this.addReceivedId(message.id);
          const payload = message.payload as DiscoverPayload;
          const crrPeers = Object.entries(this.peers).filter(
            ([id]) => id !== last(payload.routeStack)
          );
          if (
            payload.routeStack.length >= payload.targetDepth &&
            crrPeers.length < this.networkConfig.maxPeerCount!
          ) {
            this.offer(payload.routeStack);
          } else {
            let mayPerformDiscover = true;
            if (payload.routeStack.length > 1) {
              const inRoute = crrPeers.reduce(
                (acc, [key]) => acc || payload.routeStack.includes(key),
                false
              );
              const areException = crrPeers.reduce(
                (acc, [key]) => acc || payload.exceptions.includes(key),
                false
              );
              mayPerformDiscover = !inRoute && !areException;
            }
            if (mayPerformDiscover) {
              this.performDiscover(crrPeers, message.id, payload);
            }
          }
        }
        break;
      }
      case NetworkMessageTypes.Offer: {
        const routedOfferMessage = message as IRoutedMessage<
          string,
          OfferPayload
        >;
        if (routedOfferMessage.routeStack.length > 0) {
          this.routeMessage(routedOfferMessage);
        } else {
          this.answer(routedOfferMessage);
        }
        break;
      }
      case NetworkMessageTypes.Answer: {
        const routedOfferMessage = message as IRoutedMessage<
          string,
          AnswerPayload
        >;
        if (routedOfferMessage.routeStack.length > 0) {
          this.routeMessage(routedOfferMessage);
        } else {
          logger.log(`Answer Recceived from ${peerId}`);
          this.peerFactory.receiveAnswer(message.payload);
        }
        break;
      }
      case NetworkMessageTypes.Candidate: {
        const routedOfferMessage = message as IRoutedMessage<
          string,
          CandidatePayload
        >;
        if (routedOfferMessage.routeStack.length > 0) {
          this.routeMessage(routedOfferMessage);
        } else {
          this.peerFactory.recceiveCandidate(message.payload);
        }
        break;
      }
      default:
        this.emit("message", message);
        break;
    }
  }

  close() {
    Object.entries(this.peers).forEach(([_, value]) => {
      value.close();
    });
    clearInterval(this.garbageCollectorInterval);
  }

  addPeer(peerId: string, peer: Peer) {
    this.peers[peerId] = peer;
    Logger.log(`Peer ${peerId} connected - ${size(this.peers)}`);
    this.emit("connection", peerId, peer);
    peer.on("message", (message, peer) =>
      this.handleMessage(message as ITracedMessage<NetworkMessageTypes, any>, [
        peerId,
        peer,
      ])
    );
    peer.on("close", peer => this.connectionClosed(peerId, peer));
  }

  broadcast(type: string, payload: any) {
    const message: ITracedMessage = {
      type: NetworkMessageTypes.Broadcast,
      payload: {
        type,
        payload,
      },
      id: randomTimespanedId(
        this.networkConfig.idSaltLength!,
        this.networkConfig.messageLifespan!
      ),
    };
    this.addReceivedId(message.id);
    this.broadcastMessage(message);
  }

  discover(amount: number, targetDepth?: number) {
    this.performDiscover(
      Object.entries(this.peers),
      randomTimespanedId(
        this.networkConfig.idSaltLength!,
        this.networkConfig.messageLifespan!
      ),
      {
        exceptions: Object.keys(this.peers),
        routeStack: [],
        targetDepth:
          targetDepth ?? this.networkConfig.defaltDiscoverTargetDepth!,
        amount,
      }
    );
  }
}

export default Network;
