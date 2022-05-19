import type { RTC } from './rtc';
import { logStore, idStore, LogListStore, peersStore } from './store';
import type { messageObject } from './types';
import type { offerObject } from './types.d';

export class WS {
  private ws: WebSocket;
  private rtc: RTC;
  private isOpen = false;
  private logListStore: LogListStore;
  private myId = '';
  constructor(rtc: RTC) {
    this.rtc = rtc;
    this.logListStore = new LogListStore(logStore);
    idStore.subscribe((id) => {
      this.myId = id;
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
  public sendMessage(txt: string): void {
    if (this.isOpen) {
      this.ws.send(txt);
      return;
    };
    setTimeout(() => {
      this.sendMessage(txt);
    }, 5000);
  }
  private async handleMessage(e: MessageEvent): Promise<void> {
    const messageObject: messageObject = JSON.parse(e.data);
    this.logListStore.push({
      log: messageObject.log,
      timeStamp: messageObject.timeStamp
    });
    if (messageObject.dataType === 'LocalId') {
      idStore.set(messageObject.stringData);
    } else if (messageObject.dataType === 'Peers') {
      const peers = messageObject.listData.split(',').map((peerId) => ({
        id: peerId,
        icon: '😀'
      }));
      peersStore.set(peers);
    } else if (messageObject.dataType === 'Offer') {
      const offerObject: offerObject = JSON.parse(messageObject.stringData);
      const offerSdp: RTCSessionDescriptionInit = JSON.parse(offerObject.offer);
      const answerSdp: RTCSessionDescriptionInit = await this.rtc.createAnswer(offerSdp);
      const answerObject = {
        from: this.myId,
        to: offerObject.from,
        offer: JSON.stringify(answerSdp)
      };
      const reply: messageObject = {
        dataType: 'Answer',
        stringData: JSON.stringify(answerObject),
        log: '',
        timeStamp: ''
      };
      this.sendMessage(JSON.stringify(reply));
      this.logListStore.pushWithCurrentTimeStamp('Answer sent');
    }
  }
}
