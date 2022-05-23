import type { fileMetaData, fileObjectInterface, fragment } from './types';

export class fileObject implements fileObjectInterface {
  public meta: fileMetaData;
  public data: ArrayBuffer;
  public isFragmented: boolean;
  public fragment?: fragment;
}
