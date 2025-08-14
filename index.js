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
  relationshipMetaKey
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
    // If no data is provided, and there is meta, attach meta directly on the relationship; otherwise skip
    if (relationship === undefined) {
      const transformedKey = transformFunc ? transformFunc(key) : key;
      if (relationshipContainer?.meta) {
        deserialized[transformedKey] = {
          [relationshipMetaKey]: transformKeys(
            relationshipContainer.meta,
            transformFunc
          ),
        };
      }
      // If no data and no meta, don't create the relationship property at all
      return;
    }
    if (!relationship) return;
    if (Array.isArray(relationship)) {
      deserialized[transformFunc ? transformFunc(key) : key] = relationship.map(
        (rel) => {
          const includedResource = findIncluded(included, rel.type, rel.id);
          return {
            ...deserializeResource(
              includedResource,
              included,
              transformFunc,
              relationshipMetaKey
            ),
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
        ...deserializeResource(
          includedResource,
          included,
          transformFunc,
          relationshipMetaKey
        ),
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
  const relationshipMetaKey = options.relationshipMetaKey || "meta";

  const { included, ...rest } = response;
  let data;

  if (Array.isArray(response.data)) {
    data = {
      ...transformKeys(rest, transformFunc),
      data: response.data.map((resource) =>
        deserializeResource(
          resource,
          included,
          transformFunc,
          relationshipMetaKey
        )
      ),
    };
  } else {
    const deserializedSingle = deserializeResource(
      response.data,
      included,
      transformFunc,
      relationshipMetaKey
    );
    const transformedRest = transformKeys(rest, transformFunc);
    data = {
      ...transformedRest,
      data: deserializedSingle,
    };
  }

  return removeUndefinedProperties(data);
};

module.exports = { deserialize };
