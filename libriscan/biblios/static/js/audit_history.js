/**
 * AuditHistory - Word edit history timeline display
 */
class AuditHistory {
  static CONFIG = {
    EMOJI: {
      CREATED: '✨',
      CHANGED: '📝',
      EDIT: '✏️',
      USER: '👤',
      ARROW: '→',
      PLUS: '➕'
    },
    FIELDS: [
      { key: 'text', label: 'Text', getValue: (r) => r.text },
      { key: 'confidence', label: 'Confidence', getValue: (r) => parseFloat(r.confidence).toFixed(2), format: (v) => `${v}%` },
      { key: 'text_type', label: 'Type', getValue: (r) => r.text_type_display },
      { key: 'print_control', label: 'Print Control', getValue: (r) => r.print_control_display }
    ]
  };

  constructor(containerSelector = '#auditHistoryContent') {
    const base = document.querySelector(containerSelector);
    this.elements = {
      container: base?.querySelector('ul.timeline'),
      emptyState: base?.querySelector('#auditHistoryEmpty'),
      timeline: base?.querySelector('#auditHistoryTimeline'),
      wordText: base?.querySelector('#historyWordText'),
      wordId: base?.querySelector('#historyWordId'),
      count: base?.querySelector('#historyCount'),
      timezone: base?.querySelector('#userTimezone')
    };
  }

  async displayHistory(wordId) {
    try {
      // Always fetch fresh data with cache-busting to ensure latest history
      const baseUrl = LibriscanUtils.buildWordHistoryURL(wordId);
      // Add timestamp query parameter to bypass cache and get latest data
      const url = `${baseUrl}?_t=${Date.now()}`;
      const data = await LibriscanUtils.fetchJSON(url);
      this.renderTimeline(data);
    } catch (error) {
      console.error('Error loading audit history:', error);
      LibriscanUtils.showToast('Error loading history', 'error');
    }
  }

  renderTimeline(data) {
    const hasHistory = data.history?.length > 0;
    
    this.elements.emptyState?.classList.toggle('hidden', hasHistory);
    this.elements.timeline?.classList.toggle('hidden', !hasHistory);
    
    if (!hasHistory) return;

    if (this.elements.wordText) this.elements.wordText.textContent = data.current_text;
    if (this.elements.wordId) this.elements.wordId.textContent = data.word_id;
    if (this.elements.count) this.elements.count.textContent = `${data.history_count} ${data.history_count === 1 ? 'Change' : 'Changes'}`;
    if (this.elements.timezone) this.elements.timezone.textContent = LibriscanUtils.getUserTimezone();

    if (this.elements.container) {
      this.elements.container.innerHTML = data.history
        .map((record, idx) => this.createTimelineItem(record, idx, data.history))
        .join('');
    }
  }

