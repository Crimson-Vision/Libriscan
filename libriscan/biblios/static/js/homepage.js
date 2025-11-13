// Alias 
const fetchJSON = LibriscanUtils.fetchJSON.bind(LibriscanUtils);

// Tab switching and view toggle - Single DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  const tabs = document.querySelectorAll('#main-tabs .tab');
  const panels = document.querySelectorAll('.tab-panel');
  const viewToggle = document.querySelector('.btn-group');
  
  // Apply initial styling to first tab using Tailwind classes
  if (tabs[0]) {
    tabs[0].classList.add('btn-primary', 'font-semibold', 'shadow-md', '-translate-y-0.5');
  }
  
  // Initialize ViewToggle module for list/grid functionality
  const viewToggleAPI = ViewToggle.init({
    listBtnId: 'list-view-btn',
    gridBtnId: 'grid-view-btn',
    tabs: [
      {
        tabId: 'all-documents-tab',
        tableSelector: '#all-documents .overflow-x-auto'
      },
      {
        tabId: 'pending-reviews-tab',
        tableSelector: '#pending-reviews .overflow-x-auto'
      }
    ]
  });
  
  // Initialize view toggle visibility on page load
  const initialHash = window.location.hash.slice(1);
  if (initialHash === 'recent-work-tab') {
    viewToggle?.classList.add('hidden');
  }
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('data-tab');
      
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
        viewToggle?.classList.add('hidden');
      } else {
        viewToggle?.classList.remove('hidden');
        
        // Apply current view mode to the newly visible tab
        if (viewToggleAPI) {
          viewToggleAPI.applyToTab(targetId);
        }
      }
      
      // Re-apply current search filter to newly visible tab
      const searchInput = document.getElementById('homepage-search');
      if (searchInput && searchInput.value.trim()) {
        filterAllTabs(searchInput.value.trim().toLowerCase());
      }
      
      // Save active tab in URL without scrolling
      history.replaceState(null, null, `#${targetId}`);
    });
  });
  
  // Restore active tab from URL hash on page load (after pagination)
  function restoreActiveTab() {
    const hash = window.location.hash.slice(1);
    if (hash && document.getElementById(hash)) {
      const tabToActivate = document.querySelector(`[data-tab="${hash}"]`);
      if (tabToActivate) {
        tabs.forEach(t => {
          t.classList.remove('tab-active', 'btn-primary', 'font-semibold', 'shadow-md', '-translate-y-0.5');
        });
        tabToActivate.classList.add('tab-active', 'btn-primary', 'font-semibold', 'shadow-md', '-translate-y-0.5');
        
        panels.forEach(panel => panel.classList.add('hidden'));
        document.getElementById(hash).classList.remove('hidden');
        
        // Show/hide view toggle based on restored tab
        if (hash === 'recent-work-tab') {
          viewToggle?.classList.add('hidden');
        } else {
          viewToggle?.classList.remove('hidden');
        }
      }
    }
  }
  
  // Restore tab on page load
  restoreActiveTab();
  
  // Search functionality - Filters across ALL tabs
  const searchInput = document.getElementById('homepage-search');
  const searchResults = document.getElementById('homepage-search-results');
  
  if (searchInput && searchResults) {
    searchInput.addEventListener('input', function(e) {
      const query = e.target.value.trim().toLowerCase();
      
      // Filter ALL tabs immediately
      filterAllTabs(query);
      
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
  
  /**
   * Filter all tabs based on search query
   * @param {string} query - The search query (already lowercased)
   */
  function filterAllTabs(query) {
    // Filter All Documents tab
    filterTableRows('#all-documents table', '#all-documents', query);
    
    // Filter Pending Reviews tab (if it exists)
    filterTableRows('#pending-reviews table', '#pending-reviews', query);
    
    // Filter Where You Left Off cards
    filterCards('#recent-textblocks .card', query);
    
    // Filter grid views (if they exist and are visible)
    filterGridCards('all-documents-tab-grid', query);
    filterGridCards('pending-reviews-tab-grid', query);
  }
  
  /**
   * Filter table rows for a specific tab
   * @param {string} tableSelector - CSS selector for the table
   * @param {string} containerSelector - CSS selector for the container
   * @param {string} query - Search query (lowercased)
   */
  function filterTableRows(tableSelector, containerSelector, query) {
    const table = document.querySelector(tableSelector);
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    let visibleCount = 0;
    
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
      
      if (rowText.includes(query)) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });
    
    // Show/hide "no results" message for this tab
    showNoResultsMessage(containerSelector, visibleCount, query);
  }
  
  /**
   * Filter grid cards for a specific grid container
   * @param {string} gridId - ID of the grid container
   * @param {string} query - Search query (lowercased)
   */
  function filterGridCards(gridId, query) {
    const gridContainer = document.getElementById(gridId);
    if (!gridContainer || gridContainer.classList.contains('hidden')) return;
    
    const gridCards = gridContainer.querySelectorAll('.card');
    gridCards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (query === '' || text.includes(query)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }
  
  /**
   * Filter cards in "Where You Left Off" tab
   * @param {string} cardSelector - CSS selector for cards
   * @param {string} query - Search query (lowercased)
   */
  function filterCards(cardSelector, query) {
    const cards = document.querySelectorAll(cardSelector);
    if (cards.length === 0) return;
    
    let visibleCount = 0;
    
    cards.forEach(card => {
      if (query === '') {
        card.style.display = '';
        visibleCount++;
        return;
      }
      
      const text = card.textContent.toLowerCase();
      if (text.includes(query)) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });
    
    // Show/hide "no results" message for Where You Left Off tab
    showNoResultsMessage('#recent-textblocks', visibleCount, query);
  }
  
  /**
   * Show or hide "no results" message for a tab
   * @param {string} containerSelector - CSS selector for the container
   * @param {number} visibleCount - Number of visible items
   * @param {string} query - Search query
   */
  function showNoResultsMessage(containerSelector, visibleCount, query) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    const msgId = `no-filter-results-${containerSelector.replace(/[^a-z0-9]/gi, '-')}`;
    let noResultsMsg = document.getElementById(msgId);
    
    if (visibleCount === 0 && query !== '') {
      if (!noResultsMsg) {
        noResultsMsg = document.createElement('div');
        noResultsMsg.id = msgId;
        noResultsMsg.className = 'alert alert-info mt-4';
        noResultsMsg.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>No results match your search. Try a different term.</span>
        `;
        container.appendChild(noResultsMsg);
      }
      noResultsMsg.style.display = '';
    } else if (noResultsMsg) {
      noResultsMsg.style.display = 'none';
    }
  }
});