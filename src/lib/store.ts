import { Writable, writable } from 'svelte/store';

export const logContainerStore: Writable<string[]> = writable([]);
