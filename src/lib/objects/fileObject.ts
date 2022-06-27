import type { FileObjectInterface, FragmentOrder } from '../types';
import { sha256 } from '$lib/sha256';
import Base64 from '$lib/base64';

export class FileObject implements FileObjectInterface {
  public dataId: string;
  public name: string;
  public type: string;
  public hashDigests: string[];
  constructor(dataId: string, name: string, type: string, data: ArrayBuffer[]) {
    this.dataId = dataId;
    this.name = name;
    this.type = type;
    // Compute a sha256 hash digest for each fragment of the data
    this.hashDigests = data.map((d: ArrayBuffer) => {
      const base64 = Base64.encode(d);
      return sha256(base64);
    });
  }
}
