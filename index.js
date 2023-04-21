import fp from 'fastify-plugin'
import { join } from 'desm'

export default fp(async function (fastify, opts) {
  const localOpts = {
    prefix: '/cms'
  }

  const options = structuredClone(Object.assign({}, localOpts, opts))

  // initialize database
  fastify.register(import(join(import.meta.url, 'database.js')), options)
  fastify.register(import(join(import.meta.url, 'routes.js')), options)
}, { name: 'fastify-cms', fastify: '^4.x' })
