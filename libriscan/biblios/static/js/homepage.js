// Alias 
const fetchJSON = LibriscanUtils.fetchJSON.bind(LibriscanUtils);

// Tab switching and view toggle - Single DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  const tabs = document.querySelectorAll('#main-tabs .tab');
  const panels = document.querySelectorAll('.tab-panel');
  
  // Apply initial styling to first tab using Tailwind classes
  if (tabs[0]) {
    tabs[0].classList.add('btn-primary', 'font-semibold', 'shadow-md', '-translate-y-0.5');
  }
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active styling from all tabs
      tabs.forEach(t => {
        t.classList.remove('tab-active', 'btn-primary', 'font-semibold', 'shadow-md', '-translate-y-0.5');
      });
      
      // Add active styling to clicked tab using Tailwind classes
      this.classList.add('tab-active', 'btn-primary', 'font-semibold', 'shadow-md', '-translate-y-0.5');
      
      // Hide all panels
      panels.forEach(panel => panel.classList.add('hidden'));
      
      // Show target panel
      const targetId = this.getAttribute('data-tab');
      document.getElementById(targetId).classList.remove('hidden');
      
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
        // Prevents scroll jump
        tabs.forEach(t => {
          t.classList.remove('tab-active', 'btn-primary', 'font-semibold', 'shadow-md', '-translate-y-0.5');
        });
        tabToActivate.classList.add('tab-active', 'btn-primary', 'font-semibold', 'shadow-md', '-translate-y-0.5');
        
        panels.forEach(panel => panel.classList.add('hidden'));
        document.getElementById(hash).classList.remove('hidden');
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
      listBtn.classList.add('btn-primary');
      gridBtn.classList.remove('btn-primary');
    });
    
    gridBtn.addEventListener('click', function() {
      gridBtn.classList.add('btn-primary');
      listBtn.classList.remove('btn-primary');
    });
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
  
  // View toggle for All Documents tab - GRID IMPLEMENTATION
  const listViewBtn = document.getElementById('list-view-btn');
  const gridViewBtn = document.getElementById('grid-view-btn');
  const tableContainer = document.querySelector('#all-documents-tab .overflow-x-auto');
  
  if (listViewBtn && gridViewBtn && tableContainer) {
    // Create grid container
    const gridContainer = document.createElement('div');
    gridContainer.id = 'documents-grid';
    gridContainer.className = 'hidden grid grid-cols-3 gap-4';
    tableContainer.parentNode.insertBefore(gridContainer, tableContainer.nextSibling);
    
    // List view click
    listViewBtn.addEventListener('click', () => {
      listViewBtn.classList.add('btn-primary');
      gridViewBtn.classList.remove('btn-primary');
      tableContainer.classList.remove('hidden');
      gridContainer.classList.add('hidden');
    });
    
    // Grid view click
    gridViewBtn.addEventListener('click', () => {
      gridViewBtn.classList.add('btn-primary');
      listViewBtn.classList.remove('btn-primary');
      tableContainer.classList.add('hidden');
      gridContainer.classList.remove('hidden');
      
      // Generate cards if not already done
      if (gridContainer.children.length === 0) {
        generateGridCards();
        
        // Re-apply search filter after cards are generated using requestAnimationFrame
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
    });
    
    /**
     * Generate grid cards from table rows (client-side view toggle).
     * Note: For large datasets, use server-side rendering for better performance.
     * 
     * @returns {void}
     */
    function generateGridCards() {
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
        const openLink = cells[5]?.querySelector('a')?.href;
        
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
              <a href="${openLink}" class="btn btn-sm btn-primary gap-2">
                Open
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
    }
  }
});