/**
 * LaivastoPixel - A Pixel Art Generator Library by 'Strawberry-development'.
 * Version: 1.0.0
 * License: GNU
 *
 * This library allows you to convert images into pixel art, adjust settings (brightness, contrast), and
 * export the pixelated images. It also offers a grid toggle and customizable color palette for the user.
 */

class LaivastoPixel {
    constructor(imageCanvas, pixelCanvas, controls) {
        this.imageCanvas = imageCanvas;
        this.pixelCanvas = pixelCanvas;

        // Ensure the canvas elements are valid
        if (!this.imageCanvas || !this.pixelCanvas) {
            throw new Error('Canvas elements are required.');
        }

        this.ctxImage = this.imageCanvas.getContext('2d');
        this.ctxPixel = this.pixelCanvas.getContext('2d');

        this.controls = controls;  // Controls for pixel size, brightness, contrast, etc.

        this.originalImage = null;
        this.pixelSize = 10;
        this.brightness = 1;
        this.contrast = 1;
        this.colorPalette = 'default';

        // Store default values for reset
        this.defaultPixelSize = this.pixelSize;
        this.defaultBrightness = this.brightness;
        this.defaultContrast = this.contrast;
        this.defaultColorPalette = this.colorPalette;

        this.initEventListeners();
    }

    initEventListeners() {
        const { pixelSizeRange, brightnessRange, contrastRange, colorPaletteSelect } = this.controls;

        if (pixelSizeRange) {
            pixelSizeRange.addEventListener('input', () => this.setPixelSize(pixelSizeRange.value));
        }
        if (brightnessRange) {
            brightnessRange.addEventListener('input', () => this.setBrightness(brightnessRange.value));
        }
        if (contrastRange) {
            contrastRange.addEventListener('input', () => this.setContrast(contrastRange.value));
        }
        if (colorPaletteSelect) {
            colorPaletteSelect.addEventListener('change', () => this.setColorPalette(colorPaletteSelect.value));
        }
    }

    loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    this.imageCanvas.width = img.width;
                    this.imageCanvas.height = img.height;
                    this.ctxImage.drawImage(img, 0, 0);
                    this.originalImage = this.ctxImage.getImageData(0, 0, img.width, img.height);
                    this.applyPixelation();
                    resolve();
                };
                img.onerror = reject;
            };
            reader.readAsDataURL(file);
        });
    }

    setPixelSize(size) {
        this.pixelSize = parseInt(size, 10);
        this.applyPixelation();
    }

    setBrightness(brightness) {
        this.brightness = parseFloat(brightness);
        this.applyPixelation();
    }

    setContrast(contrast) {
        this.contrast = parseFloat(contrast);
        this.applyPixelation();
    }

    setColorPalette(palette) {
        this.colorPalette = palette;
        this.applyPixelation();
    }

    applyPixelation() {
        if (!this.originalImage) return;

        const pixelSize = this.pixelSize;
        const { width, height } = this.originalImage;

        this.pixelCanvas.width = width;
        this.pixelCanvas.height = height;
        this.ctxPixel.clearRect(0, 0, width, height);

        for (let y = 0; y < height; y += pixelSize) {
            for (let x = 0; x < width; x += pixelSize) {
                const pixelData = this.ctxImage.getImageData(x, y, pixelSize, pixelSize);
                const avgColor = this.getAverageColor(pixelData.data);
                const adjustedColor = this.adjustColor(avgColor);
                const paletteColor = this.applyPalette(adjustedColor);

                this.ctxPixel.fillStyle = `rgb(${paletteColor[0]}, ${paletteColor[1]}, ${paletteColor[2]})`;
                this.ctxPixel.fillRect(x, y, pixelSize, pixelSize);
            }
        }
    }

    getAverageColor(data) {
        let r = 0, g = 0, b = 0;
        const pixelCount = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
        }
        return [r / pixelCount, g / pixelCount, b / pixelCount];
    }

    adjustColor(color) {
        // Adjust color with brightness and contrast
        const [r, g, b] = color.map(c => this.contrast * (c * this.brightness));
        return [Math.min(255, Math.max(0, r)), Math.min(255, Math.max(0, g)), Math.min(255, Math.max(0, b))];
    }

    applyPalette(color) {
        const palettes = {
            default: color,
            grayscale: this.toGrayscale(color),
            pastel: this.toPastel(color)
        };

        return palettes[this.colorPalette] || color;
    }

    toGrayscale([r, g, b]) {
        const avg = (r + g + b) / 3;
        return [avg, avg, avg];
    }

    toPastel([r, g, b]) {
        return [Math.min(255, r + 100), Math.min(255, g + 100), Math.min(255, b + 100)];
    }

    resetCanvas() {
        if (!this.originalImage) return;

        // Reset image, pixelation, and all controls to their default values
        this.pixelSize = this.defaultPixelSize;
        this.brightness = this.defaultBrightness;
        this.contrast = this.defaultContrast;
        this.colorPalette = this.defaultColorPalette;

        if (this.controls.pixelSizeRange) this.controls.pixelSizeRange.value = this.defaultPixelSize;
        if (this.controls.brightnessRange) this.controls.brightnessRange.value = this.defaultBrightness;
        if (this.controls.contrastRange) this.controls.contrastRange.value = this.defaultContrast;
        if (this.controls.colorPaletteSelect) this.controls.colorPaletteSelect.value = this.defaultColorPalette;

        this.applyPixelation();
    }

    downloadImage() {
        const link = document.createElement('a');
        link.href = this.pixelCanvas.toDataURL('image/png');
        link.download = 'pixelated_image.png';
        link.click();
    }
}

export default LaivastoPixel;