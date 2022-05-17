import { logStore, idStore, LogListStore, peersStore } from './store';
import type { messageObject } from './types';

export class WS {
  private ws: WebSocket;
  private isOpen = false;
  private logListStore: LogListStore;
  constructor() {
    this.logListStore = new LogListStore(logStore);
    console.log(this);
    try {
      this.ws = new WebSocket('ws://localhost:8080/ws');
      this.logListStore.pushWithCurrentTimeStamp('Connected to the signaling server');
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
  private handleMessage(e: MessageEvent): void {
    const messageObject: messageObject = JSON.parse(e.data);
    switch (messageObject.dataType) {
    case 'LocalId':
      idStore.set(messageObject.stringData);
      break;
    case 'Peers':
      // eslint-disable-next-line no-case-declarations
      const peers = messageObject.listData.split(',').map((peerId) => ({
        id: peerId,
        icon: '😀'
      }));
      peersStore.set(peers);
      break;
    }
    this.logListStore.push({
      log: messageObject.log,
      timeStamp: messageObject.timeStamp
    });
  }
}
