/**
 * WordDetails - Main component for word details functionality
 * Manages display, navigation, confidence, and suggestions
 */
class WordDetails {
  constructor() {
    // Cache DOM elements
    this.container = document.getElementById('clickedWordsContainer');
    this.wordElement = document.getElementById('clickedWord');
    this.wordInput = document.getElementById('wordInput');
    this.editButton = document.getElementById('editButton');
    this.saveButton = document.getElementById('saveButton');
    this.revertButton = document.getElementById('revertButton');
    this.suggestionsContainer = document.getElementById('wordSuggestions');
    this.confidenceLevelSpan = document.getElementById('confidenceLevel');
    this.acceptBtn = document.getElementById('acceptBtn');
    this.prevWordBtn = document.getElementById('prevWordBtn');
    this.nextWordBtn = document.getElementById('nextWordBtn');
    this.wordPosition = document.getElementById('wordPosition');
    
    // Dropdown elements
    this.wordActionsDropdown = document.getElementById('wordActionsDropdown');
    this.revertToOriginalAction = document.getElementById('revertToOriginalAction');
    this.saveToDictionaryAction = document.getElementById('saveToDictionaryAction');

    // Initialize data
    this.currentWordId = null;
    this.currentWordInfo = null;
    this.originalWord = null;
    this.totalWords = document.querySelectorAll('.word-block').length;

    // Initialize modules
    this.editor = new WordEditor({
      wordElement: this.wordElement,
      wordInput: this.wordInput,
      editButton: this.editButton,
      saveButton: this.saveButton,
      revertButton: this.revertButton
    });

    this.metadata = new WordMetadata({
      printControlDropdownBtn: document.getElementById('printControlDropdownBtn'),
      printControlDisplay: document.getElementById('printControlDisplay'),
      printControlBadge: document.getElementById('printControlBadge'),
      printControlOptions: document.querySelectorAll('.print-control-option'),
      textTypeDropdownBtn: document.getElementById('textTypeDropdownBtn'),
      textTypeDisplay: document.getElementById('textTypeDisplay'),
      textTypeBadge: document.getElementById('textTypeBadge'),
      textTypeOptions: document.querySelectorAll('.text-type-option'),
      acceptBtn: this.acceptBtn
    });

    // Setup editor callbacks
    this.editor.onSave = async (newText) => {
      await this._updateWordText(newText, {
        autoAdvance: true
      });
    };

    this.editor.onRevert = (preEditWord) => {
      this.currentWordInfo.word = preEditWord;
    };

    // Setup metadata callbacks
    this.metadata.onAccept = async (wordText) => {
      await this._updateWordText(wordText, {
        successMessage: 'Accepted',
        autoAdvance: true
      });
    };

    // Initialize keyboard handler
    this.keyboard = new WordKeyboard(this);
    this.keyboard.initialize();

    // Initialize event listeners
    this.initializeEventListeners();

    // Auto-select first word after everything is set up
    this.selectFirstWord();
  }

  initializeEventListeners() {
    document.addEventListener('wordSelected', (event) => this.updateWordDetails(event.detail));
    document.addEventListener('printControlUpdated', (event) => this._handlePrintControlUpdate(event.detail));
    document.addEventListener('textTypeUpdated', (event) => this._handleTextTypeUpdate(event.detail));
    
    this.prevWordBtn.onclick = () => this.goToPrevWord();
    this.nextWordBtn.onclick = () => this.goToNextWord();

    if (this.revertToOriginalAction) this.revertToOriginalAction.onclick = () => this.revertToOriginalWord();
    if (this.saveToDictionaryAction) this.saveToDictionaryAction.onclick = () => this.saveToDictionary();

    const auditHistoryTab = document.getElementById('wordAuditHistoryTab');
    if (auditHistoryTab) {
      auditHistoryTab.addEventListener('change', () => {
        if (auditHistoryTab.checked) {
          this.loadAuditHistory();
        }
      });
    }

    this.editor.initializeEventListeners();
    this.metadata.initializeEventListeners();
  }

  updateWordDetails(wordInfo) {
    if (this.editor.isEditingMode()) this.editor.exitEditMode();

    this.currentWordInfo = wordInfo;
    this.originalWord = wordInfo.word;
    this.currentWordId = wordInfo.id;

    this.metadata.setCurrentWordInfo(wordInfo);
    this.container.classList.remove('hidden');
    
    // Always switch to Details tab when a new word is selected
    const detailsTab = document.getElementById('wordDetailsTab');
    if (detailsTab) detailsTab.checked = true;
    
    this.editor.updateWord(wordInfo.word);
    this._syncActiveWordButton();
    this.updateNavigationState();
    this._updateConfidenceDisplay(wordInfo);
    this.metadata.updateTextTypeDisplay(wordInfo.text_type || 'P');
    this.metadata.updatePrintControlDisplay(wordInfo.print_control || 'I');
    this.updateSuggestions(wordInfo);
    
    // Check if revert button should be enabled
    this._checkAndEnableRevertButton(wordInfo.id);
  }

