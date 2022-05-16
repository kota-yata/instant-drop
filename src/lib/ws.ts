import { logStore, idStore, LogListStore, peersStore } from './store';
import type { messageObject } from './types';

export class WS {
  private ws: WebSocket;
  private isOpen = false;
  private logStore: LogListStore;
  constructor() {
    this.logStore = new LogListStore(logStore);
    try {
      this.ws = new WebSocket('ws://localhost:8080/ws');
    } catch (err) {
      this.logStore.pushWithCurrentTimeStamp('Failed to connect to the signaling server');
      throw Error(err);
    }
    this.ws.onerror = () => {
      this.logStore.pushWithCurrentTimeStamp('Something went wrong on WebSocket');
    };
    this.ws.onopen = () => {
      this.isOpen = true;
    };
    this.ws.onmessage = this.handleMessage;
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
  public handleMessage(e: MessageEvent): void {
    const messageObject: messageObject = JSON.parse(e.data);
    switch (messageObject.dataType) {
    case 'LocalId':
      idStore.set(messageObject.stringData);
      break;
    case 'Peers':
      // eslint-disable-next-line no-case-declarations
      const peers = messageObject.listData.split('').map((peerId) => ({
        id: peerId,
        icon: '😀'
      }));
      peersStore.set(peers);
      break;
    }
    this.logStore.push({
      log: messageObject.log,
      timeStamp: messageObject.timeStamp
    });
  }
}
