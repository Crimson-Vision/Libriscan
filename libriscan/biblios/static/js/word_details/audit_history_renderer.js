/**
 * AuditHistoryRenderer - Handles rendering of audit history timeline items
 */
class AuditHistoryRenderer {
  constructor(config) {
    this.config = config;
  }

  renderTimelineItem(record, index, allHistory) {
    const context = this._getRecordContext(index, allHistory);
    const dateTime = LibriscanUtils.formatDateTime(record.history_date);
    const changes = this._detectChanges(record, context.previous);
    const styles = this._getStyles(context);
    const content = this._getContent(record, context, changes);

    return `
      <li class="w-full">
        ${!context.isFirst ? '<hr class="bg-base-300"/>' : ''}
        <div class="timeline-start pr-2 sm:pr-4" style="flex: 0 0 auto; min-width: 80px; max-width: 120px;">
          <div class="text-right sm:text-right">
            <time class="text-xs sm:text-sm font-semibold text-primary block mb-0.5 break-words" datetime="${record.history_date}">${dateTime.relative}</time>
            <time class="text-[10px] sm:text-xs text-base-content/50 font-mono block hidden sm:block" datetime="${record.history_date}">${dateTime.exact} ${dateTime.time}</time>
          </div>
        </div>
        <div class="timeline-middle flex-shrink-0">
          <div class="tooltip tooltip-bottom" data-tip="${this._getTooltipText(context)}">
            <div class="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full ${styles.icon} transition-all duration-200 text-base sm:text-lg">
              ${styles.emoji}
            </div>
          </div>
        </div>
        <div class="timeline-end pl-2 sm:pl-4 pb-6 sm:pb-8" style="flex: 1; min-width: 0;">
          <div class="card bg-base-100 border ${styles.card} transition-all duration-200 w-full">
            <div class="card-body p-3 sm:p-4">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3">
                <div class="flex flex-col gap-2">
                  <div class="flex items-center gap-1.5 text-xs text-base-content/60 flex-wrap">
                    <span class="tooltip tooltip-bottom hidden sm:inline" data-tip="Changed by">${this.config.EMOJI.USER}</span>
                    <span class="font-medium break-words min-w-0">${record.history_user}</span>
                    ${record.history_user_role ? `<span class="badge badge-xs badge-outline whitespace-nowrap">${record.history_user_role}</span>` : ''}
                  </div>
                  ${context.isRevert ? `<div><span class="badge badge-xs badge-warning whitespace-nowrap">${record.history_change_reason}</span></div>` : ''}
                </div>
              </div>
              ${content}
            </div>
          </div>
        </div>
        ${!context.isLast ? '<hr class="bg-base-300"/>' : ''}
      </li>
    `;
  }

  _getRecordContext(index, allHistory) {
    const totalRecords = allHistory.length;
    const currentRecord = allHistory[index];
    
    return {
      isFirst: index === 0,
      isLast: index === totalRecords - 1,
      isOriginal: index === totalRecords - 1,
      isFirstChange: index === totalRecords - 2 && totalRecords > 1,
      isCreated: currentRecord.history_type === 'Created',
      isRevert: currentRecord.history_change_reason?.toLowerCase().includes('revert'),
      previous: index < totalRecords - 1 ? allHistory[index + 1] : null
    };
  }

  _getStyles(context) {
    const { EMOJI } = this.config;
    
    // Priority order: Original > Revert > FirstChange > Created > First > Default
    if (context.isOriginal) {
      return {
        icon: 'bg-success text-success-content shadow-md',
        card: 'border-success shadow-md bg-success/10',
        emoji: EMOJI.ORIGINAL
      };
    }
    
    if (context.isRevert) {
      return {
        icon: 'bg-warning text-warning-content',
        card: 'border-warning shadow-md bg-warning/5',
        emoji: EMOJI.REVERT
      };
    }
    
    // Check FirstChange before isFirst - if it's both, prioritize showing as FirstChange
    if (context.isFirstChange) {
      return {
        icon: 'bg-info text-info-content shadow-md',
        card: 'border-info shadow-md bg-info/10',
        emoji: EMOJI.FIRST_CHANGE
      };
    }
    
    if (context.isCreated) {
      return {
        icon: 'bg-success text-success-content',
        card: 'border-base-200 hover:border-primary/30',
        emoji: EMOJI.CREATED
      };
    }
    
    if (context.isFirst) {
      return {
        icon: 'bg-primary text-primary-content shadow-md',
        card: 'border-primary shadow-md bg-primary/5',
        emoji: EMOJI.CHANGED
      };
    }
    
    return {
      icon: 'bg-base-300 text-base-content',
      card: 'border-base-200 hover:border-primary/30',
      emoji: EMOJI.CHANGED
    };
  }

  _getTooltipText(context) {
    // Match priority order from _getStyles
    if (context.isOriginal) return 'Original Word';
    if (context.isRevert) return 'Reverted to Original Word';
    if (context.isFirstChange) return 'First Change';
    if (context.isCreated) return 'Created';
    if (context.isFirst) return 'Current';
    return 'Changed';
  }

