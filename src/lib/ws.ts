import MessageObject from './objects/messageObject';
import StringDataObject from './objects/stringDataObject';
import { RTC } from './rtc';
import { logStore, idStore, LogListStore, peersStore } from './store';
import type { individualRTC, MessageObjectInterface, StringDataObjectInterface } from './types';

export class WS {
  private ws: WebSocket;
  public rtcInstanceList: individualRTC[] = [];
  private isOpen = false;
  private logListStore: LogListStore;
  private localId: string;
  constructor() {
    this.logListStore = new LogListStore(logStore);
    idStore.subscribe((id) => {
      this.localId = id;
    });
    try {
      this.ws = new WebSocket('ws://localhost:8080/ws');
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
    };
    // Intentionally make Immediately Invoked Function Expression (IIFE) as this onmessage event passes WebSocket object as "this"
    this.ws.onmessage = (event: MessageEvent) => {
      this.handleMessage(event);
    };
  }
  /**
   * Sends message if WebSocket is open, otherwise waits for 5s and recursively tries to send again
   * @param txt string data you want to send
   */
  public sendMessage(txt: string): void {
    if (this.isOpen) {
      this.ws.send(txt);
      return;
    };
    setTimeout(() => {
      this.sendMessage(txt);
    }, 5000);
  }
  /**
   * handles the received message based off the data type
   * @param e MessageEvent from WebSocket.onmessage
   */
  private async handleMessage(e: MessageEvent): Promise<void> {
    const messageObject: MessageObjectInterface = JSON.parse(e.data);
    this.logListStore.push({
      log: messageObject.log,
      timeStamp: messageObject.timeStamp
    });
    switch (messageObject.dataType) {
    case 'LocalId':
      this.handleMessageLocalId(messageObject);
      break;
    case 'Peers':
      this.handleMessagePeers(messageObject);
      break;
    case 'Offer':
      await this.handleMessageOffer(messageObject);
      break;
    case 'Answer':
      await this.handleMessageAnswer(messageObject);
      break;
    case 'IceCandidate':
      this.handleMessageIceCandidate(messageObject);
      break;
    default:
      this.logListStore.pushWithCurrentTimeStamp('Unknown message detected');
    }
  }
  private handleMessageLocalId(messageObject: MessageObject) {
    idStore.set(messageObject.stringData);
  }
  private handleMessagePeers(messageObject: MessageObject) {
    const peers = messageObject.listData.split(',').map((peerId) => ({
      id: peerId,
      icon: '😀'
    }));
    peersStore.set(peers);
  }
  private async handleMessageOffer(messageObject: MessageObject) {
    const offerObject: StringDataObjectInterface = JSON.parse(messageObject.stringData);
    const r = this.rtcInstanceList.find((r) => r.id === offerObject.from);
    if (r) {
      this.logListStore.pushWithCurrentTimeStamp(`The connection with ${offerObject.from} has already been established`);
      return;
    }
    const rtc = new RTC(this, offerObject.from);
    this.rtcInstanceList.push({ id: offerObject.from, rtc });
    const offerSdp: RTCSessionDescriptionInit = JSON.parse(offerObject.offer);
    const answerSdp: RTCSessionDescriptionInit = await rtc.createAnswer(offerSdp);
    const answerObject: string = new StringDataObject(this.localId, offerObject.from, JSON.stringify(answerSdp)).toString();
    const reply: string = new MessageObject('Answer', answerObject).toString();
    this.sendMessage(reply);
    this.logListStore.pushWithCurrentTimeStamp('Answer sent');
  }
  private async handleMessageAnswer(messageObject: MessageObject) {
    const answerObject: StringDataObjectInterface = JSON.parse(messageObject.stringData);
    const answerSdp = JSON.parse(answerObject.offer);
    const r = this.rtcInstanceList.find((r) => r.id === answerObject.from);
    if (!r) {
      const errorMessage = 'The corresponding RTC instance to the ID was not found';
      this.logListStore.pushWithCurrentTimeStamp(errorMessage);
      throw new Error(errorMessage);
    }
    await r.rtc.handleAnswer(answerSdp);
    this.logListStore.pushWithCurrentTimeStamp(`P2P connection with peer ID: ${answerObject.from} established`);
  }
  private handleMessageIceCandidate(messageObject: MessageObject) {
    const stringData: StringDataObject = JSON.parse(messageObject.stringData);
    const rtcAndId = this.rtcInstanceList.find((r) => r.id === stringData.from);
    if (!rtcAndId) {
      this.logListStore.pushWithCurrentTimeStamp('Corresponding RTC instance to the remote peer was not found');
      return;
    }
    rtcAndId.rtc.addIceCandidate(JSON.parse(stringData.offer));
    this.logListStore.pushWithCurrentTimeStamp('New ICE candidate added');
  }
}
