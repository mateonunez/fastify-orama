'use strict'

const t = require('tap')
const { test } = t
const Fastify = require('fastify')
const fastifyLyra = require('..')
const { create, insert, search } = require('@lyrasearch/lyra')
const { persistToFile, restoreFromFile } = require('@lyrasearch/plugin-data-persistence')

const dbName = './lyra.json'
const dbFormat = 'json'

t.beforeEach(() => {
  const db = create({
    schema: {
      author: 'string',
      quote: 'string'
    }
  })

  insert(db, {
    author: 'Mateo Nunez',
    quote: 'Hi there! This is fastify-lyra plugin.'
  })

  persistToFile(db, dbFormat, dbName)
})

test('Should load Lyra database from file', t => {
  t.plan(1)
  const fastify = Fastify()

  fastify.register(fastifyLyra, {
    persistence: true
  })

  fastify.ready(() => {
    t.ok(fastify.lyra)
    fastify.close()
  })
})

test('Should retrieve search results loading Lyra database from file', async t => {
  t.plan(2)
  const fastify = Fastify()

  await fastify.register(fastifyLyra, {
    persistence: true
  })

  const result = fastify.lyra.search({
    term: 'fastify-lyra'
  })

  t.equal(result.count, 1)
  t.same(result.hits[0].document.author, 'Mateo Nunez')
  fastify.close()
})

test('Should save correctly the new database on filesystem', async t => {
  t.plan(1)

  const fastify = Fastify()

  await fastify.register(fastifyLyra, {
    persistence: true
  })

  fastify.lyra.insert({
    quote: 'Lyra and Fastify are awesome together.',
    author: 'Mateo Nunez'
  })

  fastify.lyra.save()

  const db2 = restoreFromFile(dbFormat, dbName)

  const result = search(db2, {
    term: 'Mateo Nunez'
  })

  t.equal(result.count, 2)
  fastify.close()
})

test("Should thrown an error when database persitent doesn't exists", t => {
  t.plan(1)
  const fastify = Fastify()

  const databaseName = './nope.json'
  fastify.register(fastifyLyra, {
    persistence: true,
    persistency: {
      name: databaseName
    }
  })

  fastify.ready(errors => {
    t.equal(errors.message, `The database file ${databaseName} does not exist`)
    fastify.close()
  })
})
