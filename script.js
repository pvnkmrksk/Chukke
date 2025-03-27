// Default color configurations
const defaultColors = [
  { letter: 'C', color: '#00FFFF' }, // Cyan
  { letter: 'M', color: '#FF00FF' }, // Magenta
  { letter: 'Y', color: '#FFFF00' }, // Yellow
  { letter: 'K', color: '#000000' }, // Black
  { letter: 'R', color: '#FF0000' }, // Red
  { letter: 'G', color: '#00FF00' }, // Green
  { letter: 'B', color: '#0000FF' }, // Blue
  { letter: 'W', color: '#FFFFFF' }  // White
];

// Initialize color pickers and sync with letters
document.addEventListener('DOMContentLoaded', function() {
  // Setup number of colors input
  setupSliderNumberPair('numColorsSlider', 'numColors');
  document.getElementById('numColors').addEventListener('input', updateColorFields);
  document.getElementById('numColorsSlider').addEventListener('input', updateColorFields);
  
  // Setup the marker color picker
  setupColorPicker('markerColor', '#pickerMarker .color-display');
  
  // Generate initial color fields
  updateColorFields();
  
  // Setup all slider-number pairs
  setupSliderNumberPair('tileSizeSlider', 'tileSize');
  setupSliderNumberPair('tileMarginSlider', 'tileMargin');
  setupSliderNumberPair('linePaddingSlider', 'linePadding');
  setupSliderNumberPair('tileRowsSlider', 'tileRows');
  setupSliderNumberPair('tileColsSlider', 'tileCols');
  setupSliderNumberPair('startSeqSlider', 'startSeq');
  setupSliderNumberPair('customWidthSlider', 'customWidth');
  setupSliderNumberPair('customHeightSlider', 'customHeight');
  
  // Add change event for rows and columns to validate against max tags
  document.getElementById('tileRows').addEventListener('change', validateTotalTags);
  document.getElementById('tileCols').addEventListener('change', validateTotalTags);
  document.getElementById('numColors').addEventListener('change', validateTotalTags);
});

// Function to validate total tag count against maximum possible
function validateTotalTags() {
  const numColors = parseInt(document.getElementById('numColors').value);
  const rows = parseInt(document.getElementById('tileRows').value);
  const cols = parseInt(document.getElementById('tileCols').value);
  const startSeq = parseInt(document.getElementById('startSeq').value);
  
  const maxPossibleTags = Math.pow(numColors, 4);
  const totalTags = rows * cols;
  const endSeq = startSeq + totalTags - 1;
  
  // Check if we're trying to generate more tags than possible
  if (endSeq >= maxPossibleTags) {
    // Adjust the values
    const warningElement = document.getElementById('maxTagsWarning');
    if (!warningElement) {
      const helpText = document.querySelector('.help-text');
      const warning = document.createElement('div');
      warning.id = 'maxTagsWarning';
      warning.className = 'error-message';
      warning.textContent = `Warning: Your settings would exceed the maximum possible tags (${maxPossibleTags}). Reducing to the maximum.`;
      helpText.parentNode.insertBefore(warning, helpText.nextSibling);
    } else {
      warningElement.textContent = `Warning: Your settings would exceed the maximum possible tags (${maxPossibleTags}). Reducing to the maximum.`;
    }
  } else {
    // Remove warning if it exists
    const warningElement = document.getElementById('maxTagsWarning');
    if (warningElement) {
      warningElement.remove();
    }
  }
}

