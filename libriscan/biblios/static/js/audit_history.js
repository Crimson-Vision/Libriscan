/**
 * AuditHistory - Word edit history timeline display
 */
class AuditHistory {
  static EMOJI = {
    CREATED: '✨',
    CHANGED: '✏️',
    EDIT: '✏️',
    USER: '👤',
    PLUS: '➕',
    ARROW: '→'
  };

  static CHANGE_FIELDS = [
    { key: 'text', label: 'Text', getValue: (r) => r.text },
    { key: 'confidence', label: 'Confidence', getValue: (r) => parseFloat(r.confidence).toFixed(2), format: (v) => `${v}%` },
    { key: 'text_type', label: 'Type', getValue: (r) => r.text_type_display },
    { key: 'print_control', label: 'Print Control', getValue: (r) => r.print_control_display }
  ];

  constructor() {
    this.elements = {
      container: document.querySelector('#auditHistoryTimeline ul.timeline'),
      emptyState: document.getElementById('auditHistoryEmpty'),
      timeline: document.getElementById('auditHistoryTimeline'),
      wordText: document.getElementById('historyWordText'),
      wordId: document.getElementById('historyWordId'),
      count: document.getElementById('historyCount'),
      timezone: document.getElementById('userTimezone')
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
    if (!data.history?.length) {
      this.elements.emptyState.classList.remove('hidden');
      this.elements.timeline.classList.add('hidden');
      return;
    }

    this.elements.wordText.textContent = data.current_text;
    this.elements.wordId.textContent = data.word_id;
    this.elements.count.textContent = `${data.history_count} ${data.history_count === 1 ? 'Change' : 'Changes'}`;
    this.elements.timezone.textContent = LibriscanUtils.getUserTimezone();

    this.elements.container.innerHTML = data.history.map((record, index) => 
      this.createTimelineItem(record, index, data.history)
    ).join('');

    this.elements.emptyState.classList.add('hidden');
    this.elements.timeline.classList.remove('hidden');
  }

  createTimelineItem(record, index, allHistory) {
    const isFirst = index === 0;
    const isLast = index === allHistory.length - 1;
    const previous = index < allHistory.length - 1 ? allHistory[index + 1] : null;
    const { relative, exact, time } = LibriscanUtils.formatDateTime(record.history_date);
    const changes = this.detectChanges(record, previous);
    
    const iconClass = isFirst ? 'bg-primary text-primary-content shadow-lg ring-4 ring-primary/20' : 'bg-base-300';
    const iconEmoji = record.history_type === 'Created' ? AuditHistory.EMOJI.CREATED : AuditHistory.EMOJI.CHANGED;
    const icon = `<span class="flex items-center justify-center size-5 rounded-full ${iconClass} transition-all">${iconEmoji}</span>`;
    const cardClass = isFirst ? 'border-2 border-primary/30 bg-primary/5' : 'border-base-300';
    const badgeClass = isFirst ? 'badge-primary' : 'badge-ghost';

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
        <div class="timeline-middle flex-shrink-0">${icon}</div>
        <div class="timeline-end pl-3 mb-6 min-w-0" style="flex: 1 1 auto;">
          <div class="bg-base-100 border rounded-lg shadow-sm hover:shadow-md transition-all p-3 ${cardClass}">
            <div class="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <span class="badge ${badgeClass} badge-sm font-semibold">${record.history_type}</span>
              <div class="flex items-center gap-1.5 text-xs text-base-content/60">
                <span>${AuditHistory.EMOJI.USER}</span>
                <span class="truncate max-w-[140px]">${record.history_user}</span>
              </div>
            </div>
            ${changes.length > 0 ? this.renderChanges(changes) : record.history_type === 'Created' ? this.renderCreation(record) : ''}
          </div>
        </div>
        ${!isLast ? '<hr class="bg-primary/30"/>' : ''}
      </li>
    `;
  }

  renderChanges(changes) {
    return '<div class="space-y-2">' + changes.map(c => `
      <div class="bg-base-200/50 rounded-md p-2.5 hover:bg-base-200 transition-colors">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-primary">${AuditHistory.EMOJI.EDIT}</span>
          <span class="font-semibold text-xs text-base-content">${c.field}</span>
        </div>
        ${c.from ? `
          <div class="grid grid-cols-[1fr_auto_1fr] gap-2 items-center ml-5">
            <span class="badge badge-error badge-xs line-through opacity-75 justify-start truncate" title="${c.from}">${c.from}</span>
            <span class="text-base-content/40">${AuditHistory.EMOJI.ARROW}</span>
            <span class="badge badge-success badge-xs font-semibold justify-start truncate" title="${c.to}">${c.to}</span>
          </div>
        ` : `<div class="ml-5"><span class="badge badge-success badge-xs">${c.to}</span></div>`}
      </div>
    `).join('') + '</div>';
  }

  renderCreation(record) {
    const confidenceValue = parseFloat(record.confidence).toFixed(2);
    return `
      <div class="bg-success/10 rounded-md p-2.5 border border-success/20">
        <div class="flex items-center gap-1.5 mb-2">
          <span class="text-success">${AuditHistory.EMOJI.PLUS}</span>
          <span class="font-semibold text-xs text-success">Initial Values</span>
        </div>
        <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 ml-5 text-xs">
          <span class="text-base-content/60">Text:</span>
          <span class="badge badge-success badge-xs font-semibold">${record.text}</span>
          <span class="text-base-content/60">Confidence:</span>
          <span class="badge badge-outline badge-xs">${confidenceValue}%</span>
          <span class="text-base-content/60">Type:</span>
          <span class="badge badge-ghost badge-xs">${record.text_type_display || 'N/A'}</span>
        </div>
      </div>
    `;
  }

  detectChanges(current, previous) {
    if (!previous) return [];
    return AuditHistory.CHANGE_FIELDS
      .map(f => {
        const curr = f.getValue(current);
        const prev = f.getValue(previous);
        if (curr !== prev) {
          const fromDisplay = f.format ? f.format(prev) : prev;
          const toDisplay = f.format ? f.format(curr) : curr;
          return { field: f.label, from: fromDisplay, to: toDisplay };
        }
        return null;
      })
      .filter(Boolean);
  }
}

window.AuditHistory = AuditHistory;
