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
    this.typeControlStat = elements.typeControlStat;
    this.confidenceStat = elements.confidenceStat;
    
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
      alert('Text cannot be empty');
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
    
    if (enabled) {
      // Save current word before editing
      this.preEditWord = this.wordElement.textContent;
      
      // Hide other stats to give input full width for extremely long words
      if (this.typeControlStat) this.typeControlStat.classList.add('lg:hidden');
      if (this.confidenceStat) this.confidenceStat.classList.add('lg:hidden');
      
      // Show edit UI
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
      
      // Show display UI
      this.wordElement.classList.remove('hidden');
      this.wordInput.classList.add('hidden');
      this.editButton.classList.remove('hidden');
      this.saveButton.classList.add('hidden');
      this.revertButton.classList.add('hidden');
    }
  }

  static isTyping() {
    const active = document.activeElement;
    return !!(active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable));
  }
}

