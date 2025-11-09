/**
 * Document Search - Debounced search with dropdown results + instant filter
 */
(function() {
  'use strict';

  let timeout;
  let results = [];

  function init() {
    const input = document.querySelector('#search-input');
    const container = document.querySelector('#search-results');
    if (!input || !container) return;

    input.addEventListener('input', (event) => {
      clearTimeout(timeout);
      const query = event.target.value.trim();
      
      // Instant filter table/grid
      filterDocuments(query);
      
      // Debounced dropdown search
      timeout = setTimeout(() => query ? search(query, container) : container.innerHTML = '', 300);
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && results[0]) {
        window.location.href = results[0].url;
      }
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.dropdown')) container.innerHTML = '';
    });
  }

  // Filter both table rows and grid cards
  function filterDocuments(query) {
    const lowerQuery = query.toLowerCase();
    
    // Filter table rows
    const tableContainer = document.querySelector('#tab1 .overflow-x-auto');
    if (tableContainer && !tableContainer.classList.contains('hidden')) {
      const tableRows = tableContainer.querySelectorAll('tbody tr');
      tableRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(lowerQuery) ? '' : 'none';
      });
    }
    
    // Filter grid cards
    const gridContainer = document.getElementById('documents-grid');
    if (gridContainer && !gridContainer.classList.contains('hidden')) {
      // Wait for grid to be populated
      requestAnimationFrame(() => {
        const gridCards = gridContainer.querySelectorAll('.card');
        gridCards.forEach(card => {
          const text = card.textContent.toLowerCase();
          card.style.display = text.includes(lowerQuery) ? '' : 'none';
        });
      });
    }
  }

  // Highlight the search query in the text
  function highlight(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-warning text-warning-content font-semibold px-0.5 py-0 rounded">$1</mark>');
  }

  async function search(query, container) {
    try {
      const response = await fetch(`/api/search/?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      results = (await response.json()).results || [];
      container.innerHTML = results.length ? `
        <ul class="menu menu-compact w-full gap-0 p-1">
          ${results.map(result => `
            <li>
              <a href="${result.url}" class="px-2 py-1.5 rounded hover:bg-base-200 active:bg-base-300">
                  <div class="flex flex-col">
                    <span class="font-semibold text-sm leading-tight">${highlight(result.title, query)}</span>
                    <span class="text-xs opacity-60 leading-tight">${highlight(result.identifier, query)} • ${highlight(result.collection, query)}${result.series ? ` • ${highlight(result.series, query)}` : ''}</span>
                  </div>
              </a>
            </li>
          `).join('')}
        </ul>
      ` : '<div class="alert alert-info py-2 px-3"><span class="text-sm">No documents found</span></div>';
    } catch (error) {
      console.error('Search error:', error);
      container.innerHTML = '<div class="alert alert-error"><span class="text-sm">Search failed. Please try again.</span></div>';
      if (window.LibriscanUtils?.showToast) {
        window.LibriscanUtils.showToast('Search failed. Please try again.', 'error');
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();