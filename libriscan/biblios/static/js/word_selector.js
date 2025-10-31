class WordSelector {
  constructor() {
    this.selectedBlock = null;
    this.initializeWordBlocks();
  }

  initializeWordBlocks() {
    document.querySelectorAll('.word-block').forEach(wordBlock => {
      wordBlock.addEventListener('click', (event) => this.handleWordClick(event));
    });
  }

  handleWordClick(event) {
    try {
      if (this.selectedBlock) this.selectedBlock.classList.remove('btn-active');
      
      const wordBlock = event.currentTarget;
      wordBlock.classList.add('btn-active');
      this.selectedBlock = wordBlock;
      
      const wordInfo = this.extractWordInfo(wordBlock);
      this.dispatchWordSelectedEvent(wordInfo);
    } catch (error) {
      console.error('Error handling word click:', error);
      LibriscanUtils.showToast('Error selecting word', 'error');
    }
  }

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
      suggestions: this._parseSuggestions(wordBlock.dataset.wordSuggestions),
      geometry: {
        x0: parseFloat(wordBlock.dataset.wordGeoX0),
        y0: parseFloat(wordBlock.dataset.wordGeoY0),
        x1: parseFloat(wordBlock.dataset.wordGeoX1),
        y1: parseFloat(wordBlock.dataset.wordGeoY1)
      }
    };
  }

  _parseSuggestions(suggestionsString) {
    // Handle empty, null, or whitespace-only strings
    if (!suggestionsString || !suggestionsString.trim()) {
      return {};
    }
    
    const trimmedString = suggestionsString.trim();
    
    // Handle empty JSON arrays/objects
    if (trimmedString === '[]' || trimmedString === '{}') {
      return {};
    }
    
    try {
      const parsedData = JSON.parse(trimmedString);
      
      // If parsed data is already an object/dictionary, return it directly
      if (typeof parsedData === 'object' && parsedData !== null && !Array.isArray(parsedData)) {
        return parsedData;
      }
      
      // If parsed data is an array of [word, frequency] tuples, convert to object
      if (Array.isArray(parsedData)) {
        return Object.fromEntries(parsedData);
      }
      
      return {};
    } catch (parseError) {
      // Data should always be valid JSON, but handle gracefully if parsing fails
      console.warn('Failed to parse suggestions data:', trimmedString, parseError);
      if (typeof LibriscanUtils !== 'undefined' && LibriscanUtils.showToast) {
        LibriscanUtils.showToast('Failed to load word suggestions', 'warning');
      }
      return {};
    }
  }

  dispatchWordSelectedEvent(wordInfo) {
    document.dispatchEvent(new CustomEvent('wordSelected', { detail: wordInfo }));
  }
}

document.addEventListener('DOMContentLoaded', () => new WordSelector());
