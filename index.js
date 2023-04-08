'use strict'

const fp = require('fastify-plugin')
const { create, insert, search } = require('@orama/orama')
const path = require('path')
const { existsSync } = require('fs')
const { restoreFromFile, persistToFile } = require('@orama/plugin-data-persistence')

async function FastifyOrama (fastify, options, next) {
  const { schema, defaultLanguage = 'english', stemming = true, persistence = false } = options

  if (fastify.orama) {
    return next(new Error('fastify-orama is already registered'))
  }

  let db
  let dbName
  let dbFormat

  if (persistence) {
    dbName = options.persistency?.name || './orama.json'
    dbFormat = options.persistency?.format || 'json'
    const datbaseExists = existsSync(path.resolve(dbName))

    if (!datbaseExists) {
      return next(new Error(`The database file ${dbName} does not exist`))
    }

    db = await restoreFromFile(dbFormat, `./${dbName}`)
  } else {
    if (!schema) return next(new Error('You must provide a schema to create a new database'))

    db = await create({
      schema,
      defaultLanguage,
      stemming
    })
  }

  await fastify.decorate('orama', {
    insert: (...args) => insert(db, ...args),
    search: (...args) => search(db, ...args),
    save: () => persistToFile(db, dbFormat, dbName)
  })

  next()
}

module.exports = fp(FastifyOrama, {
  fastify: '4.x',
  name: '@fastify/orama'
})
