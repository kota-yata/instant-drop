import { FileObject } from '$lib/objects/fileObject';

export const fragment = async (blob: Blob, dataId: string): Promise<[FileObject, ArrayBuffer][]> => {
  const THRESHOLD = 16000;
  if (blob.size <= THRESHOLD) {
    const arrayBuffer: ArrayBuffer = await blob.arrayBuffer();
    const fileObject: FileObject = new FileObject(dataId, blob.type, arrayBuffer, false);
    return [[fileObject, arrayBuffer]];
  }
  // Fragment process
  const resultArray: [FileObject, ArrayBuffer][] = [];
  const total = Math.ceil(blob.size / THRESHOLD);
  for (let i = 1; i <= total; i++) {
    const start = THRESHOLD * (i - 1);
    const end = THRESHOLD * i + 1;
    const fragmentBlob = blob.slice(start, end, blob.type);
    const arrayBuffer: ArrayBuffer = await fragmentBlob.arrayBuffer();
    const fileObject: FileObject = new FileObject(dataId, blob.type, arrayBuffer, true, { total, index: i });
    resultArray.push([fileObject, arrayBuffer]);
  }
  return resultArray;
};
