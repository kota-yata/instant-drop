import MyMessageObject from './objects/messageObject';
import MyStringDataObject from './objects/stringDataObject';
import { RTC } from './rtc';
import { logStore, idStore, LogListStore, peersStore } from './store';
import type { IndividualRTC } from './types';
import * as ProtoWS from './proto/ws';

export class WS {
  private ws: WebSocket;
  public rtcInstanceList: IndividualRTC[] = [];
  private isOpen = false;
  private logListStore: LogListStore;
  private localId: string;
  constructor() {
    this.logListStore = new LogListStore(logStore);
    idStore.subscribe((id) => {
      this.localId = id;
    });
    try {
      this.ws = new WebSocket('wss://ws-java.an.r.appspot.com:8080/ws');
      // this.ws = new WebSocket('ws://localhost:8080/ws');
      this.logListStore.pushWithCurrentTimeStamp('Connecting to the signaling server...');
    } catch (err) {
      this.logListStore.pushWithCurrentTimeStamp('Failed to connect to the signaling server');
      throw Error(err);
    }
    this.ws.onerror = () => {
      this.logListStore.pushWithCurrentTimeStamp('Something went wrong on WebSocket');
    };
    this.ws.onopen = () => {
      this.isOpen = true;
      this.ws.binaryType = 'arraybuffer';
    };
    // Intentionally make Immediately Invoked Function Expression (IIFE) as this onmessage event passes WebSocket object as "this"
    this.ws.onmessage = (event: MessageEvent<ArrayBuffer>) => {
      this.handleMessage(event);
    };
  }
  /**
   * Sends message if WebSocket is open, otherwise waits for 5s and recursively tries to send again
   * @param txt string data you want to send
   */
  public sendMessage(mso: ProtoWS.MessageObject): void {
    const bin = ProtoWS.encodeMessageObject(mso);
    if (this.isOpen) {
      this.ws.send(bin);
      return;
    };
    setTimeout(() => {
      this.sendMessage(mso);
    }, 5000);
  }
  /**
   * handles the received message based off the data type
   * @param e MessageEvent from WebSocket.onmessage
   */
  private async handleMessage(e: MessageEvent<ArrayBuffer>): Promise<void> {
    const messageObject = ProtoWS.decodeMessageObject(new Uint8Array(e.data));
    this.logListStore.push({
      log: messageObject.log,
      timeStamp: messageObject.timeStamp
    });
    switch (messageObject.dataType) {
    case ProtoWS.DataType.LocalId:
      this.handleMessageLocalId(messageObject);
      break;
    case ProtoWS.DataType.Peers:
      this.handleMessagePeers(messageObject);
      break;
    case ProtoWS.DataType.Offer:
      await this.handleMessageOffer(messageObject);
      break;
    case ProtoWS.DataType.Answer:
      await this.handleMessageAnswer(messageObject);
      break;
    case ProtoWS.DataType.IceCandidate:
      this.handleMessageIceCandidate(messageObject);
      break;
    default:
      this.logListStore.pushWithCurrentTimeStamp('Unknown message detected');
    }
  }
  private handleMessageLocalId(messageObject: ProtoWS.MessageObject) {
    idStore.set(messageObject.stringData);
  }
  private handleMessagePeers(messageObject: ProtoWS.MessageObject) {
    const peers = messageObject.listData.map((peerId) => ({
      id: peerId,
      icon: '🤨'
    }));
    peersStore.set(peers);
  }
  private async handleMessageOffer(messageObject: ProtoWS.MessageObject) {
    const offerObject: ProtoWS.StringDataObject = messageObject.stringDataObject;
    const r = this.rtcInstanceList.find((r) => r.id === offerObject.from);
    if (r) {
      this.logListStore.pushWithCurrentTimeStamp(`The connection with ${offerObject.from} has already been established`);
      return;
    }
    const rtc = new RTC(this, offerObject.from);
    this.rtcInstanceList.push({ id: offerObject.from, rtc });
    const offerSdp: RTCSessionDescriptionInit = JSON.parse(offerObject.offer);
    const answerSdp: RTCSessionDescriptionInit = await rtc.createAnswer(offerSdp);
    const answerObject: ProtoWS.StringDataObject = new MyStringDataObject(this.localId, offerObject.from, JSON.stringify(answerSdp));
    const reply: ProtoWS.MessageObject = new MyMessageObject(ProtoWS.DataType.Answer, answerObject);
    this.sendMessage(reply);
  }
  private async handleMessageAnswer(messageObject: ProtoWS.MessageObject) {
    const answerObject: ProtoWS.StringDataObject = messageObject.stringDataObject;
    const answerSdp: RTCSessionDescriptionInit = JSON.parse(answerObject.offer);
    const r = this.rtcInstanceList.find((r) => r.id === answerObject.from);
    if (!r) {
      const errorMessage = 'Corresponding RTC instance to the ID was not found';
      this.logListStore.pushWithCurrentTimeStamp(errorMessage);
      throw new Error(errorMessage);
    }
    await r.rtc.handleAnswer(answerSdp);
    this.logListStore.pushWithCurrentTimeStamp(`P2P connection with peer ID: ${answerObject.from} established`);
  }
  private handleMessageIceCandidate(messageObject: ProtoWS.MessageObject) {
    const stringData: ProtoWS.StringDataObject = messageObject.stringDataObject;
    const rtcAndId = this.rtcInstanceList.find((r) => r.id === stringData.from);
    if (!rtcAndId) {
      this.logListStore.pushWithCurrentTimeStamp('Corresponding RTC instance to the remote peer was not found');
      return;
    }
    rtcAndId.rtc.addIceCandidate(JSON.parse(stringData.offer));
  }
}
