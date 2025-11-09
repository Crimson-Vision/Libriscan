class WordSelector {
  constructor() {
    this.selectedBlock = null;
    this.initializeWordBlocks();
    this.applyReviewFlags();
  }

  initializeWordBlocks() {
    document.querySelectorAll('.word-block').forEach(wordBlock => {
      wordBlock.addEventListener('click', (event) => this.handleWordClick(event));
    });
  }

  applyReviewFlags() {
    document.querySelectorAll('.word-block').forEach(wordBlock => {
      const isReviewed = wordBlock.dataset.wordReview === 'true';
      const isAccepted = wordBlock.dataset.wordConfidenceLevel === WordDetailsConfig.CONFIDENCE_LEVELS.ACCEPTED;
      
      wordBlock.classList.toggle('btn-error', isReviewed);
      
      if (isReviewed) {
        wordBlock.classList.remove('btn-ghost');
        // Keep btn-dash for accepted words even when reviewed
        if (isAccepted) {
          wordBlock.classList.add('btn-dash');
        } else {
          wordBlock.classList.remove('btn-dash');
        }
        if (!wordBlock.querySelector('.review-flag-icon')) {
          const flagIcon = document.createElement('span');
          flagIcon.className = 'review-flag-icon inline-flex items-center mr-1';
          flagIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" /></svg>';
          wordBlock.insertBefore(flagIcon, wordBlock.querySelector('span') || wordBlock.firstChild);
        }
      } else {
        wordBlock.classList.remove('btn-error');
        wordBlock.querySelector('.review-flag-icon')?.remove();
        if (isAccepted) {
          wordBlock.classList.add('btn-dash');
        } else {
          wordBlock.classList.add('btn-ghost');
        }
      }
    });
  }

  handleWordClick(event) {
    try {
      if (this.selectedBlock) {
        this.selectedBlock.classList.remove('btn-active');
        // Remove focus to prevent black border from being left behind
        this.selectedBlock.blur();
      }
      
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
      review: wordBlock.dataset.wordReview === 'true',
      suggestions: this._parseSuggestions(wordBlock.dataset.wordSuggestions),
      // Limits for geometry coordinates removed from data-words-json
      // geometry: {
      //   x0: parseFloat(wordBlock.dataset.wordGeoX0),
      //   y0: parseFloat(wordBlock.dataset.wordGeoY0),
      //   x1: parseFloat(wordBlock.dataset.wordGeoX1),
      //   y1: parseFloat(wordBlock.dataset.wordGeoY1)
      // }
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
