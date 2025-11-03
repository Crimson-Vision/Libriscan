/**
 * AuditHistory - Word edit history timeline display
 */
class AuditHistory {
  static CONFIG = {
    EMOJI: {
      CREATED: '✨',
      CHANGED: '📝',
      REVERT: '↩️',
      EDIT: '✏️',
      USER: '👤',
      ARROW: '→',
      ORIGINAL: '🏁',
      FIRST_CHANGE: '🔰'
    },
    FIELDS: [
      { 
        key: 'text', 
        label: 'Text', 
        getValue: (record) => record.text 
      },
      { 
        key: 'confidence', 
        label: 'Confidence', 
        getValue: (record) => parseFloat(record.confidence).toFixed(2), 
        format: (value) => `${value}%` 
      },
      { 
        key: 'text_type', 
        label: 'Type', 
        getValue: (record) => record.text_type_display 
      },
      { 
        key: 'print_control', 
        label: 'Print Control', 
        getValue: (record) => record.print_control_display 
      }
    ]
  };

  constructor(containerSelector = '#auditHistoryContent') {
    const baseContainer = document.querySelector(containerSelector);
    this.elements = {
      container: baseContainer?.querySelector('ul.timeline'),
      emptyState: baseContainer?.querySelector('#auditHistoryEmpty'),
      timeline: baseContainer?.querySelector('#auditHistoryTimeline'),
      wordText: baseContainer?.querySelector('#historyWordText'),
      wordId: baseContainer?.querySelector('#historyWordId'),
      count: baseContainer?.querySelector('#historyCount'),
      timezone: baseContainer?.querySelector('#userTimezone')
    };
    this.renderer = new AuditHistoryRenderer(AuditHistory.CONFIG);
  }

  async displayHistory(wordId) {
    try {
      const baseUrl = LibriscanUtils.buildWordHistoryURL(wordId);
      const url = `${baseUrl}?_t=${Date.now()}`;
      const historyData = await LibriscanUtils.fetchJSON(url);
      this.renderTimeline(historyData);
    } catch (error) {
      console.error('Error loading audit history:', error);
      LibriscanUtils.showToast('Error loading history', 'error');
    }
  }

  renderTimeline(historyData) {
    const hasHistory = historyData.history?.length > 0;
    
    this.elements.emptyState?.classList.toggle('hidden', hasHistory);
    this.elements.timeline?.classList.toggle('hidden', !hasHistory);
    
    if (!hasHistory) return;

    this._updateHeader(historyData);

    if (this.elements.container) {
      this.elements.container.innerHTML = historyData.history
        .map((record, index) => 
          this.renderer.renderTimelineItem(record, index, historyData.history)
        )
        .join('');
    }
  }

  _updateHeader(historyData) {
    if (this.elements.wordText) {
      this.elements.wordText.textContent = historyData.current_text;
    }
    if (this.elements.wordId) {
      this.elements.wordId.textContent = historyData.word_id;
    }
    if (this.elements.count) {
      const changeCount = historyData.history_count;
      this.elements.count.textContent = `${changeCount} ${changeCount === 1 ? 'Change' : 'Changes'}`;
    }
    if (this.elements.timezone) {
      this.elements.timezone.textContent = LibriscanUtils.getUserTimezone();
    }
  }
}

window.AuditHistory = AuditHistory;
