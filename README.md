# fastify-lyra

![Continuous Integration](https://github.com/mateonunez/fastify-lyra/workflows/ci/badge.svg)

Lyra plugin for Fastify.

## Installation

```
npm install @mateonunez/fastify-lyra
```
****
## Usage

### Example

```js
const Fastify = require('fastify')
const FastifyLyra = require('@mateonunez/fastify-lyra')

const app = Fastify()

app.register(FastifyLyra, {
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
