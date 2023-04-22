export const autoPrefix = '/tags'

export default async function (fastify, opts) {
  // create tag
  fastify.route({
    method: 'POST',
    url: '/',
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']
      const { name } = request.body

      const stmt = db.prepare('INSERT INTO tags (name) VALUES (?)')
      const info = stmt.run(name)

      return info
    }
  })

  // read tag
  fastify.route({
    method: 'GET',
    url: '/:id',
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']
      const { id } = request.params

      const stmt = db.prepare('SELECT * FROM tags WHERE id = ?')
      const info = stmt.get(id)

      return info
    }
  })

  // update tag
  fastify.route({
    method: 'PUT',
    url: '/:id',
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']
      const { id } = request.params
      const { name } = request.body

      const stmt = db.prepare('UPDATE tags SET name = ? WHERE id = ?')
      const info = stmt.run(name, id)

      return info
    }
  })

  // list tag
  fastify.route({
    method: 'GET',
    url: '/',
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']

      const stmt = db.prepare('SELECT * FROM tags')
      const info = stmt.all()

      return info
    }
  })

  // delete tag
  fastify.route({
    method: 'DELETE',
    url: '/:id',
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']
      const { id } = request.params

      const stmt = db.prepare('UPDATE tags SET status = \'unpublished\' WHERE id = ?')
      const info = stmt.run(id)

      return info
    }
  })
}
