'use strict'

const fp = require('fastify-plugin')
const { Lyra } = require('@nearform/lyra')

function FastifyLyra(fastify, options, next) {
  const { schema, defaultLanguage = 'english', stemming = false } = options

  if (fastify.lyra) {
    return next(new Error('fastify-lyra is already registered'))
  }

  const client = new Lyra({
    schema,
    defaultLanguage,
    stemming
  })

  fastify.decorate('lyra', client)

  next()
}

module.exports = fp(FastifyLyra, {
  fastify: '4.x',
  name: '@fastify/lyra'
})
