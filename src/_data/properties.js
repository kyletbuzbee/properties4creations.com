// Consolidated properties data processor
// Converts JSON data into Eleventy collections and provides data validation

module.exports = function() {
    const fs = require('fs');
    const path = require('path');

    // Load and validate properties data
    let propertiesData = {};
    try {
        const propertiesPath = path.join(__dirname, 'properties.json');
        propertiesData = JSON.parse(fs.readFileSync(propertiesPath, 'utf8'));
    } catch (error) {
        console.error('Error loading properties data:', error);
        // Create fallback data structure
        propertiesData = {};
    }

    // Validate and normalize property data
    const validatedProperties = {};
    const errors = [];

    Object.entries(propertiesData).forEach(([key, property]) => {
        try {
            // Required fields validation
            const requiredFields = ['id', 'slug', 'title', 'coords', 'price', 'bedrooms', 'bathrooms', 'sqft', 'city'];
            const missingFields = requiredFields.filter(field => !property[field]);

            if (missingFields.length > 0) {
                errors.push(`Property ${key}: Missing required fields: ${missingFields.join(', ')}`);
                return;
            }

            // Add defaults for optional fields
            const normalizedProperty = {
                ...property,
                status: property.status || 'Available',
                voucherType: property.voucherType || 'Standard',
                propertyType: property.propertyType || 'Residential',
                tags: property.tags || [],
                features: property.features || [],
                description: property.description || property.title,
                shortDesc: property.shortDesc || `${property.bedrooms} Bed • ${property.bathrooms} Bath`,
                img: property.img || 'properties/default.webp',
                coords: Array.isArray(property.coords) ? property.coords : [0, 0],
                banner: property.banner || {
                    image: 'hero-property-banner.webp',
                    title: property.title,
                    subtitle: property.description || '',
                    eyebrow: 'Available Now'
                }
            };

            // Add computed fields
            normalizedProperty.url = `/properties/${property.slug}/`;
            normalizedProperty.link = `/properties/${property.slug}/`;

            validatedProperties[key] = normalizedProperty;

        } catch (propertyError) {
            errors.push(`Property ${key}: Validation error - ${propertyError.message}`);
        }
    });

    // Log validation errors
    if (errors.length > 0) {
        console.warn('Property data validation errors:');
        errors.forEach(error => console.warn(`  ${error}`));
    }

    console.log(`✅ Processed ${Object.keys(validatedProperties).length} properties (${errors.length} errors)`);

    return validatedProperties;
};
