/*
 * Can be made globally available by placing this
 * inside `global.d.ts` and removing `export` keyword
 */
export interface log {
  log: string,
  timeStamp: string
}

export interface messageObject {
  dataType: 'String' | 'List',
  stringData?: string,
  listData?: string, // comma as a deliminator
  log: string,
  timeStamp: string
}
