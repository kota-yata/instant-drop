// import type { dataType, MessageObjectInterface } from '../types';
import { type MessageObject, DataType, type StringDataObject } from '$lib/proto/ws';

export default class MyMessageObject implements MessageObject {
  public dataType: DataType;
  public stringDataObject?: StringDataObject;
  public listData?: string[];
  public stringData?: string;
  public log = '';
  public timeStamp = '';
  constructor(dataType: DataType, data: StringDataObject | string | string[], log?: string, timeStamp?: string) {
    this.dataType = dataType;
    if (dataType === DataType.Peers) {
      this.listData = data as string[];
    } else if (dataType === DataType.Answer || dataType === DataType.Offer) {
      this.stringDataObject = data as StringDataObject;
    } else {
      this.stringData = data as string;
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
