// Read the .env file.
import * as dotenv from 'dotenv'

// Require the framework
import Fastify from 'fastify'

// Require library to exit fastify process, gracefully (if possible)
import closeWithGrace from 'close-with-grace'

// Import your application
import appService, { Schema } from '../index.js'
import S from 'fluent-json-schema'

// Dotenv config
dotenv.config()

// Instantiate Fastify with some config
const app = Fastify({
  logger: true
})

// Dummy auth and user profile, NOT FOR PRODUCTION
app.addHook('preValidation', async (request, _reply) => {
  if (request.query.authed) {
    request.user = {
      canCreate: true,
      canUpdate: true,
      canDelete: true
    }
  }
})

// Register your application as a normal plugin.
const authenticate = async (request, _reply) => {
  if (!request.user) {
    throw new Error('Unauthorized')
  }
}

app.register(appService, {
  // example overriding the metadata schema
  // adding a publishAt and author field
  Metadata: Schema.Metadata
    .prop('publishAt', S.string().format('date-time'))
    .prop('author', S.string().required()),

  // example overriding the data schema
  // adding a teaserImage field
  Data: Schema.Data
    .prop('teaserImage', S.string().required()),

  // example providing authentication functions
  authenticateCreate: authenticate,
  authenticateUpdate: authenticate,
  authenticateDelete: authenticate
})

// delay is the number of milliseconds for the graceful close to finish
const closeListeners = closeWithGrace({ delay: process.env.FASTIFY_CLOSE_GRACE_DELAY || 500 }, async function ({ signal, err, manual }) {
  if (err) {
    app.log.error(err)
  }
  await app.close()
})

app.addHook('onClose', async (instance, done) => {
  closeListeners.uninstall()
  done()
})

// Start listening.
app.listen({ port: process.env.PORT || 3000 }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})
