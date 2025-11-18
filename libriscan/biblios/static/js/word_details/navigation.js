/**
 * WordNavigation - Handles word navigation operations
 */
class WordNavigation {
  constructor(wordDetails) {
    this.wordDetails = wordDetails;
  }

  goToPrevWord() {
    const prevButton = WordBlockManager.getAdjacentWordBlock(this.wordDetails.currentWordId, 'prev');
    if (prevButton) prevButton.click();
  }

  goToNextWord() {
    const nextButton = WordBlockManager.getAdjacentWordBlock(this.wordDetails.currentWordId, 'next');
    if (nextButton) nextButton.click();
  }

  updateNavigationState() {
    const currentButton = WordBlockManager.getWordBlock(this.wordDetails.currentWordId);
    if (!currentButton) return;

    let currentPosition = 1;
    let button = currentButton;
    let prevSibling = button.previousElementSibling;
    
    // Skip over non-word-block elements (dividers, badges, etc.) when counting
    while (prevSibling) {
      if (prevSibling.classList.contains(WordDetailsConfig.WORD_BLOCK_CLASS)) {
        currentPosition++;
        button = prevSibling;
      }
      prevSibling = prevSibling.previousElementSibling;
    }

    if (this.wordDetails.prevWordBtn) {
      this.wordDetails.prevWordBtn.disabled = !WordBlockManager.getAdjacentWordBlock(this.wordDetails.currentWordId, 'prev');
    }
    if (this.wordDetails.nextWordBtn) {
      this.wordDetails.nextWordBtn.disabled = !WordBlockManager.getAdjacentWordBlock(this.wordDetails.currentWordId, 'next');
    }
    if (this.wordDetails.wordPosition) {
      this.wordDetails.wordPosition.textContent = `${currentPosition} of ${this.wordDetails.totalWords}`;
    }
  }

  selectFirstWord() {
    setTimeout(() => {
      const lastEditedId = this.wordDetails.container?.dataset.lastEditedWordId;
      let wordToSelect = lastEditedId ? WordBlockManager.getWordBlock(lastEditedId) : null;
      
      if (!wordToSelect) {
        // Find word with line 0 and number 0 (first word in first line)
        wordToSelect = document.querySelector(`.${WordDetailsConfig.WORD_BLOCK_CLASS}[data-word-line="0"][data-word-number="0"]`);
        // Fallback to first word block if line 0, number 0 doesn't exist
        if (!wordToSelect) {
          wordToSelect = document.querySelector(`.${WordDetailsConfig.WORD_BLOCK_CLASS}`);
        }
      }
      
      if (wordToSelect) wordToSelect.click();
    }, WordDetailsConfig.AUTO_ADVANCE_DELAY);
  }
}

