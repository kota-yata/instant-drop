import { Writable, writable } from 'svelte/store';
import type { log } from './types.d';

export const id: Writable<string> = writable('No ID');

export class logContainer {
  public static store: Writable<log[]> = writable([]);
  public static push(data: log): void {
    logContainer.store.update((value) => {
      value.push(data);
      return value;
    });
  }
};
