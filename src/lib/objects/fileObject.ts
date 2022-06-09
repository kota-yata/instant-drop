import type { FileObjectInterface, fragmentOrder } from '../types';
import { sha256 } from '$lib/sha256';
import Base64 from '$lib/base64';

export class FileObject implements FileObjectInterface {
  public dataId: string;
  public type: string;
  public dataHash: string;
  public isFragmented: boolean;
  public fragment?: fragmentOrder;
  constructor(dataId: string, type: string, data: ArrayBuffer, isFragmented: boolean, fragment?: fragmentOrder) {
    this.dataId = dataId;
    this.type = type;
    const base64 = Base64.encode(data);
    this.dataHash = sha256(base64);
    this.isFragmented = isFragmented;
    if (isFragmented) {
      this.fragment = fragment;
    }
  }
}
