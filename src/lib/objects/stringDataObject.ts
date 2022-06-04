import type { StringDataObjectInterface } from '../types';

export default class StringDataObject implements StringDataObjectInterface {
  public from: string;
  public to: string;
  public offer: string;
  /**
   * Constructing an offerObject
   * @param from Local peer ID
   * @param to Remote peer ID
   * @param offer SDP or other stringified data
   */
  constructor(from: string, to: string, offer: string) {
    this.from = from;
    this.to = to;
    this.offer = offer;
  }
  /**
   * Stringify this messageObject
   * @returns Stringified messageObject
   */
  public toString(): string {
    const stringified = JSON.stringify(this);
    return stringified;
  }
}
