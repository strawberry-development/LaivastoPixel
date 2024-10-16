import LaivastoPixel from '../lib/laivastoPixel.js';

const imageInput = document.getElementById('imageInput');
const uploadImageBtn = document.getElementById('uploadImageBtn');
const imageCanvas = document.getElementById('imageCanvas');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');

let pixelMaster = new LaivastoPixel();

uploadImageBtn.addEventListener('click', () => imageInput.click());

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        pixelMaster.loadImage(file)
            .then(() => {
                // Enable controls after the image is successfully loaded
                enableControls(true);
            })
            .catch(err => console.error('Error loading image:', err));
    }
});

// Pixel size control
pixelSizeRange.addEventListener('input', () => {
    document.getElementById('pixelSizeValue').textContent = pixelSizeRange.value;
    pixelMaster.setPixelSize(pixelSizeRange.value);
});

// Brightness control
brightnessRange.addEventListener('input', () => {
    document.getElementById('brightnessValue').textContent = brightnessRange.value;
    pixelMaster.setBrightness(brightnessRange.value);
});

// Contrast control
contrastRange.addEventListener('input', () => {
    document.getElementById('contrastValue').textContent = contrastRange.value;
    pixelMaster.setContrast(contrastRange.value);
});

// Color palette control
colorPaletteSelect.addEventListener('change', () => {
    pixelMaster.setColorPalette(colorPaletteSelect.value);
});

// Reset button
resetBtn.addEventListener('click', () => {
    pixelMaster.resetCanvas();
});

// Download button
downloadBtn.addEventListener('click', () => {
    pixelMaster.downloadImage();
});

// Function to enable/disable controls
function enableControls(enable) {
    pixelSizeRange.disabled = !enable;
    brightnessRange.disabled = !enable;
    contrastRange.disabled = !enable;
    colorPaletteSelect.disabled = !enable;
    resetBtn.disabled = !enable;
    downloadBtn.disabled = !enable;

    // Remove or add 'disabled' class to visually indicate button state
    resetBtn.classList.toggle('disabled', !enable);
    downloadBtn.classList.toggle('disabled', !enable);
}