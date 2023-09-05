'use strict'

import { it } from 'node:test'
import { ok, strictEqual } from 'node:assert'
import Fastify from 'fastify'
import fastifyOrama from '../index.js'

it('Should register correctly fastifyOrama plugin', async () => {
  const fastify = Fastify()
  await fastify.register(fastifyOrama, {
    schema: {
      quote: 'string',
      author: 'string'
    }
  })

  ok(fastify.orama)
  ok(fastify.orama.persist === undefined)
})

it('Should insert and retrieve data using Orama', async () => {
  const fastify = Fastify()

  await fastify.register(fastifyOrama, {
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
  const fastify = Fastify()

  try {
    await fastify.register(fastifyOrama)
  } catch (error) {
    strictEqual(error.message, 'You must provide a schema to create a new database')
  }
})

it('Should throw when trying to register multiple instances without giving a name', async () => {
  const fastify = Fastify()

  try {
    await fastify.register(fastifyOrama, {
      schema: {
        quote: 'string',
        author: 'string'
      }
    })

    await fastify.register(fastifyOrama, {
      schema: {
        anotherColumn: 'string',
        antoherHere: 'string'
      }
    })
  } catch (error) {
    strictEqual(error.message, 'fastify-orama is already registered')
  }
})
