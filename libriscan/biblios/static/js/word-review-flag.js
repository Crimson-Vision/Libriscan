/**
 * WordReviewFlag - Handles review flag toggle
 */
class WordReviewFlag {
  constructor(wordDetails) {
    this.wordDetails = wordDetails;
    this.container = document.getElementById('reviewFlagContainer');
    this.urlCache = null;
    this.filledIconPromise = null;
    this.outlineIconPromise = null;
    this.flagIconSmallPromise = null;
    
    document.addEventListener('wordSelected', (event) => this.updateFlagButton(event.detail));
    document.addEventListener('htmx:afterSwap', (event) => {
      if (event.target.id === 'reviewFlagBtn') {
        this.updateWordData();
        const isReviewed = event.target.querySelector('svg')?.getAttribute('fill') !== 'none';
        window.LibriscanUtils?.showToast(
          isReviewed ? 'Flagged for review' : 'Review flag removed',
          'success'
        );
      }
    });
    document.addEventListener('htmx:responseError', (event) => {
      if (event.detail.path.includes('toggle-review')) {
        window.LibriscanUtils?.showToast('Failed to toggle review flag', 'error');
      }
    });
  }

  getUrlParts() {
    return this.urlCache || (this.urlCache = window.LibriscanUtils?.parseLibriscanURL() || {});
  }

  updateFlagButton(wordInfo) {
    if (!this.container || !wordInfo?.id) return;
    
    if (!this.filledIconPromise) {
      this.filledIconPromise = window.SVGLoader.loadIcon('flag-filled', { cssClass: 'size-6', fill: 'currentColor' });
      this.outlineIconPromise = window.SVGLoader.loadIcon('flag-outline', { cssClass: 'size-6' });
    }
    
    const url = this.getUrlParts();
    const toggleUrl = `/${url.shortName}/${url.collectionSlug}/${url.identifier}/page${url.pageNumber}/word/${wordInfo.id}/toggle-review/`;
    const isReviewed = Boolean(wordInfo.review);
    const flaggedCount = document.querySelectorAll('.word-block[data-word-review="true"]').length;
    const tipText = `Flag for Review (F)${flaggedCount > 0 ? ` - ${flaggedCount} flagged` : ''}`;
    
    (isReviewed ? this.filledIconPromise : this.outlineIconPromise).then(icon => {
      this.container.innerHTML = `
        <button id="reviewFlagBtn" 
                class="btn btn-ghost btn-sm tooltip tooltip-left opacity-70 hover:opacity-100 transition-opacity duration-200 text-orange-500" 
                data-tip="${tipText}"
                hx-post="${toggleUrl}"
                hx-target="#reviewFlagBtn"
                hx-swap="outerHTML">
          <span class="flex items-center gap-1">
            ${icon}
            <kbd class="kbd kbd-sm">F</kbd>
            ${flaggedCount > 0 ? `<span class="badge badge-warning badge-sm min-w-[1.25rem]">${flaggedCount}</span>` : ''}
          </span>
        </button>
      `;
      htmx?.process(this.container);
    });
    this.updateWordBlockVisual(wordInfo.id, isReviewed);
  }

  updateWordBlockVisual(wordId, isReviewed) {
    const wordBlock = WordBlockManager?.getWordBlock?.(wordId);
    if (!wordBlock) return;
    
    const isAccepted = wordBlock.dataset.wordConfidenceLevel === WordDetailsConfig.CONFIDENCE_LEVELS.ACCEPTED;
    
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
      if (!this.flagIconSmallPromise) {
        this.flagIconSmallPromise = window.SVGLoader.loadIcon('flag-outline', { cssClass: 'size-4' });
      }
      const flagIcon = document.createElement('span');
      flagIcon.className = 'review-flag-icon inline-flex items-center mr-1';
      this.flagIconSmallPromise.then(svg => {
        flagIcon.innerHTML = svg;
      });
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

