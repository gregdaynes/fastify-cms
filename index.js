import fp from 'fastify-plugin'
import AutoLoad from '@fastify/autoload'
import { join } from 'desm'
import _ from 'lodash'

export default fp(async function (fastify, opts) {
  fastify.register(import('@fastify/sensible'))

  const localOpts = {
    prefix: '/cms'
  }

  const options = structuredClone(Object.assign({}, localOpts, opts))

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  await fastify.register(AutoLoad, {
    dir: join(import.meta.url, 'plugins'),
    options: {
      ..._.omit(options, ['prefix'])
    }
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  await fastify.register(AutoLoad, {
    dir: join(import.meta.url, 'routes'),
    options
  })
}, { name: 'fastify-cms', fastify: '^4.x' })
