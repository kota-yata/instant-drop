import { Writable, writable } from 'svelte/store';
import type { FileObject } from './objects/fileObject';
import type { log, peer } from './types.d';
import { getTimestamp } from './utils/timestamp';

export const idStore: Writable<string> = writable('No ID');
export const peersStore: Writable<peer[]> = writable([]);
export const filesStore: Writable<FileObject[]> = writable([]);
export const logStore: Writable<log[]> = writable([]);

/**
 * Make a prototype for a given store
 */
export class ObjectListStore<StoreType> {
  public store: Writable<StoreType[]>;
  constructor(storeType: Writable<StoreType[]>) {
    this.store = storeType;
  }
  public push(data: StoreType): void {
    this.store.update((value) => {
      value.push(data);
      return value;
    });
  }
};

export class LogListStore extends ObjectListStore<log> {
  public pushWithCurrentTimeStamp(log: string): void {
    const logObject: log = {
      log,
      timeStamp: getTimestamp()
    };
    this.store.update((value) => {
      value.push(logObject);
      return value;
    });
  }
}
