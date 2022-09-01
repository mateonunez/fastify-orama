'use strict'

const fp = require('fastify-plugin')
const { create, insert, search } = require('@lyrasearch/lyra')

function FastifyLyra (fastify, options, next) {
  const { schema, defaultLanguage = 'english', stemming = true } = options

  if (fastify.lyra) {
    return next(new Error('fastify-lyra is already registered'))
  }

  const db = create({
    schema,
    defaultLanguage,
    stemming
  })

  fastify.decorate('lyra', {
    insert: (...args) => insert(db, ...args),
    search: (...args) => search(db, ...args)
  })

  next()
}

module.exports = fp(FastifyLyra, {
  fastify: '4.x',
  name: '@fastify/lyra'
})
