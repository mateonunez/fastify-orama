import { expectType } from 'tsd'

import { InternalTypedDocument, Orama, PartialSchemaDeep, Results, Schema, SearchParams, TypedDocument } from '@orama/orama'
import Fastify from 'fastify'

import {PersistenceInFile, PersistenceInMemory, fastifyOrama} from '../..'

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
const id = await appWithOrama.orama.insert({ quote: 'Hello', author: 'World' })
expectType<string>(id)

appWithOrama.get('/hello', async () => {

  const {orama} = appWithOrama
  const result = await orama.search({ term: 'hello' })

  expectType<Results<InternalTypedDocument<MySchema>>>(result)
  expectType<string>(result.hits[0].document.author)

  return {
    hello: result.hits
  }
})

expectType<{
  insert: (document: PartialSchemaDeep<TypedDocument<Orama<typeof mySchema>>>) => Promise<string>,
  search: (params: SearchParams<Orama<Schema<typeof mySchema>>, typeof mySchema>) => Promise<Results<Schema<typeof mySchema>>>,
  persist?: () => Promise<any>,
}>(appWithOrama.orama)