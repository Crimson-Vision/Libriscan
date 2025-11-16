/* Page View Tutorials - For page editing interface */

import { TutorialBase } from './base.js';

export class PageTutorials extends TutorialBase {
  startPageWalkthrough() {
    const driver = this.createDriver([
      {
        element: 'body',
        popover: {
          title: 'Welcome to Libriscan! 👋',
          description: 'Take a quick tour of the page editing interface. You\'ll learn how to navigate, view images, and edit extracted text.',
          side: 'center',
          align: 'center'
        }
      },
      {
        element: '#openseadragon-viewer',
        popover: {
          title: '📷 Image Viewer',
          description: '<strong>Navigate the page image:</strong><br/>• Scroll to zoom in/out<br/>• Drag to pan around<br/>• Use top-left controls for rotation and additional options',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '#pageNavigation',
        popover: {
          title: '⬅️ Page Navigation ➡️',
          description: '<strong>Move between pages:</strong><br/>• Use Previous/Next buttons<br/>• Or use the dropdown to jump directly to any page number',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#textDisplay',
        popover: {
          title: '🔎 Extracted Text Display',
          description: '<strong>All extracted words with confidence indicators:</strong><br/>• 🟢 Green = High confidence<br/>• 🟡 Yellow = Medium confidence<br/>• 🔴 Red = Low confidence<br/><br/>Line numbers and dividers separate text. <strong>Click any word to edit it.</strong>',
          side: 'left',
          align: 'start'
        }
      },
      {
        element: '#confidenceFilter',
        popover: {
          title: '🎨 Confidence Filter',
          description: '<strong>Toggle visibility of indicators:</strong><br/>• Confidence levels (High, Medium, Low, Accepted)<br/>• Word controls (Omit, Merge with Prior)<br/>• Review flags<br/>• Line numbers and dividers<br/><br/>Use this to focus on specific types of words that need attention.',
          side: 'left',
          align: 'start'
        }
      },
      {
        element: '#clickedWordsContainer',
        popover: {
          title: '✏️ Word Details Panel',
          description: '<strong>First, click on any word above to open this panel.</strong><br/><br/>Once open, you can:<br/>• Edit word text<br/>• View alternative suggestions<br/>• Adjust metadata (text type, visibility control)<br/>• Check confidence levels<br/>• Review complete edit history',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '#help-button',
        popover: {
          title: '🎓 Help & Tutorials',
          description: '<strong>Need help?</strong> Click this button anytime to access:<br/>• Interactive tutorials<br/>• Keyboard shortcuts guide<br/>• Documentation links',
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
          title: '⌨️ Keyboard Shortcuts Guide',
          description: '<strong>Speed up your workflow!</strong> Learn keyboard shortcuts to edit faster. <strong>Important:</strong> First click on a word to activate keyboard navigation.',
          side: 'center',
          align: 'center'
        }
      },
      {
        element: '#word-container',
        popover: {
          title: '🖱️ Step 1: Select a Word',
          description: '<strong>Click any word in the extracted text</strong> to activate the details panel and enable all keyboard shortcuts.',
          side: 'left',
          align: 'start'
        }
      },
      {
        element: '#prevWordBtn',
        popover: {
          title: '⬅️ Navigate: Left Arrow (←)',
          description: '<strong>Press <kbd>←</kbd></strong> to move to the previous word. Useful for reviewing words sequentially without using your mouse.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#nextWordBtn',
        popover: {
          title: '➡️ Navigate: Right Arrow (→)',
          description: '<strong>Press <kbd>→</kbd></strong> to move to the next word. Combined with other shortcuts, you can edit words very quickly!',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#editButton',
        popover: {
          title: '✏️ Edit: Press "E"',
          description: '<strong>Press <kbd>E</kbd></strong> to enter edit mode for the current word. You can also double-click the word text to edit.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#clickedWord',
        popover: {
          title: '💾 Save & Cancel',
          description: '<strong>While editing:</strong><br/>• Press <kbd>Enter</kbd> to save changes and auto-advance to next word<br/>• Press <kbd>Esc</kbd> to cancel and revert to original',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#confidenceLevelSection',
        popover: {
          title: '✅ Accept: Press "A"',
          description: '<strong>Press <kbd>A</kbd></strong> to accept the current word (sets confidence to 100%) and automatically advance to the next word. Great for fast workflows!',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#wordSuggestions',
        popover: {
          title: '🔢 Apply Suggestions: Press 1-9',
          description: '<strong>Press number keys <kbd>1</kbd>-<kbd>9</kbd></strong> to quickly apply suggestions:<br/>• <kbd>1</kbd> = First suggestion<br/>• <kbd>2</kbd> = Second suggestion<br/>• And so on...<br/><br/>This also auto-advances to the next word for rapid editing!',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '#reviewFlagBtn',
        popover: {
          title: '🚩 Flag for Review: Press "F"',
          description: '<strong>Press <kbd>F</kbd></strong> to toggle the review flag on the current word. Flagged words are highlighted in red and can be easily found later for review.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: 'body',
        popover: {
          title: '🚀 Keyboard Shortcuts Summary',
          description: '<strong>Navigation & Editing:</strong><br/>• <kbd>←</kbd> <kbd>→</kbd> - Navigate between words<br/>• <kbd>E</kbd> - Edit current word<br/>• <kbd>Enter</kbd> - Save changes<br/>• <kbd>Esc</kbd> - Cancel editing<br/><br/><strong>Quick Actions:</strong><br/>• <kbd>A</kbd> - Accept word<br/>• <kbd>1-9</kbd> - Apply suggestions<br/>• <kbd>F</kbd> - Flag for review<br/><br/><strong>💡 Pro Tip:</strong> Accepting words or applying suggestions automatically advances to the next word!',
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
          description: 'Learn how to edit words, manage metadata, and review suggestions. <strong>First, click on a word to see its details panel.</strong>',
          side: 'center',
          align: 'center'
        }
      },
      {
        element: '#clickedWord',
        popover: {
          title: '📝 Word Text',
          description: '<strong>Current word is displayed here.</strong><br/>• Click the Edit button (or press <kbd>E</kbd>) to modify<br/>• Or double-click the word to enter edit mode quickly',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#wordVisibilityControlDropdownBtn',
        popover: {
          title: '🎛️ Word Visibility Control',
          description: '<strong>Control how the word appears in exports:</strong><br/>• <strong>Include (I)</strong> - Normal output, word appears as-is<br/>• <strong>Merge (M)</strong> - Merge this word with the previous word (no space)<br/>• <strong>Omit (O)</strong> - Exclude this word from output completely',
          side: 'left',
          align: 'start'
        }
      },
      {
        element: '#confidenceLevelSection',
        popover: {
          title: '📈 Confidence Level',
          description: '<strong>OCR confidence indicator:</strong><br/>• Shows how confident the system is about this word<br/>• Lower confidence words may need review<br/>• Click "Accept" (or press <kbd>A</kbd>) to set confidence to 100%',
          side: 'left',
          align: 'start'
        }
      },
      {
        element: '#wordSuggestions',
        popover: {
          title: '💡 Alternative Suggestions',
          description: '<strong>Alternative words based on context and OCR analysis.</strong><br/>• Click any suggestion to apply it<br/>• Or press number keys <kbd>1-9</kbd> to quickly apply the first nine suggestions<br/>• Auto-advances to next word after applying',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '#wordAuditHistoryTab',
        popover: {
          title: '📜 Audit History',
          description: '<strong>Click the Audit History tab</strong> to view:<br/>• Complete edit history of the word<br/>• Who made changes and when<br/>• Previous values before edits<br/><br/>Useful for tracking word evolution and understanding edits over time.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#wordActionsDropdownIcon',
        popover: {
          title: '↩️ Revert to Original',
          description: '<strong>Available in the actions menu dropdown</strong> (when a word has been edited).<br/>• Restores word to its original OCR-extracted value<br/>• A confirmation dialog appears to prevent accidental reverts<br/>• Useful if you want to undo recent changes',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: 'body',
        popover: {
          title: '🎉 You\'re Ready to Edit!',
          description: '<strong>Remember these keyboard shortcuts for faster editing:</strong><br/>• <kbd>E</kbd> - Edit word<br/>• <kbd>A</kbd> - Accept word<br/>• <kbd>1-9</kbd> - Apply suggestions<br/>• <kbd>Enter</kbd> - Save and advance<br/>• <kbd>Esc</kbd> - Cancel<br/><br/>Happy editing!',
          side: 'center',
          align: 'center'
        }
      }
    ]);
    driver?.drive();
  }
}
