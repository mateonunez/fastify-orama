import { expect, test } from 'tstyche'

import { InternalTypedDocument, Orama, PartialSchemaDeep, Results, Schema, SearchParams, TypedDocument } from '@orama/orama'
import Fastify from 'fastify'
import fp from 'fastify-plugin'

import { PersistenceInFile, PersistenceInMemory, fastifyOrama } from '../..'

const app = Fastify()

const mySchema = {
  quote: 'string',
  author: 'string'
} as const
type MySchema = Schema<typeof mySchema>


app.register(fastifyOrama, {
  schema: mySchema,
  prefix: '/api/orama',
  language: 'en'
})

app.register(fastifyOrama, {
  persistence: new PersistenceInMemory()
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

const appWithOrama = app.withOrama<typeof mySchema>()

test('should enable the insertion of documents', () => {
  appWithOrama.orama.insert({ quote: 'Hello', author: 'World' }).then(id => {
    expect(id).type.toBe<string>()
  })
})

test('should enable the searching of documents', () => {
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
