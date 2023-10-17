'use strict'

const path = require('node:path')
const { existsSync } = require('node:fs')
const { restoreFromFile, persistToFile } = require('@orama/plugin-data-persistence/server')

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

module.exports = PersistenceInFile
