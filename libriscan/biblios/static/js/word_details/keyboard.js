// Handles keyboard shortcuts for word details navigation and suggestions
class WordKeyboard {
  constructor(wordDetails) {
    this.wordDetails = wordDetails;
    this.handler = (event) => this._handleKeydown(event);
  }

  initialize() {
    document.addEventListener('keydown', this.handler);
  }

  destroy() {
    document.removeEventListener('keydown', this.handler);
  }

  _handleKeydown(event) {
    if (WordEditor.isTyping() || this.wordDetails.editor.isEditingMode()) return;

    const { key } = event;
    
    // Prevent keyboard navigation during auto-advance to avoid double-advancing
    if (this.wordDetails.updateHandler?.isAutoAdvancing) {
      if (key === 'ArrowLeft' || key === 'ArrowRight') {
        event.preventDefault();
        return;
      }
    }
    
    if (key === 'ArrowLeft') {
      event.preventDefault();
      this.wordDetails.goToPrevWord();
    } else if (key === 'ArrowRight') {
      event.preventDefault();
      this.wordDetails.goToNextWord();
    } else if (key >= '1' && key <= '9') {
      event.preventDefault();
      this._applySuggestion(parseInt(key) - 1);
    } else if (key === 'e' || key === 'E') {
      event.preventDefault();
      this.wordDetails.editor.enterEditMode();
    } else if (key === 'a' || key === 'A') {
      event.preventDefault();
      this.wordDetails.metadata.accept();
    } else if (key === 'f' || key === 'F') {
      event.preventDefault();
      this.wordDetails.reviewFlag?.toggleFlag();
    }
  }

  async _applySuggestion(index) {
    const { currentWordInfo, suggestionsContainer } = this.wordDetails;
    if (!currentWordInfo?.suggestions) return;

    const entries = Object.entries(currentWordInfo.suggestions);
    if (index < 0 || index >= entries.length) return;

    const list = suggestionsContainer.querySelector('ul');
    const links = list?.querySelectorAll('a');
    if (!links?.[index]) return;

    const [suggestion] = entries[index];
    await this.wordDetails.applySuggestion(suggestion, list, links[index]);
    links[index].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

