import { join } from 'node:path'
import Database from 'better-sqlite3'
import fp from 'fastify-plugin'
import { monotonicFactory as ulid } from 'ulidx'

export default fp(async function (fastify, opts) {
  // initialize database
  const db = new Database(join(process.cwd(), 'cms.db'), opts)

  fastify.decorate('fastify-cms-database', db)

  fastify.decorate('fastify-cms-ulid', ulid())

  // migration: documents
  db.exec(`
     CREATE TABLE IF NOT EXISTS documents
     (
         id         TEXT NOT NULL,
         metadata   JSON DEFAULT '{}' NOT NULL,
         data       JSON DEFAULT '{}' NOT NULL,
         deleted_at TEXT,
         
         CONSTRAINT documents_pk
             PRIMARY KEY (id)
     )
         
     without rowid;
 `)
}, {
  name: 'fastify-cms-db',
  dependencies: []
})
