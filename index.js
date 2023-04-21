import fp from 'fastify-plugin'

export default fp(async function (fastify, opts) {
  fastify.decorate('exampleDecorator', () => {
    return 'decorated'
  })
}, { fastify: '^4.x' })
