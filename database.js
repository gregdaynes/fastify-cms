import { join } from 'node:path'
import Database from 'better-sqlite3'
import fp from 'fastify-plugin'

export default fp(async function (fastify, opts) {
  // initialize database
  const db = new Database(join(process.cwd(), 'cms.db'), opts)
  fastify.decorate('fastify-cms-database', db)

  // migration: items
  db.exec('CREATE TABLE IF NOT EXISTS items (' +
    'id INTEGER' +
    '  CONSTRAINT items_pki ' +
    '  PRIMARY KEY ' +
    '  AUTOINCREMENT, ' +
    'title TEXT NOT NULL, ' +
    'slug TEXT NOT NULL, ' +
    'content TEXT NOT NULL, ' +
    'path TEXT NOT NULL, ' +
    'status TEXT DEFAULT \'unpublished\' NOT NULL, ' +
    'category_id INTEGER NOT NULL ' +
    '  CONSTRAINT items_categories_id_fk ' +
    '  REFERENCES categories ' +
    ')'
  )

  // migration: categories
  db.exec('CREATE TABLE IF NOT EXISTS categories (' +
    'id INTEGER' +
    '  CONSTRAINT items_pki ' +
    '  PRIMARY KEY ' +
    '  AUTOINCREMENT, ' +
    'name TEXT NOT NULL, ' +
    'slug TEXT NOT NULL, ' +
    'status TEXT DEFAULT \'unpublished\' NOT NULL ' +
    ')'
  )

  // migration: tags
  db.exec('CREATE TABLE IF NOT EXISTS tags (' +
    'id INTEGER' +
    '  CONSTRAINT items_pki ' +
    '  PRIMARY KEY ' +
    '  AUTOINCREMENT, ' +
    'name TEXT NOT NULL, ' +
    'status TEXT DEFAULT \'unpublished\' NOT NULL ' +
    ')'
  )

  // migration: item_tags
  db.exec('CREATE TABLE IF NOT EXISTS item_tags (' +
    'id INTEGER NOT NULL ' +
    '  CONSTRAINT item_tags ' +
    '  PRIMARY KEY AUTOINCREMENT, ' +
    'id_item INTEGER NOT NULL ' +
    '  CONSTRAINT item_tags_items_id_fk ' +
    '  REFERENCES items, ' +
    'id_tag INTEGER NOT NULL ' +
    '  CONSTRAINT item_tags_tags_id_fk ' +
    '  REFERENCES tags ' +
    ')'
  )
}, { name: 'fastify-cms-db' })
