import { logContainerStore } from './store';
import type { messageObject } from './types';

export class WS {
  private ws: WebSocket;
  private isOpen = false;
  constructor() {
    try {
      this.ws = new WebSocket('ws://localhost:80/ws');
      this.ws.onopen = () => {
        this.isOpen = true;
      };
      this.ws.onmessage = this.handleMessage;
    } catch (err) {
      throw Error(err);
    }
  }
  public sendMessage(txt: string): void {
    try {
      if (this.isOpen) {
        this.ws.send(txt);
        return;
      };
      setTimeout(() => {
        this.sendMessage(txt);
      }, 5000);
    } catch (err) {
      throw Error(err);
    }
  }
  public handleMessage(e: MessageEvent): void {
    const messageObject: messageObject = JSON.parse(e.data);
    console.log(messageObject);
    logContainerStore.update((value) => {
      value.push(messageObject.log);
      return value;
    });
  }
}
