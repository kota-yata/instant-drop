import { FileObject } from '$lib/objects/fileObject';

export const fragment = async (blob: Blob): Promise<FileObject> => {
  const THRESHOLD = 16000;
  if (blob.size <= THRESHOLD) {
    const arrayBuffer: ArrayBuffer = await blob.arrayBuffer();
    const fileObject = new FileObject(blob.type, arrayBuffer, false);
    return fileObject;
  }
  // Fragment process
};
