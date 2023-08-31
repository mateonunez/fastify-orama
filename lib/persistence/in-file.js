import path from 'node:path'
import { existsSync } from 'node:fs'
import { restoreFromFile, persistToFile } from '@orama/plugin-data-persistence/server'

class PersistenceInFile {
  constructor (options = {}) {
    this.filePath = options.filePath || path.join(process.cwd(), './orama.msp')
    this.format = options.format || 'binary'

    this.mustExistOnStart = options.mustExistOnStart || false
  }

  async restore () {
    const databaseExists = existsSync(path.resolve(this.filePath))

    if (this.mustExistOnStart && !databaseExists) {
      throw new Error(`The database file ${this.filePath} does not exist`)
    }

    const db = await restoreFromFile(this.format, this.filePath)
    return db
  }

  async persist (db) {
    const filePath = await persistToFile(db, this.format, this.filePath)
    return filePath
  }
}

export default PersistenceInFile
