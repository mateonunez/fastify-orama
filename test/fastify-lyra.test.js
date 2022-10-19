'use strict'

const t = require('tap')
const test = t.test
const Fastify = require('fastify')
const fastifyLyra = require('..')

test('Should exists correctly FastifyLyra plugin', t => {
  t.plan(1)
  const fastify = Fastify()

  fastify.register(fastifyLyra, {
    schema: {
      quote: 'string',
      author: 'string'
    }
  })

  fastify.ready(() => {
    t.ok(fastify.lyra)
    fastify.close()
  })
})

test('Should insert and retrieve data using Lyra', async t => {
  t.plan(2)
  const fastify = Fastify()

  await fastify.register(fastifyLyra, {
    schema: {
      quote: 'string',
      author: 'string'
    }
  })

  fastify.lyra.insert({
    quote: 'Hi there! This is fastify-lyra plugin.',
    author: 'Mateo Nunez'
  })

  const search = fastify.lyra.search({
    term: 'fastify-lyra'
  })

  t.equal(search.hits[0].quote, 'Hi there! This is fastify-lyra plugin.')
  t.equal(search.hits[0].author, 'Mateo Nunez')
  fastify.close()
})

test('Should throw an error when the schema is not declared', t => {
  t.plan(1)
  const fastify = Fastify()

  fastify.register(fastifyLyra)

  fastify.ready(errors => {
    t.equal(
      errors.message,
      'You must provide a schema to create a new database'
    )
    fastify.close()
  })
})

test('Should throw when trying to register multiple instances without giving a name', t => {
  t.plan(1)
  const fastify = Fastify()

  fastify.register(fastifyLyra, {
    schema: {
      quote: 'string',
      author: 'string'
    }
  })

  fastify.register(fastifyLyra, {
    schema: {
      anotherColumn: 'string',
      antoherHere: 'string'
    }
  })

  fastify.ready(errors => {
    t.equal(errors.message, 'fastify-lyra is already registered')
    fastify.close()
  })
})
