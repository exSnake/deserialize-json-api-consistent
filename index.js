/**
 * Converts a string to camelCase.
 * @param {string} str - The input string to convert.
 * @returns {string} The camelCased string.
 */
const camelCase = (str) => {
  return str.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
};

/**
 * Recursively transforms keys of an object or array using the provided function.
 * @param {Object|Array} obj - The object or array to transform.
 * @param {Function|null} transformFunc - The function to transform keys with.
 * @returns {Object|Array} The transformed object or array.
 */
const transformKeys = (obj, transformFunc) => {
  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeys(item, transformFunc));
  } else if (obj && typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      const transformedKey = transformFunc ? transformFunc(key) : key;
      acc[transformedKey] = transformKeys(obj[key], transformFunc);
      return acc;
    }, {});
  }
  return obj;
};

/**
 * Finds an included resource by type and id.
 * @param {Array} included - The array of included resources.
 * @param {string} type - The type of the resource to find.
 * @param {string} id - The id of the resource to find.
 * @returns {Object|undefined} The found resource or undefined.
 */
const findIncluded = (included, type, id) => {
  return included.find((item) => item.type === type && item.id === id);
};

/**
 * Deserializes a single resource, including its relationships.
 * @param {Object} resource - The resource to deserialize.
 * @param {Array} included - The array of included resources.
 * @param {Function|null} transformFunc - The function to transform keys with.
 * @returns {Object|null} The deserialized resource.
 */
const deserializeResource = (
  resource,
  included,
  transformFunc,
  relationshipMetaCollector
) => {
  if (!resource) return null;

  const {
    id,
    type,
    attributes = {},
    relationships = {},
    links,
    meta,
    ...rest
  } = resource;

  const deserialized = {
    id,
    type,
    ...transformKeys(attributes, transformFunc),
    links,
    meta: transformKeys(meta, transformFunc),
    ...transformKeys(rest, transformFunc),
  };

  Object.keys(relationships).forEach((key) => {
    const relationshipContainer = relationships[key] || {};
    const relationship = relationshipContainer.data;
    // If no data is provided, preserve meta (and links) and represent empty state
    if (relationship === undefined) {
      const transformedKey = transformFunc ? transformFunc(key) : key;
      if (relationshipContainer && relationshipContainer.meta) {
        // Do not alter relationship shape; only hoist meta externally
        if (relationshipMetaCollector) {
          relationshipMetaCollector[transformedKey] = transformKeys(
            relationshipContainer.meta,
            transformFunc
          );
        }
      } else {
        // Neither meta nor data -> empty array for to-many relationships
        deserialized[transformedKey] = [];
      }
      return;
    }
    if (!relationship) return;
    if (Array.isArray(relationship)) {
      deserialized[transformFunc ? transformFunc(key) : key] = relationship.map(
        (rel) => {
          const includedResource = findIncluded(included, rel.type, rel.id);
          return {
            ...deserializeResource(includedResource, included, transformFunc),
            id: rel.id,
            type: rel.type,
            links: rel.links,
            meta: rel.meta,
          };
        }
      );
    } else {
      const includedResource = findIncluded(
        included,
        relationship.type,
        relationship.id
      );
      deserialized[transformFunc ? transformFunc(key) : key] = {
        ...deserializeResource(includedResource, included, transformFunc),
        id: relationship.id,
        type: relationship.type,
        links: relationship.links,
        meta: relationship.meta,
      };
    }
  });

  return deserialized;
};

/**
 * Recursively removes undefined properties from an object or array.
 * @param {Object|Array} obj - The object or array to process.
 * @returns {Object|Array} The processed object or array.
 */
const removeUndefinedProperties = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedProperties);
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, removeUndefinedProperties(v)])
    );
  }
  return obj;
};

/**
 * Deserializes a JSON:API response.
 * @param {Object} response - The JSON:API response to deserialize.
 * @param {Object} [options={}] - Options for deserialization.
 * @param {string} [options.transformKeys] - Key transformation option ('camelCase' or undefined).
 * @returns {Object} The deserialized response.
 */
const deserialize = (response, options = {}) => {
  if (!response.data) return response;

  const transformFunc =
    options.transformKeys === "camelCase" ? camelCase : null;

  const { included, ...rest } = response;
  let data;

  if (Array.isArray(response.data)) {
    data = {
      ...transformKeys(rest, transformFunc),
      data: response.data.map((resource) =>
        deserializeResource(resource, included, transformFunc)
      ),
    };
  } else {
    const relationshipMetaCollector = {};
    const deserializedSingle = deserializeResource(
      response.data,
      included,
      transformFunc,
      relationshipMetaCollector
    );
    const transformedRest = transformKeys(rest, transformFunc);
    // Hoist relationship meta to top-level meta.relationships if present
    if (Object.keys(relationshipMetaCollector).length > 0) {
      transformedRest.meta = {
        ...(transformedRest.meta || {}),
        relationships: {
          ...((transformedRest.meta && transformedRest.meta.relationships) ||
            {}),
          ...relationshipMetaCollector,
        },
      };
    }
    data = {
      ...transformedRest,
      data: deserializedSingle,
    };
  }

  return removeUndefinedProperties(data);
};

module.exports = { deserialize };