// Function to update color fields based on number of colors
function updateColorFields() {
  const numColors = parseInt(document.getElementById('numColors').value);
  const colorFieldsContainer = document.getElementById('colorFields');
  const maxTags = Math.pow(numColors, 4);
  
  // Update display
  document.getElementById('colorCountDisplay').textContent = numColors;
  document.getElementById('maxTagsDisplay').textContent = maxTags;
  
  // Update max value for start sequence
  const startSeqSlider = document.getElementById('startSeqSlider');
  const startSeqInput = document.getElementById('startSeq');
  const maxSeq = maxTags - 1;
  startSeqSlider.max = maxSeq;
  
  // If current value exceeds max, adjust it
  if (parseInt(startSeqInput.value) > maxSeq) {
    startSeqInput.value = maxSeq;
    startSeqSlider.value = maxSeq;
  }
  
  // Clear existing fields
  colorFieldsContainer.innerHTML = '';
  
  // Create new color fields
  for (let i = 0; i < numColors; i++) {
    const fieldId = `color${i}`;
    const letterId = `letter${i}`;
    
    const fieldHtml = `
      <div class="form-group">
        <label for="${letterId}" data-tooltip="Letter for color ${i+1}">Color ${i+1} Letter:</label>
        <input type="text" id="${letterId}" value="${defaultColors[i].letter}" maxlength="1" title="Single letter to identify this color">
        <div class="color-picker" id="picker${i}" title="Color ${i+1}">
          <input type="color" id="${fieldId}" value="${defaultColors[i].color}" class="color-picker-input">
          <div class="color-display" style="background-color: ${defaultColors[i].color};">${defaultColors[i].letter}</div>
        </div>
      </div>
    `;
    
    // Add to container
    colorFieldsContainer.innerHTML += fieldHtml;
  }
  
  // Initialize the new color pickers
  for (let i = 0; i < numColors; i++) {
    setupColorPicker(`color${i}`, `#picker${i} .color-display`, `letter${i}`);
  }
  
  // Validate total tags against the new max
  validateTotalTags();
}

// Function to setup color picker behavior
function setupColorPicker(colorInputId, displaySelector, letterInputId) {
  const colorInput = document.getElementById(colorInputId);
  const display = document.querySelector(displaySelector);
  const letterInput = letterInputId ? document.getElementById(letterInputId) : null;
  
  if (!colorInput || !display) return; // In case elements don't exist yet
  
  // Update display when color changes
  colorInput.addEventListener('input', function() {
    display.style.backgroundColor = this.value;
    // Auto-adjust text color based on background brightness
    const rgb = hexToRgb(this.value);
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    display.style.color = brightness > 125 ? '#000000' : '#ffffff';
  });
  
  // Update letter on display when letter input changes
  if (letterInput) {
    letterInput.addEventListener('input', function() {
      display.textContent = this.value || ' ';
    });
  }
}

