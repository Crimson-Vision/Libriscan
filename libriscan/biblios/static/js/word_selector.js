/**
 * Word Selector Component JavaScript
 * Handles word block click events and dispatches word selection events
 */

class WordSelector {
  constructor() {
    this.selectedBlock = null;
    this.initializeWordBlocks();
  }

  /**
   * Initialize click handlers for all word blocks
   */
  initializeWordBlocks() {
    const wordBlocks = document.querySelectorAll('.word-block');
    wordBlocks.forEach(wordBlock => {
      wordBlock.addEventListener('click', (event) => this.handleWordClick(event));
    });
  }

  /**
   * Handle click event on word block
   */
  handleWordClick(event) {
    try {
      // Remove active state from previous button
      if (this.selectedBlock) {
        this.selectedBlock.classList.remove('btn-active');
      }
      
      // Add active state to clicked button
      const wordBlock = event.currentTarget;
      wordBlock.classList.add('btn-active');
      this.selectedBlock = wordBlock;
      
      // Extract and dispatch word info
      const wordInfo = this.extractWordInfo(wordBlock);
      this.dispatchWordSelectedEvent(wordInfo);
    } catch (error) {
      console.error('Error handling word click:', error);
    }
  }

  /**
   * Extract word information from data attributes
   * @param {HTMLElement} wordBlock - Word block element
   * @returns {Object} Word information object
   */
  extractWordInfo(wordBlock) {
    return {
      word: wordBlock.dataset.wordText,
      confidence: parseFloat(wordBlock.dataset.wordConfidence),
      confidence_level: wordBlock.dataset.wordConfidenceLevel,
      id: wordBlock.dataset.wordId,
      line: parseInt(wordBlock.dataset.wordLine),
      number: parseInt(wordBlock.dataset.wordNumber),
      text_type: wordBlock.dataset.wordType,
      print_control: wordBlock.dataset.wordPrintControl,
      extraction_id: wordBlock.dataset.wordExtractionId,
      suggestions: (() => {
        try {
          const suggestionsStr = wordBlock.dataset.wordSuggestions;
          // Convert string "[['word', count], ...]" to array
          const suggestionsArray = eval(suggestionsStr);
          // Convert array to object format {word: count, ...}
          return Object.fromEntries(suggestionsArray);
        } catch (error) {
          console.error('Error parsing suggestions:', error);
          return {};
        }
      })(),
      geometry: {
        x0: parseFloat(wordBlock.dataset.wordGeoX0),
        y0: parseFloat(wordBlock.dataset.wordGeoY0),
        x1: parseFloat(wordBlock.dataset.wordGeoX1),
        y1: parseFloat(wordBlock.dataset.wordGeoY1)
      }
    };
  }

  /**
   * Dispatch custom event with word information
   * @param {Object} wordInfo - Word information object
   */
  dispatchWordSelectedEvent(wordInfo) {
    const event = new CustomEvent('wordSelected', {
      detail: wordInfo
    });
    document.dispatchEvent(event);
  }
}

/**
 * Confidence Toggle Component
 * Handles showing/hiding words based on confidence level
 */
class ConfidenceToggle {
  constructor() {
    this.container = document.getElementById('word-container');
    if (!this.container) return; // Exit if container not found
    
    this.toggles = {
      high: document.getElementById('toggle-high'),
      medium: document.getElementById('toggle-medium'),
      low: document.getElementById('toggle-low'),
      accepted: document.getElementById('toggle-accepted')
    };
    
    this.loadPreferences();
    this.attachEventListeners();
  }

  /**
   * Attach event listeners to checkboxes
   */
  attachEventListeners() {
    Object.entries(this.toggles).forEach(([level, checkbox]) => {
      if (checkbox) {
        checkbox.addEventListener('change', () => {
          this.handleToggle(level, checkbox.checked);
        });
      }
    });
  }

  /**
   * Handle toggle checkbox change
   * @param {string} level - Confidence level (high, medium, low)
   * @param {boolean} isVisible - Whether to show or hide words
   */
  handleToggle(level, isVisible) {
    const className = `hide-confidence-${level}`;
    
    if (isVisible) {
      this.container.classList.remove(className);
    } else {
      this.container.classList.add(className);
    }
    
    this.savePreferences();
    
    // Log for debugging
    console.log(`Confidence toggle: ${level} = ${isVisible ? 'visible' : 'hidden'}`);
  }

  /**
   * Save toggle preferences to localStorage
   */
  savePreferences() {
    const preferences = {
      high: this.toggles.high?.checked ?? true,
      medium: this.toggles.medium?.checked ?? true,
      low: this.toggles.low?.checked ?? true,
      accepted: this.toggles.accepted?.checked ?? true
    };
    
    try {
      localStorage.setItem('confidenceTogglePrefs', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save confidence toggle preferences:', error);
    }
  }

  /**
   * Load toggle preferences from localStorage
   */
  loadPreferences() {
    try {
      const saved = localStorage.getItem('confidenceTogglePrefs');
      if (!saved) return;
      
      const preferences = JSON.parse(saved);
      
      Object.entries(preferences).forEach(([level, isVisible]) => {
        const checkbox = this.toggles[level];
        if (checkbox) {
          checkbox.checked = isVisible;
          this.handleToggle(level, isVisible);
        }
      });
    } catch (error) {
      console.warn('Failed to load confidence toggle preferences:', error);
    }
  }
}

// Initialize word selector when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WordSelector();
  new ConfidenceToggle();
});
