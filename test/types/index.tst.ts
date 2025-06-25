import { describe, expect, test } from 'tstyche'

import { type InternalTypedDocument, type Orama, type PartialSchemaDeep, type Results, type Schema, type SearchParams, type TypedDocument } from '@orama/orama'
import Fastify from 'fastify'
import fp from 'fastify-plugin'

import { OramaApi, PersistenceInFile, PersistenceInMemory, fastifyOrama } from '../../index.js'

const mySchema = {
  quote: 'string',
  author: 'string'
} as const

type MySchema = Schema<typeof mySchema>

const baseSetup = () => {
  const app = Fastify()

  app.register(fastifyOrama, {
    schema: mySchema,
    persistence: new PersistenceInMemory()
  })

  return app.withOrama<typeof mySchema>()
}

const setupWithMorePersistenceOptions = () => {
  const app = baseSetup()

  app.register(fastifyOrama, {
    schema: mySchema,
    prefix: '/api/orama',
    language: 'en'
  })

  app.register(fastifyOrama, {
    persistence: new PersistenceInMemory({
      jsonIndex: 'index.json'
    })
  })

  app.register(fastifyOrama, {
    persistence: new PersistenceInFile()
  })
  app.register(fastifyOrama, {
    persistence: new PersistenceInFile({
      filePath: 'index.json',
      format: 'json',
      mustExistOnStart: true
    })
  })

  return app.withOrama<typeof mySchema>()
}

describe('Fastify Orama', () => {

  test('should expose the Orama instance', async () => {
    await (async function () {
      const appWithOrama = baseSetup()
      const id = await appWithOrama.orama.insert({ quote: 'Hello', author: 'World' })
      expect(id).type.toBe<string>()

      appWithOrama.get('/hello', async () => {

        const {orama} = appWithOrama
        expect(orama).type.toBe<OramaApi<typeof mySchema>>()
        const result = await orama.search({ term: 'hello' })

        return {
          hello: result.hits
        }
      })
    })()
  });

  test('should enable the insertion of documents', () => {
    const appWithOrama = setupWithMorePersistenceOptions()
    appWithOrama.orama.insert({ quote: 'Hello', author: 'World' }).then(id => {
      expect(id).type.toBe<string>()
    })
  })

  test('should enable the searching of documents', () => {
    const appWithOrama = setupWithMorePersistenceOptions()
    appWithOrama.get('/hello', async () => {

      const {orama} = appWithOrama
      const result = await orama.search({ term: 'hello' })

      expect(result).type.toBe<Results<InternalTypedDocument<MySchema>>>()
      expect(result.hits[0].document.author).type.toBe<string>()

      return {
        hello: result.hits
      }
    })
  })

  test('should expose the Orama API', () => {
    const appWithOrama = setupWithMorePersistenceOptions()
    expect(appWithOrama.orama).type.toBe<{
      insert: (document: PartialSchemaDeep<TypedDocument<Orama<typeof mySchema>>>) => Promise<string>,
      search: (params: SearchParams<Orama<Schema<typeof mySchema>>, typeof mySchema>) => Promise<Results<Schema<typeof mySchema>>>,
      persist?: () => Promise<any>,
    }>()
  })


  test('should enable the withOrama method', () => {
    fp(function(fastify) {
      const fastifyWithOrama = fastify.withOrama<typeof mySchema>()

      expect(fastifyWithOrama.orama).type.toBe<{
        insert: (document: PartialSchemaDeep<TypedDocument<Orama<typeof mySchema>>>) => Promise<string>,
        search: (params: SearchParams<Orama<Schema<typeof mySchema>>, typeof mySchema>) => Promise<Results<Schema<typeof mySchema>>>,
        persist?: () => Promise<any>,
      }>()
    })
  })
})
