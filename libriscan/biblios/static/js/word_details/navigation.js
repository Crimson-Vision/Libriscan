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
    while (button.previousElementSibling?.classList.contains(WordDetailsConfig.WORD_BLOCK_CLASS)) {
      currentPosition++;
      button = button.previousElementSibling;
    }

    this.wordDetails.prevWordBtn.disabled = !WordBlockManager.getAdjacentWordBlock(this.wordDetails.currentWordId, 'prev');
    this.wordDetails.nextWordBtn.disabled = !WordBlockManager.getAdjacentWordBlock(this.wordDetails.currentWordId, 'next');
    this.wordDetails.wordPosition.textContent = `${currentPosition} of ${this.wordDetails.totalWords}`;
  }

  selectFirstWord() {
    setTimeout(() => {
      const lastEditedId = this.wordDetails.container?.dataset.lastEditedWordId;
      const wordToSelect = (lastEditedId && WordBlockManager.getWordBlock(lastEditedId)) 
        || document.querySelector(`.${WordDetailsConfig.WORD_BLOCK_CLASS}`);
      
      if (wordToSelect) wordToSelect.click();
    }, WordDetailsConfig.AUTO_ADVANCE_DELAY);
  }
}

