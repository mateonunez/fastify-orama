'use strict'

const whyIsNodeRunning = require('why-is-node-running')
const t = require('tap')
const test = t.test
const Fastify = require('fastify')
const fastifyLyra = require('..')

t.beforeEach(async () => {
  const fastify = Fastify()

  fastify.register(fastifyLyra, {
    schema: {
      quote: 'string',
      author: 'string'
    },
    defaultLanguage: 'english'
  })

  await fastify.ready()
  await fastify.close()
})

test('Should exists correctly FastifyLyra plugin', (t) => {
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

test('Should insert and retrieve data using Lyra', async (t) => {
  t.plan(3)

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

  // console.log(search.hits[0].author === 'Mateo Nunez')
  t.ok(search.hits.length)
  t.equal(search.hits[0].quote, 'Hi there! This is fastify-lyra plugin.')
  t.equal(search.hits[0].author, 'Mateo Nunez')

  fastify.close()
})

test('Should throw when trying to register multiple instances without giving a name', (t) => {
  t.plan(2)

  const fastify = Fastify()

  t.teardown(() => fastify.close())

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

  fastify.ready((errors) => {
    t.ok(errors)
    t.equal(errors.message, 'fastify-lyra is already registered')
  })
})

setInterval(() => {
  whyIsNodeRunning()
}, 5000).unref()
