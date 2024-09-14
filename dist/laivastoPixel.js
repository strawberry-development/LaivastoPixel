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

        if (!this.imageCanvas || !this.pixelCanvas) {
            throw new Error('Canvas elements are required.');
        }

        this.ctxImage = this.imageCanvas.getContext('2d');
        this.ctxPixel = this.pixelCanvas.getContext('2d');

        this.controls = controls;

        this.originalImage = null;
        this.pixelSize = 10;
        this.brightness = 1;
        this.contrast = 1;
        this.colorPalette = 'default';

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
            reader.onload = e => {
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

        const imageData = this.originalImage.data;
        const numPixels = (width / pixelSize) * (height / pixelSize);
        const color = [0, 0, 0];

        for (let y = 0; y < height; y += pixelSize) {
            for (let x = 0; x < width; x += pixelSize) {
                this.getAverageColor(imageData, x, y, width, pixelSize, color);
                const adjustedColor = this.adjustColor(color);
                const paletteColor = this.applyPalette(adjustedColor);

                this.ctxPixel.fillStyle = `rgb(${paletteColor[0]}, ${paletteColor[1]}, ${paletteColor[2]})`;
                this.ctxPixel.fillRect(x, y, pixelSize, pixelSize);
            }
        }
    }

    getAverageColor(data, startX, startY, width, pixelSize, color) {
        let r = 0, g = 0, b = 0;
        const pixelCount = pixelSize * pixelSize;
        const startIdx = (startY * width + startX) * 4;

        for (let y = 0; y < pixelSize; y++) {
            for (let x = 0; x < pixelSize; x++) {
                const idx = startIdx + ((y * width) + x) * 4;
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
        return [
            Math.min(255, Math.max(0, this.contrast * (r * this.brightness))),
            Math.min(255, Math.max(0, this.contrast * (g * this.brightness))),
            Math.min(255, Math.max(0, this.contrast * (b * this.brightness)))
        ];
    }

    applyPalette(color) {
        const palettes = {
            default: color,
            grayscale: this.toGrayscale(color),
            pastel: this.toPastel(color),
            negative: this.toNegative(color),
            sepia: this.toSepia(color),
            vibrant: this.toVibrant(color),
            retro: this.toRetro(color),
            neon: this.toNeon(color),
            muted: this.toMuted(color)
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
        return [
            Math.min(255, r * 1.2),
            Math.min(255, g * 1.2),
            Math.min(255, b * 1.2)
        ];
    }

    toRetro([r, g, b]) {
        return [
            r < 128 ? r * 1.2 : r * 0.8,
            g < 128 ? g * 1.2 : g * 0.8,
            b < 128 ? b * 1.2 : b * 0.8
        ];
    }

    toNeon([r, g, b]) {
        return [
            Math.min(255, r + 100),
            Math.min(255, g + 100),
            Math.min(255, b + 100)
        ];
    }

    toMuted([r, g, b]) {
        return [r * 0.8, g * 0.8, b * 0.8];
    }

    resetCanvas() {
        if (!this.originalImage) return;

        // Reset image, pixelation, and all controls to their default values
        this.pixelSize = this.defaultPixelSize;
        this.brightness = this.defaultBrightness;
        this.contrast = this.defaultContrast;
        this.colorPalette = this.defaultColorPalette;

        // Update the controls
        if (this.controls.pixelSizeRange) {
            this.controls.pixelSizeRange.value = this.defaultPixelSize;
            document.getElementById('pixelSizeValue').textContent = this.defaultPixelSize;
            this.setPixelSize(this.defaultPixelSize); // Trigger pixel size change
        }
        if (this.controls.brightnessRange) {
            this.controls.brightnessRange.value = this.defaultBrightness;
            document.getElementById('brightnessValue').textContent = this.defaultBrightness;
            this.setBrightness(this.defaultBrightness); // Trigger brightness change
        }
        if (this.controls.contrastRange) {
            this.controls.contrastRange.value = this.defaultContrast;
            document.getElementById('contrastValue').textContent = this.defaultContrast;
            this.setContrast(this.defaultContrast); // Trigger contrast change
        }
        if (this.controls.colorPaletteSelect) {
            this.controls.colorPaletteSelect.value = this.defaultColorPalette;
            this.setColorPalette(this.defaultColorPalette); // Trigger color palette change
        }

        // Reapply pixelation with default values
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