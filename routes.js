import fp from 'fastify-plugin'

export default fp(async function (fastify, opts) {
  // register routes
  const { prefix } = opts

  // category
  fastify.register(async function (fastify, opts) {
    // create category
    fastify.route({
      method: 'POST',
      url: prefix + '/categories',
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
      url: prefix + '/categories/:id',
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
      url: prefix + '/categories/:id',
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
      url: prefix + '/categories',
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
      url: prefix + '/categories/:id',
      handler: async (request, reply) => {
        const db = request.server['fastify-cms-database']
        const { id } = request.params

        const stmt = db.prepare('UPDATE categories SET status = \'unpublished\' WHERE id = ?')
        const info = stmt.run(id)

        return info
      }
    })

    // tag
    // create tag
    fastify.route({
      method: 'POST',
      url: prefix + '/tags',
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
      url: prefix + '/tags/:id',
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
      url: prefix + '/tags/:id',
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
      url: prefix + '/tags',
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
      url: prefix + '/tags/:id',
      handler: async (request, reply) => {
        const db = request.server['fastify-cms-database']
        const { id } = request.params

        const stmt = db.prepare('UPDATE tags SET status = \'unpublished\' WHERE id = ?')
        const info = stmt.run(id)

        return info
      }
    })

    // item
    // create item
    fastify.route({
      method: 'POST',
      url: prefix + '/items',
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
      url: prefix + '/items/:id',
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
      url: prefix + '/items/:id',
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
      url: prefix + '/items',
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
      url: prefix + '/items/:id',
      handler: async (request, reply) => {
        const db = request.server['fastify-cms-database']
        const { id } = request.params

        const stmt = db.prepare('UPDATE items SET status = \'unpublished\' WHERE id = ?')
        const info = stmt.run(id)

        return info
      }
    })
  })
})
