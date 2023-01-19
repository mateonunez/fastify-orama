'use strict'

const t = require('tap')
const test = t.test
const Fastify = require('fastify')
const fastifyLyra = require('..')

test('Should exists correctly FastifyLyra plugin', async ({ plan, ok }) => {
  plan(1)
  const fastify = Fastify()

  await fastify.register(fastifyLyra, {
    schema: {
      quote: 'string',
      author: 'string'
    }
  })

  ok(fastify.lyra)
})

test('Should insert and retrieve data using Lyra', async ({ plan, same }) => {
  plan(2)
  const fastify = Fastify()

  await fastify.register(fastifyLyra, {
    schema: {
      quote: 'string',
      author: 'string'
    }
  })

  await fastify.lyra.insert({
    quote: 'Hi there! This is fastify-lyra plugin.',
    author: 'Mateo Nunez'
  })

  const search = await fastify.lyra.search({
    term: 'fastify-lyra'
  })

  same(search.hits[0].document.quote, 'Hi there! This is fastify-lyra plugin.')
  same(search.hits[0].document.author, 'Mateo Nunez')
  fastify.close()
})

test('Should throw an error when the schema is not declared', async ({ same, teardown }) => {
  teardown(() => {
    fastify.close()
  })

  const fastify = Fastify()

  try {
    await fastify.register(fastifyLyra)
  } catch (error) {
    same(error.message, 'You must provide a schema to create a new database')
  }
})

test('Should throw when trying to register multiple instances without giving a name', async ({ same, teardown }) => {
  teardown(() => {
    fastify.close()
  })

  const fastify = Fastify()

  try {
    await fastify.register(fastifyLyra, {
      schema: {
        quote: 'string',
        author: 'string'
      }
    })
  
    await fastify.register(fastifyLyra, {
      schema: {
        anotherColumn: 'string',
        antoherHere: 'string'
      }
    })
  } catch (error) {
    same(error.message, 'fastify-lyra is already registered')
  }
})
