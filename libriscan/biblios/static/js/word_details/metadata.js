/**
 * WordMetadata - Handles word metadata updates
 * Manages word visibility control and accepted status functionality
 */
class WordMetadata {
  constructor(elements) {
    this.wordVisibilityControlDropdownBtn = elements.wordVisibilityControlDropdownBtn;
    this.wordVisibilityControlBadge = elements.wordVisibilityControlBadge;
    this.wordVisibilityControlOptions = elements.wordVisibilityControlOptions;
    this.acceptBtn = elements.acceptBtn;
    this.currentWordId = null;
    this.currentWordInfo = null;
    this.currentWordVisibilityControl = 'I';
    this.onAccept = null;
  }

  initializeEventListeners() {
    this.wordVisibilityControlOptions.forEach(option => {
      option.addEventListener('click', (event) => {
        event.preventDefault();
        this.updateWordVisibilityControl(option.getAttribute('data-value'));
        this._closeDropdown(this.wordVisibilityControlDropdownBtn);
      });
    });
    
    if (this.acceptBtn) {
      this.acceptBtn.onclick = () => this.accept();
    }
  }

  setCurrentWordId(wordId) {
    this.currentWordId = wordId;
  }

  setCurrentWordInfo(wordInfo) {
    this.currentWordInfo = wordInfo;
    this.currentWordId = wordInfo.id;
  }

  async updateWordVisibilityControl(wordVisibilityControlValue) {
    if (!this.currentWordId) {
      console.error('No word selected');
      LibriscanUtils.showToast('No word selected', 'error');
      return;
    }
    
    this.wordVisibilityControlBadge.textContent = 'Updating...';
    this.wordVisibilityControlDropdownBtn.disabled = true;
    
    try {
      const data = await this._sendWordVisibilityControlUpdate(wordVisibilityControlValue);
      this.currentWordVisibilityControl = data.print_control;
      this._updateWordVisibilityControlDisplay(data.print_control);
      this._showWordVisibilityControlSuccess();
      LibriscanUtils.showToast('Word visibility control updated', 'success');
      
      // Dispatch event to update word block styling
      document.dispatchEvent(new CustomEvent('wordVisibilityControlUpdated', { 
        detail: { wordId: this.currentWordId, wordVisibilityControl: data.print_control, data: data } 
      }));
      
      return data;
    } catch (error) {
      console.error('Error updating word visibility control:', error);
      LibriscanUtils.showToast(error.message || 'Failed to update word visibility control', 'error');
      this._updateWordVisibilityControlDisplay(this.currentWordVisibilityControl);
      throw error;
    } finally {
      this.wordVisibilityControlDropdownBtn.disabled = false;
    }
  }

  updateWordVisibilityControlDisplay(wordVisibilityControlValue) {
    this.currentWordVisibilityControl = wordVisibilityControlValue;
    this._updateWordVisibilityControlDisplay(wordVisibilityControlValue);
  }

  async _sendWordVisibilityControlUpdate(wordVisibilityControlValue) {
    const { shortName, collectionSlug, identifier, pageNumber } = LibriscanUtils.parseLibriscanURL();
    const url = `/${shortName}/${collectionSlug}/${identifier}/page${pageNumber}/word/${this.currentWordId}/print-control/`;
    
    return await LibriscanUtils.postFormData(url, { 
      print_control: wordVisibilityControlValue 
    });
  }

  _updateWordVisibilityControlDisplay(wordVisibilityControlValue) {
    const config = {
      'I': { text: 'Include', badge: 'badge-success' },
      'M': { text: 'Merge with Prior', badge: 'badge-warning' },
      'O': { text: 'Omit', badge: 'badge-error' }
    }[wordVisibilityControlValue] || { text: 'Include', badge: 'badge-success' };
    
    if (this.wordVisibilityControlBadge) {
      this.wordVisibilityControlBadge.textContent = config.text;
      this.wordVisibilityControlBadge.className = `badge badge-sm ${config.badge}`;
    }
  }

  _showWordVisibilityControlSuccess() {
    if (!this.wordVisibilityControlBadge) return;
    
    this.wordVisibilityControlBadge.classList.add('badge-outline');
    setTimeout(() => this.wordVisibilityControlBadge.classList.remove('badge-outline'), 300);
  }

  _closeDropdown(dropdownBtn) {
    if (dropdownBtn) dropdownBtn.blur();
    if (document.activeElement) document.activeElement.blur();
  }
  
  async accept() {
    if (!this.currentWordInfo?.word) {
      LibriscanUtils.showToast('No word selected', 'error');
      return;
    }
    
    if (this.acceptBtn?.disabled) {
      return; // Prevent double-clicking
    }
    
    this._setAcceptLoading(true);
    
    try {
      if (this.onAccept) {
        await this.onAccept(this.currentWordInfo.word);
        // Keep button disabled after successful accept
        if (this.acceptBtn) {
          this.acceptBtn.disabled = true;
        }
      }
    } catch (error) {
      console.error('Error accepting:', error);
      LibriscanUtils.showToast('Failed to accept', 'error');
      // Re-enable on error
      this._setAcceptLoading(false);
    }
  }
  
  _setAcceptLoading(isLoading) {
    if (!this.acceptBtn) return;
    
    this.acceptBtn.disabled = isLoading;
    if (isLoading) {
      this.acceptBtn.innerHTML = `<span class="loading loading-spinner loading-xs"></span>Saving...`;
    } else {
      this.acceptBtn.innerHTML = `<span class="text-xs">Accept</span>
        <kbd class="kbd kbd-xs">A</kbd>`;
      this.acceptBtn.disabled = false;
    }
  }
}

