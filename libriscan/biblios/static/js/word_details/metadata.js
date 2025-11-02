/**
 * WordMetadata - Handles word metadata updates
 * Manages print control and accepted status functionality
 */
class WordMetadata {
  constructor(elements) {
    this.printControlDropdownBtn = elements.printControlDropdownBtn;
    this.printControlDisplay = elements.printControlDisplay;
    this.printControlBadge = elements.printControlBadge;
    this.printControlOptions = elements.printControlOptions;
    this.acceptBtn = elements.acceptBtn;
    this.currentWordId = null;
    this.currentWordInfo = null;
    this.currentPrintControl = 'I';
    this.onAccept = null;
  }

  initializeEventListeners() {
    this.printControlOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        this.updatePrintControl(option.getAttribute('data-value'));
        this._closeDropdown(this.printControlDropdownBtn);
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

  async updatePrintControl(printControlValue) {
    if (!this.currentWordId) {
      console.error('No word selected');
      LibriscanUtils.showToast('No word selected', 'error');
      return;
    }
    
    this.printControlDisplay.textContent = 'Updating...';
    this.printControlDropdownBtn.disabled = true;
    
    try {
      const data = await this._sendPrintControlUpdate(printControlValue);
      this.currentPrintControl = data.print_control;
      this._updatePrintControlDisplay(data.print_control);
      this._showPrintControlSuccess();
      LibriscanUtils.showToast('Print control updated', 'success');
      
      // Dispatch event to update word block styling
      document.dispatchEvent(new CustomEvent('printControlUpdated', { 
        detail: { wordId: this.currentWordId, printControl: data.print_control, data: data } 
      }));
      
      return data;
    } catch (error) {
      console.error('Error updating print control:', error);
      LibriscanUtils.showToast(error.message || 'Failed to update print control', 'error');
      this._updatePrintControlDisplay(this.currentPrintControl);
      throw error;
    } finally {
      this.printControlDropdownBtn.disabled = false;
    }
  }

  updatePrintControlDisplay(printControlValue) {
    this.currentPrintControl = printControlValue;
    this._updatePrintControlDisplay(printControlValue);
  }

  async _sendPrintControlUpdate(printControlValue) {
    const { shortName, collectionSlug, identifier, pageNumber } = LibriscanUtils.parseLibriscanURL();
    const url = `/${shortName}/${collectionSlug}/${identifier}/page${pageNumber}/word/${this.currentWordId}/print-control/`;
    
    return await LibriscanUtils.postFormData(url, { 
      print_control: printControlValue 
    });
  }

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

  _showPrintControlSuccess() {
    if (!this.printControlBadge) return;
    
    this.printControlBadge.classList.add('badge-outline');
    setTimeout(() => this.printControlBadge.classList.remove('badge-outline'), 300);
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
    
    this._setAcceptLoading(true);
    
    try {
      if (this.onAccept) {
        await this.onAccept(this.currentWordInfo.word);
      }
    } catch (error) {
      console.error('Error accepting:', error);
      LibriscanUtils.showToast('Failed to accept', 'error');
    } finally {
      this._setAcceptLoading(false);
    }
  }
  
  _setAcceptLoading(isLoading) {
    if (!this.acceptBtn) return;
    
    this.acceptBtn.disabled = isLoading;
    this.acceptBtn.innerHTML = isLoading
      ? `<span class="loading loading-spinner loading-xs"></span>Saving...`
      : `<span class="text-xs">Accept</span>
        <kbd class="kbd kbd-xs">A</kbd>`;
  }
}

