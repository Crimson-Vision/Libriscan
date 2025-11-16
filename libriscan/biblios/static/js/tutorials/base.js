/* Tutorial Base Class - Shared functionality for all tutorials */

export class TutorialBase {
  constructor() {
    this.driver = null;
  }

  createDriver(steps) {
    if (!window.driver?.js?.driver) {
      console.error('Driver.js not loaded');
      if (typeof LibriscanUtils !== 'undefined') {
        LibriscanUtils.showToast('Tutorial system not available', 'error');
      }
      return null;
    }

    try {
      this.driver = window.driver.js.driver({
        showProgress: true,
        showButtons: ['next', 'previous', 'close'],
        progressText: '{{current}} of {{total}}',
        nextBtnText: 'Next',
        prevBtnText: 'Previous',
        doneBtnText: 'Done',
        closeBtnText: '✕',
        animate: true,
        smoothScroll: true,
        steps: steps
      });
      return this.driver;
    } catch (error) {
      console.error('Error creating driver:', error);
      if (typeof LibriscanUtils !== 'undefined') {
        LibriscanUtils.showToast('Failed to start tutorial', 'error');
      }
      return null;
    }
  }

  destroy() {
    this.driver?.destroy();
    this.driver = null;
  }
}
