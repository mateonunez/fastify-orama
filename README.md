# fastify-lyra

Lyra plugin for Fastify.

## Installation

```
npm install fastify-lyra
```

## Usage

### Example

```js
const Fastify = require('fastify')
const fastifyLyra = require('fastify-lyra')

const app = Fastify()

app.register(fastifyLyra, {
  schema: {
    quote: "string",
    author: "string"
  }
})

app.get('/quote/:query', async function (req, reply) {
  try {
    const { params: { query } } = req

    const search = await app.lyra.search({
      term: query,
      properties: ["quote"]
    })

    return { quotes: search.hits }
  } catch (err) {
    return err;
  }
})

app.listen(3000)
```

## License

FastifyLyra is licensed under the [MIT](LICENSE) license.