import fp from 'fastify-plugin'

export default fp(async function (fastify, opts) {
  const db = fastify['fastify-cms-database']

  const documents = await opts.documentList({ server: { 'fastify-cms-database': db } }, {}, opts)

  for (const document of documents) {
    const id = document.id
    const url = document.metadata.url

    if (!url) continue

    try {
      fastify.route({
        method: 'GET',
        url,
        handler: handler.bind(null, id)
      })
    } catch (err) {
      if (err.code !== 'FST_ERR_DUPLICATED_ROUTE') throw err

      fastify.log.warn({ id, url }, 'Duplicate of route found')
    }
  }

  const pages = documents.reduce((acc, document) => {
    const id = document.id
    const { slug, url } = document.metadata

    acc[id] = { url, slug }
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

  async function handler (id, request, reply) {
    const document = await opts.documentRead(request, { id }, opts)
    if (!document) return reply.notFound()

    return document
  }
}, {
  name: 'fastify-cms-document-routes',
  dependencies: ['fastify-cms-db']
})
