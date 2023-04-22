export const autoPrefix = '/items'

export default async function (fastify, opts) {
  // create item
  fastify.route({
    method: 'POST',
    url: '/',
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']
      const { title, slug, content, idCategory } = request.body

      const stmt = db.prepare('INSERT INTO items (title, slug, content, id_category) VALUES (?, ?, ?, ?)')
      const info = stmt.run(title, slug, content, idCategory)

      return info
    }
  })

  // read item
  fastify.route({
    method: 'GET',
    url: '/:id',
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']
      const { id } = request.params

      const stmt = db.prepare('SELECT * FROM items WHERE id = ?')
      const info = stmt.get(id)

      return info
    }
  })

  // update item
  fastify.route({
    method: 'PUT',
    url: '/:id',
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']
      const { id } = request.params
      const { title, slug, content, idCategory } = request.body

      const stmt = db.prepare('UPDATE items SET title = ?, slug = ?, content = ?, id_category = ? WHERE id = ?')
      const info = stmt.run(title, slug, content, idCategory, id)

      return info
    }
  })

  // list item
  fastify.route({
    method: 'GET',
    url: '/',
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']

      const stmt = db.prepare('SELECT * FROM items')
      const info = stmt.all()

      return info
    }
  })

  // delete item
  fastify.route({
    method: 'DELETE',
    url: '/:id',
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']
      const { id } = request.params

      const stmt = db.prepare('UPDATE items SET status = \'unpublished\' WHERE id = ?')
      const info = stmt.run(id)

      return info
    }
  })
}
