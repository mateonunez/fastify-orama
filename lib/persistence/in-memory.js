import { restore, persist } from '@orama/plugin-data-persistence'

class PersistenceInMemory {
  constructor (options = {}) {
    this.jsonIndex = options.jsonIndex
  }

  async restore () {
    if (!this.jsonIndex) {
      return null
    }

    const db = await restore('json', this.jsonIndex)
    return db
  }

  async persist (db) {
    const index = await persist(db, 'json')
    return index
  }
}

export default PersistenceInMemory
