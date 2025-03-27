// Helper function to convert hex to RGB
function hexToRgb(hex) {
  // Remove the # if present
  hex = hex.replace(/^#/, '');
  
  // Parse the components
  let bigint = parseInt(hex, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;
  
  return { r, g, b };
}

// Function to sync slider with number input
function setupSliderNumberPair(sliderId, numberId) {
  const slider = document.getElementById(sliderId);
  const number = document.getElementById(numberId);
  
  if (!slider || !number) return; // In case elements don't exist yet
  
  // Update number when slider changes
  slider.addEventListener('input', function() {
    number.value = this.value;
    if (numberId === 'numColors') {
      updateColorFields();
    }
  });
  
  // Update slider when number changes
  number.addEventListener('input', function() {
    slider.value = this.value;
    if (numberId === 'numColors') {
      updateColorFields();
    }
  });
}

// Convert an integer to a variable-base string with 4 digits
function toBaseN(num, base) {
  if (base <= 1) base = 2; // Minimum base is 2
  
  let result = "";
  let value = num;
  
  // Generate 4 digits
  for (let i = 0; i < 4; i++) {
    const digit = value % base;
    result = digit + result;
    value = Math.floor(value / base);
  }
  
  // Pad with leading zeros if needed
  while (result.length < 4) {
    result = "0" + result;
  }
  
  return result;
}

// Show/hide custom canvas fields
function toggleCustomCanvas() {
  const canvasSelect = document.getElementById("canvasSize").value;
  document.getElementById("customCanvas").style.display = 
    (canvasSelect === "Custom") ? "block" : "none";
} 