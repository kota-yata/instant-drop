import { fileStore, idStore, LogListStore, logStore, ObjectListStore } from './store';
import type { WS } from './ws';
import type { FileObject } from '$lib/objects/fileObject';
import { WaitingObject } from './objects/waitingObject';
import * as ProtoWS from './proto/ws';
import MyStringDataObject from './objects/stringDataObject';
import MyMessageObject from './objects/messageObject';

/**
 * Class for WebRTC datachannel connection
 */
export class RTC {
  private readonly CONFIG: RTCConfiguration = {
    'iceServers': [
      {
        urls: 'turn:numb.viagenie.ca',
        credential: 'muazkh',
        username: 'webrtc@live.com'
      },
      {
        urls: 'turn:192.158.29.39:3478?transport=udp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
      },
      {
        urls: 'turn:192.158.29.39:3478?transport=tcp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
      },
      {
        urls: 'turn:turn.bistri.com:80',
        credential: 'homeo',
        username: 'homeo'
      },
      {
        urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
        credential: 'webrtc',
        username: 'webrtc'
      },
      {
        'urls': [
          'stun:stun.l.google.com:19302',
          'stun:stun.stunprotocol.org:3478',
        ]
      }
    ]
  };
  private peerConnection: RTCPeerConnection;
  private dataChannel: RTCDataChannel;
  private logStore: LogListStore;
  private fileStore: ObjectListStore<File>;
  private ws: WS;
  private localId: string;
  private remoteId: string;
  private waitingObject: WaitingObject;
  /**
   * Creates a new RTCPeerConnection instance, and adds event listeners for icecandidate, connectionstatechange and datachannel.
   */
  constructor(ws: WS, remoteId: string) {
    this.waitingObject = new WaitingObject();
    this.fileStore = new ObjectListStore<File>(fileStore);
    this.logStore = new LogListStore(logStore);
    this.ws = ws;
    this.remoteId = remoteId;
    idStore.subscribe((id) => {
      this.localId = id;
    });
    this.peerConnection = new RTCPeerConnection(this.CONFIG);
    this.dataChannel = this.peerConnection.createDataChannel('File Transfer', {
      ordered: false,
      negotiated: true,
      id: 0
    });
    this.dataChannel.binaryType = 'arraybuffer';
    this.dataChannel.onopen = () => {
      this.logStore.pushWithCurrentTimeStamp('RTC Data Channel is open');
    };
    this.dataChannel.onmessage = (event: MessageEvent) => { this.handleMessage(event); };
    this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => { this.elIceCandidate(event); }; // Ice Candidate update event
    this.peerConnection.onconnectionstatechange = () => { this.elConnectionStateChange(); }; // Connection state update event
  }
  private elIceCandidate(event: RTCPeerConnectionIceEvent): void {
    if (!event.candidate) return;
    const offerObj: ProtoWS.StringDataObject = new MyStringDataObject(this.localId, this.remoteId, JSON.stringify(event.candidate));
    const messageObj: ProtoWS.MessageObject = new MyMessageObject(ProtoWS.DataType.IceCandidate, offerObj);
    this.ws.sendMessage(messageObj);
  }
  private elConnectionStateChange(): void {
    this.logStore.pushWithCurrentTimeStamp(`Connection state changed: ${this.peerConnection.connectionState}`);
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
    return offer;
  }
  /**
   * Called when receiving an offer. Sets the offer from the first argument as a remote SDP, then creates an answer.
   * @param offer the offer from a remote peer
   * @returns Local SDP
   */
  public async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    await this.peerConnection.setRemoteDescription(offer);
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
  /**
   * Called when receiving a message. Call handleFileObject when the message is string, handleArrayBuffer when the message is array buffer
   * @param event A message received from the remote peer
   */
  public handleMessage(event: MessageEvent): void {
    const message = event.data;
    let file: File = null;
    if (typeof message === 'string') { // FileObject
      const fileObject: FileObject = JSON.parse(message);
      file = this.waitingObject.addFileObject(fileObject);
    } else { // Data
      file = this.waitingObject.addFragment(message as ArrayBuffer);
    }
    if (file) this.fileStore.push(file);
  }
  public send(data: string): void;
  public send(data: Blob): void;
  public send(data: ArrayBuffer): void;
  public send(data: ArrayBufferView): void;
  public send(data: any): void {
    if (this.dataChannel.readyState === 'open') {
      this.dataChannel.send(data);
      return;
    };
    setTimeout(() => {
      this.send(data);
    }, 2000);
  }
  public async addIceCandidate(ic: RTCIceCandidate): Promise<void> {
    this.peerConnection.addIceCandidate(ic).catch((err) => {
      this.logStore.pushWithCurrentTimeStamp('Something went wrong during adding a new ICE candidate');
      throw Error(err);
    });
  }
};
