import fp from 'fastify-plugin'
import { create, insert, search } from '@orama/orama'
import path from 'path'
import { existsSync } from 'fs'
import { restoreFromFile, persistToFile } from '@orama/plugin-data-persistence/server'

async function FastifyOrama (fastify, options) {
  const {
    schema,
    defaultLanguage = 'english',
    stemming = true,
    persistence = false
  } = options

  if (fastify.orama) {
    throw new Error('fastify-orama is already registered')
  }

  let db
  let dbName
  let dbFormat

  if (persistence) {
    dbName = options.persistency?.name || './orama.json'
    dbFormat = options.persistency?.format || 'json'
    const databaseExists = existsSync(path.resolve(dbName))

    if (!databaseExists) {
      throw new Error(`The database file ${dbName} does not exist`)
    }

    db = await restoreFromFile(dbFormat, `./${dbName}`)
  } else {
    if (!schema) {
      throw new Error('You must provide a schema to create a new database')
    }

    db = await create({
      schema,
      defaultLanguage,
      stemming
    })
  }

  fastify.decorate('orama', {
    insert: (...args) => insert(db, ...args),
    search: (...args) => search(db, ...args),
    save: () => persistToFile(db, dbFormat, dbName)
  })
}

export default fp(FastifyOrama, {
  fastify: '4.x',
  name: '@fastify/orama'
})
