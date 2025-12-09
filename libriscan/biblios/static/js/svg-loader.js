// Loads and caches SVG icons from static files with customizable attributes
class SVGLoader {
  constructor() {
    this.cache = new Map();
    this.basePath = '/static/svg/';
  }

  // Load SVG icon by name, apply customizations, and cache result
  async loadIcon(iconName, options = {}) {
    const cacheKey = `${iconName}_${JSON.stringify(options)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.basePath}${iconName}.svg`);
      if (!response.ok) {
        console.warn(`SVG icon "${iconName}" not found`);
        return '';
      }
      
      let svg = await response.text();
      
      if (options.cssClass) {
        if (svg.includes('class=')) {
          svg = svg.replace(/class="[^"]*"/, `class="${options.cssClass}"`);
        } else {
          svg = svg.replace('<svg', `<svg class="${options.cssClass}"`);
        }
      }
      
      if (options.fill !== undefined) {
        svg = svg.replace(/\s+fill="[^"]*"/g, '').replace('<svg', `<svg fill="${options.fill}"`);
      }
      
      if (options.stroke !== undefined) {
        svg = svg.replace(/\s+stroke="[^"]*"/g, '').replace('<svg', `<svg stroke="${options.stroke}"`);
      }
      
      if (options.strokeWidth !== undefined) {
        svg = svg.replace(/\s+stroke-width="[^"]*"/g, '').replace('<svg', `<svg stroke-width="${options.strokeWidth}"`);
      }
      
      this.cache.set(cacheKey, svg);
      return svg;
    } catch (error) {
      console.error(`Error loading SVG "${iconName}":`, error);
      return '';
    }
  }

  // Get cached SVG icon synchronously (returns empty if not cached)
  getCachedIcon(iconName, options = {}) {
    return this.cache.get(`${iconName}_${JSON.stringify(options)}`) || '';
  }
}

window.SVGLoader = new SVGLoader();

