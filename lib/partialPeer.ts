import Peer, { PeerConfiguration } from "./peer";
import { EventEmitter } from "events";

export default class PartialPeer extends EventEmitter {
  private readonly peerConnection: RTCPeerConnection;
  private readonly receiverSocket: RTCDataChannel;
  public readonly ttl: Date;

  constructor(
    peerConfiguration?: PeerConfiguration,
    dataChannelInit?: RTCDataChannelInit
  ) {
    super();
    this.ttl = new Date();
    this.ttl.setMinutes(this.ttl.getMinutes() + 1);

    this.peerConnection = new RTCPeerConnection(
      peerConfiguration?.rtcConfiguration
    );
    this.receiverSocket = this.peerConnection.createDataChannel(
      "receiver",
      dataChannelInit
    );

    this.peerConnection.addEventListener(
      "datachannel",
      this.onCompleteConnection.bind(this)
    );
    this.peerConnection.addEventListener(
      "icecandidate",
      this.onIceCandidate.bind(this)
    );
  }

  close() {
    this.peerConnection.close();
    this.receiverSocket.close();
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async recceiveOffer(
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit> {
    await this.peerConnection.setRemoteDescription(offer);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  async recceiveAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    await this.peerConnection.setRemoteDescription(answer);
  }

  async addCandidate(
    candidate: RTCIceCandidateInit | RTCIceCandidate
  ): Promise<void> {
    await this.peerConnection.addIceCandidate(candidate);
  }

  private onIceCandidate(event: RTCPeerConnectionIceEvent) {
    this.emit("icecandidate", event.candidate);
  }

  private onCompleteConnection(event: RTCDataChannelEvent) {
    this.peerConnection.removeEventListener(
      "datachannel",
      this.onCompleteConnection.bind(this)
    );
    this.peerConnection.removeEventListener(
      "icecandidate",
      this.onIceCandidate.bind(this)
    );
    this.emit(
      "completeConnection",
      new Peer(this.peerConnection, this.receiverSocket, event.channel)
    );
  }
}
