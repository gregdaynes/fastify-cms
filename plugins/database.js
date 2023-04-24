import Database from 'better-sqlite3'
import fp from 'fastify-plugin'
import { monotonicFactory as ulid } from 'ulidx'

export default fp(async function (fastify, opts) {
  // initialize database
  if (opts.skipDatabase === true) return

  const db = new Database(opts.databasePath)

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

export async function documentCreate (request, { id, metadata, data }, opts) {
  const db = request.server['fastify-cms-database']

  return db.prepare('INSERT INTO documents (id, metadata, data) VALUES (?, ?, ?)')
    .run(id, JSON.stringify(metadata), JSON.stringify(data))
}

export async function documentRead (request, { id, metadata, data }, opts) {
  const db = request.server['fastify-cms-database']

  const document = db.prepare('SELECT * FROM documents WHERE id = ? AND deleted_at IS NULL LIMIT 1').get(id)
  if (!document) return

  return opts.parseDocument(request, document)
}

export async function documentList (request, { id, metadata, data }, opts) {
  const db = request.server['fastify-cms-database']

  const documents = db.prepare('SELECT * FROM documents WHERE deleted_at IS NULL')
    .all()

  return documents.map(document => opts.parseDocument(request, document))
}

export async function documentUpdate (request, { id, metadata, data }, opts) {
  const db = request.server['fastify-cms-database']

  return db.prepare('UPDATE documents SET metadata = ?, data = ? WHERE id = ?')
    .run(JSON.stringify(metadata), JSON.stringify(data), id)
}

export async function documentDelete (request, { id, metadata, data, timestamp }, opts) {
  const db = request.server['fastify-cms-database']

  return await db.prepare('UPDATE documents SET deleted_at = ? WHERE id = ?')
    .run(timestamp, id)
}
