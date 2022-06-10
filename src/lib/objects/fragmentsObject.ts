import { LogListStore, logStore } from '$lib/store';
import type { FragmentSet, FragmentsObjectInterface } from '$lib/types';
import type { FileObject } from './fileObject';

export class FragmentsObject implements FragmentsObjectInterface {
  private fragments: { [id: string]: FragmentSet[]; };
  private logStore: LogListStore;
  constructor() {
    this.fragments = {};
    this.logStore = new LogListStore(logStore);
  }
  /**
   * Adds the fragmentSet in the second argument to the corresponding array. Also checks if the array is filled
   * @param to dataID
   * @param data received fragmentSet (fileObject and the actual data in an array buffer)
   * @returns if all the fragments of the dataID has been received
   */
  public add(to: string, data: FragmentSet): boolean {
    const fileObject: FileObject = data.fileObject;
    // If the data is not fragmented proceed to reconstruction
    if (!data.fileObject.isFragmented) {
      this.fragments[to] = [data];
      this.logStore.pushWithCurrentTimeStamp(`DataID: ${to} received`);
      return true;
    }
    const length = fileObject.fragment.total;
    // If none of the fragments has been received make the new array with the total length
    if (!this.fragments[to]) {
      this.fragments[to] = new Array(length).fill(null);
      this.logStore.pushWithCurrentTimeStamp(`Receiving dataID: ${to}...`);
    }
    this.fragments[to][fileObject.fragment.index - 1] = data;
    // If every element in the array is filled that means all the fragments has been received
    const incomplete: number = this.fragments[to].findIndex((el) => el === null);
    if (incomplete === -1) {
      this.logStore.pushWithCurrentTimeStamp(`All the fragments of dataID: ${to} received`);
      return true;
    }
    return false;
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
