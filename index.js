import fp from 'fastify-plugin'
import { create, insert, search } from '@orama/orama' // todo we are limiting the api to the server side

import PersistenceInMemory from './lib/persistence/in-memory.js'
import PersistenceInFile from './lib/persistence/in-file.js'

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
    insert: (...args) => insert(db, ...args),
    search: (...args) => search(db, ...args),
    save: undefined
  }

  if (persistence) {
    db = await persistence.restore()

    oramaApi.save = /* async */ function save () {
      return persistence.persist(db)
    }
  }

  if (!db) {
    if (!oramaOptions.schema) {
      throw new Error('You must provide a schema to create a new database')
    }

    db = await create(oramaOptions)
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
  PersistenceInFile
}
