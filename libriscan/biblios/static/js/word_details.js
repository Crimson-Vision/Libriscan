class WordDetails {
  constructor() {
    // Cache DOM elements
    this.container = document.getElementById('clickedWordsContainer');
    this.wordElement = document.getElementById('clickedWord');
    this.wordInput = document.getElementById('wordInput');
    this.editButton = document.getElementById('editButton');
    this.saveButton = document.getElementById('saveButton');
    this.revertButton = document.getElementById('revertButton');
    this.scoreElement = document.getElementById('confidenceScore');
    this.progressBar = document.getElementById('confidenceBar');
    this.wordMetadata = document.getElementById('wordMetadata');
    this.suggestionsContainer = document.getElementById('wordSuggestions');
    this.confidenceLevelSpan = document.getElementById('confidenceLevel');
    this.prevWordBtn = document.getElementById('prevWordBtn');
    this.nextWordBtn = document.getElementById('nextWordBtn');
    this.wordPosition = document.getElementById('wordPosition');

    // Initialize data
    this.currentWordId = null;
    this.totalWords = document.querySelectorAll('.word-block').length;

    // Initialize event listeners
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Word selection event
    document.addEventListener('wordSelected', (event) => this.updateWordDetails(event.detail));

    // Edit functionality
    this.editButton.onclick = () => this._setEditMode(true);
    this.saveButton.onclick = () => this.saveEdit();
    this.revertButton.onclick = () => this.revertEdit();
    this.wordInput.onkeypress = (e) => { if (e.key === 'Enter') this.saveButton.click(); };

    // Word navigation
    this.prevWordBtn.onclick = () => this.goToPrevWord();
    this.nextWordBtn.onclick = () => this.goToNextWord();

    // Double-click to edit word directly
    this.wordElement.addEventListener('dblclick', () => this._setEditMode(true));

    // Visual feedback for clickable word
    this.wordElement.style.cursor = 'pointer';
    this.wordElement.title = 'Double-click to edit';

    // Keyboard navigation: left/right arrows navigate when not typing/editing
    this._keydownHandler = (e) => {
      if (this._isTyping() || this._isEditing()) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); this.goToPrevWord(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); this.goToNextWord(); }
    };
    document.addEventListener('keydown', this._keydownHandler);
  }

  startEditing() {
    this._setEditMode(true);
  }

  saveEdit() {
    const newText = this.wordInput.value.trim();
    if (newText) {
      this.wordElement.textContent = newText;
      this.currentWordInfo.word = newText;
    }
    this.exitEditMode();
  }

  revertEdit() {
    this.wordElement.textContent = this.originalWord;
    this.currentWordInfo.word = this.originalWord;
    this.exitEditMode();
  }

  exitEditMode() {
    this._setEditMode(false);
  }

  // Toggle edit UI
  _setEditMode(enabled) {
    if (enabled) {
      this.wordElement.classList.add('hidden');
      this.wordInput.classList.remove('hidden');
      this.editButton.classList.add('hidden');
      this.saveButton.classList.remove('hidden');
      this.revertButton.classList.remove('hidden');
      this.wordInput.value = this.wordElement.textContent;
      this.wordInput.focus();
    } else {
      this.wordElement.classList.remove('hidden');
      this.wordInput.classList.add('hidden');
      this.editButton.classList.remove('hidden');
      this.saveButton.classList.add('hidden');
      this.revertButton.classList.add('hidden');
    }
  }

  _isTyping() {
    const active = document.activeElement;
    return !!(active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable));
  }

  _isEditing() {
    return this.wordInput && !this.wordInput.classList.contains('hidden');
  }

  getProgressClass(confidence_level) {
    const lvl = (confidence_level || '').toLowerCase();
    if (lvl === 'high') return 'progress progress-success';
    if (lvl === 'medium') return 'progress progress-warning';
    return 'progress progress-error';
  }

  updateWordDetails(wordInfo) {
    this.currentWordInfo = wordInfo;
    this.originalWord = wordInfo.word;
    this.currentWordId = wordInfo.id;

    // Show container and update basic word info
    this.container.classList.remove('hidden');
    this.wordElement.textContent = wordInfo.word;

    // Update navigation state
    this.updateNavigationState();

    // Update confidence score and progress bar
    this._updateConfidenceDisplay(wordInfo);

    // Update metadata
    this.wordMetadata.textContent = `Type: ${wordInfo.text_type === 'H' ? 'Handwriting' : 'Printed'} | Control: ${wordInfo.print_control}`;

    this.updateSuggestions(wordInfo);
  }

  _updateConfidenceDisplay(wordInfo) {
    const raw = parseFloat(wordInfo.confidence) || 0;
    const display = raw.toFixed(3);
    if (this.scoreElement) this.scoreElement.textContent = `${display}%`;
    if (this.progressBar) {
      this.progressBar.value = raw;
      this.progressBar.className = this.getProgressClass(wordInfo.confidence_level);
    }

    if (this.confidenceLevelSpan) {
      const map = { accepted: 'Accepted', high: 'High', medium: 'Medium', low: 'Low', none: 'None' };
      const level = (wordInfo.confidence_level || 'none').toLowerCase();
      this.confidenceLevelSpan.textContent = map[level] ?? wordInfo.confidence_level ?? 'None';
    }
  }

  updateSuggestions(wordInfo) {
    this.suggestionsContainer.innerHTML = '';
    const suggestions = wordInfo.suggestions || {};
    const entries = Object.entries(suggestions);
    if (entries.length === 0) {
      this.suggestionsContainer.textContent = 'No suggestions available';
      return;
    }

    const suggestionsList = document.createElement('ul');
    suggestionsList.className = 'menu menu-sm bg-base-200 w-full rounded-lg';
    const frag = document.createDocumentFragment();

    entries.forEach(([suggestion, frequency]) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'flex justify-between items-center';
      link.innerHTML = `<span>${suggestion}</span><span class="badge badge-neutral">${frequency}</span>`;
      link.addEventListener('click', event => {
        event.preventDefault();
        this.applySuggestion(suggestion, suggestionsList, link);
      });
      item.appendChild(link);
      frag.appendChild(item);
    });

    suggestionsList.appendChild(frag);
    this.suggestionsContainer.appendChild(suggestionsList);
  }

  applySuggestion(suggestion, suggestionsList, clickedLink) {
    this.currentWordInfo.word = suggestion;
    this.wordElement.textContent = suggestion;
    // Remove active state from other items
    suggestionsList.querySelectorAll('a').forEach(a => a.classList.remove('active'));
    // Add active state to clicked item
    clickedLink.classList.add('active');
  }

  goToPrevWord() {
    const currentButton = document.querySelector(`[data-word-id="${this.currentWordId}"]`);
    const prevButton = currentButton?.previousElementSibling;
    if (prevButton?.classList.contains('word-block')) {
      prevButton.click();
    }
  }

  goToNextWord() {
    const currentButton = document.querySelector(`[data-word-id="${this.currentWordId}"]`);
    const nextButton = currentButton?.nextElementSibling;
    if (nextButton?.classList.contains('word-block')) {
      nextButton.click();
    }
  }

  updateNavigationState() {
    const currentButton = document.querySelector(`[data-word-id="${this.currentWordId}"]`);
    if (!currentButton) return;

    // Get current position
    let currentPosition = 1;
    let button = currentButton;
    while (button.previousElementSibling?.classList.contains('word-block')) {
      currentPosition++;
      button = button.previousElementSibling;
    }

    // Update button states
    this.prevWordBtn.disabled = !currentButton.previousElementSibling?.classList.contains('word-block');
    this.nextWordBtn.disabled = !currentButton.nextElementSibling?.classList.contains('word-block');

    // Update position indicator
    this.wordPosition.textContent = `${currentPosition} of ${this.totalWords}`;
  }


}

// Initialize the WordDetails component when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WordDetails();
});
