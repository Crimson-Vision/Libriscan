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

    // Stat container elements for full-width edit mode
    this.typeControlStat = document.getElementById('typeControlStat');
    this.confidenceStat = document.getElementById('confidenceStat');

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
      revertButton: this.revertButton,
      typeControlStat: this.typeControlStat,
      confidenceStat: this.confidenceStat
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
      markAcceptedBtn: this.markAcceptedBtn
    });

    // Setup editor callbacks
    this.editor.onSave = async (newText) => {
      await this._updateWordText(newText, () => {
        // Callback after successful save
      });
    };

    this.editor.onRevert = (preEditWord) => {
      this.currentWordInfo.word = preEditWord;
    };

    // Setup metadata callbacks
    this.metadata.onMarkAccepted = async (wordText) => {
      await this._updateWordText(wordText, {
        successMessage: 'Marked as accepted'
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
    this.editor.updateWord(wordInfo.word);
    this._syncActiveWordButton();
    this.updateNavigationState();
    this._updateConfidenceDisplay(wordInfo);
    this.metadata.updateTextTypeDisplay(wordInfo.text_type || 'P');
    this.metadata.updatePrintControlDisplay(wordInfo.print_control || 'I');
    this.updateSuggestions(wordInfo);
  }

  _updateConfidenceDisplay(wordInfo) {
    const raw = parseFloat(wordInfo.confidence) || 0;
    
    if (this.scoreElement) this.scoreElement.style.display = 'none';
    if (this.progressBar) this.progressBar.style.display = 'none';
    
    if (raw >= 99.999) {
      if (this.confidenceLevelSpan) {
        this.confidenceLevelSpan.innerHTML = '<span class="badge badge-primary">Accepted</span>';
      }
      if (this.markAcceptedBtn) this.markAcceptedBtn.classList.add('hidden');
    } else {
      if (this.confidenceLevelSpan) {
        const level = (wordInfo.confidence_level || 'none').toLowerCase();
        const levelText = this.getLevelText(level);
        const badgeClass = this.getBadgeClass(level);
        this.confidenceLevelSpan.innerHTML = `<span class="badge ${badgeClass}">${levelText}</span>`;
      }
      if (this.markAcceptedBtn) {
        this.markAcceptedBtn.classList.remove('hidden');
        this.metadata._setMarkAcceptedLoading(false);
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
    suggestionsList.className = 'menu menu-sm bg-base-200 w-full rounded-lg';
    const frag = document.createDocumentFragment();
    const total = entries.length;

    entries.forEach(([suggestion, frequency], index) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'flex items-center gap-3';
      
      const { progressValue, progressClass } = this._calculateSuggestionProgress(index, total);
      
      link.innerHTML = `
        <span class="badge badge-neutral badge-sm shrink-0">${index + 1}</span>
        <span class="flex-1">${suggestion}</span>
        <progress class="progress w-20 ${progressClass}" value="${progressValue}" max="100"></progress>
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

  _calculateSuggestionProgress(index, total) {
    if (total === 1) {
      return { progressValue: 100, progressClass: 'progress-success' };
    }
    
    const progressValue = 100 - (index / (total - 1)) * 90;
    const progressClass = progressValue >= 70 ? 'progress-success' 
                        : progressValue >= 40 ? 'progress-warning' 
                        : 'progress-error';
    
    return { progressValue, progressClass };
  }

  async applySuggestion(suggestion, suggestionsList, clickedLink) {
    if (!suggestion.trim()) {
      LibriscanUtils.showToast('Suggestion cannot be empty', 'error');
      return;
    }

    await this._updateWordText(suggestion, () => {
      suggestionsList.querySelectorAll('a').forEach(a => a.classList.remove('active'));
      clickedLink.classList.add('active');
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

  _updateWordData(data) {
    this.currentWordInfo.word = data.text;
    this.currentWordInfo.confidence = data.confidence;
    this.currentWordInfo.confidence_level = data.confidence_level;
    this.currentWordInfo.suggestions = data.suggestions;
  }

  _updateWordUI() {
    this.editor.updateWord(this.currentWordInfo.word);
    this._updateConfidenceDisplay(this.currentWordInfo);
    this.updateSuggestions(this.currentWordInfo);
  }

  _updateWordBlock(data) {
    const wordBlock = document.querySelector(`[data-word-id="${this.currentWordInfo.id}"]`);
    if (!wordBlock) return;

    wordBlock.dataset.wordText = data.text;
    wordBlock.dataset.wordConfidence = data.confidence;
    wordBlock.dataset.wordConfidenceLevel = data.confidence_level;
    wordBlock.dataset.wordSuggestions = JSON.stringify(Object.entries(data.suggestions));
    
    wordBlock.className = wordBlock.className.replace(/confidence-\w+/g, '');
    wordBlock.classList.add(`confidence-${data.confidence_level}`);
    
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
    const existingStatus = wordBlock.querySelector('.accepted-status');
    if (existingStatus) existingStatus.remove();

    wordBlock.textContent = text;
    
    if (confidenceLevel === 'accepted' || confidence >= 99.999) {
      const status = document.createElement('div');
      status.setAttribute('aria-label', 'status');
      status.className = 'status status-primary accepted-status';
      wordBlock.appendChild(status);
    }
  }

  revertToOriginalWord() {
    console.log('Revert to Original Word clicked');
    // TODO: Implement functionality
  }

  saveToDictionary() {
    console.log('Save to Dictionary clicked');
    // TODO: Implement functionality
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
  }

  selectFirstWord() {
    setTimeout(() => {
      const firstWordBlock = document.querySelector('.word-block');
      if (firstWordBlock) firstWordBlock.click();
    }, 100);
  }
}

// Initialize the WordDetails component when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WordDetails();
});
