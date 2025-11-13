/**
 * Confidence Indicator Toggle Component
 * Manages visibility of confidence indicators (underlines and badges)
 */

class ConfidenceToggle {
  static STORAGE_KEY = 'confidenceTogglePrefs';
  static LEVELS = ['high', 'medium', 'low', 'accepted', 'omit', 'merge', 'review'];

  constructor(containerId = 'word-container') {
    // Initialize toggles as empty object first to prevent undefined errors
    this.toggles = {};
    this.toggleAll = null;
    
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.toggleAll = document.getElementById('toggle-all');
    this.toggles = Object.fromEntries(
      ConfidenceToggle.LEVELS.map(level => [level, document.getElementById(`toggle-${level}`)])
    );
    
    this.init();
  }

  init() {
    if (!this.container) return;
    this.applyPreferencesImmediately();
    this.attachEventListeners();
  }
  
  getAllToggles() {
    return [...Object.values(this.toggles), document.getElementById('toggle-line-display')].filter(Boolean);
  }
  
  toggleLineDisplay(isVisible) {
    document.querySelectorAll('.line-number-badge, .line-divider').forEach(el => {
      el.style.display = isVisible ? '' : 'none';
    });
  }
  
  saveDisplayPreferences() {
    const toggle = document.getElementById('toggle-line-display');
    try {
      localStorage.setItem('displayTogglePrefs', JSON.stringify({ lineDisplay: toggle?.checked ?? true }));
    } catch (error) {
      console.warn('Failed to save display preferences:', error);
    }
  }
  
  loadDisplayPreferences() {
    try {
      const saved = localStorage.getItem('displayTogglePrefs');
      return saved ? JSON.parse(saved) : { lineDisplay: true };
    } catch (error) {
      return { lineDisplay: true };
    }
  }

  /**
   * Apply saved preferences immediately to prevent UI flash
   */
  applyPreferencesImmediately() {
    const prefs = this.loadPreferencesSync();
    const displayPrefs = this.loadDisplayPreferences();
    
    Object.entries(this.toggles).forEach(([level, checkbox]) => {
      if (!checkbox) return;
      const isVisible = prefs[level] ?? true;
      checkbox.checked = isVisible;
      this.container.classList.toggle(`hide-confidence-${level}`, !isVisible);
      if (level === 'accepted') {
        this._updateAcceptedButtonClasses(isVisible);
      }
    });
    
    const lineDisplayToggle = document.getElementById('toggle-line-display');
    if (lineDisplayToggle) {
      lineDisplayToggle.checked = displayPrefs.lineDisplay !== false;
      this.toggleLineDisplay(lineDisplayToggle.checked);
    }
    
    this.syncToggleAll();
  }
  
  /**
   * Update btn-dash/btn-ghost classes for accepted words
   */
  _updateAcceptedButtonClasses(isVisible) {
    if (!this.container) return;
    
    this.container.querySelectorAll('.word-block').forEach(block => {
      const isAccepted = block.dataset.wordConfidenceLevel === WordDetailsConfig.CONFIDENCE_LEVELS.ACCEPTED;
      if (!isAccepted) return;
      
      block.classList.toggle('btn-dash', isVisible);
      block.classList.toggle('btn-ghost', !isVisible);
    });
  }

  attachEventListeners() {
    Object.entries(this.toggles).forEach(([level, checkbox]) => {
      checkbox?.addEventListener('change', (event) => {
        event.stopPropagation();
        this.toggleIndicator(level, checkbox.checked);
        this.syncToggleAll();
        this.savePreferences();
      });
    });
    
    const lineDisplayToggle = document.getElementById('toggle-line-display');
    lineDisplayToggle?.addEventListener('change', (event) => {
      event.stopPropagation();
      this.toggleLineDisplay(lineDisplayToggle.checked);
      this.saveDisplayPreferences();
      this.syncToggleAll();
    });
    
    this.toggleAll?.addEventListener('change', (event) => {
      event.stopPropagation();
      const isChecked = this.toggleAll.checked;
      this.getAllToggles().forEach(toggle => {
        toggle.checked = isChecked;
        if (toggle.id === 'toggle-line-display') {
          this.toggleLineDisplay(isChecked);
          this.saveDisplayPreferences();
        } else {
          const level = toggle.id.replace('toggle-', '');
          this.toggleIndicator(level, isChecked);
        }
      });
      this.savePreferences();
    });

    // Keep dropdown open on label click
    const dropdownContent = document.querySelector('.dropdown-content');
    dropdownContent?.addEventListener('click', (event) => {
      if (event.target.closest('label')) {
        event.stopPropagation();
      }
    });
  }

  toggleIndicator(level, isVisible) {
    this.container.classList.toggle(`hide-confidence-${level}`, !isVisible);
    
    // For accepted level, also toggle button-dash/btn-ghost classes
    if (level === 'accepted') {
      this._updateAcceptedButtonClasses(isVisible);
    }
  }

  syncToggleAll() {
    if (!this.toggleAll) return;
    this.toggleAll.checked = this.getAllToggles().every(toggle => toggle.checked);
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
   * Check if a specific confidence level toggle is checked
   */
  isLevelVisible(level) {
    if (!this.toggles) return true;
    const checkbox = this.toggles[level];
    return checkbox ? checkbox.checked : true;
  }

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

