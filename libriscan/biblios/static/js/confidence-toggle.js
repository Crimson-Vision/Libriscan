/**
 * Confidence Indicator Toggle Component
 * Manages visibility of confidence indicators (underlines and badges)
 */

class ConfidenceToggle {
  static STORAGE_KEY = 'confidenceTogglePrefs';
  static LEVELS = ['high', 'medium', 'low', 'accepted'];

  constructor(containerId = 'word-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.toggleAll = document.getElementById('toggle-all');
    this.toggles = Object.fromEntries(
      ConfidenceToggle.LEVELS.map(level => [level, document.getElementById(`toggle-${level}`)])
    );
    
    this.init();
  }

  init() {
    this.applyPreferencesImmediately();
    this.attachEventListeners();
  }

  /**
   * Apply saved preferences immediately to prevent UI flash
   */
  applyPreferencesImmediately() {
    const prefs = this.loadPreferencesSync();
    
    Object.entries(this.toggles).forEach(([level, checkbox]) => {
      if (!checkbox) return;
      
      const isVisible = prefs[level] ?? true;
      checkbox.checked = isVisible;
      this.container.classList.toggle(`hide-confidence-${level}`, !isVisible);
    });
    
    this.syncToggleAll();
  }

  attachEventListeners() {
    // Individual toggle handlers
    Object.entries(this.toggles).forEach(([level, checkbox]) => {
      checkbox?.addEventListener('change', (e) => {
        e.stopPropagation(); // Keep dropdown open
        this.toggleIndicator(level, checkbox.checked);
        this.syncToggleAll();
        this.savePreferences();
      });
    });
    
    // "All" toggle handler
    this.toggleAll?.addEventListener('change', (e) => {
      e.stopPropagation(); // Keep dropdown open
      const isChecked = this.toggleAll.checked;
      Object.entries(this.toggles).forEach(([level, checkbox]) => {
        if (checkbox) {
          checkbox.checked = isChecked;
          this.toggleIndicator(level, isChecked);
        }
      });
      this.savePreferences();
    });

    // Keep dropdown open on label click
    const dropdownContent = document.querySelector('.dropdown-content');
    dropdownContent?.addEventListener('click', (e) => {
      if (e.target.closest('label')) {
        e.stopPropagation();
      }
    });
  }

  toggleIndicator(level, isVisible) {
    this.container.classList.toggle(`hide-confidence-${level}`, !isVisible);
  }

  syncToggleAll() {
    if (!this.toggleAll) return;
    this.toggleAll.checked = Object.values(this.toggles)
      .every(checkbox => checkbox?.checked);
  }

  savePreferences() {
    const prefs = Object.fromEntries(
      Object.entries(this.toggles).map(([level, checkbox]) => [level, checkbox?.checked ?? true])
    );
    
    try {
      localStorage.setItem(ConfidenceToggle.STORAGE_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.warn('Failed to save toggle preferences:', error);
      if (typeof LibriscanUtils !== 'undefined') {
        LibriscanUtils.showToast('Could not save preferences', 'warning');
      }
    }
  }

  loadPreferencesSync() {
    try {
      const saved = localStorage.getItem(ConfidenceToggle.STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.warn('Failed to load toggle preferences:', error);
      if (typeof LibriscanUtils !== 'undefined') {
        LibriscanUtils.showToast('Could not load preferences', 'warning');
      }
      return {};
    }
  }

  /**
   * Reinitialize after HTMX swap
   */
  reinit() {
    this.container = document.getElementById('word-container');
    if (!this.container) return;
    
    this.toggleAll = document.getElementById('toggle-all');
    this.toggles = Object.fromEntries(
      ConfidenceToggle.LEVELS.map(level => [level, document.getElementById(`toggle-${level}`)])
    );
    
    this.init();
  }
}

// Auto-initialize on page load
let confidenceToggleInstance = null;

function initConfidenceToggle() {
  confidenceToggleInstance = new ConfidenceToggle();
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initConfidenceToggle);

// Reinitialize after HTMX swap (for dynamic content)
document.body.addEventListener('htmx:afterSwap', (event) => {
  // Only reinit if the swapped content contains word-container
  if (event.detail.target.querySelector('#word-container') || 
      event.detail.target.id === 'word-container') {
    initConfidenceToggle();
  }
});

// Export for manual initialization if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConfidenceToggle;
}

