/**
 * WordUpdateHandler - Handles word update operations
 */
class WordUpdateHandler {
  constructor(wordDetails) {
    this.wordDetails = wordDetails;
  }

  async updateWordText(newText, options = {}) {
    try {
      const updateUrl = LibriscanUtils.buildWordUpdateURL(this.wordDetails.currentWordInfo.id);
      const data = await LibriscanUtils.postFormData(updateUrl, { text: newText });
      
      this.applyWordUpdate(data);
      this.handleUpdateCallbacks(options);
      
      if (options.autoAdvance) {
        this.autoAdvanceIfPossible();
      }
    } catch (error) {
      console.error('Error updating word:', error);
      LibriscanUtils.showToast('Error updating word', 'error');
      throw error;
    }
  }

  applyWordUpdate(data) {
    this.updateWordData(data);
    this.updateWordUI();
    this.updateWordBlock(data);
    
    document.dispatchEvent(new CustomEvent('wordUpdated', { 
      detail: { wordId: this.wordDetails.currentWordId, data } 
    }));
    
    this.wordDetails._checkAndEnableRevertButton(this.wordDetails.currentWordId);
  }

  updateWordData(data) {
    const wordInfo = this.wordDetails.currentWordInfo;
    wordInfo.word = data.text;
    wordInfo.confidence = data.confidence;
    wordInfo.confidence_level = data.confidence_level;
    wordInfo.suggestions = data.suggestions;
    if (data.text_type !== undefined) wordInfo.text_type = data.text_type;
    if (data.print_control !== undefined) wordInfo.print_control = data.print_control;
  }

  updateWordUI() {
    this.wordDetails.editor.updateWord(this.wordDetails.currentWordInfo.word);
    this.wordDetails._updateConfidenceDisplay(this.wordDetails.currentWordInfo);
    this.wordDetails.updateSuggestions(this.wordDetails.currentWordInfo);
  }

  updateWordBlock(data) {
    const wordBlock = WordBlockManager.getWordBlock(this.wordDetails.currentWordInfo.id);
    if (!wordBlock) return;

    WordBlockManager.updateDataAttributes(wordBlock, data);
    WordBlockManager.updateClasses(wordBlock, data);
    WordBlockManager.updateContent(wordBlock, data.text, data.confidence, data.confidence_level);
  }

  handleUpdateCallbacks(options) {
    if (typeof options === 'function') {
      LibriscanUtils.showToast('Word updated successfully');
      options();
    } else if (options?.successMessage) {
      LibriscanUtils.showToast(options.successMessage, 'success');
      options.callback?.();
    } else {
      LibriscanUtils.showToast('Word updated successfully');
    }
  }

  autoAdvanceIfPossible() {
    const currentButton = WordBlockManager.getWordBlock(this.wordDetails.currentWordId);
    const hasNextWord = currentButton?.nextElementSibling?.classList.contains(WordDetailsConfig.WORD_BLOCK_CLASS);
    
    if (hasNextWord) {
      setTimeout(() => this.wordDetails.goToNextWord(), WordDetailsConfig.AUTO_ADVANCE_DELAY);
    }
  }

  async handleMetadataChange(detail, metadataKey, updateBlockFn) {
    const { wordId, [metadataKey === 'text_type' ? 'textType' : 'printControl']: value, data } = detail;
    const wordBlock = WordBlockManager.getWordBlock(wordId);
    if (!wordBlock) return;

    const metadataValue = data?.[metadataKey] ?? value;

    if (this.wordDetails.currentWordId === wordId && this.wordDetails.currentWordInfo) {
      this.wordDetails.currentWordInfo[metadataKey] = metadataValue;
    }

    updateBlockFn(wordBlock, metadataValue);

    document.dispatchEvent(new CustomEvent('wordUpdated', { 
      detail: { wordId, data: { [metadataKey]: metadataValue } } 
    }));

    if (this.wordDetails.currentWordId === wordId) {
      await this.wordDetails._checkAndEnableRevertButton(wordId);
    }
  }
}

