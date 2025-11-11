/**
 * WordRevert - Handles word revert functionality
 */
class WordRevert {
  constructor(wordDetails) {
    this.wordDetails = wordDetails;
  }

  async showConfirmationDialog() {
    const modal = document.getElementById('revertConfirmationModal');
    if (!modal) return true;
    
    return new Promise((resolve) => {
      modal.addEventListener('close', () => resolve(modal.returnValue === 'confirm'), { once: true });
      modal.showModal();
    });
  }

  async revertToOriginalWord() {
    if (!this.wordDetails.currentWordId) {
      LibriscanUtils.showToast('No word selected', 'error');
      return;
    }

    // Show confirmation dialog
    const confirmed = await this.showConfirmationDialog();
    if (!confirmed) {
      return; // User cancelled
    }

    const button = this.wordDetails.revertToOriginalAction;
    const originalText = button?.textContent;
    
    LibriscanUtils.setButtonLoading(button, true, 'Reverting...');

    try {
      const data = await LibriscanUtils.postFormData(
        LibriscanUtils.buildWordRevertURL(this.wordDetails.currentWordId), 
        {}
      );

      this.wordDetails.updateHandler.applyWordUpdate(data);

      if (data.print_control !== undefined) this.wordDetails.metadata.updateWordVisibilityControlDisplay(data.print_control);

      const auditHistoryTab = document.getElementById('wordAuditHistoryTab');
      if (auditHistoryTab?.checked && this.wordDetails.auditHistory) {
        await this.wordDetails.auditHistory.displayHistory(this.wordDetails.currentWordId);
      }

      LibriscanUtils.showToast('Word reverted to original', 'success');
    } catch (error) {
      console.error('Error reverting word:', error);
      LibriscanUtils.showToast(error.message || 'Failed to revert word', 'error');
    } finally {
      LibriscanUtils.setButtonLoading(button, false, originalText || 'Revert to Original');
    }
  }

  async checkAndEnableRevertButton(wordId) {
    if (!this.wordDetails.revertToOriginalAction) return;

    try {
      const data = await LibriscanUtils.fetchJSON(LibriscanUtils.buildWordHistoryURL(wordId));
      const history = data.history || [];
      
      if (!history.length || !this.wordDetails.currentWordInfo) {
        this.disableRevertButton();
        return;
      }

      const earliestRecord = history[history.length - 1];
      const isSameAsOriginal = this.compareWithOriginal(this.wordDetails.currentWordInfo, earliestRecord);

      isSameAsOriginal ? this.disableRevertButton() : this.enableRevertButton();
    } catch (error) {
      this.disableRevertButton();
    }
  }

  compareWithOriginal(current, original) {
    return current.word === original.text &&
           parseFloat(current.confidence) === parseFloat(original.confidence) &&
           current.text_type === original.text_type &&
           current.print_control === original.print_control;
  }

  enableRevertButton() {
    if (!this.wordDetails.revertToOriginalAction) return;
    this.wordDetails.revertToOriginalAction.classList.remove('opacity-50', 'pointer-events-none');
    this.wordDetails.revertToOriginalAction.removeAttribute('aria-disabled');
    this.wordDetails.revertToOriginalAction.removeAttribute('tabindex');
  }

  disableRevertButton() {
    if (!this.wordDetails.revertToOriginalAction) return;
    this.wordDetails.revertToOriginalAction.classList.add('opacity-50', 'pointer-events-none');
    this.wordDetails.revertToOriginalAction.setAttribute('aria-disabled', 'true');
    this.wordDetails.revertToOriginalAction.setAttribute('tabindex', '-1');
  }
}

