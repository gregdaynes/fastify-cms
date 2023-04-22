import S from 'fluent-json-schema'

export const Category = S.object()
  .id('#category')
  .prop('id', S.number())
  .prop('name', S.string())
  .prop('slug', S.string())
  .prop('status', S.string())

export const autoPrefix = '/categories'

export default async function (fastify, opts) {
  // create category
  fastify.route({
    method: 'POST',
    url: '/',
    schema: {
      body: S.object()
        .prop('name', S.string().required())
        .prop('slug', S.string().required()),
      response: {
        200: Category
      }
    },
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']
      const { name, slug } = request.body

      const stmt = db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)')
      const { lastInsertRowid } = stmt.run(name, slug)

      const select = db.prepare('SELECT * FROM categories WHERE id = ? LIMIT 1')
      const info = select.get(lastInsertRowid)

      return info
    }
  })

  // read category
  fastify.route({
    method: 'GET',
    url: '/:id',
    schema: {
      params: S.object()
        .prop('id', S.number().required()),
      response: {
        200: Category
      }
    },
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']
      const { id } = request.params

      const stmt = db.prepare('SELECT * FROM categories WHERE id = ?')
      const info = stmt.get(id)

      return info
    }
  })

  // update category
  fastify.route({
    method: 'PUT',
    url: '/:id',
    schema: {
      params: S.object()
        .prop('id', S.number().required()),
      body: S.object()
        .prop('name', S.string().required())
        .prop('slug', S.string().required()),
      response: {
        200: Category
      }
    },
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']
      const { id } = request.params
      const { name, slug } = request.body

      const stmt = db.prepare('UPDATE categories SET name = ?, slug = ? WHERE id = ?')
      stmt.run(name, slug, id)

      const select = db.prepare('SELECT * FROM categories WHERE id = ? LIMIT 1')
      const info = select.get(id)

      return info
    }
  })

  // list category
  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      response: {
        200: S.array().items(
          S.object()
            .prop('id', S.number().required())
            .prop('name', S.string().required())
            .prop('slug', S.string().required())
            .prop('status', S.string().required())
        )
      }
    },
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']

      const stmt = db.prepare('SELECT * FROM categories')
      const info = stmt.all()

      return info
    }
  })

  // delete category
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

      const stmt = db.prepare('UPDATE categories SET status = \'unpublished\' WHERE id = ?')
      stmt.run(id)
    }
  })
}
