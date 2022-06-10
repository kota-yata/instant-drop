import { FileObject } from '$lib/objects/fileObject';

export const fragment = async (file: File, dataId: string): Promise<[FileObject, ArrayBuffer][]> => {
  const THRESHOLD = 16000;
  if (file.size <= THRESHOLD) {
    const arrayBuffer: ArrayBuffer = await file.arrayBuffer();
    const fileObject: FileObject = new FileObject(file.name, dataId, file.type, arrayBuffer, false);
    return [[fileObject, arrayBuffer]];
  }
  // Fragment process
  const resultArray: [FileObject, ArrayBuffer][] = [];
  const total = Math.ceil(file.size / THRESHOLD);
  for (let i = 1; i <= total; i++) {
    const start = THRESHOLD * (i - 1);
    const end = THRESHOLD * i;
    const fragmentBlob = file.slice(start, end, file.type);
    const arrayBuffer: ArrayBuffer = await fragmentBlob.arrayBuffer();
    const fileObject: FileObject = new FileObject(file.name, dataId, file.type, arrayBuffer, true, { total, index: i });
    resultArray.push([fileObject, arrayBuffer]);
  }
  return resultArray;
};
