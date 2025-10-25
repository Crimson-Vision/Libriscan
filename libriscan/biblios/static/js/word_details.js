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
    this.suggestionsContainer = document.getElementById('wordSuggestions');
    this.confidenceLevelSpan = document.getElementById('confidenceLevel');
    this.markAcceptedBtn = document.getElementById('markAcceptedBtn');
    this.prevWordBtn = document.getElementById('prevWordBtn');
    this.nextWordBtn = document.getElementById('nextWordBtn');
    this.wordPosition = document.getElementById('wordPosition');
    
    // Dropdown elements
    this.wordActionsDropdown = document.getElementById('wordActionsDropdown');
    this.revertToOriginalAction = document.getElementById('revertToOriginalAction');
    this.saveToDictionaryAction = document.getElementById('saveToDictionaryAction');
    this.viewAuditLogAction = document.getElementById('viewAuditLogAction');

    // Print control elements
    this.printControlDropdownBtn = document.getElementById('printControlDropdownBtn');
    this.printControlDisplay = document.getElementById('printControlDisplay');
    this.printControlBadge = document.getElementById('printControlBadge');
    this.printControlOptions = document.querySelectorAll('.print-control-option');

    // Text type elements
    this.textTypeDropdownBtn = document.getElementById('textTypeDropdownBtn');
    this.textTypeDisplay = document.getElementById('textTypeDisplay');
    this.textTypeBadge = document.getElementById('textTypeBadge');
    this.textTypeOptions = document.querySelectorAll('.text-type-option');

    // Stat container elements for full-width edit mode
    this.typeControlStat = document.getElementById('typeControlStat');
    this.confidenceStat = document.getElementById('confidenceStat');

    // Initialize data
    this.currentWordId = null;
    this.currentPrintControl = 'I';
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

    // Mark as accepted button
    if (this.markAcceptedBtn) {
      this.markAcceptedBtn.onclick = () => this.markAsAccepted();
    }

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

    // Print control dropdown actions
    this.printControlOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        const value = option.getAttribute('data-value');
        this.updatePrintControl(value);
        // Close dropdown by removing focus
        if (this.printControlDropdownBtn) {
          this.printControlDropdownBtn.blur();
        }
      });
    });

    // Text type dropdown actions
    this.textTypeOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        const value = option.getAttribute('data-value');
        this.updateTextType(value);
        // Close dropdown by removing focus
        if (this.textTypeDropdownBtn) {
          this.textTypeDropdownBtn.blur();
        }
      });
    });
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
    this.wordInput.value = this.preEditWord;
    this.wordElement.textContent = this.preEditWord;
    this.currentWordInfo.word = this.preEditWord;
    this.exitEditMode();
  }

  exitEditMode() {
    this._setEditMode(false);
  }

  // Toggle edit UI
  _setEditMode(enabled) {
    if (enabled) {
      // Save the current word value before editing starts
      this.preEditWord = this.wordElement.textContent;
      
      // Hide other stats to give input full width (desktop only)
      // This is to get the input to full width for extremely long words
      if (this.typeControlStat) this.typeControlStat.classList.add('lg:hidden');
      if (this.confidenceStat) this.confidenceStat.classList.add('lg:hidden');
      
      this.wordElement.classList.add('hidden');
      this.wordInput.classList.remove('hidden');
      this.editButton.classList.add('hidden');
      this.saveButton.classList.remove('hidden');
      this.revertButton.classList.remove('hidden');
      this.wordInput.value = this.wordElement.textContent;
      this.wordInput.focus();
    } else {
      // Restore other stats visibility
      if (this.typeControlStat) this.typeControlStat.classList.remove('lg:hidden');
      if (this.confidenceStat) this.confidenceStat.classList.remove('lg:hidden');
      
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
    // Exit edit mode if currently editing before switching to new word
    if (!this.wordInput.classList.contains('hidden')) {
      this.exitEditMode();
    }

    this.currentWordInfo = wordInfo;
    this.originalWord = wordInfo.word;
    this.currentWordId = wordInfo.id;
    this.currentPrintControl = wordInfo.print_control || 'I';

    // Show container and update basic word info
    this.container.classList.remove('hidden');
    this.wordElement.textContent = wordInfo.word;

    // Ensure the corresponding word button is visually active and visible
    this._syncActiveWordButton();

    // Update navigation state
    this.updateNavigationState();

    // Update confidence score and progress bar
    this._updateConfidenceDisplay(wordInfo);

    // Update text type display
    this._updateTextTypeDisplay(wordInfo.text_type || 'P');

    // Update print control display
    this._updatePrintControlDisplay(this.currentPrintControl);

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
      // Hide the Mark as Accepted button
      if (this.markAcceptedBtn) {
        this.markAcceptedBtn.classList.add('hidden');
      }
    } else {
      // Normal display for other confidence levels - show badge only
      if (this.confidenceLevelSpan) {
        const level = (wordInfo.confidence_level || 'none').toLowerCase();
        const levelText = this.getLevelText(level);
        const badgeClass = this.getBadgeClass(level);
        this.confidenceLevelSpan.innerHTML = `<span class="badge ${badgeClass}">${levelText}</span>`;
      }
      // Show the Mark as Accepted button for non-accepted confidence
      if (this.markAcceptedBtn) {
        this.markAcceptedBtn.classList.remove('hidden');
        this._setMarkAcceptedLoading(false); // Reset button to default state
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
   * @param {Function|Object} callbackOrOptions - Success callback function OR options object {callback, successMessage}
   */
  async _updateWordText(newText, callbackOrOptions) {
    try {
      const updateUrl = this._buildUpdateUrl();
      const data = await this._makeUpdateRequest(updateUrl, newText);
      
      this._updateWordData(data);
      this._updateWordUI();
      this._updateWordBlock(data);
      
      // Handle callback and toast message
      if (typeof callbackOrOptions === 'function') {
        LibriscanUtils.showToast('Word updated successfully');
        callbackOrOptions();
      } else if (callbackOrOptions?.successMessage) {
        LibriscanUtils.showToast(callbackOrOptions.successMessage, 'success');
        callbackOrOptions.callback?.();
      } else {
        LibriscanUtils.showToast('Word updated successfully');
      }
    } catch (error) {
      console.error('Error updating word:', error);
      LibriscanUtils.showToast('Error updating word', 'error');
      throw error;
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
   * Update print control value for the current word
   */
  async updatePrintControl(printControlValue) {
    if (!this.currentWordId) return console.error('No word selected');

    // Show loading state
    this.printControlDisplay.textContent = 'Updating...';
    this.printControlDropdownBtn.disabled = true;

    try {
      const { shortName, collectionSlug, identifier, pageNumber } = LibriscanUtils.parseLibriscanURL();
      const url = `/${shortName}/${collectionSlug}/${identifier}/page${pageNumber}/word/${this.currentWordId}/print-control/`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRFToken': LibriscanUtils.getCSRFToken(),
        },
        body: new URLSearchParams({ print_control: printControlValue }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to update print control');
      }

      const data = await response.json();
      this.currentPrintControl = this.currentWordInfo.print_control = data.print_control;
      this._updatePrintControlDisplay(data.print_control);
      this._showPrintControlSuccess();
      LibriscanUtils.showToast('Print control updated', 'success');
      
    } catch (error) {
      console.error('Error updating print control:', error);
      LibriscanUtils.showToast(error.message || 'Failed to update print control', 'error');
      this._updatePrintControlDisplay(this.currentPrintControl);
    } finally {
      this.printControlDropdownBtn.disabled = false;
    }
  }

  /**
   * Update text type value for the current word
   */
  async updateTextType(textTypeValue) {
    if (!this.currentWordId) return console.error('No word selected');

    // Show loading state
    this.textTypeDisplay.textContent = 'Updating...';
    this.textTypeDropdownBtn.disabled = true;

    try {
      const { shortName, collectionSlug, identifier, pageNumber } = LibriscanUtils.parseLibriscanURL();
      const url = `/${shortName}/${collectionSlug}/${identifier}/page${pageNumber}/word/${this.currentWordId}/text-type/`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRFToken': LibriscanUtils.getCSRFToken(),
        },
        body: new URLSearchParams({ text_type: textTypeValue }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to update text type');
      }

      const data = await response.json();
      this.currentWordInfo.text_type = data.text_type;
      this._updateTextTypeDisplay(data.text_type);
      this._showTextTypeSuccess();
      LibriscanUtils.showToast('Text type updated', 'success');
      
    } catch (error) {
      console.error('Error updating text type:', error);
      LibriscanUtils.showToast(error.message || 'Failed to update text type', 'error');
      this._updateTextTypeDisplay(this.currentWordInfo.text_type);
    } finally {
      this.textTypeDropdownBtn.disabled = false;
    }
  }

  /**
   * Mark the current word as accepted (set confidence to 99.999)
   * Reuses the existing word update flow with loading state management
   */
  async markAsAccepted() {
    if (!this.currentWordInfo?.word) {
      LibriscanUtils.showToast('No word selected', 'error');
      return;
    }

    this._setMarkAcceptedLoading(true);

    try {
      // Update word with same text - backend sets confidence to 99.999
      await this._updateWordText(this.currentWordInfo.word, {
        successMessage: 'Marked as accepted'
      });
    } catch (error) {
      console.error('Error marking as accepted:', error);
      LibriscanUtils.showToast('Failed to mark as accepted', 'error');
    } finally {
      this._setMarkAcceptedLoading(false);
    }
  }

  /**
   * Toggle loading state for Mark as Accepted button
   */
  _setMarkAcceptedLoading(isLoading) {
    if (!this.markAcceptedBtn) return;

    this.markAcceptedBtn.disabled = isLoading;
    
    if (isLoading) {
      this.markAcceptedBtn.innerHTML = `
        <span class="loading loading-spinner loading-xs"></span>
        Saving...
      `;
    } else {
      this.markAcceptedBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
        Mark as Accepted
      `;
    }
  }

  /**
   * Update the text type display UI
   */
  _updateTextTypeDisplay(textTypeValue) {
    const config = {
      'P': { text: 'Printed', badge: 'badge-info' },
      'H': { text: 'Handwriting', badge: 'badge-secondary' }
    }[textTypeValue] || { text: 'Printed', badge: 'badge-info' };

    if (this.textTypeDisplay) this.textTypeDisplay.textContent = config.text;
    
    if (this.textTypeBadge) {
      this.textTypeBadge.textContent = textTypeValue;
      this.textTypeBadge.className = `badge badge-xs ${config.badge}`;
    }
  }

  /**
   * Update the print control display UI
   */
  _updatePrintControlDisplay(printControlValue) {
    const config = {
      'I': { text: 'Include', badge: 'badge-success' },
      'M': { text: 'Merge with Prior', badge: 'badge-warning' },
      'O': { text: 'Omit', badge: 'badge-error' }
    }[printControlValue] || { text: 'Include', badge: 'badge-success' };

    if (this.printControlDisplay) this.printControlDisplay.textContent = config.text;
    
    if (this.printControlBadge) {
      this.printControlBadge.textContent = printControlValue;
      this.printControlBadge.className = `badge badge-xs ${config.badge}`;
    }
  }

  /**
   * Show success feedback for print control update
   */
  _showPrintControlSuccess() {
    if (!this.printControlBadge) return;
    
    this.printControlBadge.classList.add('badge-outline');
    setTimeout(() => this.printControlBadge.classList.remove('badge-outline'), 300);
  }

  /**
   * Show success feedback for text type update
   */
  _showTextTypeSuccess() {
    if (!this.textTypeBadge) return;
    
    this.textTypeBadge.classList.add('badge-outline');
    setTimeout(() => this.textTypeBadge.classList.remove('badge-outline'), 300);
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
