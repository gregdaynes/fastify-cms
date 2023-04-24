import fp from 'fastify-plugin'
import AutoLoad from '@fastify/autoload'
import Path from 'node:path'
import { join } from 'desm'
import _ from 'lodash'
import {
  Document,
  Metadata,
  Data,
  parseDocument,
  now
} from './routes/documents/index.js'
import {
  documentCreate,
  documentRead,
  documentUpdate,
  documentList,
  documentDelete
} from './plugins/database.js'

export default fp(async function (fastify, opts) {
  fastify.register(import('@fastify/sensible'))

  const localOpts = {
    // default prefix
    prefix: '/cms',

    // default schema
    Document,
    Metadata,
    Data,

    // default authentication
    authenticateCreate: authenticateBase('authenticateCreate'),
    authenticateUpdate: authenticateBase('authenticateUpdate'),
    authenticateDelete: authenticateBase('authenticateDelete'),
    async authenticateRead (request, reply) {},
    async authenticateList (request, reply) {},

    // default sqlite database path
    databasePath: Path.join(process.cwd(), 'cms.db'),

    // document database functions
    documentCreate,
    documentRead,
    documentUpdate,
    documentList,
    documentDelete,

    // utility functions
    parseDocument,
    now
  }

  const methods = _.compact(_.pick(opts, ['documentCreate', 'documentRead', 'documentUpdate', 'documentList', 'documentDelete']))
  if (methods.length) {
    opts.skipDatabase = true
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

function authenticateBase (name) {
  return async function (request, reply) {
    request.log.warn(`${name} needs to be provided. Using the default is a risk.`)

    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  }
}
