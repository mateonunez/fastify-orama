import path from 'node:path'
import { existsSync } from 'node:fs'
import { restoreFromFile, persistToFile } from '@orama/plugin-data-persistence/server'

class PersistenceInFile {
  constructor (options = {}) {
    this.filePath = options.filePath || path.join(process.cwd(), './orama.msp')
    this.format = options.format || 'binary'

    this.mustExistOnStart = options.mustExistOnStart === true || false
  }

  async restore () {
    const databaseExists = existsSync(path.resolve(this.filePath))

    if (!databaseExists) {
      if (this.mustExistOnStart) {
        throw new Error(`The database file ${this.filePath} does not exist`)
      }

      return null
    }

    const db = await restoreFromFile(this.format, this.filePath)
    return db
  }

  /* async */ persist (db) {
    return persistToFile(db, this.format, this.filePath)
  }
}

export default PersistenceInFile
