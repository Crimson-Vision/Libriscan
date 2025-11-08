// Tab switching 
document.addEventListener('DOMContentLoaded', function() {
  const tabs = document.querySelectorAll('#main-tabs .tab');
  const panels = document.querySelectorAll('.tab-panel');
  
  // Use btn-primary class for consistent styling
  // Apply to first tab on load
  if (tabs[0]) {
    tabs[0].classList.add('btn-primary');
    tabs[0].style.fontWeight = '600';
    tabs[0].style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    tabs[0].style.transform = 'translateY(-2px)';
  }
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active styling from all tabs
      tabs.forEach(t => {
        t.classList.remove('tab-active', 'btn-primary');
        t.style.fontWeight = '';
        t.style.boxShadow = '';
        t.style.transform = '';
      });
      
      // Add active styling to clicked tab - matching Start Transcribing button
      this.classList.add('tab-active', 'btn-primary');
      this.style.fontWeight = '600';
      this.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
      this.style.transform = 'translateY(-2px)';
      
      // Hide all panels
      panels.forEach(panel => panel.classList.add('hidden'));
      
      // Show target panel
      const targetId = this.getAttribute('data-tab');
      document.getElementById(targetId).classList.remove('hidden');
      
      // Save active tab in URL hash
      window.location.hash = targetId;
    });
  });
  
  // Restore active tab from URL hash on page load (after pagination)
  function restoreActiveTab() {
    const hash = window.location.hash.slice(1); // Remove # from hash
    if (hash && document.getElementById(hash)) {
      const tabToActivate = document.querySelector(`[data-tab="${hash}"]`);
      if (tabToActivate) {
        tabToActivate.click();
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
  
  // Search functionality
  const searchInput = document.getElementById('homepage-search');
  const searchResults = document.getElementById('homepage-search-results');
  let searchTimeout;
  
  if (searchInput && searchResults) {
    searchInput.addEventListener('input', function(e) {
      const query = e.target.value.trim().toLowerCase();
      
      // Clear previous timeout
      clearTimeout(searchTimeout);
      
      // Filter the table/grid immediately
      filterTable(query);
      
      // Hide dropdown results if query is empty
      if (query.length === 0) {
        searchResults.classList.add('hidden');
        searchResults.innerHTML = '';
        return;
      }
      
      // Wait 300ms after user stops typing before showing dropdown
      searchTimeout = setTimeout(() => {
        performSearch(query);
      }, 300);
    });
    
    // Close dropdown results when clicking outside
    document.addEventListener('click', function(e) {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.add('hidden');
      }
    });
  }
  
  // Filter table rows AND grid cards based on search query
  function filterTable(query) {
    const table = document.querySelector('#all-documents table');
    const gridContainer = document.getElementById('documents-grid');
    
    // Filter table rows
    if (table) {
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
        if (query === '' || text.includes(query)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    }
  }
  
  async function performSearch(query) {
    try {
      // Get CSRF token if needed for your setup
      const response = await fetch(`/api/search/?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        displaySearchResults(data.results);
      } else {
        searchResults.innerHTML = '<div class="p-4 text-center text-base-content/60">No documents found</div>';
        searchResults.classList.remove('hidden');
      }
    } catch (error) {
      console.error('Search error:', error);
      searchResults.innerHTML = `<div class="p-4 text-center text-error">Search error: ${error.message}</div>`;
      searchResults.classList.remove('hidden');
    }
  }
  
  function displaySearchResults(results) {
    searchResults.innerHTML = results.map(doc => `
      <a href="${doc.url}" class="block p-3 hover:bg-base-200 transition-colors border-b border-base-300 last:border-b-0">
        <div class="font-medium text-base">${doc.identifier}</div>
        <div class="text-sm text-base-content/70">
          ${doc.organization} > ${doc.collection}${doc.series ? ' > ' + doc.series : ' > <span class="text-base-content/50">Orphaned</span>'}
        </div>
      </a>
    `).join('');
    searchResults.classList.remove('hidden');
  }
});

// View toggle for All Documents tab - GRID IMPLEMENTATION
document.addEventListener('DOMContentLoaded', function() {
  const listViewBtn = document.getElementById('list-view-btn');
  const gridViewBtn = document.getElementById('grid-view-btn');
  const tableContainer = document.querySelector('#tab1 .overflow-x-auto');
  
  if (!listViewBtn || !gridViewBtn || !tableContainer) return;
  
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
      
      // Re-apply search filter after cards are generated
      setTimeout(() => {
        const searchInput = document.getElementById('homepage-search');
        if (searchInput && searchInput.value.trim()) {
          const query = searchInput.value.trim().toLowerCase();
          const gridCards = gridContainer.querySelectorAll('.card');
          gridCards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(query) ? '' : 'none';
          });
        }
      }, 50);
    }
  });
  
  function generateGridCards() {
    const rows = tableContainer.querySelectorAll('tbody tr');
    
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
      gridContainer.appendChild(card);
    });
  }
});