import Logger from "./logger";
import { EventEmitter } from "events";
import { ITracedMessage } from "./message";

export interface PeerConfiguration {
  rtcConfiguration?: RTCConfiguration;
}

interface Peer {
  on<TypeType = string, PayloadType = any>(
    event: "message",
    cb: (message: ITracedMessage<TypeType, PayloadType>, peer: Peer) => void
  ): this;
  on(event: "close", cb: (peer: Peer) => void): this;
}

class Peer extends EventEmitter {
  private readonly peerConfiguration: PeerConfiguration;
  private readonly peerConnection: RTCPeerConnection;
  private readonly receiverSocket: RTCDataChannel;
  private readonly transmitterSocket: RTCDataChannel;

  constructor(
    peerConnection: RTCPeerConnection,
    receiverSocket: RTCDataChannel,
    transmitterSocket: RTCDataChannel,
    peerConfiguration?: PeerConfiguration
  ) {
    super();
    this.peerConnection = peerConnection;
    this.receiverSocket = receiverSocket;
    this.transmitterSocket = transmitterSocket;
    this.peerConfiguration = {
      ...peerConfiguration,
    };

    this.peerConnection.addEventListener(
      "connectionstatechange",
      this.connectionStateHandler.bind(this)
    );
    this.receiverSocket.onmessage = event =>
      this.emit("message", JSON.parse(event.data), this);
  }

  private connectionStateHandler() {
    switch (this.peerConnection.iceConnectionState) {
      case "failed":
      case "closed":
      case "disconnected":
        Logger.warn("Peer dsiconnected");
        this.peerConnection.close();
        this.emit("close", this);
        break;
      case "completed":
        Logger.log("Connection completed");
        break;
    }
  }

  sendTraced(message: ITracedMessage) {
    this.transmitterSocket.send(JSON.stringify(message));
  }

  send(type: string, payload: any) {
    this.transmitterSocket.send(
      JSON.stringify({
        type,
        payload,
      })
    );
  }

  close() {
    this.peerConnection.close();
    this.receiverSocket.close();
    this.transmitterSocket.close();
  }
}

export default Peer;
