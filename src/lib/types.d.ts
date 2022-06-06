/*
 * Can be made globally available by placing this
 * inside `global.d.ts` and removing `export` keyword
 */
export interface log {
  log: string,
  timeStamp: string
}

export type dataType = 'LocalId' | 'Peers' | 'Offer' | 'Answer' | 'IceCandidate' | 'Error';

export interface ObjectInterface {
  public toString(): string;
}

export interface MessageObjectInterface extends ObjectInterface {
  public dataType: dataType,
  public stringData?: string,
  public listData?: string, // comma as a deliminator
  public log: string,
  public timeStamp: string,
}

export interface StringDataObjectInterface extends ObjectInterface {
  public from: string,
  public to: string,
  public offer: string
}

export interface peer {
  id: string,
  icon: string
}

export interface individualRTC {
  id: string,
  rtc: RTC
}

export interface fragment {
  total: number,
  index: number
}

export interface fileObjectInterface {
  public dataId: string;
  public type: string
  public dataHash: string
  public isFragmented: boolean,
  public fragment?: fragment
}
