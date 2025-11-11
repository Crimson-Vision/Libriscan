/**
 * WordDetails - Main component for word details functionality
 * Manages display, navigation, confidence, and suggestions
 */
class WordDetails {
  constructor() {
    // Clean up any existing instance to prevent duplicate event listeners
    if (window.wordDetailsInstance) {
      window.wordDetailsInstance.destroy();
    }
    
    this._initElements();
    this._initData();
    this._initModules();
    this._setupCallbacks();
    this.initializeEventListeners();
    this.navigation.selectFirstWord();
    
    // Store instance globally for cleanup
    window.wordDetailsInstance = this;
  }
  
  destroy() {
    if (this.keyboard) {
      this.keyboard.destroy();
    }
    // Remove event listeners
    document.removeEventListener('wordSelected', this._wordSelectedHandler);
    document.removeEventListener('wordVisibilityControlUpdated', this._wordVisibilityControlHandler);
    window.wordDetailsInstance = null;
  }

  _initElements() {
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
    this.revertToOriginalAction = document.getElementById('revertToOriginalAction');
  }

  _initData() {
    this.currentWordId = null;
    this.currentWordInfo = null;
    this.totalWords = document.querySelectorAll(`.${WordDetailsConfig.WORD_BLOCK_CLASS}`).length;
  }

  _initModules() {
    this.editor = new WordEditor({
      wordElement: this.wordElement,
      wordInput: this.wordInput,
      editButton: this.editButton,
      saveButton: this.saveButton,
      revertButton: this.revertButton
    });

    this.metadata = new WordMetadata({
      wordVisibilityControlDropdownBtn: document.getElementById('wordVisibilityControlDropdownBtn'),
      wordVisibilityControlBadge: document.getElementById('wordVisibilityControlBadge'),
      wordVisibilityControlOptions: document.querySelectorAll('.word-visibility-control-option'),
      acceptBtn: this.acceptBtn
    });

    this.keyboard = new WordKeyboard(this);
    this.keyboard.initialize();

    this.updateHandler = new WordUpdateHandler(this);
    this.navigation = new WordNavigation(this);
    this.suggestions = new WordSuggestions(this);
    this.revert = new WordRevert(this);
    this.reviewFlag = new WordReviewFlag(this);
  }

  _setupCallbacks() {
    this.editor.onSave = (newText) => 
      this.updateHandler.updateWordText(newText, { autoAdvance: true });
    
    this.editor.onRevert = (preEditWord) => {
      if (this.currentWordInfo) {
        this.currentWordInfo.word = preEditWord;
      }
    };

    this.metadata.onAccept = (wordText) => 
      this.updateHandler.updateWordText(wordText, { 
        successMessage: 'Accepted', 
        autoAdvance: true 
      });
  }

  initializeEventListeners() {
    // Store handlers as instance methods for proper cleanup
    this._wordSelectedHandler = (event) => this.updateWordDetails(event.detail);
    this._wordVisibilityControlHandler = (event) => this._handleWordVisibilityControlUpdate(event.detail);
    
    document.addEventListener('wordSelected', this._wordSelectedHandler);
    document.addEventListener('wordVisibilityControlUpdated', this._wordVisibilityControlHandler);
    
    if (this.prevWordBtn) {
      this.prevWordBtn.onclick = () => this.navigation.goToPrevWord();
    }
    if (this.nextWordBtn) {
      this.nextWordBtn.onclick = () => this.navigation.goToNextWord();
    }
    
    if (this.revertToOriginalAction) {
      this.revertToOriginalAction.onclick = () => this.revert.revertToOriginalWord();
    }

    const auditHistoryTab = document.getElementById('wordAuditHistoryTab');
    if (auditHistoryTab) {
      auditHistoryTab.addEventListener('change', () => {
        if (auditHistoryTab.checked) this.loadAuditHistory();
      });
    }

    this.editor.initializeEventListeners();
    this.metadata.initializeEventListeners();
  }

