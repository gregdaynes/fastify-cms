import S from 'fluent-json-schema'

export const Tag = S.object()
  .id('#tag')
  .prop('id', S.number())
  .prop('name', S.string())

export const autoPrefix = '/tags'

export default async function (fastify, opts) {
  // create tag
  fastify.route({
    method: 'POST',
    url: '/',
    schema: {
      body: S.object()
        .prop('name', S.string().required()),
      response: {
        200: Tag
      }
    },
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']
      const { name } = request.body

      const stmt = db.prepare('INSERT INTO tags (name) VALUES (?)')
      const { lastInsertRowid } = stmt.run(name)

      const select = db.prepare('SELECT * FROM tags WHERE id = ? LIMIT 1')
      const info = select.get(lastInsertRowid)

      console.log(info)

      return info
    }
  })

  // read tag
  fastify.route({
    method: 'GET',
    url: '/:id',
    schema: {
      params: S.object()
        .prop('id', S.number().required()),
      response: {
        200: Tag
      }
    },
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
    schema: {
      params: S.object()
        .prop('id', S.number().required()),
      body: S.object()
        .prop('name', S.string().required()),
      response: {
        200: Tag
      }
    },
    handler: async (request, reply) => {
      const db = request.server['fastify-cms-database']
      const { id } = request.params
      const { name } = request.body

      const stmt = db.prepare('UPDATE tags SET name = ? WHERE id = ?')
      stmt.run(name, id)

      const select = db.prepare('SELECT * FROM tags WHERE id = ? LIMIT 1')
      const info = select.get(id)

      return info
    }
  })

  // list tag
  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      response: {
        200: S.array().items(
          S.object()
            .prop('id', S.number().required())
            .prop('name', S.string().required())
        )
      }
    },
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

      const stmt = db.prepare('UPDATE tags SET status = \'unpublished\' WHERE id = ?')
      const info = stmt.run(id)

      return info
    }
  })
}
