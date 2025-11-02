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
    const isAccepted = data.confidence_level === WordDetailsConfig.CONFIDENCE_LEVELS.ACCEPTED || 
                      parseFloat(data.confidence) >= WordDetailsConfig.ACCEPTED_THRESHOLD;
    const acceptedToggleVisible = confidenceToggleInstance?.isLevelVisible('accepted') ?? true;
    
    wordBlock.classList.toggle('btn-dash', isAccepted && acceptedToggleVisible);
    wordBlock.classList.toggle('btn-ghost', !isAccepted || !acceptedToggleVisible);
    
    // Update print control classes
    wordBlock.classList.remove('print-control-omit', 'print-control-merge');
    if (data.print_control === 'O') {
      wordBlock.classList.add('print-control-omit');
    } else if (data.print_control === 'M') {
      wordBlock.classList.add('print-control-merge');
    }
  }

  static updatePrintControlClasses(wordBlock, printControl) {
    wordBlock.classList.remove('print-control-omit', 'print-control-merge');
    if (printControl === 'O') wordBlock.classList.add('print-control-omit');
    else if (printControl === 'M') wordBlock.classList.add('print-control-merge');
  }

  static updateContent(wordBlock, text, confidence, confidenceLevel) {
    wordBlock.innerHTML = '';
    const textSpan = document.createElement('span');
    const isAccepted = confidenceLevel === WordDetailsConfig.CONFIDENCE_LEVELS.ACCEPTED || 
                      confidence >= WordDetailsConfig.ACCEPTED_THRESHOLD;
    
    if (isAccepted) textSpan.className = 'accepted-word';
    textSpan.textContent = text;
    wordBlock.appendChild(textSpan);
  }

  static getAdjacentWordBlock(wordId, direction) {
    const currentButton = this.getWordBlock(wordId);
    if (!currentButton) return null;

    const adjacent = direction === 'prev' 
      ? currentButton.previousElementSibling
      : currentButton.nextElementSibling;
    
    return adjacent?.classList.contains(WordDetailsConfig.WORD_BLOCK_CLASS) ? adjacent : null;
  }

  static syncActiveWordButton(wordId) {
    document.querySelector(`.${WordDetailsConfig.WORD_BLOCK_CLASS}.btn-active`)
      ?.classList.remove('btn-active');

    const currentButton = this.getWordBlock(wordId);
    if (!currentButton) return;
    
    currentButton.classList.add('btn-active');
    LibriscanUtils.scrollIntoViewSafe(currentButton, { block: 'center', behavior: 'smooth' });
  }
}

