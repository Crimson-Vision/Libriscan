/**
 * WordBlockManager - Manages word block DOM operations
 */
class WordBlockManager {
  static getWordBlock(wordId) {
    return document.querySelector(`[data-word-id="${wordId}"]`);
  }

  static updateDataAttributes(wordBlock, data) {
    wordBlock.dataset.wordText = data.text;
    wordBlock.dataset.wordConfidence = data.confidence;
    wordBlock.dataset.wordConfidenceLevel = data.confidence_level;
    wordBlock.dataset.wordSuggestions = JSON.stringify(Object.entries(data.suggestions));
    if (data.print_control !== undefined) wordBlock.dataset.wordPrintControl = data.print_control;
    if (data.text_type !== undefined) wordBlock.dataset.wordType = data.text_type;
  }

  static updateClasses(wordBlock, data) {
    // Update confidence classes
    wordBlock.className = wordBlock.className.replace(/confidence-\w+/g, '');
    wordBlock.classList.add(`confidence-${data.confidence_level}`);
    
    // Update btn-ghost/btn-dash classes for accepted words
    const isAccepted = data.confidence_level === WordDetailsConfig.CONFIDENCE_LEVELS.ACCEPTED;
    let acceptedToggleVisible = true;
    try {
      acceptedToggleVisible = confidenceToggleInstance?.isLevelVisible?.('accepted') ?? true;
    } catch (error) {
      console.warn('Error checking accepted toggle visibility:', error);
      LibriscanUtils.showToast('Error checking accepted toggle visibility', 'error');
    }
    
    wordBlock.classList.toggle('btn-dash', isAccepted && acceptedToggleVisible);
    wordBlock.classList.toggle('btn-ghost', !isAccepted || !acceptedToggleVisible);
    
    // Update word visibility control classes
    wordBlock.classList.remove('word-visibility-control-omit', 'word-visibility-control-merge');
    if (data.print_control === 'O') {
      wordBlock.classList.add('word-visibility-control-omit');
    } else if (data.print_control === 'M') {
      wordBlock.classList.add('word-visibility-control-merge');
    }
  }

  static updateWordVisibilityControlClasses(wordBlock, wordVisibilityControl) {
    wordBlock.classList.remove('word-visibility-control-omit', 'word-visibility-control-merge');
    if (wordVisibilityControl === 'O') wordBlock.classList.add('word-visibility-control-omit');
    else if (wordVisibilityControl === 'M') wordBlock.classList.add('word-visibility-control-merge');
  }

  static updateContent(wordBlock, text, confidence, confidenceLevel) {
    wordBlock.innerHTML = '';
    const textSpan = document.createElement('span');
    const isAccepted = confidenceLevel === WordDetailsConfig.CONFIDENCE_LEVELS.ACCEPTED;
    
    if (isAccepted) textSpan.className = 'accepted-word';
    textSpan.textContent = text;
    wordBlock.appendChild(textSpan);
  }

  static getAdjacentWordBlock(wordId, direction) {
    const currentButton = this.getWordBlock(wordId);
    if (!currentButton) return null;

    let adjacent = direction === 'prev' 
      ? currentButton.previousElementSibling
      : currentButton.nextElementSibling;
    
    // Skip over non-word-block elements (dividers, badges, etc.)
    while (adjacent && !adjacent.classList.contains(WordDetailsConfig.WORD_BLOCK_CLASS)) {
      adjacent = direction === 'prev' 
        ? adjacent.previousElementSibling
        : adjacent.nextElementSibling;
    }
    
    return adjacent;
  }

  static syncActiveWordButton(wordId) {
    const previousActive = document.querySelector(`.${WordDetailsConfig.WORD_BLOCK_CLASS}.btn-active`);
    if (previousActive) {
      previousActive.classList.remove('btn-active');
      // Remove focus to prevent black border from being left behind
      previousActive.blur();
    }

    const currentButton = this.getWordBlock(wordId);
    if (!currentButton) return;
    
    currentButton.classList.add('btn-active');
    LibriscanUtils.scrollIntoViewSafe(currentButton, { block: 'center', behavior: 'smooth' });
  }
}

