import fp from 'fastify-plugin'
import { join } from 'desm'

export default fp(async function (fastify, opts) {
  const localOpts = {

  }

  const options = Object.create({}, localOpts, opts)

  // initialize database
  fastify.register(import(join(import.meta.url, 'database.js')), options)
}, { name: 'fastify-cms', fastify: '^4.x' })
