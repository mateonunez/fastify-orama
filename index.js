'use strict'

const fp = require('fastify-plugin')
const Orama = require('@orama/orama')

const PersistenceInMemory = require('./lib/persistence/in-memory.js')
const PersistenceInFile = require('./lib/persistence/in-file.js')

const SKIP_METHODS = [
  'create'
]

const oramaInternals = Orama.internals

async function fastifyOrama (fastify, options) {
  if (fastify.orama) {
    throw new Error('fastify-orama is already registered')
  }

  const {
    persistence,
    ...oramaOptions
  } = options

  let db

  const oramaApi = {
    persist: undefined // custom
  }

  const oramaProxyKeys = Object.keys(Orama)
    .filter((key) => typeof Orama[key] === 'function' && !SKIP_METHODS.includes(key))

  for (const key of oramaProxyKeys) {
    oramaApi[key] = (...args) => Orama[key](db, ...args)
  }

  if (persistence) {
    db = await persistence.restore()

    oramaApi.persist = /* async */ function persist () {
      return persistence.persist(db)
    }
  }

  if (!db) {
    if (!oramaOptions.schema) {
      throw new Error('You must provide a schema to create a new database')
    }

    db = await Orama.create(oramaOptions)
  }

  function withOrama () {
    return this
  }

  fastify.decorate('orama', oramaApi)
  fastify.decorate('withOrama', withOrama)
}

module.exports = fp(fastifyOrama, {
  fastify: '5.x',
  name: 'fastify-orama'
})

module.exports.fastifyOrama = fastifyOrama
module.exports.PersistenceInMemory = PersistenceInMemory
module.exports.PersistenceInFile = PersistenceInFile
module.exports.oramaInternals = oramaInternals
