# 🥣 deserialize-json-api-consistent

Maintained fork of [`weilandia/deserialize-json-api`](https://github.com/weilandia/deserialize-json-api) with a consistent relationship wrapper and ongoing support.

Immutable json:api deserializer

- [{json:api} spec](https://jsonapi.org/) compliant
- maps included objects to resources
- does not mutate original response object

## Install

```
npm install deserialize-json-api-consistent
# or
yarn add deserialize-json-api-consistent
```

## Breaking changes in v3

This fork introduces a consistent relationship wrapper and therefore a major version bump.

- Relationships are always objects with the shape `{ data, meta?, links? }`.
  - to-many: `data` is an array
  - to-one: `data` is an object or `null`
- When `data` is omitted by the server but `meta` or `links` exist, we still return the wrapper with:
  - to-many: `data: []`
  - to-one: `data: null`
- When neither `meta` nor `links` nor `data` are provided by the server:
  - to-many: `data: []`
  - to-one: `data: null`

Resource-level fields remain “flat” (`id`, `type`, attributes, `links`, `meta`). Only relationships are wrapped.

## Usage

```js
import { deserialize } from "deserialize-json-api-consistent";

const body = {
  data: {
    id: 1,
    type: "movie",
    attributes: {
      name: "test movie",
      year: 2014,
    },
    relationships: {
      actors: {
        data: [
          { id: 1, type: "person" },
          { id: 2, type: "person" },
        ],
      },
      awards: {
        data: [
          {
            id: 4,
            type: "award",
            links: {
              self: "/awards/1",
              related: "/awards/1/movie",
            },
            meta: {
              verified: false,
            },
          },
        ],
      },
      locations: {
        data: [{ id: 1, type: "location" }],
      },
      director: {
        data: { id: 3, type: "person" },
      },
    },
    links: {
      self: "/movies/1",
    },
    meta: {
      saved: false,
    },
  },
  included: [
    {
      type: "person",
      id: 1,
      attributes: { name: "John", age: 80 },
    },
    {
      type: "person",
      id: 2,
      attributes: { name: "Jenn", age: 40 },
    },
    {
      type: "award",
      id: 4,
      attributes: { type: "Oscar", category: "Best director" },
    },
    {
      type: "location",
      id: 1,
      attributes: { name: "LA" },
    },
    {
      type: "person",
      id: 3,
      attributes: { name: "Steven" },
    },
  ],
  meta: {
    copyright: "Copyright 2015 Example Corp.",
  },
  errors: [{ title: "Error!" }],
};

const deserializedData = deserialize(body);

deserializedData == {
  data: {
    id: 1,
    type: "movie",
    links: { self: "/movies/1" },
    meta: { saved: false },
    name: "test movie",
    year: 2014,
    locations: { data: [{ id: 1, name: "LA", type: "location" }] },
    director: { data: { id: 3, type: "person", name: "Steven" } },
    actors: {
      data: [
        { id: 1, type: "person", name: "John", age: 80 },
        { id: 2, type: "person", name: "Jenn", age: 40 },
      ],
    },
    awards: {
      data: [
        {
          id: 4,
          type: "award",
          links: { self: "/awards/1", related: "/awards/1/movie" },
          meta: { verified: false },
          category: "Best director",
        },
      ],
    },
  },
  meta: { copyright: "Copyright 2015 Example Corp." },
  errors: [{ title: "Error!" }],
};

### Relationship wrapper shape

- to-many with only meta:
```json
"actors": {
  "links": { "related": "/movies/1/actors", "self": "/movies/1/relationships/actors" },
  "meta": { "count": 3 },
  "data": []
}
```

- to-many with links only and no data:
```json
"actors": {
  "links": { "related": "/movies/1/actors" },
  "data": []
}
```

- to-one with links only and no data:
```json
"director": {
  "links": { "related": "/movies/1/director" },
  "data": null
}
```
```

## Options

#### camelCase

If you would like to have your object key `camelCased` you can pass an option:

```javascript
const result = deserialize(body, { transformKeys: "camelCase" });
```

Currently the package will look for `-` and `_` characters and transform it into camelCase.

```
first-name -> firstName
first_name -> firstName
```

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request
