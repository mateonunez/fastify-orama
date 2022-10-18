'use strict'

const fp = require('fastify-plugin')
const { create, insert, search } = require('@lyrasearch/lyra')
const path = require('path')
const fs = require('fs')
const { restoreFromFile, persistToFile } = require('@lyrasearch/plugin-data-persistence')

function FastifyLyra (fastify, options, next) {
  const { schema, defaultLanguage = 'english', stemming = true, persistence = false } = options

  if (fastify.lyra) {
    return next(new Error('fastify-lyra is already registered'))
  }

  let db
  let dbName
  let dbFormat

  if (persistence) {
    dbName = options.persistency?.name || './lyra.json'
    dbFormat = options.persistency?.format || 'json'
    const datbaseExists = fs.existsSync(path.resolve(dbName))

    if (!datbaseExists) {
      return next(new Error(`The database file ${dbName} does not exist`))
    }

    db = restoreFromFile(dbFormat, `./${dbName}`)
  } else {
    if (!schema) return next(new Error('You must provide a schema to create a new database'))

    db = create({
      schema,
      defaultLanguage,
      stemming
    })
  }

  fastify.decorate('lyra', {
    insert: (...args) => insert(db, ...args),
    search: (...args) => search(db, ...args),
    save: () => persistToFile(db, dbFormat, dbName)
  })

  next()
}

module.exports = fp(FastifyLyra, {
  fastify: '4.x',
  name: '@fastify/lyra'
})
