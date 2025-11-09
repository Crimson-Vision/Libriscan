/**
 * WordReviewFlag - Handles review flag toggle
 */
class WordReviewFlag {
  constructor(wordDetails) {
    this.wordDetails = wordDetails;
    this.container = document.getElementById('reviewFlagContainer');
    this.urlCache = null;
    this.filledIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6"><path fill-rule="evenodd" d="M3 2.25a.75.75 0 0 1 .75.75v.54l1.838-.46a9.75 9.75 0 0 1 6.725.738l.108.054A8.25 8.25 0 0 0 18 4.524l3.11-.732a.75.75 0 0 1 .917.81 47.784 47.784 0 0 0 .005 10.337.75.75 0 0 1-.574.812l-3.114.733a9.75 9.75 0 0 1-6.594-.77l-.108-.054a8.25 8.25 0 0 0-5.69-.625l-2.202.55V21a.75.75 0 0 1-1.5 0V3A.75.75 0 0 1 3 2.25Z" clip-rule="evenodd" /></svg>';
    this.outlineIcon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" /></svg>';
    this.flagIconSmall = this.outlineIcon.replace('class="size-6"', 'class="size-4"');
    document.addEventListener('wordSelected', (event) => this.updateFlagButton(event.detail));
    document.addEventListener('htmx:afterSwap', (event) => {
      if (event.target.id === 'reviewFlagBtn') {
        this.updateWordData();
        const isReviewed = event.target.querySelector('svg')?.getAttribute('fill') !== 'none';
        LibriscanUtils?.showToast(
          isReviewed ? 'Flagged for review' : 'Review flag removed',
          'success'
        );
      }
    });
    document.addEventListener('htmx:responseError', (event) => {
      if (event.detail.path.includes('toggle-review')) {
        LibriscanUtils?.showToast('Failed to toggle review flag', 'error');
      }
    });
  }

  getUrlParts() {
    return this.urlCache || (this.urlCache = LibriscanUtils.parseLibriscanURL());
  }

  updateFlagButton(wordInfo) {
    if (!this.container || !wordInfo?.id) return;
    
    const url = this.getUrlParts();
    const toggleUrl = `/${url.shortName}/${url.collectionSlug}/${url.identifier}/page${url.pageNumber}/word/${wordInfo.id}/toggle-review/`;
    const isReviewed = Boolean(wordInfo.review);
    const flaggedCount = document.querySelectorAll('.word-block[data-word-review="true"]').length;
    
    this.container.innerHTML = `
      <button id="reviewFlagBtn" 
              class="btn btn-ghost btn-sm tooltip tooltip-left opacity-70 hover:opacity-100 transition-opacity duration-200 text-orange-500" 
              data-tip="Flag for Review (F)${flaggedCount > 0 ? ` - ${flaggedCount} flagged` : ''}"
              hx-post="${toggleUrl}"
              hx-target="#reviewFlagBtn"
              hx-swap="outerHTML">
        <span class="flex items-center gap-1">
          ${isReviewed ? this.filledIcon : this.outlineIcon}
          <kbd class="kbd kbd-sm">F</kbd>
          ${flaggedCount > 0 ? `<span class="badge badge-warning badge-sm min-w-[1.25rem]">${flaggedCount}</span>` : ''}
        </span>
      </button>
    `;
    
    htmx?.process(this.container);
    this.updateWordBlockVisual(wordInfo.id, isReviewed);
  }

  updateWordBlockVisual(wordId, isReviewed) {
    const wordBlock = WordBlockManager?.getWordBlock?.(wordId);
    if (!wordBlock) return;
    
    const confidence = parseFloat(wordBlock.dataset.wordConfidence) || 0;
    const isAccepted = confidence >= 99.999;
    
    wordBlock.classList.toggle('btn-error', isReviewed);
    
    if (isReviewed) {
      wordBlock.classList.remove('btn-ghost');
      // Keep btn-dash for accepted words even when reviewed
      if (isAccepted) {
        wordBlock.classList.add('btn-dash');
      } else {
        wordBlock.classList.remove('btn-dash');
      }
    } else {
      wordBlock.classList.toggle('btn-ghost', !isAccepted);
      wordBlock.classList.toggle('btn-dash', isAccepted);
    }
    
    const existingIcon = wordBlock.querySelector('.review-flag-icon');
    if (isReviewed && !existingIcon) {
      const flagIcon = document.createElement('span');
      flagIcon.className = 'review-flag-icon inline-flex items-center mr-1';
      flagIcon.innerHTML = this.flagIconSmall;
      wordBlock.insertBefore(flagIcon, wordBlock.querySelector('span') || wordBlock.firstChild);
    } else if (!isReviewed && existingIcon) {
      existingIcon.remove();
    }
  }

  updateWordData() {
    const button = document.getElementById('reviewFlagBtn');
    if (!button || !this.wordDetails.currentWordInfo) return;
    
    const isReviewed = button.querySelector('svg')?.getAttribute('fill') !== 'none';
    this.wordDetails.currentWordInfo.review = isReviewed;
    
    const wordBlock = WordBlockManager?.getWordBlock?.(this.wordDetails.currentWordId);
    if (wordBlock) {
      // Set as string to match template format ('true' or 'false')
      wordBlock.setAttribute('data-word-review', isReviewed ? 'true' : 'false');
      this.updateWordBlockVisual(this.wordDetails.currentWordId, isReviewed);
    }
  }

  toggleFlag() {
    const button = document.getElementById('reviewFlagBtn');
    if (button && this.wordDetails.currentWordId) {
      button.click();
    }
  }
}

window.WordReviewFlag = WordReviewFlag;