  _getContent(record, context, changes) {
    if (context.isOriginal) {
      return this._renderCreation(record);
    }
    
    if (context.isRevert) {
      return changes.length 
        ? this._renderChanges(changes, false, true)
        : this._renderRevert(record);
    }
    
    if (context.isFirstChange && changes.length) {
      return this._renderChanges(changes, true);
    }
    
    if (changes.length) {
      return this._renderChanges(changes);
    }
    
    if (context.isCreated) {
      return this._renderCreation(record);
    }
    
    return '';
  }

  _renderChanges(changes, isFirstChange = false, isRevert = false) {
    const { EMOJI } = this.config;
    
    // Determine styling based on change type
    let containerClass, badgeClass, textClass;
    
    if (isRevert) {
      containerClass = 'bg-warning/10 border border-warning/20 rounded-md p-2 sm:p-2.5 hover:bg-warning/15 transition-colors';
      badgeClass = 'badge-warning';
      textClass = 'text-warning';
    } else if (isFirstChange) {
      containerClass = 'bg-info/10 border border-info/20 rounded-md p-2 sm:p-2.5 hover:bg-info/15 transition-colors';
      badgeClass = 'badge-info';
      textClass = 'text-info';
    } else {
      containerClass = 'bg-base-200/50 rounded-md p-2 sm:p-2.5 hover:bg-base-200 transition-colors';
      badgeClass = 'badge-success';
      textClass = 'text-base-content';
    }
    
    return `<div class="space-y-2 ${isFirstChange ? 'mt-2' : ''}">${changes.map(change => `
      <div class="${containerClass}">
        <div class="flex items-center gap-2 mb-2 flex-wrap">
          <span class="font-semibold text-xs ${textClass} break-words min-w-0">${change.field}</span>
        </div>
        ${change.from ? `
          <div class="flex flex-col sm:grid sm:grid-cols-[1fr_auto_1fr] gap-2 sm:gap-2 items-start sm:items-center ml-0 sm:ml-5">
            <span class="badge badge-error badge-xs line-through opacity-75 justify-start truncate max-w-full sm:max-w-none" title="${change.from}">${change.from}</span>
            <span class="text-base-content/40 tooltip tooltip-bottom hidden sm:inline self-center" data-tip="Changed to">${EMOJI.ARROW}</span>
            <span class="badge ${badgeClass} badge-xs justify-start truncate max-w-full sm:max-w-none" title="${change.to}">${change.to}</span>
          </div>
        ` : `<div class="ml-0 sm:ml-5"><span class="badge ${badgeClass} badge-xs break-words">${change.to}</span></div>`}
      </div>
    `).join('')}</div>`;
  }

  _renderCreation(record) {
    const confidence = parseFloat(record.confidence).toFixed(2);
    
    return `
      <div class="bg-success/10 rounded-md p-2 sm:p-2.5 border border-success/20">
        <div class="grid grid-cols-[auto_1fr] gap-x-2 sm:gap-x-3 gap-y-1.5 text-xs">
          <span class="text-base-content/60 font-medium whitespace-nowrap">Text:</span>
          <span class="badge badge-outline badge-xs break-words min-w-0">${record.text || 'N/A'}</span>
          <span class="text-base-content/60 font-medium whitespace-nowrap">Confidence:</span>
          <span class="badge badge-outline badge-xs whitespace-nowrap">${confidence}%</span>
          <span class="text-base-content/60 font-medium whitespace-nowrap">Type:</span>
          <span class="badge badge-outline badge-xs break-words">${record.text_type_display || 'N/A'}</span>
          <span class="text-base-content/60 font-medium whitespace-nowrap">Print Control:</span>
          <span class="badge badge-outline badge-xs break-words">${record.print_control_display || 'N/A'}</span>
        </div>
      </div>
    `;
  }

  _renderRevert(record) {
    const { EMOJI } = this.config;
    return `
      <div class="bg-warning/10 rounded-md p-2 sm:p-2.5 border border-warning/20">
        <div class="flex items-center gap-1.5 mb-2 flex-wrap">
          <span class="text-warning tooltip tooltip-bottom flex-shrink-0" data-tip="Reverted to original">${EMOJI.REVERT}</span>
          <span class="font-semibold text-xs text-warning">Reverted</span>
        </div>
        <div class="text-xs text-base-content/70 ml-0 sm:ml-5 break-words">
          ${record.history_change_reason || 'Word reverted to its original state'}
        </div>
      </div>
    `;
  }

  _detectChanges(currentRecord, previousRecord) {
    if (!previousRecord) return [];
    
    return this.config.FIELDS
      .map(field => {
        const currentValue = field.getValue(currentRecord);
        const previousValue = field.getValue(previousRecord);
        
        if (currentValue !== previousValue) {
          return { 
            field: field.label, 
            from: field.format ? field.format(previousValue) : previousValue, 
            to: field.format ? field.format(currentValue) : currentValue 
          };
        }
        return null;
      })
      .filter(Boolean);
  }
}

window.AuditHistoryRenderer = AuditHistoryRenderer;
