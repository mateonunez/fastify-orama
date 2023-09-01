import { it } from 'node:test'
import { strictEqual } from 'node:assert'
import Fastify from 'fastify'
import { FastifyOrama, PersistenceInMemory, PersistenceInFile } from '../index.js'
import { create, insert, search } from '@orama/orama'
import { persistToFile, restoreFromFile } from '@orama/plugin-data-persistence/server'

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

it('Should load Orama database from file (binary)', async () => {
  const opts = await buildFakeDb('./orama.msp', 'binary')

  const fastify = Fastify()
  await fastify.register(FastifyOrama, {
    persistence: new PersistenceInFile(opts)
  })

  await fastify.ready()

  const results = await fastify.orama.search({ term: 'fastify-orama' })
  strictEqual(results.count, 1)

  const { document } = results.hits[Object.keys(results.hits)[0]]
  strictEqual(document.author, 'Mateo Nunez')
})

it('Should load Orama database from file (json)', async () => {
  const opts = await buildFakeDb('./orama.json', 'json')

  const fastify = Fastify()
  await fastify.register(FastifyOrama, {
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
    filePath: 'can-save.msp',
    format: 'binary'
  }

  const fastify = Fastify()
  await fastify.register(FastifyOrama, {
    schema: {
      author: 'string',
      quote: 'string'
    },
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

  await fastify.orama.save()

  {
    const results = await fastify.orama.search({ term: 'Mateo Nunez' })
    strictEqual(results.count, 1)
  }
})