function generateSVG() {
  // Get number of colors
  const numColors = parseInt(document.getElementById('numColors').value);
  
  // Collect all color mappings
  const colorMappings = [];
  for (let i = 0; i < numColors; i++) {
    const letter = document.getElementById(`letter${i}`).value || defaultColors[i].letter;
    const color = document.getElementById(`color${i}`).value;
    colorMappings.push({ letter, color });
  }

  // Canvas selection
  let canvasOption = document.getElementById('canvasSize').value;
  let pageWidth, pageHeight;
  switch (canvasOption) {
    case "A4":
      pageWidth = 210; pageHeight = 297; break;
    case "Letter":
      pageWidth = 216; pageHeight = 279; break;
    case "A3":
      pageWidth = 297; pageHeight = 420; break;
    case "A5":
      pageWidth = 148; pageHeight = 210; break;
    case "A6":
      pageWidth = 105; pageHeight = 148; break;
    case "4x6":
      pageWidth = 101.6; pageHeight = 152.4; break;
    case "Custom":
      pageWidth  = parseFloat(document.getElementById('customWidth').value);
      pageHeight = parseFloat(document.getElementById('customHeight').value);
      break;
    default:
      pageWidth = 210; pageHeight = 297;
  }

  // Tile & layout settings
  const tileSize  = parseFloat(document.getElementById('tileSize').value);
  const tileMargin= parseFloat(document.getElementById('tileMargin').value);
  const rows      = parseInt(document.getElementById('tileRows').value);
  const cols      = parseInt(document.getElementById('tileCols').value);
  const linePad   = parseFloat(document.getElementById('linePadding').value);
  const startSeq  = parseInt(document.getElementById('startSeq').value);

  // Marker options
  const includeNotch  = document.getElementById('includeNotch').checked;
  const includeLine   = document.getElementById('includeLine').checked;
  const showText      = document.getElementById('showText').checked;
  const markerColor   = document.getElementById('markerColor').value;

  // Compute horizontal line gap & thickness as a fraction of tileSize
  const gap       = includeLine ? tileSize * (linePad / 100) : 0;
  const thickness = includeLine ? tileSize * (linePad / 100) : 0;

  // Space between the bottom of any marker and the text
  const textGap = tileSize * 0.1; // Increased from 0.05 to 0.1 to move text lower

  // The total vertical space for markers & text below the tile
  const markerSpace = includeLine ? (gap + thickness + (showText ? textGap : 0)) : (showText ? textGap : 0);

  // Cell dimensions
  const cellWidth  = tileSize + tileMargin;
  const cellHeight = tileSize + markerSpace + tileMargin;

  // Page margin
  const pageMargin = 10;
  const startX = pageMargin;
  const startY = pageMargin;

  // Calculate maximum possible unique tags
  const maxPossibleTags = Math.pow(numColors, 4);
  
  // Start building the SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}mm" height="${pageHeight}mm" viewBox="0 0 ${pageWidth} ${pageHeight}">`;
  // Optional dashed border around the page
  svg += `<rect x="0" y="0" width="${pageWidth}" height="${pageHeight}" fill="white" stroke="#ccc" stroke-dasharray="2,2" />`;

  // Store tag SVGs for PNG export
  window.tagSVGs = [];

  // Generate each tile
  let tileIndex = 0;
  let tilesGenerated = 0;
  const maxTilesToGenerate = rows * cols;
  
  // Check if we would exceed maximum possible tags
  if (startSeq + maxTilesToGenerate > maxPossibleTags) {
    // Alert user or show a message
    const warningElement = document.getElementById('maxTagsWarning');
    if (!warningElement) {
      const svgContainer = document.getElementById('svgContainer');
      svgContainer.innerHTML = `<p class="error-message">Warning: Your settings would exceed the maximum possible tags (${maxPossibleTags}). 
                              Only generating up to the maximum possible.</p>` + svgContainer.innerHTML;
    }
  }
  
  for (let r = 0; r < rows && tilesGenerated < maxTilesToGenerate; r++) {
    for (let c = 0; c < cols && tilesGenerated < maxTilesToGenerate; c++) {
      // If we would exceed the maximum possible tags, stop generating
      if (startSeq + tileIndex >= maxPossibleTags) {
        break;
      }
      
      // Position of this tile
      const tileX = startX + c * cellWidth;
      const tileY = startY + r * cellHeight;

      // Convert (startSeq + tileIndex) to a base-n code
      const baseValue = startSeq + tileIndex;
      const codeDigits = toBaseN(baseValue, numColors);

      // Build the letter code based on color mappings
      let codeLetters = "";
      for (let d = 0; d < 4; d++) {
        const digit = parseInt(codeDigits[d]);
        if (digit < numColors) {
          codeLetters += colorMappings[digit].letter;
        } else {
          codeLetters += "?"; // Fallback for invalid digits
        }
      }

      // Sequence number
      const overallNumber = baseValue;
      const labelText = codeLetters + " - " + overallNumber;

      // Start a group for the tile
      svg += `<g transform="translate(${tileX},${tileY})">`;

      // 2x2 quadrants
      const half = tileSize / 2;
      // codeDigits[0] => top-left, codeDigits[1] => top-right, etc.
      const digitTL = parseInt(codeDigits[0]);
      const digitTR = parseInt(codeDigits[1]);
      const digitBL = parseInt(codeDigits[2]);
      const digitBR = parseInt(codeDigits[3]);

      svg += `<rect x="0"     y="0"      width="${half}" height="${half}" fill="${colorMappings[digitTL].color}" />`;
      svg += `<rect x="${half}" y="0"      width="${half}" height="${half}" fill="${colorMappings[digitTR].color}" />`;
      svg += `<rect x="0"     y="${half}" width="${half}" height="${half}" fill="${colorMappings[digitBL].color}" />`;
      svg += `<rect x="${half}" y="${half}" width="${half}" height="${half}" fill="${colorMappings[digitBR].color}" />`;

      // Notch marker (top-left corner)
      if (includeNotch) {
        const notchSize = tileSize / 4;
        svg += `<polygon points="0,0 ${notchSize},0 0,${notchSize}" fill="${markerColor}" />`;
      }

      // Horizontal line marker
      if (includeLine) {
        svg += `<line x1="0" y1="${tileSize + gap}" x2="${tileSize}" y2="${tileSize + gap}" stroke="${markerColor}" stroke-width="${thickness}" />`;
      }

      // Improved scaling for text size
      // For very small markers, reduce the text size more aggressively
      let fontSize;
      if (tileSize < 5) {
        fontSize = Math.max(0.5, tileSize * 0.08); // More aggressive scaling for tiny tiles
      } else {
        fontSize = Math.max(1, tileSize * 0.12);
      }

      // Place text below markers with improved positioning
      if (showText) {
        // Calculate the proper y-position based on marker existence with improved position
        // Move text significantly lower (100% more of text height)
        const textHeight = fontSize * 1.2; // Approximate text height
        const yText = tileSize + (includeLine ? (gap + thickness + textGap) : textGap) + textHeight;
        
        // Always show the full text, but adjust for small sizes if needed
        let displayText = labelText;
        
        // Add text with proper alignment that stays within the marker width
        // Only constrain text width if necessary, not by default
        svg += `<text x="0" y="${yText}" font-size="${fontSize}" fill="#333" text-anchor="start">${displayText}</text>`;
        
        // Add a second text with just dots in case we need to trim text width
        if (tileSize < 10) {
          // For very small tiles, add a fallback dots-only version that's constrained
          svg += `<text x="0" y="${yText}" font-size="${fontSize}" fill="#333" text-anchor="start" 
                  textLength="${tileSize}" lengthAdjust="spacingAndGlyphs" class="dots-only">${codeLetters}</text>`;
        }
      }

      svg += `</g>`; // end tile group
      
      // Store individual tag SVG for PNG export
      const individualSVG = generateIndividualTagSVG(
        tileSize, 
        colorMappings[digitTL].color,
        colorMappings[digitTR].color,
        colorMappings[digitBL].color,
        colorMappings[digitBR].color,
        markerColor,
        includeNotch,
        includeLine,
        thickness,
        gap,
        showText,
        codeLetters,
        overallNumber,
        fontSize,
        textGap
      );
      window.tagSVGs.push({
        svg: individualSVG,
        id: overallNumber,
        codeLetters: codeLetters
      });
      
      tileIndex++;
      tilesGenerated++;
    }
  }
  
  // Add attribution text in bottom-right corner
  const attributionText = "pvnkmrksk.github.io/Chukke";
  const attributionFontSize = Math.max(2, pageWidth * 0.008); // Scale with page size but not too small
  svg += `<text x="${pageWidth - pageMargin}" y="${pageHeight - pageMargin / 2}" font-size="${attributionFontSize}" 
          fill="#cccccc" text-anchor="end" opacity="0.5">${attributionText}</text>`;

  svg += `</svg>`;

  // Show in preview
  document.getElementById('svgContainer').innerHTML = svg;
  window.generatedSVG = svg;
}

