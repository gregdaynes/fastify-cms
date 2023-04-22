export const autoPrefix = '/categories'

export default async function (fastify, opts) {
  // create category
  fastify.route({
    method: 'POST',
    url: '/',
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']
      const { name, slug } = request.body

      const stmt = db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)')
      const info = stmt.run(name, slug)

      return info
    }
  })

  // read category
  fastify.route({
    method: 'GET',
    url: '/:id',
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
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']
      const { id } = request.params
      const { name, slug } = request.body

      const stmt = db.prepare('UPDATE categories SET name = ?, slug = ? WHERE id = ?')
      const info = stmt.run(name, slug, id)

      return info
    }
  })

  // list category
  fastify.route({
    method: 'GET',
    url: '/',
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
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']
      const { id } = request.params

      const stmt = db.prepare('UPDATE categories SET status = \'unpublished\' WHERE id = ?')
      const info = stmt.run(id)

      return info
    }
  })
}
