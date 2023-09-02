import { describe, it } from 'node:test'
import { strictEqual, match } from 'node:assert'
import Fastify from 'fastify'
import { fastifyOrama, PersistenceInMemory, PersistenceInFile } from '../index.js'
import { create, insert } from '@orama/orama'
import { persistToFile } from '@orama/plugin-data-persistence/server'

async function buildFakeDb (filePath, format) {
  const db = await create({
    schema: {
      author: 'string',
      quote: 'string'
    }
  })

  await insert(db, {
    author: 'Mateo Nunez',
    quote: 'Hi there! This is fastify-orama plugin.'
  })

  await persistToFile(db, format, filePath)

  return {
    filePath,
    format
  }
}

describe('PersistenceInFile', () => {
  it('Should load Orama database from file (binary)', async () => {
    const opts = await buildFakeDb(`./orama_test_${Date.now()}.msp`, 'binary')

    const fastify = Fastify()
    await fastify.register(fastifyOrama, {
      persistence: new PersistenceInFile(opts)
    })

    await fastify.ready()

    const results = await fastify.orama.search({ term: 'fastify-orama' })
    strictEqual(results.count, 1)

    const { document } = results.hits[Object.keys(results.hits)[0]]
    strictEqual(document.author, 'Mateo Nunez')
  })

  it('Should load Orama database from file (json)', async () => {
    const opts = await buildFakeDb(`./orama_test_${Date.now()}.json`, 'json')

    const fastify = Fastify()
    await fastify.register(fastifyOrama, {
      persistence: new PersistenceInFile(opts)
    })

    await fastify.ready()

    const results = await fastify.orama.search({ term: 'fastify-orama' })
    strictEqual(results.count, 1)

    const { document } = results.hits[Object.keys(results.hits)[0]]
    strictEqual(document.author, 'Mateo Nunez')
  })

  it('Should save correctly the new database on filesystem when it is created for the first time', async () => {
    const opts = {
      filePath: 'orama_test_can-save.msp',
      format: 'binary'
    }

    const fastify = Fastify()
    await fastify.register(fastifyOrama, {
      schema: { author: 'string', quote: 'string' },
      persistence: new PersistenceInFile(opts)
    })

    await fastify.ready()

    {
      const results = await fastify.orama.search({ term: 'Mateo Nunez' })
      strictEqual(results.count, 0)
    }

    await fastify.orama.insert({
      quote: 'Orama and Fastify are awesome together.',
      author: 'Mateo Nunez'
    })

    const path = await fastify.orama.save()
    strictEqual(path, opts.filePath)

    {
      const results = await fastify.orama.search({ term: 'Mateo Nunez' })
      strictEqual(results.count, 1)
    }
  })

  it('Should reject when the database file is missing and there is no schema', async () => {
    try {
      const fastify = Fastify()
      await fastify.register(fastifyOrama, {
        persistence: new PersistenceInFile({ filePath: `orama_test_${Date.now()}.msp` })
      })
    } catch (error) {
      strictEqual(error.message, 'You must provide a schema to create a new database')
    }
  })

  it('Should reject when the database is missing and it is mandatory', async () => {
    try {
      const fastify = Fastify()
      await fastify.register(fastifyOrama, {
        schema: { author: 'string', quote: 'string' },
        persistence: new PersistenceInFile({
          filePath: `orama_test_${Date.now()}.msp`,
          mustExistOnStart: true
        })
      })
    } catch (error) {
      match(error.message, /^The database file .* does not exist$/)
    }
  })

  it('Should load the default db name', async () => {
    await buildFakeDb('./orama.msp', 'binary')
    const fastify = Fastify()
    await fastify.register(fastifyOrama, {
      persistence: new PersistenceInFile({
        mustExistOnStart: true
      })
    })

    await fastify.ready()

    const results = await fastify.orama.search({ term: 'fastify-orama' })
    strictEqual(results.count, 1)
  })
})

describe('PersistenceInMemory', () => {
  it('Should load Orama database from memory', async () => {
    const fastifyOne = Fastify()
    await fastifyOne.register(fastifyOrama, {
      schema: { author: 'string', quote: 'string' },
      persistence: new PersistenceInMemory()
    })

    await fastifyOne.ready()

    {
      const results = await fastifyOne.orama.search({ term: 'Mateo Nunez' })
      strictEqual(results.count, 0)
    }

    await fastifyOne.orama.insert({
      quote: 'Orama and Fastify are awesome together.',
      author: 'Mateo Nunez'
    })

    const inMemoryDb = await fastifyOne.orama.save()

    {
      const results = await fastifyOne.orama.search({ term: 'Mateo Nunez' })
      strictEqual(results.count, 1)
    }

    await fastifyOne.close()

    const fastifyTwo = Fastify()
    await fastifyTwo.register(fastifyOrama, {
      persistence: new PersistenceInMemory({
        jsonIndex: inMemoryDb
      })
    })

    await fastifyTwo.ready()

    {
      const results = await fastifyTwo.orama.search({ term: 'Mateo Nunez' })
      strictEqual(results.count, 1)
    }
  })
})
