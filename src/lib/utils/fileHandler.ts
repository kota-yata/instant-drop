import { FileObject } from '$lib/objects/fileObject';
import type { FragmentSet } from '$lib/types';

const MAX_PAYLOAD_SIZE = 16384;

export const fragment = async (file: File, dataId: string): Promise<FragmentSet> => {
  const fragments: ArrayBuffer[] = [];
  if (file.size <= MAX_PAYLOAD_SIZE) {
    const arrayBuffer: ArrayBuffer = await file.arrayBuffer();
    fragments.push(arrayBuffer);
    const fileObject: FileObject = new FileObject(dataId, file.name, file.type, fragments);
    return { fileObject, fragments };
  }
  // Fragment process
  const total = Math.ceil(file.size / MAX_PAYLOAD_SIZE);
  for (let i = 1; i <= total; i++) {
    const start = MAX_PAYLOAD_SIZE * (i - 1);
    const end = MAX_PAYLOAD_SIZE * i;
    const fragmentBlob = file.slice(start, end, file.type);
    const arrayBuffer: ArrayBuffer = await fragmentBlob.arrayBuffer();
    fragments.push(arrayBuffer);
  }
  const fileObject = new FileObject(dataId, file.name, file.type, fragments);
  return { fileObject, fragments };
};
