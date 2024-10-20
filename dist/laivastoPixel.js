/**
 * LaivastoPixel - A Pixel Art Generator Library by 'Strawberry-development'.
 * Version: 1.0.3
 * License: GNU
 *
 * This library allows you to convert images into pixel art, adjust settings (brightness, contrast), and
 * export the pixelated images. It also offers a grid toggle and customizable color palette for the user.
 */

export default class LaivastoPixel {
    constructor() {
        this.imageCanvas = document.getElementById('laivasto-imageCanvas');
        this.pixelCanvas = document.getElementById('laivasto-pixelCanvas');

        if (!this.imageCanvas || !this.pixelCanvas) {
            throw new Error('Canvas elements are required.');
        }

        this.ctxImage = this.imageCanvas.getContext('2d');
        this.ctxPixel = this.pixelCanvas.getContext('2d');

        if (!this.ctxImage || !this.ctxPixel) {
            throw new Error('Failed to get 2D context from canvas elements.');
        }

        this.controls = {
            imageInput: document.getElementById('laivasto-imageInput'),
            uploadImageBtn: document.getElementById('laivasto-uploadImageBtn'),
            resetBtn: document.getElementById('laivasto-resetBtn'),
            downloadBtn: document.getElementById('laivasto-downloadBtn'),
            pixelSizeRange: document.getElementById('laivasto-blockSizeRange'),
            brightnessRange: document.getElementById('laivasto-brightnessRange'),
            contrastRange: document.getElementById('laivasto-contrastRange'),
            colorPaletteSelect: document.getElementById('laivasto-filterSelect'),
            gridToggle: document.getElementById('laivasto-gridToggle')
        };

        this.defaultSettings = {
            pixelSize: 10,
            brightness: 1,
            contrast: 1,
            colorPalette: 'default',
            showGrid: false // Default grid toggle state
        };

        this.settings = { ...this.defaultSettings };
        this.originalImage = null;
        this.timer = null;

        this.resetCanvas();
        this.enableControls(false);
        this.initEventListeners();
    }

