#!/data/data/com.termux/files/usr/bin/bash

URL=${1:-"http://localhost:3000/example-ui.html"}
OUTPUT=${2:-"screenshots/current/curl-capture.html"}

echo "📸 Capturing HTML from $URL..."
mkdir -p screenshots/current

# Capture HTML
curl -s "$URL" > "$OUTPUT"

# Extract important info
echo "📋 Page Analysis:"
echo "Title: $(grep -o '<title>.*</title>' "$OUTPUT" | sed 's/<[^>]*>//g')"
echo "Meta Description: $(grep -o 'name="description" content="[^"]*"' "$OUTPUT" | sed 's/.*content="//;s/"//')"
echo "Headers: $(grep -o '<h[1-6]>.*</h[1-6]>' "$OUTPUT" | wc -l) found"
echo "Images: $(grep -o '<img' "$OUTPUT" | wc -l) found"
echo "Links: $(grep -o '<a' "$OUTPUT" | wc -l) found"

echo "✅ HTML saved to: $OUTPUT"