  _updateConfidenceDisplay(wordInfo) {
    const raw = parseFloat(wordInfo.confidence) || 0;
    
    if (raw >= 99.999) {
      if (this.confidenceLevelSpan) {
        this.confidenceLevelSpan.innerHTML = '<span class="badge badge-primary">Accepted</span>';
      }
      if (this.acceptBtn) this.acceptBtn.classList.add('hidden');
    } else {
      if (this.confidenceLevelSpan) {
        const level = (wordInfo.confidence_level || 'none').toLowerCase();
        const levelText = this.getLevelText(level);
        const badgeClass = this.getBadgeClass(level);
        this.confidenceLevelSpan.innerHTML = `<span class="badge ${badgeClass}">${levelText}</span>`;
      }
      if (this.acceptBtn) {
        this.acceptBtn.classList.remove('hidden');
        this.metadata._setAcceptLoading(false);
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
    const entries = Object.entries(wordInfo.suggestions || {});
    
    if (entries.length === 0) {
      this.suggestionsContainer.textContent = 'No suggestions available';
      return;
    }

    const suggestionsList = document.createElement('ul');
    suggestionsList.className = 'menu menu-sm bg-base-200 w-full rounded-lg grid grid-cols-3 gap-2';
    const frag = document.createDocumentFragment();

    entries.forEach(([suggestion, frequency], index) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'flex items-center justify-center gap-2 p-2';
      
      // Add keyboard shortcut indicator for first 9 suggestions
      const keyboardShortcut = index < 9 ? `<kbd class="kbd kbd-xs">${index + 1}</kbd>` : '';
      
      link.innerHTML = `
        ${keyboardShortcut}
        <span>${suggestion}</span>
      `;
      
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
      LibriscanUtils.showToast('Suggestion cannot be empty', 'error');
      return;
    }

    await this._updateWordText(suggestion, {
      callback: () => {
        suggestionsList.querySelectorAll('a').forEach(a => a.classList.remove('active'));
        clickedLink.classList.add('active');
      },
      autoAdvance: true
    });
  }

  async _updateWordText(newText, callbackOrOptions) {
    try {
      const updateUrl = LibriscanUtils.buildWordUpdateURL(this.currentWordInfo.id);
      const data = await LibriscanUtils.postFormData(updateUrl, { text: newText });
      
      this._updateWordData(data);
      this._updateWordUI();
      this._updateWordBlock(data);
      
      document.dispatchEvent(new CustomEvent('wordUpdated', { 
        detail: { wordId: this.currentWordId, data } 
      }));
      
      // Check if revert button should be enabled after text change
      await this._checkAndEnableRevertButton(this.currentWordId);
      
      // Handle callbacks and messages
      if (typeof callbackOrOptions === 'function') {
        LibriscanUtils.showToast('Word updated successfully');
        callbackOrOptions();
      } else if (callbackOrOptions?.successMessage) {
        LibriscanUtils.showToast(callbackOrOptions.successMessage, 'success');
        callbackOrOptions.callback?.();
      } else {
        LibriscanUtils.showToast('Word updated successfully');
      }
      
      // Auto-advance to next word if requested and not at last word
      if (callbackOrOptions?.autoAdvance) {
        const currentButton = document.querySelector(`[data-word-id="${this.currentWordId}"]`);
        const hasNextWord = currentButton?.nextElementSibling?.classList.contains('word-block');
        
        if (hasNextWord) {
          // Small delay to allow UI updates to complete
          setTimeout(() => this.goToNextWord(), 100);
        }
      }
    } catch (error) {
      console.error('Error updating word:', error);
      LibriscanUtils.showToast('Error updating word', 'error');
      throw error;
    }
  }

  _updateWordData(data) {
    this.currentWordInfo.word = data.text;
    this.currentWordInfo.confidence = data.confidence;
    this.currentWordInfo.confidence_level = data.confidence_level;
    this.currentWordInfo.suggestions = data.suggestions;
    if (data.text_type !== undefined) {
      this.currentWordInfo.text_type = data.text_type;
    }
    if (data.print_control !== undefined) {
      this.currentWordInfo.print_control = data.print_control;
    }
  }

  _updateWordUI() {
    this.editor.updateWord(this.currentWordInfo.word);
    this._updateConfidenceDisplay(this.currentWordInfo);
    this.updateSuggestions(this.currentWordInfo);
  }

  _updateWordBlock(data) {
    const wordBlock = document.querySelector(`[data-word-id="${this.currentWordInfo.id}"]`);
    if (!wordBlock) return;

    // Update data attributes
    wordBlock.dataset.wordText = data.text;
    wordBlock.dataset.wordConfidence = data.confidence;
    wordBlock.dataset.wordConfidenceLevel = data.confidence_level;
    wordBlock.dataset.wordSuggestions = JSON.stringify(Object.entries(data.suggestions));
    if (data.print_control !== undefined) {
      wordBlock.dataset.wordPrintControl = data.print_control;
    }
    if (data.text_type !== undefined) {
      wordBlock.dataset.wordType = data.text_type;
    }
    
    // Restore confidence CSS classes
    wordBlock.className = wordBlock.className.replace(/confidence-\w+/g, '');
    wordBlock.classList.add(`confidence-${data.confidence_level}`);
    
    // Restore print control CSS classes
    wordBlock.classList.remove('print-control-omit', 'print-control-merge');
    if (data.print_control === 'O') {
      wordBlock.classList.add('print-control-omit');
    } else if (data.print_control === 'M') {
      wordBlock.classList.add('print-control-merge');
    }
    
    this.updateWordBlockContent(wordBlock, data.text, data.confidence, data.confidence_level);
  }

  async _handlePrintControlUpdate(detail) {
    const { wordId, printControl, data } = detail;
    const wordBlock = document.querySelector(`[data-word-id="${wordId}"]`);
    if (!wordBlock) return;

    // Update currentWordInfo if this is the current word
    if (this.currentWordId === wordId && this.currentWordInfo) {
      if (data && data.print_control !== undefined) {
        this.currentWordInfo.print_control = data.print_control;
      } else {
        // If data is not provided, update from the printControl value
        this.currentWordInfo.print_control = printControl;
      }
    }

    wordBlock.dataset.wordPrintControl = printControl;
    wordBlock.classList.remove('print-control-omit', 'print-control-merge');
    
    if (printControl === 'O') {
      wordBlock.classList.add('print-control-omit');
    } else if (printControl === 'M') {
      wordBlock.classList.add('print-control-merge');
    }

    document.dispatchEvent(new CustomEvent('wordUpdated', { 
      detail: { wordId: wordId, data: { print_control: printControl } } 
    }));

    // Check if revert button should be enabled after print control change
    if (this.currentWordId === wordId) {
      await this._checkAndEnableRevertButton(wordId);
    }
  }

  async _handleTextTypeUpdate(detail) {
    const { wordId, textType, data } = detail;
    
    // Update currentWordInfo if this is the current word
    if (this.currentWordId === wordId && this.currentWordInfo) {
      if (data && data.text_type !== undefined) {
        this.currentWordInfo.text_type = data.text_type;
      } else {
        // If data is not provided, update from the textType value
        this.currentWordInfo.text_type = textType;
      }
    }

    const wordBlock = document.querySelector(`[data-word-id="${wordId}"]`);
    const textTypeValue = data?.text_type !== undefined ? data.text_type : textType;
    if (wordBlock && textTypeValue) {
      wordBlock.dataset.wordType = textTypeValue;
    }

    document.dispatchEvent(new CustomEvent('wordUpdated', { 
      detail: { wordId: wordId, data: { text_type: textType } } 
    }));

    // Check if revert button should be enabled after text type change
    if (this.currentWordId === wordId) {
      await this._checkAndEnableRevertButton(wordId);
    }
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

    let currentPosition = 1;
    let button = currentButton;
    while (button.previousElementSibling?.classList.contains('word-block')) {
      currentPosition++;
      button = button.previousElementSibling;
    }

    this.prevWordBtn.disabled = !currentButton.previousElementSibling?.classList.contains('word-block');
    this.nextWordBtn.disabled = !currentButton.nextElementSibling?.classList.contains('word-block');
    this.wordPosition.textContent = `${currentPosition} of ${this.totalWords}`;
  }

  _syncActiveWordButton() {
    const prev = document.querySelector('.word-block.btn-active');
    if (prev) prev.classList.remove('btn-active');

    const currentButton = document.querySelector(`[data-word-id="${this.currentWordId}"]`);
    if (!currentButton) return;
    
    currentButton.classList.add('btn-active');

    try {
      currentButton.scrollIntoView({ block: 'center', behavior: 'smooth' });
    } catch (e) {
      currentButton.scrollIntoView();
    }
  }

  updateWordBlockContent(wordBlock, text, confidence, confidenceLevel) {
    wordBlock.innerHTML = '';
    
    const isAccepted = confidenceLevel === 'accepted' || confidence >= 99.999;
    
    const textSpan = document.createElement('span');
    if (isAccepted) {
      textSpan.className = 'accepted-word';
    }
    textSpan.textContent = text;
    wordBlock.appendChild(textSpan);
  }

  saveToDictionary() {
    // TODO: Implement functionality
  }

  async revertToOriginalWord() {
    if (!this.currentWordId) {
      LibriscanUtils.showToast('No word selected', 'error');
      return;
    }

    const button = this.revertToOriginalAction;
    const originalText = button?.textContent;
    
    if (button) {
      button.disabled = true;
      button.classList.add('loading');
      button.textContent = 'Reverting...';
    }

    try {
      const data = await LibriscanUtils.postFormData(
        LibriscanUtils.buildWordRevertURL(this.currentWordId), 
        {}
      );

      this._updateWordData(data);
      this._updateWordUI();
      this._updateWordBlock(data);

      if (data.text_type !== undefined) this.metadata.updateTextTypeDisplay(data.text_type);
      if (data.print_control !== undefined) this.metadata.updatePrintControlDisplay(data.print_control);

      document.dispatchEvent(new CustomEvent('wordUpdated', {
        detail: { wordId: this.currentWordId, data }
      }));

      const auditHistoryTab = document.getElementById('wordAuditHistoryTab');
      if (auditHistoryTab?.checked && this.auditHistory) {
        await this.auditHistory.displayHistory(this.currentWordId);
      }

      await this._checkAndEnableRevertButton(this.currentWordId);
      LibriscanUtils.showToast('Word reverted to original', 'success');
    } catch (error) {
      console.error('Error reverting word:', error);
      LibriscanUtils.showToast(error.message || 'Failed to revert word', 'error');
    } finally {
      if (button) {
        button.disabled = false;
        button.classList.remove('loading');
        button.textContent = originalText || 'Revert to Original';
      }
    }
  }

  async _checkAndEnableRevertButton(wordId) {
    if (!this.revertToOriginalAction) return;

    try {
      const data = await LibriscanUtils.fetchJSON(LibriscanUtils.buildWordHistoryURL(wordId));
      const history = data.history || [];
      
      if (!history.length || !this.currentWordInfo) {
        this._disableRevertButton();
        return;
      }

      const earliestRecord = history[history.length - 1];
      const current = this.currentWordInfo;
      
      const isSameAsOriginal = 
        current.word === earliestRecord.text &&
        parseFloat(current.confidence) === parseFloat(earliestRecord.confidence) &&
        current.text_type === earliestRecord.text_type &&
        current.print_control === earliestRecord.print_control;

      isSameAsOriginal ? this._disableRevertButton() : this._enableRevertButton();
    } catch (error) {
      this._disableRevertButton();
    }
  }

  _enableRevertButton() {
    if (!this.revertToOriginalAction) return;
    this.revertToOriginalAction.classList.remove('opacity-50', 'pointer-events-none');
    this.revertToOriginalAction.removeAttribute('aria-disabled');
    this.revertToOriginalAction.removeAttribute('tabindex');
  }

  _disableRevertButton() {
    if (!this.revertToOriginalAction) return;
    this.revertToOriginalAction.classList.add('opacity-50', 'pointer-events-none');
    this.revertToOriginalAction.setAttribute('aria-disabled', 'true');
    this.revertToOriginalAction.setAttribute('tabindex', '-1');
  }

  async loadAuditHistory() {
    if (!this.currentWordId) {
      LibriscanUtils.showToast('No word selected', 'error');
      return;
    }

    if (!this.auditHistory) {
      this.auditHistory = new AuditHistory();
    }

    await this.auditHistory.displayHistory(this.currentWordId);
    
    // Re-check button state after loading history
    this._checkAndEnableRevertButton(this.currentWordId);
  }

  selectFirstWord() {
    setTimeout(() => {
      const lastEditedId = this.container.dataset.lastEditedWordId;
      const wordToSelect = (lastEditedId && document.querySelector(`[data-word-id="${lastEditedId}"]`)) 
        || document.querySelector('.word-block');
      
      if (wordToSelect) wordToSelect.click();
    }, 100);
  }
}

// Initialize the WordDetails component when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WordDetails();
});
