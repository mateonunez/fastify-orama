import { expectType } from 'tsd'

import Fastify from 'fastify'
import { Result } from '@orama/orama'

import { fastifyOrama, PersistenceInMemory, PersistenceInFile } from '.'

const app = Fastify()

app.register(fastifyOrama, {
  schema: {
    quote: 'string',
    author: 'string'
  },
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

app.orama.insert({ quote: 'Hello', author: 'World' })

app.get('/hello', async () => {
  const result = await app.orama.search({ term: 'hello' })

  expectType<Result[]>(result.hits)

  return {
    hello: result.hits
  }
})
