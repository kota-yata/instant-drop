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
  public name: string
  public dataId: string
  public type: string
  public dataHash: string
  public isFragmented: boolean
  public fragment?: FragmentOrder
}

export interface FragmentSet {
  fileObject: FileObject
  arrayBuffer: ArrayBuffer
}

export interface FragmentsObjectInterface {
  private fragments: {
    [id: string]: FragmentSet[]
  }
  private logStore: LogListStore
  public add(to: string, data: FragmentSet): boolean
  public toFile(id: string): File
}
