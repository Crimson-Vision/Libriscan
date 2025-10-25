/**
 * WordMetadata - Handles word metadata updates
 * Manages text type, print control, and accepted status functionality
 */
class WordMetadata {
  constructor(elements) {
    this.printControlDropdownBtn = elements.printControlDropdownBtn;
    this.printControlDisplay = elements.printControlDisplay;
    this.printControlBadge = elements.printControlBadge;
    this.printControlOptions = elements.printControlOptions;
    this.textTypeDropdownBtn = elements.textTypeDropdownBtn;
    this.textTypeDisplay = elements.textTypeDisplay;
    this.textTypeBadge = elements.textTypeBadge;
    this.textTypeOptions = elements.textTypeOptions;
    this.markAcceptedBtn = elements.markAcceptedBtn;
    this.currentWordId = null;
    this.currentWordInfo = null;
    this.currentPrintControl = 'I';
    this.currentTextType = 'P';
    this.onMarkAccepted = null;
  }

  initializeEventListeners() {
    this.printControlOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        this.updatePrintControl(option.getAttribute('data-value'));
        this._closeDropdown(this.printControlDropdownBtn);
      });
    });
    
    this.textTypeOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        this.updateTextType(option.getAttribute('data-value'));
        this._closeDropdown(this.textTypeDropdownBtn);
      });
    });
    
    if (this.markAcceptedBtn) {
      this.markAcceptedBtn.onclick = () => this.markAsAccepted();
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

  async updateTextType(textTypeValue) {
    if (!this.currentWordId) {
      console.error('No word selected');
      return;
    }
    
    this.textTypeDisplay.textContent = 'Updating...';
    this.textTypeDropdownBtn.disabled = true;
    
    try {
      const data = await this._sendTextTypeUpdate(textTypeValue);
      this.currentTextType = data.text_type;
      this._updateTextTypeDisplay(data.text_type);
      this._showTextTypeSuccess();
      LibriscanUtils.showToast('Text type updated', 'success');
      return data;
    } catch (error) {
      console.error('Error updating text type:', error);
      LibriscanUtils.showToast(error.message || 'Failed to update text type', 'error');
      this._updateTextTypeDisplay(this.currentTextType);
      throw error;
    } finally {
      this.textTypeDropdownBtn.disabled = false;
    }
  }

  updatePrintControlDisplay(printControlValue) {
    this.currentPrintControl = printControlValue;
    this._updatePrintControlDisplay(printControlValue);
  }

  updateTextTypeDisplay(textTypeValue) {
    this.currentTextType = textTypeValue;
    this._updateTextTypeDisplay(textTypeValue);
  }

  async _sendPrintControlUpdate(printControlValue) {
    const { shortName, collectionSlug, identifier, pageNumber } = LibriscanUtils.parseLibriscanURL();
    const url = `/${shortName}/${collectionSlug}/${identifier}/page${pageNumber}/word/${this.currentWordId}/print-control/`;
    
    return await LibriscanUtils.postFormData(url, { 
      print_control: printControlValue 
    });
  }

  async _sendTextTypeUpdate(textTypeValue) {
    const { shortName, collectionSlug, identifier, pageNumber } = LibriscanUtils.parseLibriscanURL();
    const url = `/${shortName}/${collectionSlug}/${identifier}/page${pageNumber}/word/${this.currentWordId}/text-type/`;
    
    return await LibriscanUtils.postFormData(url, { 
      text_type: textTypeValue 
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

  _showPrintControlSuccess() {
    if (!this.printControlBadge) return;
    
    this.printControlBadge.classList.add('badge-outline');
    setTimeout(() => this.printControlBadge.classList.remove('badge-outline'), 300);
  }

  _showTextTypeSuccess() {
    if (!this.textTypeBadge) return;
    
    this.textTypeBadge.classList.add('badge-outline');
    setTimeout(() => this.textTypeBadge.classList.remove('badge-outline'), 300);
  }

  _closeDropdown(dropdownBtn) {
    if (dropdownBtn) dropdownBtn.blur();
    if (document.activeElement) document.activeElement.blur();
  }
  
  async markAsAccepted() {
    if (!this.currentWordInfo?.word) {
      LibriscanUtils.showToast('No word selected', 'error');
      return;
    }
    
    this._setMarkAcceptedLoading(true);
    
    try {
      if (this.onMarkAccepted) {
        await this.onMarkAccepted(this.currentWordInfo.word);
      }
    } catch (error) {
      console.error('Error marking as accepted:', error);
      LibriscanUtils.showToast('Failed to mark as accepted', 'error');
    } finally {
      this._setMarkAcceptedLoading(false);
    }
  }
  
  _setMarkAcceptedLoading(isLoading) {
    if (!this.markAcceptedBtn) return;
    
    this.markAcceptedBtn.disabled = isLoading;
    this.markAcceptedBtn.innerHTML = isLoading
      ? `<span class="loading loading-spinner loading-xs"></span>Saving...`
      : `<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
        Mark as Accepted`;
  }
}