// Generate SVG for a single tag (for PNG export)
function generateIndividualTagSVG(
  tileSize, colorTL, colorTR, colorBL, colorBR, 
  markerColor, includeNotch, includeLine, thickness, gap, 
  showText, codeLetters, tagNumber, fontSize, textGap
) {
  // Add 10% padding to the edges
  const padding = tileSize * 0.1;
  const fullSize = tileSize + (padding * 2);
  
  // For text, add extra space at the bottom
  const textHeight = fontSize * 1.2; 
  const textSpace = showText ? textHeight + textGap : 0;
  const totalHeight = fullSize + (includeLine ? gap + thickness : 0) + textSpace;
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${fullSize}" height="${totalHeight}" viewBox="0 0 ${fullSize} ${totalHeight}">`;
  
  // Background
  svg += `<rect x="0" y="0" width="${fullSize}" height="${totalHeight}" fill="white"/>`;
  
  // Main tag with 10% padding
  const half = tileSize / 2;
  svg += `<rect x="${padding}" y="${padding}" width="${half}" height="${half}" fill="${colorTL}" />`;
  svg += `<rect x="${padding + half}" y="${padding}" width="${half}" height="${half}" fill="${colorTR}" />`;
  svg += `<rect x="${padding}" y="${padding + half}" width="${half}" height="${half}" fill="${colorBL}" />`;
  svg += `<rect x="${padding + half}" y="${padding + half}" width="${half}" height="${half}" fill="${colorBR}" />`;
  
  // Notch marker (top-left corner)
  if (includeNotch) {
    const notchSize = tileSize / 4;
    svg += `<polygon points="${padding},${padding} ${padding + notchSize},${padding} ${padding},${padding + notchSize}" fill="${markerColor}" />`;
  }
  
  // Horizontal line marker
  if (includeLine) {
    svg += `<line x1="${padding}" y1="${padding + tileSize + gap}" x2="${padding + tileSize}" y2="${padding + tileSize + gap}" 
            stroke="${markerColor}" stroke-width="${thickness}" />`;
  }
  
  // Text
  if (showText) {
    const yText = padding + tileSize + (includeLine ? gap + thickness + textGap : textGap) + textHeight;
    const labelText = `${codeLetters} - ${tagNumber}`;
    svg += `<text x="${padding}" y="${yText}" font-size="${fontSize}" fill="#333" text-anchor="start">${labelText}</text>`;
  }
  
  svg += `</svg>`;
  return svg;
}

