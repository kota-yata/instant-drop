import type { dataType, MessageObjectInterface } from './types';

export default class MessageObject implements MessageObjectInterface {
  public dataType: dataType;
  public stringData?: string;
  public listData?: string; // comma as a deliminator
  public log = '';
  public timeStamp = '';
  constructor(dataType: dataType, data: string, log?: string, timeStamp?: string) {
    this.dataType = dataType;
    if (dataType === 'Peers') {
      this.listData = data;
    } else {
      this.stringData = data;
    }
    if (this.log && this.timeStamp) {
      this.log = log;
      this.timeStamp = timeStamp;
    }
  }
  /**
   * Stringify this messageObject
   * @returns Stringified messageObject
   */
  public toString(): string {
    const stringified = JSON.stringify(this);
    return stringified;
  }
};
