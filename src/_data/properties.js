// src/_data/properties.js
const propertiesData = require('./properties.json');

module.exports = function() {
  const normalizedProperties = {};

  for (const [key, property] of Object.entries(propertiesData)) {
    normalizedProperties[key] = {
      ...property,
      // Fix URL path discrepancy - use /projects/ instead of /properties/
      url: `/projects/${property.slug}/`,
      link: `/projects/${property.slug}/`
    };
  }

  return normalizedProperties;
};

// Also export as an array for pagination
module.exports.propertiesArray = function() {
  const normalizedProperties = [];

  for (const [key, property] of Object.entries(propertiesData)) {
    normalizedProperties.push({
      ...property,
      // Fix URL path discrepancy - use /projects/ instead of /properties/
      url: `/projects/${property.slug}/`,
      link: `/projects/${property.slug}/`
    });
  }

  return normalizedProperties;
};
