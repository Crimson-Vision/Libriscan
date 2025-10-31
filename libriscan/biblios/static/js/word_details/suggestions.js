/**
 * WordSuggestions - Handles word suggestions rendering and interaction
 */
class WordSuggestions {
  constructor(wordDetails) {
    this.wordDetails = wordDetails;
  }

  updateSuggestions(wordInfo) {
    this.wordDetails.suggestionsContainer.innerHTML = '';
    const entries = Object.entries(wordInfo.suggestions || {});
    
    if (entries.length === 0) {
      this.wordDetails.suggestionsContainer.textContent = 'No suggestions available';
      return;
    }

    const suggestionsList = document.createElement('ul');
    suggestionsList.className = 'menu menu-sm bg-base-200 w-full rounded-lg grid grid-cols-3 gap-2';
    const frag = document.createDocumentFragment();

    entries.forEach(([suggestion], index) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'flex items-center justify-center gap-2 p-2';
      
      const keyboardShortcut = index < 9 ? `<kbd class="kbd kbd-xs">${index + 1}</kbd>` : '';
      link.innerHTML = `${keyboardShortcut}<span>${suggestion}</span>`;
      
      link.addEventListener('click', (event) => {
        event.preventDefault();
        this.applySuggestion(suggestion, suggestionsList, link);
      });
      
      item.appendChild(link);
      frag.appendChild(item);
    });

    suggestionsList.appendChild(frag);
    this.wordDetails.suggestionsContainer.appendChild(suggestionsList);
  }

  async applySuggestion(suggestion, suggestionsList, clickedLink) {
    if (!suggestion.trim()) {
      LibriscanUtils.showToast('Suggestion cannot be empty', 'error');
      return;
    }

    await this.wordDetails.updateHandler.updateWordText(suggestion, {
      callback: () => {
        suggestionsList.querySelectorAll('a').forEach(a => a.classList.remove('active'));
        clickedLink.classList.add('active');
      },
      autoAdvance: true
    });
  }
}

