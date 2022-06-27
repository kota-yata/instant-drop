import Base64 from '$lib/base64';
import { sha256 } from '$lib/sha256';
import { LogListStore, logStore } from '$lib/store';
import type { FragmentSet, WaitingObjectInterface } from '$lib/types';
import type { FileObject } from './fileObject';

export class WaitingObject implements WaitingObjectInterface {
  private arrayBufferWaiting: ArrayBuffer[];
  private fragments: {
    [id: string]: FragmentSet
  }
  private logStore: LogListStore;
  constructor() {
    this.fragments = {};
    this.logStore = new LogListStore(logStore);
  }
  /**
   * Adds the fileObject to fragments, scanning arrayBufferWaiting to find corresponding fragments.
   * @param fileObject fileObject to be added
   * @returns if all the fragments of the dataID has been received
   */
  public addFileObject(fileObject: FileObject): boolean {
    const fragments: ArrayBuffer[] = new Array(fileObject.hashDigests.length).fill(null);
    // Check if there is any corresponding fragment in arrayBufferWaiting
    this.arrayBufferWaiting.map((ab: ArrayBuffer) => {
      const base64 = Base64.encode(ab);
      const digest = sha256(base64);
      const index = fileObject.hashDigests.indexOf(digest);
      if (index !== -1) {
        fragments[index] = ab;
      }
    });
    const isCompleted = fragments.find(null) !== undefined;
    this.fragments[fileObject.dataId] = { fileObject, fragments };
    return isCompleted;
  }
  /**
   * Convert array buffer into blob. Joins all the fragments of the ID if needed
   * @param dataId dataId to reconstruct
   */
  public toFile(dataId: string): File {
    const targetArray: FragmentSet[] = this.fragments[dataId];
    const fileName: string = targetArray[0].fileObject.name;
    const dataType: string = targetArray[0].fileObject.type;
    const arrayBuffers: ArrayBuffer[] = targetArray.length === 1 ? [targetArray[0].arrayBuffer] : targetArray.map((fragmentSet: FragmentSet) => fragmentSet.arrayBuffer);
    const merged: File = new File(arrayBuffers, fileName, { type: dataType });
    delete this.fragments[dataId];
    return merged;
  }
}
