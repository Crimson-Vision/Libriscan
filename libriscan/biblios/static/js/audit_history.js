/**
 * AuditHistory - Word edit history timeline display
 */
class AuditHistory {
  static CONFIG = {
    EMOJI: { CREATED: '✨', CHANGED: '✏️', EDIT: '✏️', USER: '👤', PLUS: '➕', ARROW: '→' },
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
      const data = await LibriscanUtils.fetchJSON(LibriscanUtils.buildWordHistoryURL(wordId));
      this.renderTimeline(data);
      LibriscanUtils.showToast('History loaded', 'success');
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

    this.elements.wordText.textContent = data.current_text;
    this.elements.wordId.textContent = data.word_id;
    this.elements.count.textContent = `${data.history_count} ${data.history_count === 1 ? 'Change' : 'Changes'}`;
    this.elements.timezone.textContent = LibriscanUtils.getUserTimezone();

    this.elements.container.innerHTML = data.history
      .map((record, idx) => this.createTimelineItem(record, idx, data.history))
      .join('');
  }

  createTimelineItem(record, index, allHistory) {
    const { isFirst, isLast, previous } = this._getRecordContext(index, allHistory);
    const { relative, exact, time } = LibriscanUtils.formatDateTime(record.history_date);
    const changes = this._detectChanges(record, previous);
    const { EMOJI, TIMELINE_SPLIT } = AuditHistory.CONFIG;
    
    const styles = {
      icon: isFirst ? 'bg-primary text-primary-content shadow-lg ring-4 ring-primary/20' : 'bg-base-300',
      card: isFirst ? 'border-2 border-primary/30 bg-primary/5' : 'border-base-300',
      badge: isFirst ? 'badge-primary' : 'badge-ghost'
    };
    
    const emoji = record.history_type === 'Created' ? EMOJI.CREATED : EMOJI.CHANGED;
    const content = changes.length ? this._renderChanges(changes) : 
                    record.history_type === 'Created' ? this._renderCreation(record) : '';

    return `
      <li>
        ${!isFirst ? '<hr class="bg-primary/30"/>' : ''}
        <div class="timeline-start text-right pr-3 min-w-0" style="flex: 0 0 22%;">
          <div class="inline-block text-left">
            <time class="block text-sm font-bold text-primary mb-1 whitespace-nowrap" datetime="${record.history_date}">${relative}</time>
            <time class="block text-[11px] text-base-content/60 font-mono mb-0.5 whitespace-nowrap" datetime="${record.history_date}">${exact}</time>
            <time class="block text-[11px] text-base-content/50 whitespace-nowrap" datetime="${record.history_date}">${time}</time>
          </div>
        </div>
        <div class="timeline-middle flex-shrink-0"><span class="flex items-center justify-center size-5 rounded-full ${styles.icon} transition-all">${emoji}</span></div>
        <div class="timeline-end pl-3 mb-6 min-w-0" style="flex: 1 1 auto;">
          <div class="bg-base-100 border rounded-lg shadow-sm hover:shadow-md transition-all p-3 ${styles.card}">
            <div class="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <span class="badge ${styles.badge} badge-sm font-semibold">${record.history_type}</span>
              <div class="flex items-center gap-1.5 text-xs text-base-content/60">
                <span>${EMOJI.USER}</span>
                <span class="truncate max-w-[140px]">${record.history_user}</span>
              </div>
            </div>
            ${content}
          </div>
        </div>
        ${!isLast ? '<hr class="bg-primary/30"/>' : ''}
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
