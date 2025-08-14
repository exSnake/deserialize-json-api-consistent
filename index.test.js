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
    locations: [{ id: 1, name: "LA", type: "location" }],
    director: { id: 1, type: "person", name: "Steven" },
    actors: [
      { id: 1, type: "actor", name: "John", age: 80 },
      { id: 2, type: "actor", name: "Jenn", age: 40 },
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
    locations: [{ id: 1, name: "LA", type: "location" }],
    director: { id: 1, type: "person" },
    actors: [
      { id: 1, type: "actor", name: "John", age: 80, isSuperHero: true },
      { id: 2, type: "actor", name: "Jenn", age: 40, isSuperHero: false },
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

const nullResp = {
  data: null,
};

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
    user: {
      type: "users",
      id: "39",
    },
    comments: [
      {
        type: "comments",
        id: "7989",
        user: {
          type: "users",
          id: "39",
        },
        pre: {
          type: "comments",
          id: "7986",
          user: {
            type: "users",
            id: "39",
          },
        },
      },
      {
        type: "comments",
        id: "7990",
        user: {
          type: "users",
          id: "100",
        },
        pre: {
          type: "comments",
          id: "7989",
          user: {
            type: "users",
            id: "39",
          },
          pre: {
            type: "comments",
            id: "7986",
            user: {
              type: "users",
              id: "39",
            },
          },
        },
      },
    ],
  },
};

const respMetaOnly = {
  data: {
    type: "locations",
    id: "332",
    attributes: { denominazione: "SWEET TIME" },
    relationships: {
      slots: {
        links: {
          related: "http://localhost:771/api/v1/locations/332/slots",
          self: "http://localhost:771/api/v1/locations/332/relationships/slots",
        },
        meta: { count: 3 },
      },
    },
    links: {
      self: "http://localhost:771/api/v1/locations/332",
    },
  },
};

const expectedMetaOnly = {
  data: {
    type: "locations",
    id: "332",
    denominazione: "SWEET TIME",
    links: { self: "http://localhost:771/api/v1/locations/332" },
  },
  meta: {
    relationships: {
      slots: { count: 3 },
    },
  },
};

const respNoMetaNoData = {
  data: {
    type: "locations",
    id: "90",
    attributes: { denominazione: "STAZIONE DI SERVIZIO API" },
    relationships: {
      slots: {
        links: {
          related: "http://localhost:771/api/v1/locations/90/slots",
          self: "http://localhost:771/api/v1/locations/90/relationships/slots",
        },
      },
    },
    links: {
      self: "http://localhost:771/api/v1/locations/90",
    },
  },
};

const expectedNoMetaNoData = {
  data: {
    type: "locations",
    id: "90",
    denominazione: "STAZIONE DI SERVIZIO API",
    links: { self: "http://localhost:771/api/v1/locations/90" },
    slots: [],
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
    director: { type: "people", id: "10", name: "A" },
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
    director: [],
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
    actors: [],
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
    const { data, ...rest } = resp;
    const arrayResp = { data: [data, data, data], ...rest };

    const result = deserialize(arrayResp);

    const { data: expectedData, ...expectedRest } = expectedResponse;
    const expectedArrayResponse = {
      data: [expectedData, expectedData, expectedData],
      ...expectedRest,
    };

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

  it("should return empty array when relationship has neither meta nor data (to-many)", () => {
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
