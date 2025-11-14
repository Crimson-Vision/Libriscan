/* Tutorial System */

class LibriscanTutorial {
  constructor() {
    this.driver = null;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    document.getElementById('startTutorial')?.addEventListener('click', (event) => {
      event.preventDefault();
      this.startPageWalkthrough();
    });

    document.getElementById('startKeyboardShortcuts')?.addEventListener('click', (event) => {
      event.preventDefault();
      this.startKeyboardShortcuts();
    });

    document.getElementById('startWordEditingTutorial')?.addEventListener('click', (event) => {
      event.preventDefault();
      this.startWordEditing();
    });

    document.getElementById('startDocumentTutorial')?.addEventListener('click', (event) => {
      event.preventDefault();
      this.startDocumentWalkthrough();
    });

    document.getElementById('startPageCardTutorial')?.addEventListener('click', (event) => {
      event.preventDefault();
      this.startPageCardWalkthrough();
    });
  }

  createDriver(steps) {
    if (!window.driver?.js?.driver) {
      console.error('Driver.js not loaded');
      if (typeof LibriscanUtils !== 'undefined') {
        LibriscanUtils.showToast('Tutorial system not available', 'error');
      }
      return null;
    }

    try {
      this.driver = window.driver.js.driver({
        showProgress: true,
        showButtons: ['next', 'previous', 'close'],
        progressText: '{{current}} of {{total}}',
        nextBtnText: 'Next',
        prevBtnText: 'Previous',
        doneBtnText: 'Done',
        closeBtnText: '✕',
        animate: true,
        smoothScroll: true,
        steps: steps
      });
      return this.driver;
    } catch (error) {
      console.error('Error creating driver:', error);
      if (typeof LibriscanUtils !== 'undefined') {
        LibriscanUtils.showToast('Failed to start tutorial', 'error');
      }
      return null;
    }
  }

