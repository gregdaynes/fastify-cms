import fp from 'fastify-plugin'
import AutoLoad from '@fastify/autoload'
import { join } from 'desm'
import _ from 'lodash'
import { Document, Metadata, Data } from './routes/documents/index.js'

export default fp(async function (fastify, opts) {
  fastify.register(import('@fastify/sensible'))

  const localOpts = {
    // default prefix
    prefix: '/cms',

    // default schema
    Document,
    Metadata,
    Data
  }

  const options = Object.assign(Object.assign({}, localOpts, opts))

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

export const Schema = {
  Document, Metadata, Data
}
