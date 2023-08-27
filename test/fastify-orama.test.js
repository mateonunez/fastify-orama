'use strict'

import { it, after } from 'node:test'
import { ok, strictEqual } from 'node:assert'
import Fastify from 'fastify'
import FastifyOrama from '../index.js'

it('Should exists correctly FastifyOrama plugin', async () => {
  after(() => {
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

it('Should insert and retrieve data using Orama', async () => {
  after(() => {
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

  strictEqual(search.hits[0].document.quote, 'Hi there! This is fastify-orama plugin.')
  strictEqual(search.hits[0].document.author, 'Mateo Nunez')
})

it('Should throw an error when the schema is not declared', async () => {
  after(() => {
    fastify.close()
  })

  const fastify = Fastify()

  try {
    await fastify.register(FastifyOrama)
  } catch (error) {
    strictEqual(error.message, 'You must provide a schema to create a new database')
  }
})

it('Should throw when trying to register multiple instances without giving a name', async () => {
  after(() => {
    fastify.close()
  })

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
    strictEqual(error.message, 'fastify-orama is already registered')
  }
})
