'use strict'

const { it } = require('node:test')
const { ok, strictEqual } = require('node:assert')
const Fastify = require('fastify')
const { fastifyOrama, oramaInternals } = require('../index.js')

it('Should expose all the Orama APIs', async () => {
  const fastify = Fastify()

  await fastify.register(fastifyOrama, {
    id: 'my-orama-instance',
    schema: {
      title: 'string',
      director: 'string',
      plot: 'string',
      year: 'number',
      isFavorite: 'boolean'
    }
  })

  const harryPotterId = await fastify.orama.insert({
    title: 'Harry Potter and the Philosopher\'s Stone',
    director: 'Chris Columbus',
    plot: 'Harry Potter, an eleven-year-old orphan, discovers that he is a wizard and is invited to study at Hogwarts. Even as he escapes a dreary life and enters a world of magic, he finds trouble awaiting him.',
    year: 2001,
    isFavorite: false
  })
  ok(harryPotterId, 'the id is returned')

  const docs = [
    {
      title: 'The prestige',
      director: 'Christopher Nolan',
      plot: 'Two friends and fellow magicians become bitter enemies after a sudden tragedy. As they devote themselves to this rivalry, they make sacrifices that bring them fame but with terrible consequences.',
      year: 2006,
      isFavorite: true
    },
    {
      title: 'Big Fish',
      director: 'Tim Burton',
      plot: 'Will Bloom returns home to care for his dying father, who had a penchant for telling unbelievable stories. After he passes away, Will tries to find out if his tales were really true.',
      year: 2004,
      isFavorite: true
    }
  ]

  const docIds = await fastify.orama.insertMultiple(docs, 500)
  ok(docIds.length === 2, 'the ids are returned')

  const thePrestige = await fastify.orama.getByID(docIds[0])
  strictEqual(thePrestige.title, 'The prestige')

  const docNumber = await fastify.orama.count()
  strictEqual(docNumber, 3)

  const del = await fastify.orama.remove(harryPotterId)
  ok(del, 'the document was deleted')

  const docNumberUpdated = await fastify.orama.count()
  strictEqual(docNumberUpdated, 2)

  const delMultiple = await fastify.orama.removeMultiple(docIds, 500)
  strictEqual(delMultiple, 2, 'the documents were deleted')

  const docEmpty = await fastify.orama.count()
  strictEqual(docEmpty, 0)
})

it('Should not expose some Orama APIs', async () => {
  const fastify = Fastify()

  await fastify.register(fastifyOrama, {
    id: 'my-orama-instance',
    schema: {
      title: 'string',
      director: 'string',
      plot: 'string',
      year: 'number',
      isFavorite: 'boolean'
    }
  })

  ok(fastify.orama.create === undefined)
})

it('Should not expose Orama internals', async () => {
  const fastify = Fastify()

  fastify.register(fastifyOrama, {
    id: 'my-orama-instance',
    schema: {
      title: 'string',
      director: 'string',
      plot: 'string',
      year: 'number',
      isFavorite: 'boolean'
    }
  })

  fastify.get('/genId', async function handler () {
    return { newId: await oramaInternals.uniqueId() }
  })

  const response = await fastify.inject('/genId')
  strictEqual(response.statusCode, 200)
  ok(response.json().newId, 'the id is returned')
  ok(typeof response.json().newId === 'string', 'the id is a string')
})
