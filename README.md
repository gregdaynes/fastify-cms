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
