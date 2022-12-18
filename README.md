# fastify-lyra

![Continuous Integration](https://github.com/mateonunez/fastify-lyra/workflows/ci/badge.svg)

Lyra plugin for Fastify.

## Installation

```
npm install fastify-lyra
```
****
## Usage

### Example

```js
const Fastify = require('fastify')
const FastifyLyra = require('fastify-lyra')

const app = Fastify()

app.register(FastifyLyra, {
  schema: {
    quote: "string",
    author: "string"
  }
})

app.get('/quotes/:query', async function (req, reply) {
  try {
    const { params: { query } } = req

    const search = app.lyra.search({
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

This plugin implements [@lyrasearch/plugin-data-persistence](https://github.com/lyrasearch/plugin-data-persistence) to allow users to `load` or `save` database instances.

### Example

```js
const Fastify = require('fastify')
const FastifyLyra = require('fastify-lyra')

const app = Fastify()

// The database must exists to load it in your Fastify application
app.register(FastifyLyra, {
  persistence: true,
  persistency: {
    name: './quotes.json',
    format: 'json'
  }
})

app.post('/quotes', async function (req, reply) {
  try {
    const { body: { author, quote } } = req

    fastify.lyra.insert({
      author,
      quote
    })

    fastify.lyra.save()

    return { success: true }
  } catch (err) {
    return err;
  }
})

app.listen(3000)
```


## License

FastifyLyra is licensed under the [MIT](LICENSE) license.
