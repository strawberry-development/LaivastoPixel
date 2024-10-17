import LaivastoPixel from '../lib/laivastoPixel.js';
let pixelMaster = new LaivastoPixel();

// TODO
// Refractor this code into the library

const switchButton = document.getElementById('switchButton');
const imageCanvas = document.getElementById('imageCanvas');
const pixelCanvas = document.getElementById('pixelCanvas');
const canvasStatus = document.getElementById('canvasStatus');

switchButton.addEventListener('click', function() {
    if (imageCanvas.style.display === 'none') {
        imageCanvas.style.display = 'block';
        pixelCanvas.style.display = 'none';
        canvasStatus.textContent = 'Image Canvas';
    } else {
        imageCanvas.style.display = 'none';
        pixelCanvas.style.display = 'block';
        canvasStatus.textContent = 'Pixel Canvas';
    }
});