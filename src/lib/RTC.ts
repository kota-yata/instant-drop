import { LogListStore, logStore } from './store';

/**
 * Class for WebRTC datachannel connection
 */
export class RTC {
  private readonly CONFIG: RTCConfiguration = { 'iceServers': [{ 'urls': 'stun:stun.1.google.com:19302' }] };
  private peerConnection: RTCPeerConnection;
  private dataChannel: RTCDataChannel;
  private logStore: LogListStore;
  /**
   * Creates a new RTCPeerConnection instance, and adds event listeners for icecandidate, connectionstatechange and datachannel.
   */
  constructor() {
    this.peerConnection = new RTCPeerConnection(this.CONFIG);
    this.logStore = new LogListStore(logStore);
    this.peerConnection.addEventListener('icecandidate', this.elIceCandidate); // Ice Candidate update event
    this.peerConnection.addEventListener('connectionstatechange', this.elConnectionStateChange); // Connection state update event
    this.peerConnection.addEventListener('datachannel', this.elDataChannel); // Data Channel constructor
    this.logStore.pushWithCurrentTimeStamp('New RTC Instance created');
  }
  private elIceCandidate(event: RTCPeerConnectionIceEvent): void {
    if (!event.candidate) return;
    this.logStore.pushWithCurrentTimeStamp('New local ICE Candidate detected');
  }
  private elConnectionStateChange(): void {
    this.logStore.pushWithCurrentTimeStamp(`Connection state changed: ${this.peerConnection.connectionState}`);
  }
  private elDataChannel(event: RTCDataChannelEvent): void {
    this.dataChannel = event.channel;
    this.dataChannel.addEventListener('open', () => {
      this.logStore.pushWithCurrentTimeStamp('RTC Data Channel opened');
    });
    this.dataChannel.addEventListener('close', () => {
      this.logStore.pushWithCurrentTimeStamp('RTC Data Channel closed');
    });
    this.logStore.pushWithCurrentTimeStamp('RTC Data Channel initialized');
  }
  /**
   * Creates a local SDP
   * @returns Local SDP
   */
  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    const offer = await this.peerConnection.createOffer({
      iceRestart: false,
      offerToReceiveAudio: false,
      offerToReceiveVideo: false
    });
    await this.peerConnection.setLocalDescription(offer);
    this.logStore.pushWithCurrentTimeStamp('Local SDP created');
    return offer;
  }
  /**
   * Called when receiving an offer. Sets the offer from the first argument as a remote SDP, then creates an answer.
   * @param offer the offer from a remote peer
   * @returns Local SDP
   */
  public async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    this.peerConnection.setRemoteDescription(offer);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }
  /**
   * Called when receiving an answer. Sets the answer as a remote SDP
   * @param sdp the answer from a remote peer
   */
  public async handleAnswer(sdp: RTCSessionDescriptionInit): Promise<void> {
    const remoteDesc = new RTCSessionDescription(sdp);
    await this.peerConnection.setRemoteDescription(remoteDesc);
  }
  public send(data: string): void;
  public send(data: Blob): void;
  public send(data: ArrayBuffer): void;
  public send(data: ArrayBufferView): void;
  public send(data: any): void {
    this.dataChannel.send(data);
  }
};
