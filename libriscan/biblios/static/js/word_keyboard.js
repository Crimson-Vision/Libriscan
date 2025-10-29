// Handles keyboard shortcuts for word details navigation and suggestions
class WordKeyboard {
  constructor(wordDetails) {
    this.wordDetails = wordDetails;
    this.handler = (e) => this._handleKeydown(e);
  }

  initialize() {
    document.addEventListener('keydown', this.handler);
  }

  destroy() {
    document.removeEventListener('keydown', this.handler);
  }

  _handleKeydown(e) {
    if (WordEditor.isTyping() || this.wordDetails.editor.isEditingMode()) return;

    const { key } = e;
    
    if (key === 'ArrowLeft') {
      e.preventDefault();
      this.wordDetails.goToPrevWord();
    } else if (key === 'ArrowRight') {
      e.preventDefault();
      this.wordDetails.goToNextWord();
    } else if (key >= '1' && key <= '9') {
      e.preventDefault();
      this._applySuggestion(parseInt(key) - 1);
    } else if (key === 'e' || key === 'E') {
      e.preventDefault();
      this.wordDetails.editor.enterEditMode();
    } else if (key === 'a' || key === 'A') {
      e.preventDefault();
      this.wordDetails.metadata.markAsAccepted();
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

