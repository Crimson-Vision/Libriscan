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

  _parseSuggestions(suggestionsStr) {
    if (!suggestionsStr) return {};
    
    try {
      return Object.fromEntries(JSON.parse(suggestionsStr));
    } catch (jsonError) {
      try {
        return Object.fromEntries(eval(suggestionsStr));
      } catch (evalError) {
        console.error('Error parsing suggestions:', evalError);
        LibriscanUtils.showToast('Failed to load suggestions', 'error');
        return {};
      }
    }
  }

  dispatchWordSelectedEvent(wordInfo) {
    document.dispatchEvent(new CustomEvent('wordSelected', { detail: wordInfo }));
  }
}

document.addEventListener('DOMContentLoaded', () => new WordSelector());
