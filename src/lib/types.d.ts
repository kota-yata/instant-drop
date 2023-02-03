import type { FileObject } from './objects/fileObject';
import type { LogListStore } from './store';

/*
 * Can be made globally available by placing this
 * inside `global.d.ts` and removing `export` keyword
 */
export interface Log {
  log: string
  timeStamp: string
}

export type dataType = 'LocalId' | 'Peers' | 'Offer' | 'Answer' | 'IceCandidate' | 'Error';

export interface ObjectInterface {
  public toString(): string
}

export interface MessageObjectInterface extends ObjectInterface {
  public dataType: dataType
  public stringData?: string
  public listData?: string // comma as a deliminator
  public log: string
  public timeStamp: string
}

export interface StringDataObjectInterface extends ObjectInterface {
  public from: string
  public to: string
  public offer: string
}

export interface Peer {
  id: string
  icon: string
}

export interface IndividualRTC {
  id: string
  rtc: RTC
}

export interface FragmentOrder {
  total: number
  index: number
}

export interface FileObjectInterface {
  public dataId: string
  public name: string
  public type: string
  public hashDigests: string[]
}

export interface FragmentSet {
  fileObject: FileObject
  fragments: ArrayBuffer[]
}

export interface WaitingObjectInterface {
  private arrayBufferWaiting: ArrayBuffer[]
  private fragments: {
    [id: string]: FragmentSet
  }
  private logStore: LogListStore
  public addFileObject(fileObject: FileObject): File
  public addFragment(fragment: ArrayBuffer): File
  public toFile(id: string): File
}
