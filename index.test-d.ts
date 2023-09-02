import Fastify from 'fastify'
import { expectType } from 'tsd'
import fastifyOrama from '.'
import { Result } from '@orama/orama'

const app = Fastify()

app.register(fastifyOrama, {
  schema: {
    quote: 'string',
    author: 'string'
  },
})

app.orama.insert({ quote: 'Hello', author: 'World' })

app.get('/hello', async () => {
  const result = await app.orama.search({ term: 'hello' })

  expectType<Result[]>(result.hits)

  return {
    hello: result.hits
  }
})
