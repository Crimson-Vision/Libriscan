class AuditHistory {
  static ICONS = {
    CREATED: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5 rounded-full p-1">
        <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
      </svg>
    `,
    CHANGED: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5 rounded-full p-1">
        <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
      </svg>
    `,
    ARROW: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3">
        <path fill-rule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clip-rule="evenodd" />
      </svg>
    `
  };

  static CHANGE_FIELDS = [
    { key: 'text', label: 'Text', getValue: (r) => r.text },
    { key: 'confidence', label: 'Confidence', getValue: (r) => `${r.confidence}%` },
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
      count: document.getElementById('historyCount')
    };
  }

  async displayHistory(wordId) {
    try {
      const url = LibriscanUtils.buildWordHistoryURL(wordId);
      const data = await LibriscanUtils.fetchJSON(url);
      
      this.renderTimeline(data);
      LibriscanUtils.showToast('History loaded', 'success');
    } catch (error) {
      console.error('Error loading audit history:', error);
      LibriscanUtils.showToast('Error loading history', 'error');
    }
  }

  renderTimeline(data) {
    if (!data.history?.length) {
      this.showEmptyState();
      return;
    }

    this.updateHeader(data);
    this.renderTimelineItems(data.history);
    this.showTimeline();
  }

  updateHeader(data) {
    this.elements.wordText.textContent = data.current_text;
    this.elements.wordId.textContent = data.word_id;
    this.elements.count.textContent = `${data.history_count} ${data.history_count === 1 ? 'Change' : 'Changes'}`;
  }

  renderTimelineItems(history) {
    this.elements.container.innerHTML = '';
    
    history.forEach((record, index) => {
      const item = this.createTimelineItem(record, index, history);
      this.elements.container.appendChild(item);
    });
  }

  createTimelineItem(record, index, allHistory) {
    const isFirst = index === 0;
    const isLast = index === allHistory.length - 1;
    const previousRecord = index < allHistory.length - 1 ? allHistory[index + 1] : null;
    
    const li = document.createElement('li');
    li.innerHTML = `
      ${!isFirst ? '<hr class="bg-primary"/>' : ''}
      <div class="timeline-start timeline-box bg-base-200">
        <time class="text-xs text-base-content/60">${this.formatDate(record.history_date)}</time>
      </div>
      <div class="timeline-middle">
        ${this.getHistoryIcon(record.history_type, isFirst)}
      </div>
      <div class="timeline-end timeline-box">
        ${this.createChangeDetails(record, previousRecord, isFirst)}
      </div>
      ${!isLast ? '<hr class="bg-primary"/>' : ''}
    `;
    
    return li;
  }

  getHistoryIcon(type, isFirst) {
    const colorClass = isFirst ? 'bg-primary text-primary-content' : 'bg-base-300';
    const icon = type === 'Created' ? AuditHistory.ICONS.CREATED : AuditHistory.ICONS.CHANGED;
    return icon.replace('class="size-5', `class="size-5 ${colorClass}`);
  }

  createChangeDetails(record, previousRecord, isFirst) {
    const changes = this.detectChanges(record, previousRecord);
    const badgeClass = isFirst ? 'badge-primary' : 'badge-ghost';
    
    let html = `
      <div class="flex items-center gap-2 mb-2">
        <span class="badge ${badgeClass} badge-sm">${record.history_type}</span>
        <span class="text-sm text-base-content/60">by ${record.history_user}</span>
      </div>
    `;

    if (changes.length > 0) {
      html += '<div class="space-y-2">';
      changes.forEach(change => html += this.renderChange(change));
      html += '</div>';
    } else if (record.history_type === 'Created') {
      html += this.renderCreationDetails(record);
    }

    return html;
  }

  renderChange(change) {
    return `
      <div class="text-sm">
        <span class="font-semibold">${change.field}:</span>
        ${change.from ? `
          <div class="flex items-center gap-2">
            <span class="badge badge-error badge-sm line-through">${change.from}</span>
            ${AuditHistory.ICONS.ARROW}
            <span class="badge badge-success badge-sm">${change.to}</span>
          </div>
        ` : `
          <span class="badge badge-success badge-sm">${change.to}</span>
        `}
      </div>
    `;
  }

  renderCreationDetails(record) {
    return `
      <div class="text-sm">
        <span class="font-semibold">Initial text:</span>
        <span class="badge badge-success badge-sm">${record.text}</span>
      </div>
      <div class="text-sm">
        <span class="font-semibold">Confidence:</span>
        <span class="badge badge-sm">${record.confidence}%</span>
      </div>
    `;
  }

  detectChanges(current, previous) {
    if (!previous) return [];

    return AuditHistory.CHANGE_FIELDS
      .map(field => {
        const currentValue = field.getValue(current);
        const previousValue = field.getValue(previous);
        
        return currentValue !== previousValue ? {
          field: field.label,
          from: previousValue,
          to: currentValue
        } : null;
      })
      .filter(Boolean);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  showEmptyState() {
    this.elements.emptyState.classList.remove('hidden');
    this.elements.timeline.classList.add('hidden');
  }

  showTimeline() {
    this.elements.emptyState.classList.add('hidden');
    this.elements.timeline.classList.remove('hidden');
  }
}

window.AuditHistory = AuditHistory;
