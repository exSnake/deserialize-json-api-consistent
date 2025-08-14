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

## Compatibility

This fork maintains **full compatibility** with the original `weillandia/deserialize-json-api` package while adding enhanced relationship meta handling.

- Relationships maintain their original structure (flat objects, not wrapped)
- Resource-level fields remain "flat" (`id`, `type`, attributes, `links`, `meta`)
- Relationships without data, meta, or links are not created (original behavior)
- Enhanced meta handling for relationships with only meta (no data)

### Relationship meta handling

When a relationship has only `meta` (no `data`), the meta is attached directly to the relationship object (or under a custom key via `relationshipMetaKey`).

```json
{
  "data": {
    "id": "332",
    "type": "authors",
    "denominazione": "SWEET TIME"
  }
}
// Result excerpt
// "comments": { "meta": { "count": 3 } }
```

When a relationship has no `data`, no `meta`, and no `links`, it is not created at all (maintaining original package behavior).

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
    locations: [{ id: 1, name: "LA", type: "location" }],
    director: { id: 3, type: "person", name: "Steven" },
    actors: [
      { id: 1, type: "person", name: "John", age: 80 },
      { id: 2, type: "person", name: "Jenn", age: 40 },
    ],
    awards: [
      {
        id: 4,
        type: "award",
        links: { self: "/awards/1", related: "/awards/1/movie" },
        meta: { verified: false },
        category: "Best director",
      },
    ],
  },
  meta: { copyright: "Copyright 2015 Example Corp." },
  errors: [{ title: "Error!" }],
};

### Relationship examples

- to-many with data:
```json
"actors": [
  { "id": 1, "type": "person", "name": "John", "age": 80 },
  { "id": 2, "type": "person", "name": "Jenn", "age": 40 }
]
```

- to-one with data:
```json
"director": { "id": 3, "type": "person", "name": "Steven" }
```

- to-many with only meta (no data, no links):
```json
"actors": { "meta": { "count": 3 } }
```

- to-many with no data, links, or meta:
```json
// Relationship is not created at all
// No "actors" property in the result
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

#### relationshipMetaKey

Customize the property name used to attach relationship-only meta (when there is no `data`). Default is `meta`.

```javascript
const result = deserialize(body, { relationshipMetaKey: "_meta" });
// Example output
// comments: { _meta: { count: 3 } }
```

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request
