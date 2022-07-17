'use strict'

const fp = require('fastify-plugin')
const { Lyra } = require('./dist/lyra/lyra')

function fastifyLyra (fastify, options, next) {
  const { schema, defaultLanguage } = options

  if (fastify.lyra) {
    next(new Error('fastify-lyra is already registered'))
    return
  }

  const client = new Lyra({
    schema,
    defaultLanguage
  })

  fastify.decorate('lyra', client)

  next()
}

module.exports = fp(fastifyLyra, {
  fastify: '4.x',
  name: '@fastify/lyra'
})
