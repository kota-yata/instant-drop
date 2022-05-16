/*
 * Can be made globally available by placing this
 * inside `global.d.ts` and removing `export` keyword
 */
export interface log {
  log: string,
  timeStamp: string
}

export interface messageObject {
  dataType: 'LocalId' | 'Peers' | 'Offer' | 'Answer' | 'Error',
  stringData?: string,
  listData?: string, // comma as a deliminator
  log: string,
  timeStamp: string
}

export interface offerObject {
  from: string,
  to: string,
  offer: string,
}

export interface peer {
  id: string,
  icon: string
}
