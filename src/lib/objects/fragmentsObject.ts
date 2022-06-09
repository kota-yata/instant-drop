import type { fragmentSet, FragmentsObjectInterface } from '$lib/types';
import type { FileObject } from './fileObject';

export class FragmentsObject implements FragmentsObjectInterface {
  private fragments: { [id: string]: fragmentSet[]; };
  constructor() {
    this.fragments = {};
  }
  public add(to: string, data: fragmentSet): boolean {
    const fileObject: FileObject = data[0];
    const length = fileObject.fragment.total;
    if (!this.fragments[to]) this.fragments[to] = new Array(length).fill(null);
    this.fragments[to][fileObject.fragment.index - 1] = data;
    const incomplete: number = this.fragments[to].findIndex((el) => el === null);
    if (incomplete === -1) {
      console.log(this.fragments);
      return true;
    }
    return false;
  }
  public reconstruct(id: string): void {
    console.log('id: ', id);
  }
}
