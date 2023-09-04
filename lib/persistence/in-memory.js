import { restore, persist } from '@orama/plugin-data-persistence'

class PersistenceInMemory {
  constructor (options) {
    this.jsonIndex = options?.jsonIndex
  }

  /* async */ restore () {
    if (!this.jsonIndex) {
      return null
    }

    return restore('json', this.jsonIndex)
  }

  /* async */ persist (db) {
    return persist(db, 'json')
  }
}

export default PersistenceInMemory
