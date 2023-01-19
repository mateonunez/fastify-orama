'use strict'

const t = require('tap')
const { test } = t
const Fastify = require('fastify')
const fastifyLyra = require('..')
const { create, insert, search } = require('@lyrasearch/lyra')
const { persistToFile, restoreFromFile } = require('@lyrasearch/plugin-data-persistence')

const dbName = './lyra.json'
const dbFormat = 'json'

t.beforeEach(async () => {
  const db = await create({
    schema: {
      author: 'string',
      quote: 'string'
    }
  })

  await insert(db, {
    author: 'Mateo Nunez',
    quote: 'Hi there! This is fastify-lyra plugin.'
  })

  await persistToFile(db, dbFormat, dbName)
})

test('Should load Lyra database from file', async ({ plan, ok, teardown }) => {
  plan(1)

  teardown(() => {
    fastify.close()
  })

  const fastify = Fastify()
  await fastify.register(fastifyLyra, {
    persistence: true
  })

  ok(fastify.lyra)
})

test('Should retrieve search results loading Lyra database from file', async ({ plan, same, teardown }) => {
  plan(2)

  teardown(() => {
    fastify.close()
  })

  const fastify = Fastify()
  await fastify.register(fastifyLyra, {
    persistence: true
  })
  const results = await fastify.lyra.search({
    term: 'fastify-lyra'
  })

  same(results.count, 1)

  const { document } = results.hits[Object.keys(results.hits)[0]]
  same(document.author, 'Mateo Nunez')
})

test('Should save correctly the new database on filesystem', async ({ plan, same, teardown }) => {
  plan(1)

  teardown(() => {
    fastify.close()
  })

  const fastify = Fastify()
  await fastify.register(fastifyLyra, {
    persistence: true
  })

  await fastify.lyra.insert({
    quote: 'Lyra and Fastify are awesome together.',
    author: 'Mateo Nunez'
  })

  await fastify.lyra.save()
  const db2 = await restoreFromFile(dbFormat, dbName)
  const results = await search(db2, {
    term: 'Mateo Nunez'
  })
  same(results.count, 2)
})

test("Should thrown an error when database persitent doesn't exists", async ({ plan, same, teardown }) => {
  plan(1)

  teardown(() => {
    fastify.close()
  })

  const fastify = Fastify()
  const databaseName = './nope.json'

  try {
    await fastify.register(fastifyLyra, {
      persistence: true,
      persistency: {
        name: databaseName
      }
    })
  } catch (error) {
    same(error.message, `The database file ${databaseName} does not exist`)
  }
})
