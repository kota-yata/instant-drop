import type { fileObjectInterface, fragment } from '../types';
import { sha256 } from 'js-sha256';

export class FileObject implements fileObjectInterface {
  public type: string;
  public dataHash: string;
  public isFragmented: boolean;
  public fragment?: fragment;
  constructor(type: string, data: ArrayBuffer, isFragmented: boolean, fragment?: fragment) {
    this.type = type;
    this.dataHash = sha256(data);
    this.isFragmented = isFragmented;
    if (isFragmented) {
      this.fragment = fragment;
    }
  }
}
