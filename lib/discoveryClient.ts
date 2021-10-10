import Peer, { PeerConfiguration } from "./peer";
import Logger from "./logger";
import PeerFactory from "./peerFactory";
import { ServerMessageTypes } from "./enums";
import { EventEmitter } from "events";
import { IMessage } from "./message";
import Network, { NetworkConfig, ReadonlyNetwork } from "./network";

export interface DiscoveryClientConfig {
  path: string;
  port: number;
  secure: boolean;
  params?: [param: string, value: string][];
}

interface DiscoveryClient {
  on(event: "connection", listener: (linkid: string, peer: Peer) => void): this;
  on(event: "open", listener: () => void): this;
  on(event: "emptylinkserver", listener: () => void): this;
  on(
    event: "configurationError",
    listener: (message: IMessage<ServerMessageTypes>) => void
  ): this;
  on(
    event: "communicationError",
    listener: (message: IMessage<ServerMessageTypes>) => void
  ): this;
}

class DiscoveryClient extends EventEmitter {
  private readonly webSocket: WebSocket;
  private readonly peerFactory: PeerFactory;
  private readonly network: Network;

  constructor(
    linkServerConfig: DiscoveryClientConfig,
    networkConfig?: NetworkConfig,
    peerConfiguration?: PeerConfiguration
  ) {
    super();
    const protocol = linkServerConfig.secure ? "wss://" : "ws://";
    const urlParams =
      linkServerConfig.params
        ?.map(([param, value]) => `${param}=${value}`)
        .join("&") ?? "";
    const url = `${protocol}${linkServerConfig.path}:${linkServerConfig.port}?${urlParams}`;
    Logger.log("Opening discover server socket.");
    this.webSocket = new WebSocket(url);

    this.webSocket.onopen = this.onConnectionOpen.bind(this);
    this.webSocket.onclose = this.onConnectionClose.bind(this);
    this.webSocket.onmessage = (event: MessageEvent<any>) => {
      this.handleMessage(JSON.parse(event.data));
    };

    this.peerFactory = new PeerFactory(peerConfiguration);
    this.peerFactory.on("icecandidate", this.onPeerIceCandidate.bind(this));
    this.peerFactory.on("connection", this.onPeerConnection.bind(this));

    this.network = new Network(networkConfig, peerConfiguration);
  }

  discover(amount: number): ReadonlyNetwork {
    Logger.log("Starting peer search.");
    this.send(ServerMessageTypes.Link, {
      amount,
    });
    return this.network;
  }

  close() {
    this.webSocket.close();
    this.peerFactory.close();
  }

  private onPeerConnection(linkId: string, peer: Peer) {
    this.send(ServerMessageTypes.Complete, { linkId });
    this.network.addPeer(linkId, peer);
  }

  private onPeerIceCandidate(linkId: string, candidate: RTCIceCandidate) {
    Logger.log("Peer candidate recceived.");
    this.send(ServerMessageTypes.Candidate, { linkId, candidate });
  }

  private onConnectionOpen() {
    Logger.log("Link server socket opened.");
    this.emit("open");
  }

  private onConnectionClose() {
    Logger.log("Link server socket closed.");
  }

  private send(type: ServerMessageTypes, payload: any) {
    this.webSocket.send(JSON.stringify({ type, payload }));
  }

  private handleMessage(message: IMessage<ServerMessageTypes>) {
    switch (message.type) {
      case ServerMessageTypes.Link:
        const linkList: string[] = message.payload.links;
        Logger.log(`${linkList.length} links found`);
        Logger.log("Starting connections...");
        linkList.forEach(linkId => {
          this.peerFactory.createOffer(linkId).then(offer => {
            this.send(ServerMessageTypes.Offer, {
              linkId,
              offer,
            });
          });
        });
        break;

      case ServerMessageTypes.Offer:
        Logger.log("Offer recceived.");
        this.peerFactory.recceiveOffer(message.payload).then(answer => {
          this.send(ServerMessageTypes.Answer, {
            answer,
            linkId: message.payload.linkId,
          });
        });
        break;

      case ServerMessageTypes.Answer:
        this.peerFactory.receiveAnswer(message.payload);
        break;

      case ServerMessageTypes.Candidate:
        this.peerFactory.recceiveCandidate(message.payload);
        break;

      case ServerMessageTypes.EmptyServerError:
        Logger.warn(message.payload.message);
        this.emit("emptylinkserver");
        break;

      case ServerMessageTypes.LinkAmountTooHighError:
      case ServerMessageTypes.MaxLinkAmountExceededError:
        Logger.error(message.payload.message);
        this.emit("configurationError", message);
        break;

      case ServerMessageTypes.WrongMessageTypeError:
      case ServerMessageTypes.WrongOrExpiredLinkError:
      case ServerMessageTypes.WrongMessageFormatError:
        Logger.error(message.payload.message);
        this.emit("communicationError", message);
        break;
    }
  }
}

export default DiscoveryClient;
