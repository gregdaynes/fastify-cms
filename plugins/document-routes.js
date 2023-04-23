import fp from 'fastify-plugin'

export default fp(async function (fastify, opts) {
  const db = fastify['fastify-cms-database']

  const stmt = db.prepare('SELECT id, json_extract(metadata, \'$.url\') AS url FROM documents WHERE deleted_at IS NULL AND json_extract(metadata, \'$.url\') IS NOT NULL')
  const documents = stmt.all()

  for (const { id, url } of documents) {
    try {
      fastify.route({
        method: 'GET',
        url,
        handler: handler.bind(null, id)
      })
    } catch (err) {
      if (err.code !== 'FST_ERR_DUPLICATED_ROUTE') throw err

      fastify.log.warn({ id, url }, 'Duplicate of loaded route found.')
    }
  }

  const pages = documents.reduce((acc, { id, url }) => {
    acc[id] = url
    return acc
  }, {})

  fastify.decorate('fastify-cms-pages', pages)
  fastify.decorate('fastify-cms-addPage', function (id, url) {
    pages[id] = url
  })

  fastify.get('*', function (request, reply) {
    const { url } = request

    const id = Object.keys(pages).find(id => pages[id] === url)
    if (!id) return reply.notFound()

    return handler(id, request, reply)
  })
}, {
  name: 'fastify-cms-document-routes',
  dependencies: ['fastify-cms-db']
})

function handler (id, request, reply) {
  const db = request.server['fastify-cms-database']

  const stmt = db.prepare('SELECT * FROM documents WHERE id = ? AND deleted_at IS NULL')
  const document = stmt.get(id)

  if (!document) return reply.notFound()

  return parseDocument(document)
}

function parseDocument (document) {
  return {
    ...document,
    metadata: JSON.parse(document.metadata),
    data: JSON.parse(document.data)
  }
}
