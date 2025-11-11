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
    if (this.editButton) {
      this.editButton.onclick = () => this.enterEditMode();
    }
    if (this.saveButton) {
      this.saveButton.onclick = () => this.save();
    }
    if (this.revertButton) {
      this.revertButton.onclick = () => this.revert();
    }
    if (this.wordInput) {
      this.wordInput.onkeypress = (event) => { 
        if (event.key === 'Enter') {
          event.preventDefault();
          event.stopPropagation();
          this.save(); 
        }
      };
      this.wordInput.onkeydown = (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          this.revert();
        } else if (event.key === 'Enter') {
          // Prevent Enter from bubbling up to keyboard handler
          event.stopPropagation();
        }
      };
    }
    
    // Double-click to edit
    if (this.wordElement) {
      this.wordElement.addEventListener('dblclick', () => this.enterEditMode());
      // Visual feedback
      this.wordElement.style.cursor = 'pointer';
    }
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
      if (this.wordInput) {
        this.wordInput.value = this.preEditWord;
      }
      if (this.wordElement) {
        this.wordElement.textContent = this.preEditWord;
        this.wordElement.title = this.preEditWord;
      }
      
      if (this.onRevert) {
        this.onRevert(this.preEditWord);
      }
    }
    this.exitEditMode();
  }

  updateWord(word) {
    if (this.wordElement) {
      this.wordElement.textContent = word;
      // Add title attribute to show full word on hover when truncated
      this.wordElement.title = word;
    }
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
      if (this.wordElement) {
        this.preEditWord = this.wordElement.textContent;
      }
      
      // Switch to edit mode
      this._toggleElements(displayModeElements, true);  // Hide
      this._toggleElements(editModeElements, false);     // Show
      
      // Set input value and focus
      if (this.wordInput && this.wordElement) {
        this.wordInput.value = this.wordElement.textContent;
        this.wordInput.focus();
      }
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

