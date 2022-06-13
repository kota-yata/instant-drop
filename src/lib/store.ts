import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { Log, Peer } from './types.d';
import { getTimestamp } from './utils/timestamp';

export const idStore: Writable<string> = writable('No ID');
export const peersStore: Writable<Peer[]> = writable([]);
export const logStore: Writable<Log[]> = writable([]);
export const fileStore: Writable<File[]> = writable([]);

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

export class LogListStore extends ObjectListStore<Log> {
  public pushWithCurrentTimeStamp(log: string): void {
    const logObject: Log = {
      log,
      timeStamp: getTimestamp()
    };
    this.store.update((value) => {
      value.push(logObject);
      return value;
    });
  }
}
