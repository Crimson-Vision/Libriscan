/**
 * WordEditor - Handles word editing functionality
 * Manages edit mode, save, and revert operations
 */
class WordEditor {
  constructor(elements) {
    // DOM elements
    this.wordElement = elements.wordElement;
    this.wordInput = elements.wordInput;
    this.editButton = elements.editButton;
    this.saveButton = elements.saveButton;
    this.revertButton = elements.revertButton;
    
    // State
    this.preEditWord = null;
    this.isEditing = false;
    
    // Callbacks
    this.onSave = null;
    this.onRevert = null;
  }

  initializeEventListeners() {
    this.editButton.onclick = () => this.enterEditMode();
    this.saveButton.onclick = () => this.save();
    this.revertButton.onclick = () => this.revert();
    this.wordInput.onkeypress = (e) => { 
      if (e.key === 'Enter') this.save(); 
    };
    this.wordInput.onkeydown = (e) => {
      if (e.key === 'Escape') this.revert();
    };
    
    // Double-click to edit
    this.wordElement.addEventListener('dblclick', () => this.enterEditMode());
    
    // Visual feedback
    this.wordElement.style.cursor = 'pointer';
  }

  enterEditMode() {
    this._setEditMode(true);
  }

  exitEditMode() {
    this._setEditMode(false);
  }

  async save() {
    const newText = this.wordInput.value.trim();
    if (!newText) {
      LibriscanUtils.showToast('Text cannot be empty', 'error');
      return;
    }
    
    if (this.onSave) {
      await this.onSave(newText);
      this.exitEditMode();
    }
  }

  revert() {
    if (this.preEditWord !== null) {
      this.wordInput.value = this.preEditWord;
      this.wordElement.textContent = this.preEditWord;
      this.wordElement.title = this.preEditWord;
      
      if (this.onRevert) {
        this.onRevert(this.preEditWord);
      }
    }
    this.exitEditMode();
  }

  updateWord(word) {
    this.wordElement.textContent = word;
    // Add title attribute to show full word on hover when truncated
    this.wordElement.title = word;
  }

  isEditingMode() {
    return this.isEditing;
  }
  
  /**
   * Toggle edit mode UI
   */
  _setEditMode(enabled) {
    this.isEditing = enabled;
    
    // Elements to show/hide for each mode
    const displayModeElements = [this.wordElement, this.editButton];
    const editModeElements = [this.wordInput, this.saveButton, this.revertButton];
    
    if (enabled) {
      // Save current word before editing
      this.preEditWord = this.wordElement.textContent;
      
      // Switch to edit mode
      this._toggleElements(displayModeElements, true);  // Hide
      this._toggleElements(editModeElements, false);     // Show
      
      // Set input value and focus
      this.wordInput.value = this.wordElement.textContent;
      this.wordInput.focus();
    } else {
      // Switch to display mode
      this._toggleElements(displayModeElements, false);  // Show
      this._toggleElements(editModeElements, true);      // Hide
    }
  }

  _toggleElements(elements, hide) {
    elements.forEach(element => {
      if (element) {
        element.classList.toggle('hidden', hide);
      }
    });
  }

  static isTyping() {
    const active = document.activeElement;
    return !!(active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable));
  }
}

