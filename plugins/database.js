import { join } from 'node:path'
import Database from 'better-sqlite3'
import fp from 'fastify-plugin'

export default fp(async function (fastify, opts) {
  // initialize database
  const db = new Database(join(process.cwd(), 'cms.db'), opts)
  fastify.decorate('fastify-cms-database', db)

  db.exec('CREATE TABLE IF NOT EXISTS documents (' +
    'id INTEGER' +
    '  CONSTRAINT items_pki ' +
    '  PRIMARY KEY ' +
    '  AUTOINCREMENT, ' +
    'title TEXT NOT NULL, ' +
    'slug TEXT NOT NULL, ' +
    'content TEXT NOT NULL, ' +
    'path TEXT, ' +
    'status TEXT DEFAULT \'unpublished\' NOT NULL, ' +
    'id_category INTEGER NOT NULL ' +
    '  CONSTRAINT items_categories_id_fk ' +
    '  REFERENCES categories ' +
    ')'
  )
  // migration: documents
}, { name: 'fastify-cms-db' })
