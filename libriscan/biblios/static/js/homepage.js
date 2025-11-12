// Alias 
const fetchJSON = LibriscanUtils.fetchJSON.bind(LibriscanUtils);

// Tab switching and view toggle - Single DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  const tabs = document.querySelectorAll('#main-tabs .tab');
  const panels = document.querySelectorAll('.tab-panel');
  const viewToggle = document.querySelector('.btn-group');
  
  // Track current view mode (list or grid) - persists across tabs
  let currentViewMode = 'list'; // default
  
  console.log('[Homepage] Initializing...', { tabs: tabs.length, panels: panels.length, viewToggle: !!viewToggle });
  
  // Apply initial styling to first tab using Tailwind classes
  if (tabs[0]) {
    tabs[0].classList.add('btn-primary', 'font-semibold', 'shadow-md', '-translate-y-0.5');
  }
  
  // Initialize view toggle visibility on page load
  const initialHash = window.location.hash.slice(1);
  console.log('[Homepage] Initial hash:', initialHash);
  if (initialHash === 'recent-work-tab') {
    // Hide on "Where You Left Off" only
    console.log('[Homepage] Hiding view toggle initially');
    viewToggle?.classList.add('hidden');
  }
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('data-tab');
      console.log('[Homepage] Tab clicked:', targetId);
      
      // Remove active styling from all tabs
      tabs.forEach(t => {
        t.classList.remove('tab-active', 'btn-primary', 'font-semibold', 'shadow-md', '-translate-y-0.5');
      });
      
      // Add active styling to clicked tab using Tailwind classes
      this.classList.add('tab-active', 'btn-primary', 'font-semibold', 'shadow-md', '-translate-y-0.5');
      
      // Hide all panels
      panels.forEach(panel => panel.classList.add('hidden'));
      
      // Show target panel
      document.getElementById(targetId).classList.remove('hidden');
      
      // Show/hide List/Grid buttons based on tab
      if (targetId === 'recent-work-tab') {
        console.log('[Homepage] Hiding view toggle for Where You Left Off');
        viewToggle?.classList.add('hidden');
      } else {
        console.log('[Homepage] Showing view toggle');
        viewToggle?.classList.remove('hidden');
        
        // Apply current view mode to the newly visible tab
        applyViewMode(targetId, currentViewMode);
      }
      
      // Save active tab in URL without scrolling
      history.replaceState(null, null, `#${targetId}`);
    });
  });
  
  // Restore active tab from URL hash on page load (after pagination)
  function restoreActiveTab() {
    const hash = window.location.hash.slice(1);
    console.log('[Homepage] Restoring tab from hash:', hash);
    if (hash && document.getElementById(hash)) {
      const tabToActivate = document.querySelector(`[data-tab="${hash}"]`);
      if (tabToActivate) {
        // Prevents scroll jump
        tabs.forEach(t => {
          t.classList.remove('tab-active', 'btn-primary', 'font-semibold', 'shadow-md', '-translate-y-0.5');
        });
        tabToActivate.classList.add('tab-active', 'btn-primary', 'font-semibold', 'shadow-md', '-translate-y-0.5');
        
        panels.forEach(panel => panel.classList.add('hidden'));
        document.getElementById(hash).classList.remove('hidden');
        
        // Show/hide view toggle based on restored tab
        if (hash === 'recent-work-tab') {
          console.log('[Homepage] Hiding view toggle (restored tab)');
          viewToggle?.classList.add('hidden');
        } else {
          console.log('[Homepage] Showing view toggle (restored tab)');
          viewToggle?.classList.remove('hidden');
        }
      }
    }
  }
  
  // Restore tab on page load
  restoreActiveTab();
  
  // List/Grid toggle buttons
  const listBtn = document.getElementById('list-view-btn');
  const gridBtn = document.getElementById('grid-view-btn');
  
  if (listBtn && gridBtn) {
    listBtn.addEventListener('click', function() {
      console.log('[Homepage] List view clicked');
      currentViewMode = 'list';
      listBtn.classList.add('btn-primary');
      gridBtn.classList.remove('btn-primary');
      
      // Apply list view to current active tab
      const activeTab = document.querySelector('.tab-active')?.getAttribute('data-tab');
      if (activeTab && activeTab !== 'recent-work-tab') {
        applyViewMode(activeTab, 'list');
      }
    });
    
    gridBtn.addEventListener('click', function() {
      console.log('[Homepage] Grid view clicked');
      currentViewMode = 'grid';
      gridBtn.classList.add('btn-primary');
      listBtn.classList.remove('btn-primary');
      
      // Apply grid view to current active tab
      const activeTab = document.querySelector('.tab-active')?.getAttribute('data-tab');
      if (activeTab && activeTab !== 'recent-work-tab') {
        applyViewMode(activeTab, 'grid');
      }
    });
  }
  
  /**
   * Apply the specified view mode (list or grid) to a specific tab
   * @param {string} tabId - The tab ID (e.g., 'all-documents-tab')
   * @param {string} mode - 'list' or 'grid'
   */
  function applyViewMode(tabId, mode) {
    console.log('[Homepage] Applying view mode:', mode, 'to tab:', tabId);
    
    // Get the grid container for this tab
    const gridContainer = document.getElementById(`${tabId}-grid`);
    
    // Get the table container - need to find it based on tab
    let tableContainer;
    if (tabId === 'all-documents-tab') {
      tableContainer = document.querySelector('#all-documents .overflow-x-auto');
    } else if (tabId === 'pending-reviews-tab') {
      tableContainer = document.querySelector('#pending-reviews .overflow-x-auto');
    }
    
    if (!gridContainer || !tableContainer) {
      console.log('[Homepage] Could not find containers for tab:', tabId);
      return;
    }
    
    if (mode === 'grid') {
      // Show grid, hide table
      tableContainer.classList.add('hidden');
      gridContainer.classList.remove('hidden');
      
      // Generate cards if not already done
      if (gridContainer.children.length === 0) {
        console.log('[Homepage] Generating grid cards for:', tabId);
        generateGridCards(tableContainer, gridContainer, tabId);
        
        // Re-apply search filter after cards are generated
        requestAnimationFrame(() => {
          const searchInput = document.getElementById('homepage-search');
          if (searchInput && searchInput.value.trim()) {
            const query = searchInput.value.trim().toLowerCase();
            const gridCards = gridContainer.querySelectorAll('.card');
            gridCards.forEach(card => {
              const text = card.textContent.toLowerCase();
              card.style.display = text.includes(query) ? '' : 'none';
            });
          }
        });
      }
    } else {
      // Show table, hide grid
      tableContainer.classList.remove('hidden');
      gridContainer.classList.add('hidden');
    }
  }
  
  // Search functionality - Inline table filtering only
  const searchInput = document.getElementById('homepage-search');
  const searchResults = document.getElementById('homepage-search-results');
  
  if (searchInput && searchResults) {
    searchInput.addEventListener('input', function(e) {
      const query = e.target.value.trim().toLowerCase();
      
      // Filter the table/grid immediately (inline filtering)
      filterTable(query);
      
      // Always hide dropdown (we only use inline table filtering)
      searchResults.classList.add('hidden');
      searchResults.innerHTML = '';
    });
    
    // Close dropdown results when clicking outside (kept for safety)
    document.addEventListener('click', function(e) {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.add('hidden');
      }
    });
  }
  
  // Filter table rows AND grid cards based on search query
  function filterTable(query) {
    const lowerQuery = query.toLowerCase();
    const table = document.querySelector('#all-documents table');
    const gridContainer = document.getElementById('documents-grid');
    let visibleCount = 0;
    
    // Filter table rows
    if (table) {
      const rows = table.querySelectorAll('tbody tr');
      
      rows.forEach(row => {
        if (query === '') {
          row.style.display = '';
          visibleCount++;
          return;
        }
        
        const cells = row.querySelectorAll('td');
        let rowText = '';
        
        // Get text from Document ID, Org, Collection, Series columns
        cells.forEach((cell, index) => {
          if (index < 4) { // Only search in first 4 columns
            rowText += cell.textContent.toLowerCase() + ' ';
          }
        });
        
        if (rowText.includes(lowerQuery)) {
          row.style.display = '';
          visibleCount++;
        } else {
          row.style.display = 'none';
        }
      });
      
      // Show/hide "no results" message
      const tableContainer = document.querySelector('#all-documents .overflow-x-auto');
      let noResultsMsg = document.getElementById('no-filter-results');
      
      if (visibleCount === 0 && query !== '') {
        if (!noResultsMsg) {
          noResultsMsg = document.createElement('div');
          noResultsMsg.id = 'no-filter-results';
          noResultsMsg.className = 'alert alert-info mt-4';
          noResultsMsg.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>No documents match your search. Try a different term.</span>
          `;
          tableContainer.parentElement.appendChild(noResultsMsg);
        }
      } else if (noResultsMsg) {
        noResultsMsg.remove();
      }
    }
    
    // Filter grid cards
    if (gridContainer && !gridContainer.classList.contains('hidden')) {
      const gridCards = gridContainer.querySelectorAll('.card');
      gridCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (query === '' || text.includes(lowerQuery)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    }
  }
  
  // View toggle for All Documents AND Pending Reviews tabs - GRID IMPLEMENTATION
  const listViewBtn = document.getElementById('list-view-btn');
  const gridViewBtn = document.getElementById('grid-view-btn');
  
  // Setup for All Documents tab
  const allDocsTableContainer = document.querySelector('#all-documents .overflow-x-auto');
  console.log('[Homepage] All Documents table container:', !!allDocsTableContainer);
  if (listViewBtn && gridViewBtn && allDocsTableContainer) {
    setupGridToggle('all-documents-tab', allDocsTableContainer, listViewBtn, gridViewBtn);
  }
  
  // Setup for Pending Reviews tab
  const pendingReviewsTableContainer = document.querySelector('#pending-reviews .overflow-x-auto');
  console.log('[Homepage] Pending Reviews table container:', !!pendingReviewsTableContainer);
  if (listViewBtn && gridViewBtn && pendingReviewsTableContainer) {
    setupGridToggle('pending-reviews-tab', pendingReviewsTableContainer, listViewBtn, gridViewBtn);
  }
  
  /**
   * Setup grid/list toggle for a specific tab
   * @param {string} tabId - The tab container ID
   * @param {HTMLElement} tableContainer - The table container element
   * @param {HTMLElement} listBtn - List view button
   * @param {HTMLElement} gridBtn - Grid view button
   */
  function setupGridToggle(tabId, tableContainer, listBtn, gridBtn) {
    console.log('[Homepage] Setting up grid toggle for:', tabId);
    
    // Create grid container for this tab
    const gridContainer = document.createElement('div');
    gridContainer.id = `${tabId}-grid`;
    gridContainer.className = 'hidden grid grid-cols-3 gap-4';
    tableContainer.parentNode.insertBefore(gridContainer, tableContainer.nextSibling);
  }
  
  /**
   * Generate grid cards from table rows (client-side view toggle).
   * Note: For large datasets, use server-side rendering for better performance.
   * 
   * @param {HTMLElement} tableContainer - The table container
   * @param {HTMLElement} gridContainer - The grid container to populate
   * @param {string} tabId - The tab ID for context
   * @returns {void}
   */
  function generateGridCards(tableContainer, gridContainer, tabId) {
    const rows = tableContainer.querySelectorAll('tbody tr');
    console.log('[Homepage] Generating cards from', rows.length, 'rows');
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
    
    // Batch DOM update for better performance
    gridContainer.appendChild(fragment);
    console.log('[Homepage] Generated', gridContainer.children.length, 'cards');
  }
});