  updateWordDetails(wordInfo) {
    if (this.editor.isEditingMode()) this.editor.exitEditMode();

    this.currentWordInfo = wordInfo;
    this.currentWordId = wordInfo.id;

    this.metadata.setCurrentWordInfo(wordInfo);
    this.container?.classList.remove('hidden');
    
    const detailsTab = document.getElementById('wordDetailsTab');
    if (detailsTab) detailsTab.checked = true;
    
    this.editor.updateWord(wordInfo.word);
    WordBlockManager.syncActiveWordButton(this.currentWordId);
    this.navigation.updateNavigationState();
    this._updateConfidenceDisplay(wordInfo);
    this.metadata.updateWordVisibilityControlDisplay(wordInfo.print_control || 'I');
    this.suggestions.updateSuggestions(wordInfo);
    
    // Update review flag button
    if (this.reviewFlag) {
      this.reviewFlag.updateFlagButton(wordInfo);
    }
    
    this.revert.checkAndEnableRevertButton(wordInfo.id);
  }

  _updateConfidenceDisplay(wordInfo) {
    const confidence = parseFloat(wordInfo.confidence) || 0;
    const isAccepted = confidence >= WordDetailsConfig.ACCEPTED_THRESHOLD;

    if (this.confidenceLevelSpan) {
      if (isAccepted) {
        this.confidenceLevelSpan.innerHTML = '<span class="badge badge-sm badge-primary">Accepted</span>';
      } else {
        const level = (wordInfo.confidence_level || WordDetailsConfig.CONFIDENCE_LEVELS.NONE).toLowerCase();
        const levelText = WordDetailsConfig.LEVEL_TEXT[level] || WordDetailsConfig.LEVEL_TEXT.none;
        const badgeClass = WordDetailsConfig.BADGE_CLASSES[level] || WordDetailsConfig.BADGE_CLASSES.none;
        this.confidenceLevelSpan.innerHTML = `<span class="badge badge-sm ${badgeClass}">${levelText}</span>`;
      }
    }

    if (this.acceptBtn) {
      this.acceptBtn.classList.toggle('hidden', isAccepted);
      if (!isAccepted) this.metadata._setAcceptLoading(false);
    }
  }

  updateSuggestions(wordInfo) {
    this.suggestions.updateSuggestions(wordInfo);
  }

  async applySuggestion(suggestion, suggestionsList, clickedLink) {
    await this.suggestions.applySuggestion(suggestion, suggestionsList, clickedLink);
  }

  async _updateWordText(newText, options = {}) {
    return this.updateHandler.updateWordText(newText, options);
  }

  _applyWordUpdate(data) {
    this.updateHandler.applyWordUpdate(data);
  }

  _updateWordData(data) {
    this.updateHandler.updateWordData(data);
  }

  _updateWordUI() {
    this.updateHandler.updateWordUI();
  }

  _updateWordBlock(data) {
    this.updateHandler.updateWordBlock(data);
  }

  async _handleWordVisibilityControlUpdate(detail) {
    await this.updateHandler.handleMetadataChange(detail, 'print_control', (wordBlock, value) => {
      wordBlock.dataset.wordPrintControl = value;
      WordBlockManager.updateWordVisibilityControlClasses(wordBlock, value);
    });
  }

  goToPrevWord() {
    this.navigation.goToPrevWord();
  }

  goToNextWord() {
    this.navigation.goToNextWord();
  }

  updateNavigationState() {
    this.navigation.updateNavigationState();
  }

  _getWordBlock(wordId) {
    return WordBlockManager.getWordBlock(wordId);
  }

  _getAdjacentWordBlock(direction) {
    return WordBlockManager.getAdjacentWordBlock(this.currentWordId, direction);
  }

  _syncActiveWordButton() {
    WordBlockManager.syncActiveWordButton(this.currentWordId);
  }

  updateWordBlockContent(wordBlock, text, confidence, confidenceLevel) {
    WordBlockManager.updateContent(wordBlock, text, confidence, confidenceLevel);
  }

  async revertToOriginalWord() {
    await this.revert.revertToOriginalWord();
  }

  async _checkAndEnableRevertButton(wordId) {
    await this.revert.checkAndEnableRevertButton(wordId);
  }

  _compareWithOriginal(current, original) {
    return this.revert.compareWithOriginal(current, original);
  }

  _enableRevertButton() {
    this.revert.enableRevertButton();
  }

  _disableRevertButton() {
    this.revert.disableRevertButton();
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
    this.revert.checkAndEnableRevertButton(this.currentWordId);
  }

  selectFirstWord() {
    this.navigation.selectFirstWord();
  }
}

// Initialize the WordDetails component when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WordDetails();
});
