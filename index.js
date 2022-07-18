'use strict'

const fp = require('fastify-plugin')
const { Lyra } = require('@nearform/lyra')

function fastifyLyra (fastify, options, next) {
  const { schema, defaultLanguage } = options

  if (fastify.lyra) {
    return next(new Error('fastify-lyra is already registered'))
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
