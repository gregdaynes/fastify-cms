import fp from 'fastify-plugin'
import AutoLoad from '@fastify/autoload'
import { join } from 'desm'

export default fp(async function (fastify, opts) {
  const localOpts = {
    prefix: '/cms'
  }

  const options = structuredClone(Object.assign({}, localOpts, opts))

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  await fastify.register(AutoLoad, {
    dir: join(import.meta.url, 'plugins'),
    options
  })
}, { name: 'fastify-cms', fastify: '^4.x' })
