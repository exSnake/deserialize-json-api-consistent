// index.test.js

const { deserialize } = require("./index");
const { strictEqual, deepStrictEqual } = require("assert");

const resp = {
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
          { id: 1, type: "actor" },
          { id: 2, type: "actor" },
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
        data: { id: 1, type: "person" },
      },
      studio: {},
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
      type: "actor",
      id: 1,
      attributes: { name: "John", age: 80 },
    },
    {
      type: "actor",
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
      id: 1,
      attributes: { name: "Steven" },
    },
  ],
  meta: {
    copyright: "Copyright 2015 Example Corp.",
  },
  errors: [{ title: "Error!" }],
};

const expectedResponse = {
  data: {
    id: 1,
    type: "movie",
    links: { self: "/movies/1" },
    meta: { saved: false },
    name: "test movie",
    year: 2014,
    locations: { data: [{ id: 1, name: "LA", type: "location" }] },
    director: { data: { id: 1, type: "person", name: "Steven" } },
    actors: {
      data: [
        { id: 1, type: "actor", name: "John", age: 80 },
        { id: 2, type: "actor", name: "Jenn", age: 40 },
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
    studio: { data: [] },
  },
  meta: { copyright: "Copyright 2015 Example Corp." },
  errors: [{ title: "Error!" }],
};

const respWithSeparators = {
  data: {
    id: 1,
    type: "user",
    attributes: {
      "first-name": "Foo",
      "last-name": "Bar",
    },
    relationships: {
      actors: {
        data: [
          { id: 1, type: "actor" },
          { id: 2, type: "actor" },
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
        data: { id: 1, type: "person" },
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
      type: "actor",
      id: 1,
      attributes: { name: "John", age: 80, "is-super-hero": true },
    },
    {
      type: "actor",
      id: 2,
      attributes: { name: "Jenn", age: 40, "is-super-hero": false },
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
  ],
  meta: {
    copyright: "Copyright 2015 Example Corp.",
  },
  errors: [{ title: "Error!" }],
};

const expectedRespWithSeparators = {
  data: {
    id: 1,
    type: "user",
    links: { self: "/movies/1" },
    meta: { saved: false },
    firstName: "Foo",
    lastName: "Bar",
    locations: { data: [{ id: 1, name: "LA", type: "location" }] },
    director: { data: { id: 1, type: "person" } },
    actors: {
      data: [
        { id: 1, type: "actor", name: "John", age: 80, isSuperHero: true },
        { id: 2, type: "actor", name: "Jenn", age: 40, isSuperHero: false },
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

const nullResp = {
  data: null,
};

// Derived fixtures to simplify adding tests without touching the describe block
const { data: baseData, ...restResp } = resp;
const arrayResp = { data: [baseData, baseData, baseData], ...restResp };

const { data: expectedData, ...expectedRest } = expectedResponse;
const expectedArrayResponse = {
  data: [expectedData, expectedData, expectedData],
  ...expectedRest,
};

// Relationship-specific fixtures
const respMetaOnly = {
  data: {
    type: "movies",
    id: "1",
    attributes: { name: "Test Movie" },
    relationships: {
      actors: {
        links: {
          related: "/movies/1/actors",
          self: "/movies/1/relationships/actors",
        },
        meta: { count: 3 },
      },
    },
    links: { self: "/movies/1" },
  },
};

const expectedMetaOnly = {
  data: {
    type: "movies",
    id: "1",
    name: "Test Movie",
    links: { self: "/movies/1" },
    actors: {
      links: {
        related: "/movies/1/actors",
        self: "/movies/1/relationships/actors",
      },
      meta: { count: 3 },
      data: [],
    },
  },
};

const respNoMetaNoData = {
  data: {
    type: "movies",
    id: "1",
    attributes: { name: "Test Movie" },
    relationships: {
      actors: {
        links: {
          related: "/movies/1/actors",
          self: "/movies/1/relationships/actors",
        },
      },
    },
    links: { self: "/movies/1" },
  },
};

const expectedNoMetaNoData = {
  data: {
    type: "movies",
    id: "1",
    name: "Test Movie",
    links: { self: "/movies/1" },
    actors: {
      data: [],
      links: {
        related: "/movies/1/actors",
        self: "/movies/1/relationships/actors",
      },
    },
  },
};

const respToOne = {
  data: {
    type: "movies",
    id: "1",
    relationships: { director: { data: { type: "people", id: "10" } } },
  },
  included: [{ type: "people", id: "10", attributes: { name: "A" } }],
};

const expectedToOne = {
  data: {
    type: "movies",
    id: "1",
    director: { data: { type: "people", id: "10", name: "A" } },
  },
};

const respToOneNoDataLinks = {
  data: {
    type: "movies",
    id: "1",
    relationships: { director: { links: { related: "/movies/1/director" } } },
  },
};

const expectedToOneNoDataLinks = {
  data: {
    type: "movies",
    id: "1",
    director: { data: null, links: { related: "/movies/1/director" } },
  },
};

const respToManyNoDataLinks = {
  data: {
    type: "movies",
    id: "1",
    relationships: { actors: { links: { related: "/movies/1/actors" } } },
  },
};

const expectedToManyNoDataLinks = {
  data: {
    type: "movies",
    id: "1",
    actors: { data: [], links: { related: "/movies/1/actors" } },
  },
};

// Additional edge cases
const complexResponse = {
  data: {
    type: "posts",
    id: "2291",
    attributes: {},
    relationships: {
      user: {
        data: {
          type: "users",
          id: "39",
        },
      },
      comments: {
        data: [
          {
            type: "comments",
            id: "7989",
          },
          {
            type: "comments",
            id: "7990",
          },
        ],
      },
    },
  },
  included: [
    {
      type: "users",
      id: "39",
      attributes: {},
      relationships: {},
    },
    {
      type: "users",
      id: "100",
      attributes: {},
      relationships: {},
    },
    {
      type: "comments",
      id: "7989",
      attributes: {},
      relationships: {
        user: {
          data: {
            type: "users",
            id: "39",
          },
        },
        pre: {
          data: {
            type: "comments",
            id: "7986",
          },
        },
      },
    },
    {
      type: "comments",
      id: "7986",
      attributes: {},
      relationships: {
        user: {
          data: {
            type: "users",
            id: "39",
          },
        },
      },
    },
    {
      type: "comments",
      id: "7990",
      attributes: {},
      relationships: {
        user: {
          data: {
            type: "users",
            id: "100",
          },
        },
        pre: {
          data: {
            type: "comments",
            id: "7989",
          },
        },
      },
    },
  ],
};

const expectedComplexResponse = {
  data: {
    type: "posts",
    id: "2291",
    user: { data: { type: "users", id: "39" } },
    comments: {
      data: [
        {
          type: "comments",
          id: "7989",
          user: { data: { type: "users", id: "39" } },
          pre: {
            data: {
              type: "comments",
              id: "7986",
              user: { data: { type: "users", id: "39" } },
            },
          },
        },
        {
          type: "comments",
          id: "7990",
          user: { data: { type: "users", id: "100" } },
          pre: {
            data: {
              type: "comments",
              id: "7989",
              user: { data: { type: "users", id: "39" } },
              pre: {
                data: {
                  type: "comments",
                  id: "7986",
                  user: { data: { type: "users", id: "39" } },
                },
              },
            },
          },
        },
      ],
    },
  },
};
describe("deserialize", () => {
  it("should deserialize a single resource", () => {
    const result = deserialize(resp);
    deepStrictEqual(result, expectedResponse);
  });

  it("should handle null resource", () => {
    const result = deserialize(nullResp);
    deepStrictEqual(result, nullResp);
  });

  it("should deserialize an array of resources", () => {
    const result = deserialize(arrayResp);
    deepStrictEqual(result, expectedArrayResponse);
  });

  it("should camel case object keys", () => {
    const result = deserialize(respWithSeparators, {
      transformKeys: "camelCase",
    });
    deepStrictEqual(result, expectedRespWithSeparators);
  });

  it("should handle complex nested relationships", () => {
    const result = deserialize(complexResponse);
    deepStrictEqual(result, expectedComplexResponse);
  });

  it("should preserve meta when relationship has only meta and no data (to-many)", () => {
    const result = deserialize(respMetaOnly);
    deepStrictEqual(result, expectedMetaOnly);
  });

  it("should return wrapper with empty array when relationship has neither meta nor data (to-many)", () => {
    const result = deserialize(respNoMetaNoData);
    deepStrictEqual(result, expectedNoMetaNoData);
  });

  it("should wrap to-one relationship with data object", () => {
    const result = deserialize(respToOne);
    deepStrictEqual(result, expectedToOne);
  });

  it("should wrap to-one relationship with links-only and no data as data: null", () => {
    const result = deserialize(respToOneNoDataLinks);
    deepStrictEqual(result, expectedToOneNoDataLinks);
  });

  it("should wrap to-many relationship with links-only and no data as data: []", () => {
    const result = deserialize(respToManyNoDataLinks);
    deepStrictEqual(result, expectedToManyNoDataLinks);
  });
});