    initEventListeners() {
        const {
            imageInput, uploadImageBtn, resetBtn, downloadBtn, pixelSizeRange, brightnessRange, contrastRange, colorPaletteSelect, gridToggle
        } = this.controls;

        uploadImageBtn.addEventListener('click', () => imageInput.click());

        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadImage(file).then(() => this.enableControls(true));
            }
        });

        const rangeInputs = [
            { range: pixelSizeRange, prop: 'blockSize', update: this.setPixelSize.bind(this) },
            { range: brightnessRange, prop: 'brightness', update: this.setBrightness.bind(this) },
            { range: contrastRange, prop: 'contrast', update: this.setContrast.bind(this) }
        ];

        rangeInputs.forEach(({ range, prop, update }) => {
            if (range) {
                range.addEventListener('input', () => {
                    document.getElementById(`laivasto-${prop}Value`).textContent = range.value;
                    this.debounce(() => update(range.value)); // Added debounce for performance
                });
            }
        });

        if (colorPaletteSelect) {
            colorPaletteSelect.addEventListener('change', () => {
                this.setColorPalette(colorPaletteSelect.value);
            });
        }

        resetBtn.addEventListener('click', () => this.resetCanvas());
        downloadBtn.addEventListener('click', () => this.downloadImage());

        // Added grid toggle event listener
        gridToggle.addEventListener('change', () => {
            this.setGridToggle(gridToggle.checked);
        });
    }

    enableControls(enable) {
        Object.values(this.controls).forEach(control => {
            if (control.tagName === 'BUTTON' || control.tagName === 'SELECT' || control.type === 'range' || control.type === 'checkbox') {
                if (control !== this.controls.uploadImageBtn) {
                    control.disabled = !enable;
                    control.classList.toggle('disabled', !enable);
                }
            }
        });
    }

    async loadImage(file) {
        try {
            const img = await this.readImageFile(file);
            this.imageCanvas.width = Math.floor(img.width / this.settings.pixelSize) * this.settings.pixelSize;
            this.imageCanvas.height = Math.floor(img.height / this.settings.pixelSize) * this.settings.pixelSize;
            this.ctxImage.drawImage(img, 0, 0, this.imageCanvas.width, this.imageCanvas.height);
            this.originalImage = this.ctxImage.getImageData(0, 0, this.imageCanvas.width, this.imageCanvas.height);
            this.applyPixelation();
        } catch (error) {
            console.error('Error loading image:', error);
            alert('Failed to load image. Please upload a valid image file.');
        }
    }

    readImageFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => resolve(img);
                img.onerror = reject;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    debounce(fn, delay = 50) {
        clearTimeout(this.timer);
        this.timer = setTimeout(fn, delay);
    }

    setPixelSize(size) {
        this.settings.pixelSize = Math.max(1, parseInt(size, 10));
        this.applyPixelation();
    }

    setBrightness(brightness) {
        this.settings.brightness = parseFloat(brightness);
        this.applyPixelation();
    }

    setContrast(contrast) {
        this.settings.contrast = parseFloat(contrast);
        this.applyPixelation();
    }

    setColorPalette(palette) {
        this.settings.colorPalette = palette;
        this.applyPixelation();
    }

    setGridToggle(showGrid) {
        this.settings.showGrid = showGrid;
        this.applyPixelation();
    }

    applyPixelation() {
        if (!this.originalImage) return;

        const { pixelSize, showGrid } = this.settings;
        const { width, height } = this.originalImage;
        this.pixelCanvas.width = width;
        this.pixelCanvas.height = height;
        this.ctxPixel.clearRect(0, 0, width, height);

        const imageData = this.originalImage.data;
        const numRows = Math.floor(height / pixelSize);
        const numCols = Math.floor(width / pixelSize);

        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                const startX = col * pixelSize;
                const startY = row * pixelSize;
                const color = [0, 0, 0];
                this.getAverageColor(imageData, startX, startY, width, pixelSize, color);
                const adjustedColor = this.adjustColor(color);
                const paletteColor = this.applyPalette(adjustedColor);
                this.ctxPixel.fillStyle = `rgb(${paletteColor.join(', ')})`;
                this.ctxPixel.fillRect(startX, startY, pixelSize, pixelSize);
            }
        }

        if (showGrid) {
            this.drawGrid();
        }
    }

    getAverageColor(data, startX, startY, width, pixelSize, color) {
        let r = 0, g = 0, b = 0;
        const pixelCount = pixelSize * pixelSize;
        const startIdx = (startY * width + startX) * 4;

        for (let y = 0; y < pixelSize; y++) {
            for (let x = 0; x < pixelSize; x++) {
                const idx = startIdx + (y * width + x) * 4;
                r += data[idx];
                g += data[idx + 1];
                b += data[idx + 2];
            }
        }

        color[0] = r / pixelCount;
        color[1] = g / pixelCount;
        color[2] = b / pixelCount;
    }

    adjustColor([r, g, b]) {
        const { brightness, contrast } = this.settings;
        return [r, g, b].map(v => Math.min(255, Math.max(0, Math.round(contrast * v * brightness))));
    }

    applyPalette(color) {
        const paletteTransforms = {
            grayscale: this.toGrayscale,
            pastel: this.toPastel,
            negative: this.toNegative,
            sepia: this.toSepia,
            vibrant: this.toVibrant,
            retro: this.toRetro,
            neon: this.toNeon,
            muted: this.toMuted,
            warm: this.toWarm,
            cool: this.toCool,
            vintage: this.toVintage,
            highContrast: this.toHighContrast,
            nightMode: this.toNightMode,
            blackAndWhite: this.toBlackAndWhite,
            solarized: this.toSolarized
        };

        const transform = paletteTransforms[this.settings.colorPalette];
        return transform ? transform(color) : color;
    }

    // Palette transformations
    toGrayscale([r, g, b]) {
        const avg = (r + g + b) / 3;
        return [avg, avg, avg];
    }

    toPastel([r, g, b]) {
        return [Math.min(255, r + 100), Math.min(255, g + 100), Math.min(255, b + 100)];
    }

    toNegative([r, g, b]) {
        return [255 - r, 255 - g, 255 - b];
    }

    toSepia([r, g, b]) {
        return [
            Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b),
            Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b),
            Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b)
        ];
    }

    toVibrant([r, g, b]) {
        return [Math.min(255, r * 1.2), Math.min(255, g * 1.2), Math.min(255, b * 1.2)];
    }

    toRetro([r, g, b]) {
        return [r < 128 ? r * 1.2 : r * 0.8, g < 128 ? g * 1.2 : g * 0.8, b < 128 ? b * 1.2 : b * 0.8];
    }

    toNeon([r, g, b]) {
        return [Math.min(255, r + 100), Math.min(255, g + 100), Math.min(255, b + 100)];
    }

    toMuted([r, g, b]) {
        return [r * 0.8, g * 0.8, b * 0.8];
    }

    toWarm([r, g, b]) {
        return [Math.min(255, r + 50), g, Math.max(0, b - 50)];
    }

    toCool([r, g, b]) {
        return [Math.max(0, r - 50), g, Math.min(255, b + 50)];
    }

    toVintage([r, g, b]) {
        return [
            Math.min(255, r * 0.9 + 40),
            Math.min(255, g * 0.85 + 30),
            Math.min(255, b * 0.7 + 20)
        ];
    }

    toHighContrast([r, g, b]) {
        return [
            r > 128 ? Math.min(255, r * 1.5) : Math.max(0, r * 0.5),
            g > 128 ? Math.min(255, g * 1.5) : Math.max(0, g * 0.5),
            b > 128 ? Math.min(255, b * 1.5) : Math.max(0, b * 0.5)
        ];
    }

    toNightMode([r, g, b]) {
        return [
            Math.max(0, r * 0.5),
            Math.max(0, g * 0.5),
            Math.min(255, b * 1.5)
        ];
    }

    toBlackAndWhite([r, g, b]) {
        const avg = (r + g + b) / 3;
        return avg > 128 ? [255, 255, 255] : [0, 0, 0];
    }

    toSolarized([r, g, b]) {
        return [
            r > 128 ? 255 - r : r * 1.2,
            g > 128 ? 255 - g : g * 1.2,
            b > 128 ? 255 - b : b * 1.2
        ];
    }

    resetCanvas() {
        this.settings = { ...this.defaultSettings };
        this.applyControls();
        this.applyPixelation();
    }

    applyControls() {
        const { pixelSizeRange, brightnessRange, contrastRange, colorPaletteSelect, gridToggle } = this.controls;
        const { pixelSize, brightness, contrast, colorPalette, showGrid } = this.settings;

        if (pixelSizeRange) pixelSizeRange.value = pixelSize;
        if (brightnessRange) brightnessRange.value = brightness;
        if (contrastRange) contrastRange.value = contrast;
        if (colorPaletteSelect) colorPaletteSelect.value = colorPalette;
        if (gridToggle) gridToggle.checked = showGrid;

        document.getElementById('laivasto-blockSizeValue').textContent = pixelSize;
        document.getElementById('laivasto-brightnessValue').textContent = brightness;
        document.getElementById('laivasto-contrastValue').textContent = contrast;
    }

    downloadImage() {
        const link = document.createElement('a');
        link.href = this.pixelCanvas.toDataURL('image/png');
        link.download = 'pixelated_image.png';
        link.click();
    }

    drawGrid() {
        const { pixelSize } = this.settings;
        const { width, height } = this.pixelCanvas;
        this.ctxPixel.strokeStyle = 'rgba(0, 0, 0, 0.1)'; // Light grid lines

        for (let x = 0; x < width; x += pixelSize) {
            this.ctxPixel.beginPath();
            this.ctxPixel.moveTo(x, 0);
            this.ctxPixel.lineTo(x, height);
            this.ctxPixel.stroke();
        }

        for (let y = 0; y < height; y += pixelSize) {
            this.ctxPixel.beginPath();
            this.ctxPixel.moveTo(0, y);
            this.ctxPixel.lineTo(width, y);
            this.ctxPixel.stroke();
        }
    }
}