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
    this.arrayBufferWaiting = [];
    this.fragments = {};
    this.logStore = new LogListStore(logStore);
  }
  /**
   * Adds fileObject to the fragment list, scanning arrayBufferWaiting to find corresponding fragments.
   * @param fileObject fileObject to be added
   * @returns File if all the fragments have been received, null otherwise
   */
  public addFileObject(fileObject: FileObject): File {
    this.logStore.pushWithCurrentTimeStamp(`Receiving: ${fileObject.name}...`);
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
    this.fragments[fileObject.dataId] = { fileObject, fragments };
    const isCompleted = fragments.indexOf(null) === -1;
    if (!isCompleted) return null;
    return this.toFile(fileObject.dataId);
  }
  /**
   * Adds fragment to the fragment list
   * @param fragment fragment to be added
   * @returns File if all the fragments have been received, null otherwise
   */
  public addFragment(fragment: ArrayBuffer): File {
    const base64 = Base64.encode(fragment);
    const digest = sha256(base64);
    let isFound = false;
    let dataIdCompleted = '';
    for (const dataId in this.fragments) {
      const index = this.fragments[dataId].fileObject.hashDigests.indexOf(digest);
      if (index !== -1) {
        this.fragments[dataId].fragments[index] = fragment; // if found add the ab to fragments list
        isFound = true;
        dataIdCompleted = this.fragments[dataId].fragments.indexOf(null) === -1 ? dataId : '';
        break;
      }
    }
    if (!isFound) this.arrayBufferWaiting.push(fragment);
    if (!dataIdCompleted) return null;
    return this.toFile(dataIdCompleted);
  }
  /**
   * Convert array buffer into blob. Joins all the fragments of the ID if needed
   * @param dataId dataId to reconstruct
   */
  public toFile(dataId: string): File {
    const target: FragmentSet = this.fragments[dataId];
    const fileName: string = target.fileObject.name;
    const dataType: string = target.fileObject.type;
    const merged: File = new File(target.fragments, fileName, { type: dataType });
    delete this.fragments[dataId];
    this.logStore.pushWithCurrentTimeStamp(`Received segments of ${target.fileObject.name} are successfully merged`);
    return merged;
  }
}
