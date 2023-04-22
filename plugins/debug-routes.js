import fp from 'fastify-plugin'

export default fp(async function (fastify, opts) {
  if (!process.env.FASTIFY_CMS_DEBUG) return
  await fastify.register(import('@fastify/routes'))

  fastify.addHook('onReady', async () => {
    let loadedRoutes = {}
    for (const [endpoint, routes] of fastify.routes) {
      if (!loadedRoutes[endpoint]) loadedRoutes[endpoint] = []

      for (const { method } of routes) {
        loadedRoutes[endpoint].push(method)
      }
    }

    loadedRoutes = Object.entries(loadedRoutes).reduce((acc, x) => {
      return acc + '\n\t' + x[0] + ' => [' + x[1].join(' ') + ']'
    }, 'Loaded Routes')

    fastify.log.debug(loadedRoutes)
  })
})
