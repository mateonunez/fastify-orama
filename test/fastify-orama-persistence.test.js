
import { beforeEach, it, after } from 'node:test'
import { ok, strictEqual } from 'node:assert'
import Fastify from 'fastify'
import FastifyOrama from '../index.js'
import { create, insert, search } from '@orama/orama'
import { persistToFile, restoreFromFile } from '@orama/plugin-data-persistence/server'

const dbName = './orama.json'
const dbFormat = 'json'

beforeEach(async () => {
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

  await persistToFile(db, dbFormat, dbName)
})

it('Should load Orama database from file', async () => {
  const fastify = Fastify()
  await fastify.register(FastifyOrama, {
    persistence: true
  })

  ok(fastify.orama)
})

// it('Should retrieve search results loading Orama database from file', async () => {
//   after(() => {
//     fastify.close()
//   })

//   const fastify = Fastify()
//   await fastify.register(FastifyOrama, {
//     persistence: true
//   })
//   const results = await fastify.orama.search({
//     term: 'fastify-orama'
//   })

//   strictEqual(results.count, 1)

//   const { document } = results.hits[Object.keys(results.hits)[0]]
//   strictEqual(document.author, 'Mateo Nunez')
// })

// it('Should save correctly the new database on filesystem', async () => {
//   after(() => {
//     fastify.close()
//   })

//   const fastify = Fastify()
//   await fastify.register(FastifyOrama, {
//     persistence: true
//   })

//   await fastify.orama.insert({
//     quote: 'Orama and Fastify are awesome together.',
//     author: 'Mateo Nunez'
//   })

//   await fastify.orama.save()
//   const db2 = await restoreFromFile(dbFormat, dbName)
//   const results = await search(db2, {
//     term: 'Mateo Nunez'
//   })

//   strictEqual(results.count, 2)
// })

// it("Should thrown an error when database persitent doesn't exists", async () => {
//   after(() => {
//     fastify.close()
//   })

//   const fastify = Fastify()
//   const databaseName = './nope.json'

//   try {
//     await fastify.register(FastifyOrama, {
//       persistence: true,
//       persistency: {
//         name: databaseName
//       }
//     })
//   } catch (error) {
//     strictEqual(
//       error.message,
//       `The database file ${databaseName} does not exist`
//     )
//   }
// })
