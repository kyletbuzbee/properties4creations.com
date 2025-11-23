#!/bin/bash
# Image HTML Converter - Converts <img> tags to <picture> elements with WebP support
# Usage: ./convert-images.sh [file.html]

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if file provided
if [ -z "$1" ]; then
    echo -e "${RED}Usage: $0 <html-file>${NC}"
    echo "Example: $0 index.html"
    exit 1
fi

FILE=$1

# Check if file exists
if [ ! -f "$FILE" ]; then
    echo -e "${RED}Error: File '$FILE' not found${NC}"
    exit 1
fi

# Backup original
cp "$FILE" "${FILE}.backup"
echo -e "${GREEN}✓ Backup created: ${FILE}.backup${NC}"

# Function to convert img tag to picture element
convert_img() {
    local img_src=$1
    local img_alt=$2
    local filename=$(basename "$img_src")
    local name="${filename%.*}"
    local ext="${filename##*.}"
    
    # Create WebP filename
    local webp_file="${img_src%.*}.webp"
    
    # Create picture element
    local picture="<picture>
  <source srcset=\"${webp_file}\" type=\"image/webp\">
  <source srcset=\"${img_src}\" type=\"image/${ext}\">
  <img src=\"${img_src}\" 
       alt=\"${img_alt}\"
       loading=\"lazy\"
       decoding=\"async\">
</picture>"
    
    echo "$picture"
}

# Count conversions
count=0

# Find all img tags and convert them
# This is a simplified version - for production use a proper HTML parser
sed -i.bak "s/<img src=\"\([^\"]*\)\" alt=\"\([^\"]*\)\"/<picture>\n  <source srcset=\"\1\" type=\"image\/webp\">\n  <source srcset=\"\1\" type=\"image\/jpeg\">\n  <img src=\"\1\" alt=\"\2\" loading=\"lazy\" decoding=\"async\">\n<\/picture>/g" "$FILE"

echo -e "${GREEN}✓ HTML file updated: $FILE${NC}"
echo -e "${YELLOW}Note: Review the changes and adjust WebP paths if needed${NC}"
