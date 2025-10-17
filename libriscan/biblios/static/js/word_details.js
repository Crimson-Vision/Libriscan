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
    this.editButton.onclick = () => this.startEditing();
    this.saveButton.onclick = () => this.saveEdit();
    this.revertButton.onclick = () => this.revertEdit();
    this.wordInput.onkeypress = (e) => {
      if (e.key === 'Enter') this.saveButton.click();
    };

    // Word navigation
    this.prevWordBtn.onclick = () => this.goToPrevWord();
    this.nextWordBtn.onclick = () => this.goToNextWord();

    // Keyboard navigation: left/right arrows to go previous/next
    // Ignore when typing in inputs/textareas or when editing the word input
    this._keydownHandler = (e) => {
      // Don't intercept if focus is on an input, textarea, or contentEditable element
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
        return;
      }

      // If the word input is visible (we're editing), don't navigate
      if (this.wordInput && !this.wordInput.classList.contains('hidden')) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.goToPrevWord();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.goToNextWord();
      }
    };

    document.addEventListener('keydown', this._keydownHandler);

    // Double-click to edit word directly
    this.wordElement.addEventListener('dblclick', () => this.startEditing());

    // Visual feedback for clickable word
    this.wordElement.style.cursor = 'pointer';
    this.wordElement.title = 'Double-click to edit';
  }

  startEditing() {
    this.wordElement.classList.add('hidden');
    this.wordInput.classList.remove('hidden');
    this.editButton.classList.add('hidden');
    this.saveButton.classList.remove('hidden');
    this.revertButton.classList.remove('hidden');
    this.wordInput.value = this.wordElement.textContent;
    this.wordInput.focus();
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
    this.wordElement.classList.remove('hidden');
    this.wordInput.classList.add('hidden');
    this.editButton.classList.remove('hidden');
    this.saveButton.classList.add('hidden');
    this.revertButton.classList.add('hidden');
  }

  getProgressClass(confidence_level) {
    if (confidence_level === 'high') return 'progress progress-success';
    if (confidence_level === 'medium') return 'progress progress-warning';
    if (confidence_level === 'low' || confidence_level === 'none') return 'progress progress-error';
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
    const confidenceValue = parseFloat(wordInfo.confidence).toFixed(3);
    this.scoreElement.textContent = `${confidenceValue}%`;
    this.progressBar.value = confidenceValue;
    this.progressBar.className = this.getProgressClass(wordInfo.confidence_level)
    if (this.confidenceLevelSpan) {
      const map = {
        accepted: 'Accepted',
        high: 'High',
        medium: 'Medium',
        low: 'Low',
        none: 'None'
      };
      const level = (wordInfo.confidence_level.toLowerCase() || none);
      this.confidenceLevelSpan.textContent = map[level] ?? wordInfo.confidence_level ?? none;
    }

    // Update metadata
    this.wordMetadata.textContent = `Type: ${wordInfo.text_type === 'H' ? 'Handwriting' : 'Printed'} | Control: ${wordInfo.print_control}`;

    this.updateSuggestions(wordInfo);
  }

  updateSuggestions(wordInfo) {
    this.suggestionsContainer.innerHTML = '';
    
    if (wordInfo.suggestions && Object.entries(wordInfo.suggestions).length > 0) {
      const suggestionsList = document.createElement('ul');
      suggestionsList.className = 'menu menu-sm bg-base-200 w-full rounded-lg';
      
      Object.entries(wordInfo.suggestions).forEach(([suggestion, frequency]) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.className = 'flex justify-between items-center';
        link.innerHTML = `
          <span>${suggestion}</span>
          <span class="badge badge-neutral">${frequency}</span>
        `;

        link.addEventListener('click', event => {
          event.preventDefault();
          this.applySuggestion(suggestion, suggestionsList, event);
        });

        item.appendChild(link);
        suggestionsList.appendChild(item);
      });
      
      this.suggestionsContainer.appendChild(suggestionsList);
    } else {
      this.suggestionsContainer.textContent = 'No suggestions available';
    }
  }

  applySuggestion(suggestion, suggestionsList, event) {
    this.currentWordInfo.text = suggestion;
    this.wordElement.textContent = suggestion;
    // Remove active state from other items
    suggestionsList.querySelectorAll('a').forEach(a => a.classList.remove('active'));
    // Add active state to clicked item
    event.currentTarget.classList.add('active');
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
