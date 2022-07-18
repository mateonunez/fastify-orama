import Fastify from 'fastify'
import { expectType } from 'tsd'
import fastifyLyra from '.'

const app = Fastify()

app.register(fastifyLyra, {
  schema: {
    quote: 'string',
    author: 'string'
  }
})

app.lyra.insert({ quote: 'Hello', author: 'World' })

app.get('/hello', async () => {
  const result = await app.lyra.search({ term: 'hello' })

  expectType<object[]>(result.hits)

  return {
    hello: result.hits
  }
})
