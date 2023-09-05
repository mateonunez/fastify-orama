import fp from 'fastify-plugin'
import * as Orama from '@orama/orama'

import PersistenceInMemory from './lib/persistence/in-memory.js'
import PersistenceInFile from './lib/persistence/in-file.js'

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

  fastify.decorate('orama', oramaApi)
}

export default fp(fastifyOrama, {
  fastify: '4.x',
  name: 'fastify-orama'
})

export {
  fastifyOrama,
  PersistenceInMemory,
  PersistenceInFile,
  oramaInternals
}
