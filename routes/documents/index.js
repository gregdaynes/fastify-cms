import S from 'fluent-json-schema'
import slugify from 'slugify'
import _ from 'lodash'

export const Document = S.object()
  .id('#document')
  .title('Document')
  .description('document with metadata and data')

  .definition('metadata', S.object()
    .id('#metadata')
    .prop('name', S.string().required())
    .prop('title', S.string().required())
    .prop('slug', S.string().required())
    .prop('description', S.string().required())
    .prop('keywords', S.array().items(S.anyOf([S.null(), S.string()])).required().default([]))
    .prop('url', S.string())
    .prop('updatedAt', S.string().format('date-time'))
  )

  .definition('data', S.object()
    .id('#data')
    .prop('contentType', S.string().required())
    .prop('content', S.string().required())
  )

  .prop('id', S.string().pattern(/[0-7][0-9A-HJKMNP-TV-Z]{25}/gm).required())
  .prop('metadata', S.ref('#metadata').required())
  .prop('data', S.ref('#data').required())
  .prop('deletedAt', S.string().format('date-time'))

export const autoPrefix = '/documents'

export default async function (fastify, opts) {
  // create item
  fastify.route({
    method: 'POST',
    url: '/',
    schema: {
      body: Document
        .only([
          'metadata.name',
          'metadata.title',
          'data'
        ]),
      response: {
        200: Document
          .without(['deletedAt'])
      }
    },
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']

      const id = fastify['fastify-cms-ulid']()
      const { metadata, data } = request.body
      metadata.slug = slugify(metadata.title)
      metadata.updatedAt = now()

      const stmt = db.prepare('INSERT INTO documents (id, metadata, data) VALUES (?, ?, ?)')
      stmt.run(id, JSON.stringify(metadata), JSON.stringify(data))

      request.server['fastify-cms-addPage'](id, metadata.url)

      return fetchDocumentById(id)
    }
  })

  // read item
  fastify.route({
    method: 'GET',
    url: '/:id',
    schema: {
      params: Document
        .only(['id']),
      response: {
        200: Document
      }
    },
    handler: async (request, reply) => {
      const { id } = request.params

      const existingDocument = fetchDocumentById(id)
      if (!existingDocument) return reply.notFound()

      return existingDocument
    }
  })

  // update item
  fastify.route({
    method: 'PUT',
    url: '/:id',
    schema: {
      params: Document
        .only(['id']),
      body: Document
        .only([
          'metadata.name',
          'metadata.title',
          'data'
        ]),
      response: {
        200: Document
      }
    },
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']
      const { id } = request.params

      const existingDocument = fetchDocumentById(id)
      if (!existingDocument) return reply.notFound()

      const updatedDocument = _.merge(existingDocument, request.body)
      updatedDocument.metadata.updatedAt = now()

      const stmt = db.prepare('UPDATE documents SET metadata = ?, data = ? WHERE id = ?')
      stmt.run(JSON.stringify(updatedDocument.metadata), JSON.stringify(updatedDocument.data), updatedDocument.id)

      return fetchDocumentById(id)
    }
  })

  // list item
  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      response: {
        200: S.array().items(
          Document
        )
      }
    },
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']

      const stmt = db.prepare('SELECT * FROM documents WHERE deleted_at IS NULL')
      const documents = stmt.all()

      return documents.map(document => parseDocument(document))
    }
  })

  // delete item
  fastify.route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      params: Document
        .only(['id']),
      response: {
        200: S.null()
      }
    },
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']
      const { id } = request.params

      const timestamp = now()

      const existingDocument = fetchDocumentById(id)
      if (!existingDocument) return reply.notFound()

      const { metadata } = _.merge(existingDocument, { metadata: { updatedAt: timestamp } })

      const stmt = db.prepare('UPDATE documents SET deleted_at = ? WHERE id = ?')
      console.log({ metadata, timestamp, id })
      stmt.run(timestamp, id)
    }
  })

  function fetchDocumentById (id, includeDeleted = false) {
    const db = fastify['fastify-cms-database']
    const data = db.prepare('SELECT * FROM documents WHERE id = ? AND deleted_at IS NULL LIMIT 1').get(id)
    if (!data) return

    return parseDocument(data)
  }

  function parseDocument (document) {
    return {
      ...document,
      metadata: JSON.parse(document.metadata),
      data: JSON.parse(document.data)
    }
  }

  function now () {
    return new Date().toISOString()
  }
}
