# fastify-orama

![Continuous Integration](https://github.com/mateonunez/fastify-orama/workflows/ci/badge.svg)

Orama plugin for Fastify.

## Installation

```
npm install fastify-orama
```
****
## Usage

### Example

```js
import Fastify from 'fastify'
import FastifyOrama from 'fastify-orama'

const app = Fastify()

await app.register(FastifyOrama, {
  schema: {
    quote: "string",
    author: "string"
  }
})

app.get('/quotes/:query', async function (req, reply) {
  try {
    const { params: { query } } = req

    const search = await app.orama.search({
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

## Usage with data persistence

This plugin implements [@oramasearch/plugin-data-persistence](https://github.com/oramasearch/plugin-data-persistence) to allow users to `load` or `save` database instances.

### Example

```js
import Fastify from 'fastify'
import FastifyOrama from 'fastify-orama'

const app = Fastify()

// The database must exists to load it in your Fastify application
await app.register(FastifyOrama, {
  persistence: true,
  persistency: {
    name: './quotes.json',
    format: 'json'
  }
})

app.post('/quotes', async function (req, reply) {
  try {
    const { body: { author, quote } } = req

    await fastify.orama.insert({
      author,
      quote
    })

    await fastify.orama.save()

    return { success: true }
  } catch (err) {
    return err;
  }
})

app.listen(3000)
```


## License

FastifyOrama is licensed under the [MIT](LICENSE) license.
