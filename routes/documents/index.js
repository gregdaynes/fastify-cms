import S from 'fluent-json-schema'

export const Item = S.object()
  .id('#document')
  .prop('id', S.number())
  .prop('title', S.string())
  .prop('slug', S.string())
  .prop('content', S.string())
  .prop('idCategory', S.number())

export const autoPrefix = '/documents'

export default async function (fastify, opts) {
  // create item
  fastify.route({
    method: 'POST',
    url: '/',
    schema: {
      body: S.object()
        .prop('title', S.string().required())
        .prop('slug', S.string().required())
        .prop('content', S.string().required())
        .prop('idCategory', S.number().required()),
      response: {
        200: Item
      }
    },
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']
      const { title, slug, content, idCategory } = request.body

      const stmt = db.prepare('INSERT INTO documents (title, slug, content, id_category) VALUES (?, ?, ?, ?)')
      const { lastInsertRowid } = stmt.run(title, slug, content, idCategory)

      const select = db.prepare('SELECT * FROM documents WHERE id = ? LIMIT 1')
      const info = select.get(lastInsertRowid)

      return info
    }
  })

  // read item
  fastify.route({
    method: 'GET',
    url: '/:id',
    schema: {
      params: S.object()
        .prop('id', S.number().required()),
      response: {
        200: Item
      }
    },
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']
      const { id } = request.params

      const stmt = db.prepare('SELECT * FROM documents WHERE id = ?')
      const info = stmt.get(id)
      info.idCategory = info.id_category

      return info
    }
  })

  // update item
  fastify.route({
    method: 'PUT',
    url: '/:id',
    schema: {
      params: S.object()
        .prop('id', S.number().required()),
      body: S.object()
        .prop('title', S.string().required())
        .prop('slug', S.string().required())
        .prop('content', S.string().required())
        .prop('idCategory', S.number().required()),
      response: {
        200: Item
      }
    },
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']
      const { id } = request.params
      const { title, slug, content, idCategory } = request.body

      const stmt = db.prepare('UPDATE documents SET title = ?, slug = ?, content = ?, id_category = ? WHERE id = ?')
      stmt.run(title, slug, content, idCategory, id)

      const select = db.prepare('SELECT * FROM documents WHERE id = ? LIMIT 1')
      const info = select.get(id)

      return info
    }
  })

  // list item
  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      response: {
        200: S.array().items(
          S.object()
            .prop('title', S.string().required())
            .prop('slug', S.string().required())
            .prop('content', S.string().required())
            .prop('idCategory', S.number().required())
        )
      }
    },
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']

      const stmt = db.prepare('SELECT * FROM items')
      const info = stmt.all()

      const cleanedInfo = info.map(item => {
        return {
          ...item,
          idCategory: item.id_category
        }
      })

      return cleanedInfo
    }
  })

  // delete item
  fastify.route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      params: S.object()
        .prop('id', S.number().required()),
      response: {
        200: S.null()
      }
    },
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']
      const { id } = request.params

      const stmt = db.prepare('UPDATE documents SET status = \'unpublished\' WHERE id = ?')
      stmt.run(id)
    }
  })
}