  createTimelineItem(record, index, allHistory) {
    const { isFirst, isLast, previous } = this._getRecordContext(index, allHistory);
    const { relative, exact, time } = LibriscanUtils.formatDateTime(record.history_date);
    const changes = this._detectChanges(record, previous);
    const { EMOJI } = AuditHistory.CONFIG;
    
    const isCreated = record.history_type === 'Created';
    const styles = {
      icon: isFirst 
        ? 'bg-primary text-primary-content shadow-md' 
        : isCreated 
        ? 'bg-success text-success-content' 
        : 'bg-base-300 text-base-content',
      card: isFirst ? 'border-primary shadow-md bg-primary/5' : 'border-base-200 hover:border-primary/30',
      badge: isFirst ? 'badge-primary' : isCreated ? 'badge-success' : 'badge-ghost'
    };
    
    const emoji = isCreated ? EMOJI.CREATED : EMOJI.CHANGED;
    const content = changes.length ? this._renderChanges(changes) : 
                    isCreated ? this._renderCreation(record) : '';

    return `
      <li>
        ${!isFirst ? '<hr class="bg-base-300"/>' : ''}
        <div class="timeline-start pr-4" style="flex: 0 0 120px;">
          <div class="text-right">
            <time class="text-sm font-semibold text-primary block mb-0.5" datetime="${record.history_date}">${relative}</time>
            <time class="text-xs text-base-content/50 font-mono block" datetime="${record.history_date}">${exact} ${time}</time>
          </div>
        </div>
        <div class="timeline-middle">
          <div class="flex items-center justify-center w-8 h-8 rounded-full ${styles.icon} transition-all duration-200 text-lg">
            ${emoji}
          </div>
        </div>
        <div class="timeline-end pl-4 pb-8" style="flex: 1;">
          <div class="card bg-base-100 border ${styles.card} transition-all duration-200">
            <div class="card-body p-4">
              <div class="flex items-center justify-between gap-3 mb-3">
                <div class="flex items-center gap-1.5 text-xs text-base-content/60">
                  <span>${EMOJI.USER}</span>
                  <span class="font-medium">${record.history_user}</span>
                  ${record.history_user_role ? `<span class="badge badge-xs badge-outline">${record.history_user_role}</span>` : ''}
                </div>
              </div>
              ${content}
            </div>
          </div>
        </div>
        ${!isLast ? '<hr class="bg-base-300"/>' : ''}
      </li>
    `;
  }

  _getRecordContext(index, allHistory) {
    return {
      isFirst: index === 0,
      isLast: index === allHistory.length - 1,
      previous: index < allHistory.length - 1 ? allHistory[index + 1] : null
    };
  }

  _renderChanges(changes) {
    const { EMOJI } = AuditHistory.CONFIG;
    return `<div class="space-y-2">${changes.map(c => `
      <div class="bg-base-200/50 rounded-md p-2.5 hover:bg-base-200 transition-colors">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-primary">${EMOJI.EDIT}</span>
          <span class="font-semibold text-xs text-base-content">${c.field}</span>
        </div>
        ${c.from ? `
          <div class="grid grid-cols-[1fr_auto_1fr] gap-2 items-center ml-5">
            <span class="badge badge-error badge-xs line-through opacity-75 justify-start truncate" title="${c.from}">${c.from}</span>
            <span class="text-base-content/40">${EMOJI.ARROW}</span>
            <span class="badge badge-success badge-xs font-semibold justify-start truncate" title="${c.to}">${c.to}</span>
          </div>
        ` : `<div class="ml-5"><span class="badge badge-success badge-xs">${c.to}</span></div>`}
      </div>
    `).join('')}</div>`;
  }

  _renderCreation(record) {
    const { EMOJI } = AuditHistory.CONFIG;
    const confidence = parseFloat(record.confidence).toFixed(2);
    return `
      <div class="bg-success/10 rounded-md p-2.5 border border-success/20">
        <div class="flex items-center gap-1.5 mb-2">
          <span class="text-success">${EMOJI.PLUS}</span>
          <span class="font-semibold text-xs text-success">Initial Values</span>
        </div>
        <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 ml-5 text-xs">
          <span class="text-base-content/60">Text:</span>
          <span class="badge badge-success badge-xs font-semibold">${record.text}</span>
          <span class="text-base-content/60">Confidence:</span>
          <span class="badge badge-outline badge-xs">${confidence}%</span>
          <span class="text-base-content/60">Type:</span>
          <span class="badge badge-ghost badge-xs">${record.text_type_display || 'N/A'}</span>
        </div>
      </div>
    `;
  }

  _detectChanges(current, previous) {
    if (!previous) return [];
    return AuditHistory.CONFIG.FIELDS
      .map(field => {
        const curr = field.getValue(current);
        const prev = field.getValue(previous);
        return curr !== prev ? { 
          field: field.label, 
          from: field.format ? field.format(prev) : prev, 
          to: field.format ? field.format(curr) : curr 
        } : null;
      })
      .filter(Boolean);
  }
}

window.AuditHistory = AuditHistory;

