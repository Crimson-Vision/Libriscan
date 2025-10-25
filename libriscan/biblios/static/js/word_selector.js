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
        const suggestionsStr = wordBlock.dataset.wordSuggestions;
        if (!suggestionsStr) return {};
        
        try {
          // Try JSON.parse first (for JavaScript-updated data with double quotes)
          const suggestionsArray = JSON.parse(suggestionsStr);
          return Object.fromEntries(suggestionsArray);
        } catch (jsonError) {
          try {
            // Fallback to eval for template-generated data with single quotes
            const suggestionsArray = eval(suggestionsStr);
            return Object.fromEntries(suggestionsArray);
          } catch (evalError) {
            console.error('Error parsing suggestions:', evalError);
            LibriscanUtils.showToast('Failed to load suggestions', 'error');
            return {};
          }
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

// Initialize word selector when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WordSelector();
});
