import { expectType } from 'tsd'

import Fastify from 'fastify'
import { TypedDocument, Orama, Results, Schema, InternalTypedDocument } from '@orama/orama'

import { fastifyOrama, PersistenceInMemory, PersistenceInFile } from '.'

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

const orama = app.getOrama<typeof mySchema>()
const id = await orama.insert({ quote: 'Hello', author: 'World' })
expectType<string>(id)

app.get('/hello', async () => {

  const orama = app.getOrama<typeof mySchema>()
  const result = await orama.search({ term: 'hello' })

  expectType<Results<InternalTypedDocument<MySchema>>>(result)
  expectType<string>(result.hits[0].document.author)

  return {
    hello: result.hits
  }
})
