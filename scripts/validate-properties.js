const fs = require('fs');
const path = require('path');

console.log('🔍 Validating properties data...');

// Check if properties data exists
const propertiesPath = path.join(__dirname, '..', 'public', 'properties-data.json');
if (!fs.existsSync(propertiesPath)) {
  console.error('❌ properties-data.json not found');
  process.exit(1);
}

// Read and parse properties
let properties;
try {
  const data = fs.readFileSync(propertiesPath, 'utf8');
  properties = JSON.parse(data);
} catch (error) {
  console.error('❌ Failed to parse properties-data.json:', error.message);
  process.exit(1);
}

// Validate structure
if (!properties || typeof properties !== 'object') {
  console.error('❌ Properties data must be an object');
  process.exit(1);
}

console.log(`📊 Found ${Object.keys(properties).length} properties`);

let errors = [];
let warnings = [];

for (const [id, property] of Object.entries(properties)) {
  console.log(`\n🏠 Checking property: ${id}`);

  // Required fields
  const required = ['title', 'city', 'coords'];
  for (const field of required) {
    if (!property[field]) {
      errors.push(`${id}: Missing required field '${field}'`);
    }
  }

  // Validate coords (should be [lat, lng])
  if (property.coords) {
    if (!Array.isArray(property.coords) || property.coords.length !== 2) {
      errors.push(`${id}: coords must be [latitude, longitude] array`);
    } else {
      const [lat, lng] = property.coords;
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        errors.push(`${id}: coords values must be numbers`);
      }
      if (lat < -90 || lat > 90) {
        errors.push(`${id}: latitude must be between -90 and 90`);
      }
      if (lng < -180 || lng > 180) {
        errors.push(`${id}: longitude must be between -180 and 180`);
      }
    }
  }

  // Optional validations with warnings
  if (!property.price || typeof property.price !== 'number') {
    warnings.push(`${id}: price should be a number`);
  }

  if (!property.status || !['Available', 'Coming Soon'].includes(property.status)) {
    warnings.push(`${id}: status should be 'Available' or 'Coming Soon'`);
  }

  if (!property.img) {
    warnings.push(`${id}: img field recommended for gallery grid`);
  }

  if (property.link && !property.link.startsWith('projects/')) {
    warnings.push(`${id}: link should start with 'projects/'`);
  }
}

// Report results
if (errors.length > 0) {
  console.log('\n❌ ERRORS:');
  errors.forEach(error => console.log(`  ${error}`));
  process.exit(1);
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  warnings.forEach(warning => console.log(`  ${warning}`));
}

console.log('\n✅ Properties validation passed!');
console.log('📝 Properties ready for mapping and display');
