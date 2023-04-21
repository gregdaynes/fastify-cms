import { test } from 'tap'
import fastify from 'fastify'

test('should register the correct decorator', async t => {
  t.plan(1)

  const app = fastify()

  app.register(import('../index.js'))

  await app.ready()

  t.ok(app['fastify-cms-database'])
})
