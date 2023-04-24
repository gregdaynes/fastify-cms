# Fastify CMS

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)
![CI workflow](https://github.com/gregdaynes/fastify-cms/actions/workflows/ci.yml/badge.svg)


Supports Fastify versions `4.x`

## Install

```sh
npm i gregdaynes/fastify-cms
```

## Usage

Require `fastify-cms` and register.

```js
import Fastify from 'fastify'
const fastify = Fastify()

fastify.register(import('fastify-cms'), {
  // put your options here
})

fastify.listen({ port: 3000 })
```

## Development

```sh
npm run dev

# or

npm run example
```

## Test

```sh
npm run test
```

## Acknowledgements

## License

Licensed under [The Unlicense](./LICENSE).

## Documentation

### Document

A document is the storage mechanism for a page, or some form of content that 
conforms to the [`Document` schema](./routes/documents/index.js).

_ULID_ is used for generating ids for documents, which are sortable by creation 
time with `a > b` lexicographical sort.

The CMS is not intendend to handle a huge amount of documents, we can safely all
documents metadata in memory.

### Schema

The schemas are provided by `fluent-json-schema`, and can be extended 
through the configuration object during plugin registration.

### Hook: Authenticate

Hooks for each API endpoint/method are exposed through the configuration object
where the plugin is registered.

The `authenticate*` hooks are called on each request prior to the handler function.

`authenticateCreate` is called on `POST /`
`authenticateList` is called on `GET /`
`authenticateRead` is called on `GET /:id`
`authenticateUpdate` is called on `PUT /:id`
`authenticateDelete` is called on `DELETE /:id`

each of the `authenticate*` hooks have a signature that matches the Fastify hook
api. 
    
    ```js
    async function authenticate (request, reply) {
      // do something
    }
    ```
