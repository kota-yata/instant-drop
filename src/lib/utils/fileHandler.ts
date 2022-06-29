import { FileObject } from '$lib/objects/fileObject';
import type { FragmentSet } from '$lib/types';

export const fragment = async (file: File, dataId: string): Promise<FragmentSet> => {
  const THRESHOLD = 16000;
  const fragments: ArrayBuffer[] = [];
  if (file.size <= THRESHOLD) {
    const arrayBuffer: ArrayBuffer = await file.arrayBuffer();
    fragments.push(arrayBuffer);
    const fileObject: FileObject = new FileObject(dataId, file.name, file.type, fragments);
    return { fileObject, fragments };
  }
  // Fragment process
  const total = Math.ceil(file.size / THRESHOLD);
  for (let i = 1; i <= total; i++) {
    const start = THRESHOLD * (i - 1);
    const end = THRESHOLD * i;
    const fragmentBlob = file.slice(start, end, file.type);
    const arrayBuffer: ArrayBuffer = await fragmentBlob.arrayBuffer();
    fragments.push(arrayBuffer);
  }
  const fileObject = new FileObject(dataId, file.name, file.type, fragments);
  return { fileObject, fragments };
};
