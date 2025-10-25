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
    
    // Dropdown elements
    this.wordActionsDropdown = document.getElementById('wordActionsDropdown');
    this.revertToOriginalAction = document.getElementById('revertToOriginalAction');
    this.saveToDictionaryAction = document.getElementById('saveToDictionaryAction');
    this.viewAuditLogAction = document.getElementById('viewAuditLogAction');

    // Initialize data
    this.currentWordId = null;
    this.totalWords = document.querySelectorAll('.word-block').length;

    // Initialize event listeners
    this.initializeEventListeners();

    // Auto-select first word after everything is set up
    this.selectFirstWord();
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

    // Dropdown actions
    if (this.revertToOriginalAction) {
      this.revertToOriginalAction.onclick = () => this.revertToOriginalWord();
    }
    if (this.saveToDictionaryAction) {
      this.saveToDictionaryAction.onclick = () => this.saveToDictionary();
    }
    if (this.viewAuditLogAction) {
      this.viewAuditLogAction.onclick = () => this.viewAuditLog();
    }
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

    await this._updateWordText(newText, () => {
      this.exitEditMode();
    });
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

    // Ensure the corresponding word button is visually active and visible
    this._syncActiveWordButton();

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
        this.confidenceLevelSpan.innerHTML = '<span class="badge badge-primary">Accepted</span>';
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

  async applySuggestion(suggestion, suggestionsList, clickedLink) {
    if (!suggestion.trim()) {
      alert('Suggestion cannot be empty');
      return;
    }

    await this._updateWordText(suggestion, () => {
      // Remove active state from other items
      suggestionsList.querySelectorAll('a').forEach(a => a.classList.remove('active'));
      // Add active state to clicked item
      clickedLink.classList.add('active');
    });
  }

  /**
   * Shared method to update word text on server and refresh UI
   * @param {string} newText - The new text for the word
   * @param {Function} onSuccessCallback - Callback to execute on successful update
   */
  async _updateWordText(newText, onSuccessCallback) {
    try {
      const updateUrl = this._buildUpdateUrl();
      const data = await this._makeUpdateRequest(updateUrl, newText);
      
      this._updateWordData(data);
      this._updateWordUI();
      this._updateWordBlock(data);
      
      LibriscanUtils.showToast('Word updated successfully');
      onSuccessCallback?.();
    } catch (error) {
      console.error('Error updating word:', error);
      LibriscanUtils.showToast('Error updating word', 'error');
    }
  }

  /**
   * Build the update URL from current page URL
   * @returns {string} Update URL for the current word
   */
  _buildUpdateUrl() {
    return LibriscanUtils.buildWordUpdateURL(this.currentWordInfo.id);
  }

  /**
   * Make the HTTP request to update word text
   * @param {string} updateUrl - URL to send request to
   * @param {string} newText - New text for the word
   * @returns {Promise<Object>} Server response data
   */
  async _makeUpdateRequest(updateUrl, newText) {
    return LibriscanUtils.postFormData(updateUrl, { text: newText });
  }

  /**
   * Update the current word info with server response data
   * @param {Object} data - Server response data
   */
  _updateWordData(data) {
    this.currentWordInfo.word = data.text;
    this.currentWordInfo.confidence = data.confidence;
    this.currentWordInfo.confidence_level = data.confidence_level;
    this.currentWordInfo.suggestions = data.suggestions;
  }

  /**
   * Update the UI elements with new word data
   */
  _updateWordUI() {
    this.wordElement.textContent = this.currentWordInfo.word;
    this._updateConfidenceDisplay(this.currentWordInfo);
    this.updateSuggestions(this.currentWordInfo);
  }

  /**
   * Update the word block in the page with new data
   * @param {Object} data - Server response data
   */
  _updateWordBlock(data) {
    const wordBlock = document.querySelector(`[data-word-id="${this.currentWordInfo.id}"]`);
    if (!wordBlock) return;

    // Update data attributes
    wordBlock.dataset.wordText = data.text;
    wordBlock.dataset.wordConfidence = data.confidence;
    wordBlock.dataset.wordConfidenceLevel = data.confidence_level;
    wordBlock.dataset.wordSuggestions = JSON.stringify(Object.entries(data.suggestions));
    
    // Update CSS classes
    wordBlock.className = wordBlock.className.replace(/confidence-\w+/g, '');
    wordBlock.classList.add(`confidence-${data.confidence_level}`);
    
    // Update content and visual indicators
    this.updateWordBlockContent(wordBlock, data.text, data.confidence, data.confidence_level);
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

  /**
   * Ensure the active word button matches this.currentWordId.
   * Removes 'btn-active' from any other word-block and adds it to the current.
   * Also scrolls the container so the active button is visible.
   */
  _syncActiveWordButton() {
    // Remove any previously active button
    const prev = document.querySelector('.word-block.btn-active');
    if (prev) prev.classList.remove('btn-active');

    // Find the current button and mark it active
    const currentButton = document.querySelector(`[data-word-id="${this.currentWordId}"]`);
    if (!currentButton) return;
    currentButton.classList.add('btn-active');

    // Ensure it's visible. Use scrollIntoView which is simple and reliable.
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
    try {
      currentButton.scrollIntoView({ block: 'center', behavior: 'smooth' });
    } catch (e) {
      // Older browsers may not support options — fallback to default
      currentButton.scrollIntoView();
    }
  }

  /**
   * Update word block content including badge handling
   */
  updateWordBlockContent(wordBlock, text, confidence, confidenceLevel) {
    // Remove existing status indicator if present
    const existingStatus = wordBlock.querySelector('.accepted-status');
    if (existingStatus) {
      existingStatus.remove();
    }

    wordBlock.textContent = text;
    
    // Add DaisyUI status indicator if word is accepted
    if (confidenceLevel === 'accepted' || confidence >= 99.999) {
      const status = document.createElement('div');
      status.setAttribute('aria-label', 'status');
      status.className = 'status status-primary accepted-status';
      wordBlock.appendChild(status);
    }
  }

  /**
   * Dropdown action: Revert to original word
   * Placeholder method - functionality to be implemented
   */
  revertToOriginalWord() {
    // TODO: Implement revert to original word functionality
    console.log('Revert to Original Word clicked');
  }

  /**
   * Dropdown action: Save to dictionary
   * Placeholder method - functionality to be implemented
   */
  saveToDictionary() {
    // TODO: Implement save to dictionary functionality
    console.log('Save to Dictionary clicked');
  }

  /**
   * Dropdown action: View audit log
   * Placeholder method - functionality to be implemented
   */
  viewAuditLog() {
    // TODO: Implement view audit log functionality
    console.log('View Audit Log clicked');
  }

  /**
   * Auto-select the first word on page load
   * Finds the first word block and triggers its click to use existing selection system
   */
  selectFirstWord() {
    // Small delay to ensure WordSelector is initialized first
    setTimeout(() => {
      const firstWordBlock = document.querySelector('.word-block');
      if (!firstWordBlock) return;

      // Trigger click event to use existing WordSelector flow
      firstWordBlock.click();
    }, 100);
  }
}

// Initialize the WordDetails component when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WordDetails();
});
