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
          description: 'This area shows all the extracted words from the page. Words are color-coded by confidence level - green for high confidence, yellow for medium, and red for low. Click any word to view and edit its details.',
          side: 'left',
          align: 'start'
        }
      },
      {
        element: '#confidenceFilter',
        popover: {
          title: '🎨 Confidence Filter',
          description: 'Use this filter to show or hide words based on their confidence levels. This helps you focus on words that need review by filtering out already-accepted or high-confidence words.',
          side: 'left',
          align: 'start'
        }
      },
      {
        element: '#clickedWordsContainer',
        popover: {
          title: '✏️ Word Details Panel',
          description: 'When you click on a word, its details appear here. You can edit the text, view alternative suggestions, change metadata (text type and word visibility control), check confidence levels, and see the complete history of changes.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '#tutorialFab',
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
        element: '#raw-text-content .word-block:first-child',
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
        element: '#confidenceStat',
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
        element: 'body',
        popover: {
          title: '🚀 Quick Recap',
          description: '<strong>Keyboard Shortcuts Summary:</strong><br/>' +
            '• <kbd>←</kbd> / <kbd>→</kbd> - Navigate between words<br/>' +
            '• <kbd>E</kbd> - Edit current word<br/>' +
            '• <kbd>Enter</kbd> - Save changes<br/>' +
            '• <kbd>Esc</kbd> - Cancel editing<br/>' +
            '• <kbd>A</kbd> - Accept<br/>' +
            '• <kbd>1-9</kbd> - Apply suggestions<br/><br/>' +
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
        element: '#typeControlConfidenceStatContainer',
        popover: {
          title: '📊 Word Metadata',
          description: 'View and edit word properties including word visibility control (how the word is handled in exports) and confidence level (OCR accuracy).',
          side: 'top',
          align: 'center'
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
        element: '#confidenceStat',
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
          description: 'View the complete history of changes made to this word, including who made the changes and when they were made.',
          side: 'bottom',
          align: 'center'
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
