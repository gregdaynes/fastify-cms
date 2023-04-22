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

## Todo

Data model ideas

- use ulid for ids, to give creation time sortable ids with `a > b` lexicographical sort
- metadata object to capture non-content data
  But, what then we can't query it efficiently? postgres -> jsonb. but sqlite? no.
  the cms is not intendend to hold huge amount of content, so we can probably safely hold it in memory
  from server start.

- [ ] Data model using documents and metadata
- [ ] - ulidx ids for created timestamp and sorting 
- [ ] - metadata for title, description, category, tags, path, etc
- [ ] - data for content
- [ ] - timestamp for deleted
- [ ] - remove the tags table
- [ ] - remove the categories table
- [ ] - call items documents
- [ ] could use lyre search for full text search if the data is able to fit in memory