  startPageWalkthrough() {
    const driver = this.createDriver([
      {
        element: 'body',
        popover: {
          title: 'Welcome to Libriscan! 👋',
          description: 'Let\'s take a quick tour of the page editing interface. This tutorial will show you the main features and how to navigate the application.',
          side: 'center',
          align: 'center'
        }
      },
      {
        element: '#openseadragon-viewer',
        popover: {
          title: '📷 Image Viewer',
          description: 'This is the page image viewer. You can zoom, pan, and rotate the image using your mouse or the controls. Scroll to zoom, drag to pan, and use the controls in the top-left corner for rotation and other options.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '#pageNavigation',
        popover: {
          title: '⬅️ Page Navigation ➡️',
          description: 'Use the Previous and Next buttons to navigate between pages in the document. The dropdown in the center lets you jump directly to any page number.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#textDisplay',
        popover: {
          title: '🔎 Extracted Text',
          description: 'This area shows all the extracted words from the page. Words are color-coded by confidence level - green for high confidence, yellow for medium, and red for low. Each word has a line number and word number for reference. Line dividers separate different lines of text. Click any word to view and edit its details.',
          side: 'left',
          align: 'start'
        }
      },
      {
        element: '#confidenceFilter',
        popover: {
          title: '🎨 Confidence Filter & Indicators',
          description: 'This filter controls which visual indicators are shown on words. You can toggle visibility for:<br/>' +
            '• <strong>Confidence levels:</strong> High, Medium, Low, Accepted<br/>' +
            '• <strong>Word visibility controls:</strong> Omit, Merge with Prior<br/>' +
            '• <strong>Review flags:</strong> Words flagged for review<br/>' +
            '• <strong>Line Numbers & Dividers:</strong> Show/hide line numbers and dividers<br/><br/>' +
            'Use this to customize what you see and focus on specific types of words that need attention.',
          side: 'left',
          align: 'start'
        }
      },
      {
        element: '#clickedWordsContainer',
        popover: {
          title: '✏️ Word Details Panel',
          description: '<strong>First, click on any word in the extracted text above</strong> to open the word details panel here. Once open, you can edit the text, view alternative suggestions, change metadata (text type and word visibility control), check confidence levels, and see the complete history of changes.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '#help-button',
        popover: {
          title: '🎓 Help Button',
          description: 'Click this button anytime to access tutorials and learn about keyboard shortcuts. Now let\'s explore the keyboard shortcuts that will help you work faster!',
          side: 'left',
          align: 'center'
        }
      }
    ]);
    driver?.drive();
  }

  startKeyboardShortcuts() {
    const driver = this.createDriver([
      {
        element: 'body',
        popover: {
          title: '⌨️ Keyboard Shortcuts',
          description: 'Learn these keyboard shortcuts to work faster! Make sure to click on a word first to activate keyboard navigation.',
          side: 'center',
          align: 'center'
        }
      },
      {
        element: '#word-container',
        popover: {
          title: '🖱️ Step 1: Select a Word',
          description: 'First, click on any word in the extracted text. This activates the word details panel and enables all keyboard shortcuts for navigation and editing.',
          side: 'left',
          align: 'start'
        }
      },
      {
        element: '#prevWordBtn',
        popover: {
          title: '⬅️ Arrow Left (←)',
          description: '<strong>Press the Left Arrow key</strong> to navigate to the previous word. This is useful for reviewing words sequentially without using your mouse.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#nextWordBtn',
        popover: {
          title: '➡️ Arrow Right (→)',
          description: '<strong>Press the Right Arrow key</strong> to navigate to the next word. Combined with other shortcuts, you can edit words very quickly without touching your mouse!',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#editButton',
        popover: {
          title: '✏️ Press "E" to Edit',
          description: '<strong>Press the E key</strong> to enter edit mode for the current word. You can also double-click the word text to edit it.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#clickedWord',
        popover: {
          title: '💾 Enter to Save, Esc to Cancel',
          description: 'When editing a word:<br/>• <strong>Press Enter</strong> to save your changes and auto-advance to the next word<br/>• <strong>Press Escape</strong> to cancel editing and revert to the original text',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#confidenceLevelSection',
        popover: {
          title: '✅ Press "A" to Accept',
          description: '<strong>Press the A key</strong> to accept the current word. This sets the confidence to 100% and automatically advances to the next word for faster workflow.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#wordSuggestions',
        popover: {
          title: '🔢 Press 1-9 for Suggestions',
          description: '<strong>Press number keys 1-9</strong> to quickly apply suggestions. Pressing 1 applies the first suggestion, 2 applies the second, and so on. This also auto-advances to the next word for rapid editing.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '#reviewFlagBtn',
        popover: {
          title: '🚩 Press "F" to Flag for Review',
          description: '<strong>Press the F key</strong> to toggle the review flag on the current word. Flagged words are highlighted in red and can be easily found later for review. This is useful for marking words that need attention without stopping your workflow.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: 'body',
        popover: {
          title: '🚀 Quick Recap',
          description: '<strong>Keyboard Shortcuts Summary:</strong><br/>' +
            '• <kbd>←</kbd> / <kbd>→</kbd> - Navigate between words<br/>' +
            '• <kbd>E</kbd> - Edit current word<br/>' +
            '• <kbd>Enter</kbd> - Save changes<br/>' +
            '• <kbd>Esc</kbd> - Cancel editing<br/>' +
            '• <kbd>A</kbd> - Accept word<br/>' +
            '• <kbd>1-9</kbd> - Apply suggestions<br/>' +
            '• <kbd>F</kbd> - Flag for review<br/><br/>' +
            '<strong>Pro tip:</strong> Accepting words or applying suggestions will automatically advance to the next word!',
          side: 'center',
          align: 'center'
        }
      }
    ]);
    driver?.drive();
  }

  startWordEditing() {
    const driver = this.createDriver([
      {
        element: 'body',
        popover: {
          title: '✏️ Word Editing Tutorial',
          description: 'Learn how to edit words, manage metadata, and review suggestions. First, make sure you have clicked on a word to see its details.',
          side: 'center',
          align: 'center'
        }
      },
      {
        element: '#clickedWord',
        popover: {
          title: '📝 Word Text',
          description: 'The current word is displayed here. Click the Edit button (or press E) to modify the text. You can also double-click the word to enter edit mode quickly.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#wordVisibilityControlDropdownBtn',
        popover: {
          title: '🎛️ Word Visibility Control',
          description: 'Control how the word is handled in exports:<br/>' +
            '• <strong>Include (I)</strong> - Include the word normally in output<br/>' +
            '• <strong>Merge (M)</strong> - Merge this word with the previous word<br/>' +
            '• <strong>Omit (O)</strong> - Exclude this word from output',
          side: 'left',
          align: 'start'
        }
      },
      {
        element: '#confidenceLevelSection',
        popover: {
          title: '📈 Confidence Level',
          description: 'Shows the OCR confidence level for this word. Lower confidence words may need review. Click "Accept" (or press A) to set the confidence to 100%.',
          side: 'left',
          align: 'start'
        }
      },
      {
        element: '#wordSuggestions',
        popover: {
          title: '💡 Suggestions',
          description: 'Alternative words based on context and OCR analysis. Click any suggestion to apply it to the current word, or press number keys 1-9 to apply the first nine suggestions quickly.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '#wordAuditHistoryTab',
        popover: {
          title: '📜 Audit History',
          description: 'Click the Audit History tab to view the complete edit history of the current word. This shows all changes made to the word over time, including who made the changes, when they were made, and what the previous values were. This is useful for tracking edits and understanding the word\'s evolution.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#wordActionsDropdownIcon',
        popover: {
          title: '↩️ Revert to Original',
          description: 'The "Revert to Original" action (available in the actions menu dropdown when a word has been edited) allows you to restore a word to its original OCR-extracted value. This is useful if you\'ve made changes that you want to undo. A confirmation dialog will appear to prevent accidental reverts.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: 'body',
        popover: {
          title: '🎉 You\'re Ready!',
          description: 'You now know how to edit words and manage their metadata. Remember to use keyboard shortcuts (press E, A, or 1-9) to work faster. Happy editing!',
          side: 'center',
          align: 'center'
        }
      }
    ]);
    driver?.drive();
  }

  startDocumentWalkthrough() {
    // Check if pages exist
    const hasPages = document.querySelector('.page-card') !== null;
    const pagesContainer = document.getElementById('pagesContainer');
    
    const steps = [
      {
        element: 'body',
        popover: {
          title: 'Welcome to Document View!',
          description: 'This is the document detail page where you can manage your document, view all its pages, and export the content. Let\'s explore the key features.',
          side: 'center',
          align: 'center'
        }
      },
      {
        element: 'nav.breadcrumbs',
        popover: {
          title: '📍 Breadcrumb Navigation',
          description: 'Use the breadcrumbs at the top to navigate back to the Organization or Collection. Click on any level to go back to that section.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.card-title',
        popover: {
          title: '📚 Document Header',
          description: 'The document title is displayed here. You can edit the title using the edit icon, change the document status using the status dropdown, or delete the document using the delete button.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#pagesContainer',
        popover: {
          title: hasPages ? '📃 Pages in Document' : '📃 Pages Section',
          description: hasPages 
            ? 'This section lists all pages in your document. Each page card shows the page number, identifier (which you can edit), status badges, a text snippet preview, and creation/modification dates. Click on any page card to open it for editing.'
            : 'This section will display all pages in your document. Currently, there are no pages yet. You can add pages using the "Add New Page" button below.',
          side: 'top',
          align: 'start'
        }
      }
    ];

    // Add page-specific steps if pages exist
    if (hasPages) {
      const firstPageCard = document.querySelector('.page-card');
      if (firstPageCard) {
        steps.push({
          element: firstPageCard,
          popover: {
            title: '📄 Page Card',
            description: 'Each page card shows the page number, identifier, status, and a text preview. <strong>Click on a page card</strong> to open it for editing and text extraction.<br/><br/>' +
              '<em>💡 For an in-depth guide to all page card features, check out the "Page Card Guide" tutorial in the help menu.</em>',
            side: 'right',
            align: 'start'
          }
        });
      }
    } else {
      // Add step for empty state
      steps.push({
        element: pagesContainer?.querySelector('.card') || 'body',
        popover: {
          title: '📭 No Pages Yet',
          description: 'This document doesn\'t have any pages yet. You\'ll need to add pages and upload images to start extracting text. Use the "Add New Page" button below to get started.',
          side: 'top',
          align: 'center'
        }
      });
    }

    // Add "Add New Page" button step
    const addPageButton = document.querySelector('a[href*="page/new"]');
    if (addPageButton) {
      steps.push({
        element: addPageButton,
        popover: {
          title: '➕ Add New Page',
          description: 'Click this button to add a new page to your document. You\'ll be able to upload a page image and then extract text from it using OCR.',
          side: 'top',
          align: 'center'
        }
      });
    }

    // Add export section if it exists
    const exportSection = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes('Export Document'))?.closest('.border-t');
    if (exportSection) {
      steps.push({
        element: exportSection,
        popover: {
          title: '📥 Export Document',
          description: 'Once your document has extracted text, you can export it in various formats:<br/>' +
            '• <strong>PDF with Images:</strong> Full document with embedded page images<br/>' +
            '• <strong>Text-only PDF:</strong> PDF format with extracted text only<br/>' +
            '• <strong>Plain Text:</strong> Simple text file with extracted content<br/><br/>' +
            'The export options will be available once pages have been transcribed.',
          side: 'top',
          align: 'start'
        }
      });
    }

    // Final step
    steps.push({
      element: 'body',
      popover: {
        title: '🎉 You\'re All Set!',
        description: 'You now know how to navigate and manage documents in Libriscan. Remember to:<br/>' +
          '• Add pages to your document<br/>' +
          '• Click on pages to extract and edit text<br/>' +
          '• Use the export options when ready<br/><br/>' +
          'Happy transcribing!',
        side: 'center',
        align: 'center'
      }
    });

    const driver = this.createDriver(steps);
    driver?.drive();
  }

  startPageCardWalkthrough() {
    // Check if any page cards exist
    const firstPageCard = document.querySelector('.page-card');
    if (!firstPageCard) {
      if (typeof LibriscanUtils !== 'undefined') {
        LibriscanUtils.showToast('No pages available. Add a page first to see this tutorial.', 'info');
      }
      return;
    }

    // Find elements within the first page card using classes
    const pageNumberBadge = firstPageCard.querySelector('.page-number-badge');
    const pageIdentifierSection = firstPageCard.querySelector('.page-identifier-section');
    const pageEditIdentifierBtn = firstPageCard.querySelector('.page-edit-identifier-btn');
    const pageStatusBadges = firstPageCard.querySelector('.page-status-badges');
    const pageSnippet = firstPageCard.querySelector('.page-snippet');
    const pageMetadata = firstPageCard.querySelector('.page-metadata');
    const pageReorderButtons = firstPageCard.querySelector('.page-reorder-buttons');
    const pageDeleteBtn = firstPageCard.querySelector('.page-delete-btn');
    const hasMultiplePages = document.querySelectorAll('.page-card').length > 1;

    const steps = [
      {
        element: firstPageCard,
        popover: {
          title: '📄 Page Card Overview',
          description: 'This is a page card - your gateway to editing and managing individual pages. Each card contains all the information and controls you need. Let\'s explore each component in detail.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: pageNumberBadge || firstPageCard,
        popover: {
          title: '🔢 Page Number',
          description: 'The page number badge shows the sequential position of this page in the document. Pages are numbered automatically starting from 1. This number helps you identify and navigate between pages.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: pageIdentifierSection || firstPageCard,
        popover: {
          title: '📝 Page Identifier',
          description: 'The page identifier is a custom name you can assign to each page. By default, pages are labeled "Untitled" or filename of the uploaded image, but you can give them meaningful names like "Cover", "Page 1", or internal identifier to help organize your document.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: pageEditIdentifierBtn || firstPageCard,
        popover: {
          title: '✏️ Edit Identifier',
          description: 'Click the edit icon next to the page identifier to rename the page. After clicking, you can type a new name (up to 30 characters). Press Enter or click away to save. This makes it easier to identify pages at a glance.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: pageStatusBadges || firstPageCard,
        popover: {
          title: '🏷️ Status Badges',
          description: 'Status badges indicate the current state of the page:<br/>' +
            '• <strong>"New"</strong> (yellow badge): Page has been added but no text has been extracted yet<br/>' +
            '• <strong>"Transcribed"</strong> (green badge): Page has extracted text ready for editing<br/><br/>' +
            'These badges help you quickly see which pages need attention.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: pageSnippet || firstPageCard,
        popover: {
          title: '📖 Text Snippet Preview',
          description: 'If text has been extracted from the page, a preview snippet appears here. This gives you a quick glimpse of the page content without opening it. If no text has been extracted yet, you\'ll see "No preview available".',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: pageMetadata || firstPageCard,
        popover: {
          title: '📅 Page Metadata',
          description: 'The metadata section shows important timestamps:<br/>' +
            '• <strong>Created:</strong> When the page was first added to the document<br/>' +
            '• <strong>Last Modified:</strong> When the page was last edited<br/><br/>' +
            'This helps you track when pages were added and when they were last updated.',
          side: 'top',
          align: 'start'
        }
      }
    ];

    // Add reorder buttons step only if multiple pages exist
    if (hasMultiplePages && pageReorderButtons) {
      steps.push({
        element: pageReorderButtons,
        popover: {
          title: '⬆️⬇️ Reorder Pages',
          description: 'When you have multiple pages, you can reorder them using these buttons:<br/>' +
            '• <strong>Up arrow (↑):</strong> Move the page earlier in the sequence<br/>' +
            '• <strong>Down arrow (↓):</strong> Move the page later in the sequence<br/><br/>' +
            'The first page can\'t move up, and the last page can\'t move down. Reordering helps organize your document structure.',
          side: 'right',
          align: 'start'
        }
      });
    }

    // Add delete button step
    if (pageDeleteBtn) {
      steps.push({
        element: pageDeleteBtn,
        popover: {
          title: '🗑️ Delete Page',
          description: 'The delete icon (trash can) allows you to remove a page from the document. <strong>Warning:</strong> This action cannot be undone. When you click the delete button, a confirmation dialog will appear to prevent accidental deletions. Only delete pages you\'re sure you want to remove permanently.',
          side: 'left',
          align: 'start'
        }
      });
    }

    // Add click to open step
    steps.push({
      element: firstPageCard,
      popover: {
        title: '🖱️ Click to Open',
        description: '<strong>Click anywhere on the page card</strong> to open the page for editing. Once opened, you can:<br/>' +
          '• View and edit the page image<br/>' +
          '• Extract text using OCR<br/>' +
          '• Edit individual words<br/>' +
          '• Review and correct extracted text<br/><br/>' +
          'The page card is your starting point for all page editing activities.',
        side: 'right',
        align: 'start'
      }
    });

    // Final summary
    steps.push({
      element: 'body',
      popover: {
        title: '✅ Page Card Complete!',
        description: 'You now understand all the features of a page card:<br/>' +
          '• Page number and identifier<br/>' +
          '• Status badges and text preview<br/>' +
          '• Metadata and timestamps<br/>' +
          (hasMultiplePages ? '• Page reordering<br/>' : '') +
          '• Delete functionality<br/>' +
          '• Click to open for editing<br/><br/>' +
          'Use these features to efficiently manage and navigate your document pages!',
        side: 'center',
        align: 'center'
      }
    });

    const driver = this.createDriver(steps);
    driver?.drive();
  }

  destroy() {
    this.driver?.destroy();
    this.driver = null;
  }
}

// Initialize
let tutorial = null;

function initTutorial() {
  if (window.driver?.js?.driver) {
    tutorial = new LibriscanTutorial();
    window.LibriscanTutorial = tutorial;
    console.log('✅ Tutorial initialized');
  } else {
    console.warn('⚠️ Driver.js not loaded');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTutorial);
} else {
  setTimeout(initTutorial, 100);
}
