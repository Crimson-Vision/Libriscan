/**
 * Reusable List/Grid View Toggle Module
 * with the flexibiliy to be used on any page that needs list/grid view switching
 */

const ViewToggle = {
  /**
   * Initialize view toggle for a page
   * @param {Object} config - Configuration object
   * @param {string} config.listBtnId - ID of list view button
   * @param {string} config.gridBtnId - ID of grid view button
   * @param {Array} config.tabs - Array of tab configurations
   * @returns {Object} - Public API for the view toggle
   */
  init: function(config) {
    const listBtn = document.getElementById(config.listBtnId);
    const gridBtn = document.getElementById(config.gridBtnId);
    let currentViewMode = 'list'; // default

    if (!listBtn || !gridBtn) {
      console.warn('ViewToggle: List or Grid button not found');
      return null;
    }

    // Setup grid containers for each tab
    config.tabs.forEach(tabConfig => {
      this.setupGridToggle(tabConfig, listBtn, gridBtn);
    });

    // List button click handler
    listBtn.addEventListener('click', () => {
      currentViewMode = 'list';
      listBtn.classList.add('btn-primary');
      gridBtn.classList.remove('btn-primary');

      const activeTab = document.querySelector('.tab-active')?.getAttribute('data-tab');
      if (activeTab) {
        this.applyViewMode(activeTab, 'list');
      }
    });

    // Grid button click handler
    gridBtn.addEventListener('click', () => {
      currentViewMode = 'grid';
      gridBtn.classList.add('btn-primary');
      listBtn.classList.remove('btn-primary');

      const activeTab = document.querySelector('.tab-active')?.getAttribute('data-tab');
      if (activeTab) {
        this.applyViewMode(activeTab, 'grid');
      }
    });

    // Return public API
    return {
      getCurrentMode: () => currentViewMode,
      setMode: (mode) => {
        if (mode === 'list') {
          listBtn.click();
        } else if (mode === 'grid') {
          gridBtn.click();
        }
      },
      applyToTab: (tabId, mode) => this.applyViewMode(tabId, mode || currentViewMode)
    };
  },

  /**
   * Setup grid/list toggle for a specific tab
   * @param {Object} tabConfig - Tab configuration
   * @param {HTMLElement} listBtn - List view button
   * @param {HTMLElement} gridBtn - Grid view button
   */
  setupGridToggle: function(tabConfig, listBtn, gridBtn) {
    const tableContainer = document.querySelector(tabConfig.tableSelector);
    if (!tableContainer) return;

    // Create grid container for this tab
    const gridContainer = document.createElement('div');
    gridContainer.id = `${tabConfig.tabId}-grid`;
    gridContainer.className = 'hidden grid grid-cols-3 gap-4';
    tableContainer.parentNode.insertBefore(gridContainer, tableContainer.nextSibling);

    // Store reference for later use
    if (!this._gridContainers) this._gridContainers = {};
    this._gridContainers[tabConfig.tabId] = {
      grid: gridContainer,
      table: tableContainer,
      config: tabConfig
    };
  },

  /**
   * Apply view mode (list or grid) to a specific tab
   * @param {string} tabId - The tab ID
   * @param {string} mode - 'list' or 'grid'
   */
  applyViewMode: function(tabId, mode) {
    const containers = this._gridContainers?.[tabId];
    if (!containers) return;

    const { grid, table, config } = containers;

    if (mode === 'grid') {
      // Show grid, hide table
      table.classList.add('hidden');
      grid.classList.remove('hidden');

      // Generate cards if not already done
      if (grid.children.length === 0) {
        this.generateGridCards(table, grid, config);

        // Re-apply search filter if needed
        const searchInput = document.getElementById('homepage-search');
        if (searchInput && searchInput.value.trim()) {
          this.filterGridCards(grid, searchInput.value.trim().toLowerCase());
        }
      }
    } else {
      // Show table, hide grid
      table.classList.remove('hidden');
      grid.classList.add('hidden');
    }
  },

  /**
   * Generate grid cards from table rows
   * @param {HTMLElement} tableContainer - The table container
   * @param {HTMLElement} gridContainer - The grid container to populate
   * @param {Object} config - Tab configuration
   */
  generateGridCards: function(tableContainer, gridContainer, config) {
    const rows = tableContainer.querySelectorAll('tbody tr');
    const fragment = document.createDocumentFragment();

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const docId = cells[0]?.textContent.trim();
      const org = cells[1]?.textContent.trim();
      const collection = cells[2]?.textContent.trim();
      const series = cells[3]?.textContent.trim() || 'No Series';
      const statusBadge = cells[4]?.querySelector('.badge');
      const status = statusBadge?.textContent.trim();
      const statusClass = statusBadge?.className || '';
      const actionLink = cells[5]?.querySelector('a');
      const actionHref = actionLink?.href;
      const actionText = actionLink?.textContent.trim() || 'Open';
      const actionBtnClass = actionLink?.className || 'btn btn-sm btn-primary';

      const card = document.createElement('div');
      card.className = 'card bg-base-200 shadow-md hover:shadow-lg transition-shadow';
      card.innerHTML = `
        <div class="card-body">
          <h3 class="card-title text-base">${docId}</h3>
          <div class="space-y-1 text-sm">
            <p><span class="font-semibold">Org:</span> ${org}</p>
            <p><span class="font-semibold">Collection:</span> ${collection}</p>
            <p><span class="font-semibold">Series:</span> ${series}</p>
            <div class="${statusClass}">${status}</div>
          </div>
          <div class="card-actions justify-end mt-4">
            <a href="${actionHref}" class="${actionBtnClass} gap-2">
              ${actionText}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      `;
      fragment.appendChild(card);
    });

    gridContainer.appendChild(fragment);
  },

  /**
   * Filter grid cards based on search query
   * @param {HTMLElement} gridContainer - Grid container
   * @param {string} query - Search query (lowercased)
   */
  filterGridCards: function(gridContainer, query) {
    const cards = gridContainer.querySelectorAll('.card');
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = (query === '' || text.includes(query)) ? '' : 'none';
    });
  }
};

// Make it available globally
window.ViewToggle = ViewToggle;