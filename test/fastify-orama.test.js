'use strict'

const t = require('tap')
const test = t.test
const Fastify = require('fastify')
const FastifyOrama = require('..')

test('Should exists correctly FastifyOrama plugin', async ({ plan, ok, teardown }) => {
  plan(1)

  teardown(() => {
    fastify.close()
  })

  const fastify = Fastify()
  await fastify.register(FastifyOrama, {
    schema: {
      quote: 'string',
      author: 'string'
    }
  })

  ok(fastify.orama)
})

test('Should insert and retrieve data using Orama', async ({ plan, same, teardown }) => {
  plan(2)

  teardown(() => {
    fastify.close()
  })

  const fastify = Fastify()

  await fastify.register(FastifyOrama, {
    schema: {
      quote: 'string',
      author: 'string'
    }
  })

  await fastify.orama.insert({
    quote: 'Hi there! This is fastify-orama plugin.',
    author: 'Mateo Nunez'
  })

  const search = await fastify.orama.search({
    term: 'fastify-orama'
  })

  same(search.hits[0].document.quote, 'Hi there! This is fastify-orama plugin.')
  same(search.hits[0].document.author, 'Mateo Nunez')
})

test('Should throw an error when the schema is not declared', async ({ same, plan, teardown }) => {
  plan(1)

  teardown(() => {
    fastify.close()
  })

  const fastify = Fastify()

  try {
    await fastify.register(FastifyOrama)
  } catch (error) {
    same(error.message, 'You must provide a schema to create a new database')
  }
})

test('Should throw when trying to register multiple instances without giving a name', async ({ same, plan, teardown }) => {
  teardown(() => {
    fastify.close()
  })

  plan(1)

  const fastify = Fastify()

  try {
    await fastify.register(FastifyOrama, {
      schema: {
        quote: 'string',
        author: 'string'
      }
    })

    await fastify.register(FastifyOrama, {
      schema: {
        anotherColumn: 'string',
        antoherHere: 'string'
      }
    })
  } catch (error) {
    same(error.message, 'fastify-orama is already registered')
  }
})