function downloadSVG() {
  if (!window.generatedSVG) {
    alert("Please generate the SVG first.");
    return;
  }
  const blob = new Blob([window.generatedSVG], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  // Create a hidden link, click it, then remove it
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'Chukké_tags.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Download all tags as individual PNG files
async function downloadPNGs() {
  if (!window.tagSVGs || window.tagSVGs.length === 0) {
    alert("Please generate the tags first.");
    return;
  }
  
  // Show progress indicator
  const svgContainer = document.getElementById('svgContainer');
  const progressElement = document.createElement('div');
  progressElement.className = 'progress-message';
  progressElement.innerHTML = `<p>Preparing PNG files for download...</p>`;
  svgContainer.appendChild(progressElement);
  
  // Find the highest ID to determine padding length
  const maxId = Math.max(...window.tagSVGs.map(tag => tag.id));
  const paddingLength = maxId.toString().length;
  
  // Convert SVGs to PNGs
  const pngPromises = window.tagSVGs.map((tag, index) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = function() {
        // Create canvas to draw the image
        const canvas = document.createElement('canvas');
        const minSize = 256; // Minimum size for the PNG files
        
        // Calculate size while maintaining aspect ratio
        const svgWidth = img.width;
        const svgHeight = img.height;
        const aspectRatio = svgWidth / svgHeight;
        
        let canvasWidth, canvasHeight;
        if (aspectRatio >= 1) {
          // Wider than tall
          canvasWidth = Math.max(minSize, svgWidth);
          canvasHeight = canvasWidth / aspectRatio;
        } else {
          // Taller than wide
          canvasHeight = Math.max(minSize, svgHeight);
          canvasWidth = canvasHeight * aspectRatio;
        }
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the SVG image onto the canvas, maintaining aspect ratio
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to PNG
        const pngUrl = canvas.toDataURL('image/png');
        resolve({
          url: pngUrl,
          id: tag.id,
          codeLetters: tag.codeLetters
        });
      };
      
      // Create a data URL from the SVG
      const blob = new Blob([tag.svg], {type: 'image/svg+xml'});
      const url = URL.createObjectURL(blob);
      img.src = url;
    });
  });
  
  // Wait for all PNGs to be created
  const pngs = await Promise.all(pngPromises);
  
  // Update progress
  progressElement.innerHTML = `<p>Downloading ${pngs.length} PNG files...</p>`;
  
  // Download each PNG
  for (let i = 0; i < pngs.length; i++) {
    const png = pngs[i];
    const a = document.createElement('a');
    a.href = png.url;
    // Pad ID with leading zeros for proper sorting
    const paddedId = png.id.toString().padStart(paddingLength, '0');
    a.download = `Chukke_${paddedId}_${png.codeLetters}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Add a small delay between downloads to prevent browser issues
    if (i < pngs.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    progressElement.innerHTML = `<p>Downloading: ${i + 1} of ${pngs.length} files...</p>`;
  }
  
  // Download complete
  progressElement.innerHTML = `<p>Download complete! ${pngs.length} PNG files have been saved.</p>`;
  setTimeout(() => {
    progressElement.remove();
  }, 5000);
} 