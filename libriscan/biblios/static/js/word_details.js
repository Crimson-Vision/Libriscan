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

  async saveEdit() {
    const newText = this.wordInput.value.trim();
    if (!newText) {
      alert('Text cannot be empty');
      return;
    }

    try {
      // Get URL parameters from the current page URL
      const url = window.location.pathname;
      const urlParts = url.match(/\/([^\/]+)\/([^\/]+)\/([^\/]+)\/page(\d+)\//);
      
      if (!urlParts) {
        throw new Error('Could not parse page URL');
      }
      
      const [, shortName, collectionSlug, identifier, pageNumber] = urlParts;
      const updateUrl = `/${shortName}/${collectionSlug}/${identifier}/page${pageNumber}/word/${this.currentWordInfo.id}/update/`;
      
      // Get CSRF token from HTMX headers or cookie
      let csrfToken = null;
      
      // Try to get from HTMX body headers first
      const htmxHeaders = document.body.getAttribute('hx-headers');
      if (htmxHeaders) {
        try {
          const headers = JSON.parse(htmxHeaders);
          csrfToken = headers['x-csrftoken'];
        } catch (e) {
          console.warn('Failed to parse HTMX headers');
        }
      }
      
      // Fallback to other methods
      if (!csrfToken) {
        csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
                   document.querySelector('meta[name=csrf-token]')?.getAttribute('content') ||
                   getCookie('csrftoken');
      }
      
      const response = await fetch(updateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRFToken': csrfToken
        },
        body: `text=${encodeURIComponent(newText)}`
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update the current word info with server response
        this.currentWordInfo.word = data.text;
        this.currentWordInfo.confidence = data.confidence;
        this.currentWordInfo.confidence_level = data.confidence_level;
        this.currentWordInfo.suggestions = data.suggestions;
        
        // Update the UI
        this.wordElement.textContent = data.text;
        this._updateConfidenceDisplay(this.currentWordInfo);
        this.updateSuggestions(this.currentWordInfo);
        
        // Update the word block in the page to reflect changes
        const wordBlock = document.querySelector(`[data-word-id="${this.currentWordInfo.id}"]`);
        if (wordBlock) {
          wordBlock.textContent = data.text;
          wordBlock.dataset.wordText = data.text;
          wordBlock.dataset.wordConfidence = data.confidence;
          wordBlock.dataset.wordConfidenceLevel = data.confidence_level;
          wordBlock.dataset.wordSuggestions = JSON.stringify(Object.entries(data.suggestions));
          
          // Update confidence level CSS class
          wordBlock.className = wordBlock.className.replace(/confidence-\w+/g, '');
          wordBlock.classList.add(`confidence-${data.confidence_level}`);
        }
        
        console.log('Word updated successfully');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update word');
      }
    } catch (error) {
      console.error('Error updating word:', error);
      alert(`Error updating word: ${error.message}`);
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
    
    // Hide score element - only use confidence level badge
    if (this.scoreElement) {
      this.scoreElement.style.display = 'none';
    }
    
    // Hide progress bar completely - no percentage display anywhere
    if (this.progressBar) {
      this.progressBar.style.display = 'none';
    }
    
    // Special handling for 99.999 confidence - only show "Accepted" badge
    if (raw >= 99.999) {
      if (this.confidenceLevelSpan) {
        this.confidenceLevelSpan.innerHTML = '<span class="badge badge-primary">Updated</span>';
      }
    } else {
      // Normal display for other confidence levels - show badge only
      if (this.confidenceLevelSpan) {
        const level = (wordInfo.confidence_level || 'none').toLowerCase();
        const levelText = this.getLevelText(level);
        const badgeClass = this.getBadgeClass(level);
        this.confidenceLevelSpan.innerHTML = `<span class="badge ${badgeClass}">${levelText}</span>`;
      }
    }
  }

  getLevelText(level) {
    const map = { 
      accepted: 'Accepted', 
      high: 'High', 
      medium: 'Medium', 
      low: 'Low', 
      none: 'None' 
    };
    return map[level] || 'None';
  }

  getBadgeClass(level) {
    const classMap = {
      accepted: 'badge-primary',
      high: 'badge-success', 
      medium: 'badge-warning',
      low: 'badge-error',
      none: 'badge-error'
    };
    return classMap[level] || 'badge-error';
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

// Helper function to get CSRF token from cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Initialize the WordDetails component when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WordDetails();
});
