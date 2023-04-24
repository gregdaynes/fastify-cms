import S from 'fluent-json-schema'
import slugify from 'slugify'
import _ from 'lodash'

export const Metadata = S.object()
  .id('#metadata')
  .prop('name', S.string().required())
  .prop('title', S.string().required())
  .prop('slug', S.string().required())
  .prop('description', S.string().required())
  .prop('keywords', S.array().items(S.anyOf([S.null(), S.string()])).required().default([]))
  .prop('url', S.string())
  .prop('updatedAt', S.string().format('date-time'))

export const Data = S.object()
  .id('#data')
  .prop('contentType', S.string().required())
  .prop('content', S.string().required())

export const Document = S.object()
  .id('#document')
  .title('Document')
  .description('document with metadata and data')
  .definition('metadata', Metadata)
  .definition('data', Data)
  .prop('id', S.string().pattern(/[0-7][0-9A-HJKMNP-TV-Z]{25}/gm).required())
  .prop('metadata', S.ref('#metadata').required())
  .prop('data', S.ref('#data').required())
  .prop('deletedAt', S.string().format('date-time'))

export const autoPrefix = '/documents'

export default async function (fastify, opts) {
  const documentSchema = opts.Document
    .definition('metadata', opts.Metadata)
    .definition('data', opts.Data)

  // create item
  fastify.route({
    method: 'POST',
    url: '/',
    preHandler: [
      opts.authenticateCreate
    ],
    schema: {
      body: documentSchema
        .only([
          'metadata.name',
          'metadata.title',
          'data'
        ]),
      response: {
        200: documentSchema
          .without(['deletedAt'])
      }
    },
    handler: async (request, reply) => {
      const id = fastify['fastify-cms-ulid']()
      const { metadata, data } = request.body
      metadata.slug = metadata.slug || slugify(metadata.title)
      metadata.updatedAt = opts.now()

      if (metadata.url) {
        const pages = request.server['fastify-cms-pages']
        const [documentId] = Object.entries(pages).find(([_id, { url }]) => url === metadata.url)
        if (documentId) return reply.notAcceptable()
      }

      await opts.documentCreate(request, { id, metadata, data }, opts)

      request.server['fastify-cms-addPage'](id, metadata.url)

      return await opts.documentRead(request, { id, metadata, data }, opts)
    }
  })

  // read item
  fastify.route({
    method: 'GET',
    url: '/:id',
    preHandler: [
      opts.authenticateRead
    ],
    schema: {
      params: S.object()
        .prop('id', S.anyOf([
          S.string().pattern(/[0-7][0-9A-HJKMNP-TV-Z]{25}/gm),
          S.string().minLength(1)
        ])),
      response: {
        200: documentSchema
      }
    },
    handler: async (request, reply) => {
      const { id } = request.params

      let existingDocument

      if (id.match(/[0-7][0-9A-HJKMNP-TV-Z]{25}/gm)) {
        existingDocument = await opts.documentRead(request, { id }, opts)
      } else {
        const pages = request.server['fastify-cms-pages']
        const [documentId] = Object.entries(pages).find(([_id, { slug }]) => slug === id)
        if (!documentId) return reply.notFound()

        existingDocument = await opts.documentRead(request, { id: documentId }, opts)
      }

      if (!existingDocument) return reply.notFound()
      return existingDocument
    }
  })

  // update item
  fastify.route({
    method: 'PUT',
    url: '/:id',
    preHandler: [
      opts.authenticateUpdate
    ],
    schema: {
      params: documentSchema
        .only(['id']),
      body: documentSchema
        .only([
          'metadata.name',
          'metadata.title',
          'data'
        ]),
      response: {
        200: documentSchema
      }
    },
    handler: async (request, reply) => {
      const { id } = request.params

      const existingDocument = await opts.documentRead(request, { id }, opts)
      if (!existingDocument) return reply.notFound()

      const updatedDocument = _.merge(existingDocument, request.body)
      updatedDocument.metadata.updatedAt = opts.now()

      await opts.documentUpdate(request, {
        id,
        metadata: updatedDocument.metadata,
        data: updatedDocument.data
      }, opts)

      return await opts.documentRead(request, { id }, opts)
    }
  })

  // list item
  fastify.route({
    method: 'GET',
    url: '/',
    preHandler: [
      opts.authenticateList
    ],
    schema: {
      response: {
        200: S.array().items(
          documentSchema
        )
      }
    },
    handler: async (request, reply) => {
      return await opts.documentList(request, {}, opts)
    }
  })

  // delete item
  fastify.route({
    method: 'DELETE',
    url: '/:id',
    preHandler: [
      opts.authenticateDelete
    ],
    schema: {
      params: documentSchema
        .only(['id']),
      response: {
        200: S.null()
      }
    },
    handler: async (request, reply) => {
      const { id } = request.params

      const timestamp = opts.now()

      const existingDocument = await opts.documentRead(request, { id }, opts)
      if (!existingDocument) return reply.notFound()

      const { metadata, data } = _.merge(existingDocument, { metadata: { updatedAt: timestamp } })

      await opts.documentDelete(request, { id, metadata, data, timestamp }, opts)
    }
  })
}

export async function documentCreate (request, { id, metadata, data }, opts) {
  const db = request.server['fastify-cms-database']

  return db.prepare('INSERT INTO documents (id, metadata, data) VALUES (?, ?, ?)')
    .run(id, JSON.stringify(metadata), JSON.stringify(data))
}

export async function documentRead (request, { id, metadata, data }, opts) {
  const db = request.server['fastify-cms-database']

  const document = db.prepare('SELECT * FROM documents WHERE id = ? AND deleted_at IS NULL LIMIT 1').get(id)
  if (!document) return

  return opts.parseDocument(request, document)
}

export async function documentList (request, { id, metadata, data }, opts) {
  const db = request.server['fastify-cms-database']

  const documents = db.prepare('SELECT * FROM documents WHERE deleted_at IS NULL')
    .all()

  return documents.map(document => opts.parseDocument(request, document))
}

export async function documentUpdate (request, { id, metadata, data }, opts) {
  const db = request.server['fastify-cms-database']

  return db.prepare('UPDATE documents SET metadata = ?, data = ? WHERE id = ?')
    .run(JSON.stringify(metadata), JSON.stringify(data), id)
}

export async function documentDelete (request, { id, metadata, data, timestamp }, opts) {
  const db = request.server['fastify-cms-database']

  return await db.prepare('UPDATE documents SET deleted_at = ? WHERE id = ?')
    .run(timestamp, id)
}

export function parseDocument (request, document) {
  return {
    ...document,
    metadata: JSON.parse(document.metadata),
    data: JSON.parse(document.data)
  }
}

export function now () {
  return new Date().toISOString()
}
