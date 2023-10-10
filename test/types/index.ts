import Fastify from 'fastify'

import { PersistenceInMemory, fastifyOrama } from '../..'

(async function () {
  const app = Fastify()

  const mySchema = {
    quote: 'string',
    author: 'string'
  } as const

  await app.register(fastifyOrama, {
    schema: mySchema,
    persistence: new PersistenceInMemory()
  })

  const appWithOrama = app.withOrama<typeof mySchema>()
  const id = await appWithOrama.orama.insert({ quote: 'Hello', author: 'World' })

  appWithOrama.get('/hello', async () => {

    const {orama} = appWithOrama
    const result = await orama.search({ term: 'hello' })

    return {
      hello: result.hits
    }
  })
})();