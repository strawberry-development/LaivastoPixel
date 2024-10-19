import LaivastoPixel from '../lib/laivastoPixel.js';
let pixelMaster = new LaivastoPixel();

document.getElementById('refreshLink').addEventListener('click', function (event) {
    event.preventDefault();
    location.reload();
});

// TODO
// Refractor this code into the library

const switchButton = document.getElementById('switchButton');
const imageCanvas = document.getElementById('laivasto-imageCanvas');
const pixelCanvas = document.getElementById('laivasto-pixelCanvas');
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