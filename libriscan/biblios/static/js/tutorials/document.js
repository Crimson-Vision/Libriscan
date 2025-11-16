/* Document View Tutorials - For document detail page */

import { TutorialBase } from './base.js';

export class DocumentTutorials extends TutorialBase {
  startDocumentWalkthrough() {
    const hasPages = document.querySelector('.page-card') !== null;
    const pagesContainer = document.getElementById('pagesContainer');
    const pagesSection = document.getElementById('pages-section');
    const statusDropdown = document.getElementById('statusDropdown');
    const statusButton = document.getElementById('statusButton');
    const statusBadge = document.getElementById('statusBadge');
    
    const steps = [
      {
        element: 'body',
        popover: {
          title: 'Welcome to Document View! 📚',
          description: 'This is where you manage your document, view all its pages, and export the content. Let\'s explore the key features.',
          side: 'center',
          align: 'center'
        }
      },
      {
        element: '#document-breadcrumb',
        popover: {
          title: '📍 Breadcrumb Navigation',
          description: '<strong>Navigate back to previous levels:</strong><br/>• Click on Organization to go to organization page<br/>• Click on Collection to go to collection page<br/>• Click on Series to go to series page (if applicable)',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#document-header-card',
        popover: {
          title: '📚 Document Header',
          description: '<strong>Document management controls:</strong><br/>• View or edit the document title<br/>• Change document status using the status dropdown<br/>• Delete the document using the delete button<br/><br/>The header shows key information at a glance.',
          side: 'bottom',
          align: 'start'
        }
      }
    ];

    // Add status dropdown walkthrough if it exists
    if (statusDropdown || statusButton || statusBadge) {
      steps.push({
        element: statusDropdown || statusButton || statusBadge || '#document-header-card',
        popover: {
          title: '📊 Document Status Workflow',
          description: '<strong>Track your document progress through these statuses:</strong><br/>• <strong>New</strong> - Document just created, work not started<br/>• <strong>In Progress</strong> - Actively being transcribed/edited<br/>• <strong>Ready for Review</strong> - Transcription complete, awaiting review<br/>• <strong>Approved</strong> - Document is final and approved<br/><br/>Click the status dropdown to change status.',
          side: 'bottom',
          align: 'start'
        }
      });
    }

    steps.push({
      element: pagesSection ? '#pages-section' : '#pagesContainer',
      popover: {
        title: hasPages ? '📃 Pages in Document' : '📃 Pages Section',
        description: hasPages 
          ? '<strong>All pages in your document are listed here.</strong> Each page card shows:<br/>• Page number and identifier<br/>• Status badges<br/>• Text snippet preview<br/>• Creation and modification dates<br/><br/><strong>Click any page card to open it for editing.</strong>'
          : '<strong>No pages yet.</strong> Use the "Add New Page" button below to upload page images and start extracting text.',
        side: 'top',
        align: 'start'
      }
    });

    if (hasPages) {
      const firstPageCard = document.querySelector('.page-card');
      if (firstPageCard) {
        steps.push({
          element: firstPageCard,
          popover: {
            title: '📄 Page Card',
            description: '<strong>Each page card displays:</strong><br/>• Page number and identifier<br/>• Status (New, Transcribed)<br/>• Text preview snippet<br/>• Timestamps<br/><br/><strong>Click anywhere on the card to open for editing.</strong><br/><br/><em>💡 For detailed page card features, check out the "Page Card Guide" tutorial.</em>',
            side: 'right',
            align: 'start'
          }
        });
      }
    } else {
      const pagesEmpty = document.getElementById('pages-empty');
      steps.push({
        element: pagesEmpty || pagesContainer?.querySelector('.card') || 'body',
        popover: {
          title: '📭 No Pages Yet',
          description: '<strong>To get started:</strong><br/>• Click "Add New Page" button<br/>• Upload page images<br/>• Extract text using OCR<br/>• Start editing extracted words',
          side: 'top',
          align: 'center'
        }
      });
    }

    const addPageButton = document.getElementById('page-create-link') || document.querySelector('a[href*="page/new"]');
    if (addPageButton) {
      steps.push({
        element: addPageButton,
        popover: {
          title: '➕ Add New Page',
          description: '<strong>Click to add a new page:</strong><br/>• Upload a page image (JPG or PNG)<br/>• Set page number and identifier<br/>• Extract text using OCR<br/>• Start editing extracted words',
          side: 'top',
          align: 'center'
        }
      });
    }

    const exportSection = document.getElementById('export-section');
    if (exportSection) {
      steps.push({
        element: exportSection,
        popover: {
          title: '📥 Export Document',
          description: '<strong>Export your document in multiple formats:</strong><br/>• <strong>PDF with Images</strong> - Full document with embedded page images<br/>• <strong>Text-only PDF</strong> - PDF format with extracted text only<br/>• <strong>Plain Text</strong> - Simple text file with extracted content<br/><br/>Export options are available once pages have been transcribed.',
          side: 'top',
          align: 'start'
        }
      });
    }

    steps.push({
      element: 'body',
      popover: {
        title: '🎉 You\'re All Set!',
        description: '<strong>Your workflow:</strong><br/>1. Add pages → Upload images<br/>2. Extract text → Use OCR<br/>3. Edit words → Review and correct<br/>4. Update status → Track progress (New → In Progress → Ready for Review → Approved)<br/>5. Export → When ready<br/><br/>Happy transcribing!',
        side: 'center',
        align: 'center'
      }
    });

    const driver = this.createDriver(steps);
    driver?.drive();
  }

  startPageCardWalkthrough() {
    const firstPageCard = document.querySelector('.page-card');
    if (!firstPageCard) {
      LibriscanUtils?.showToast('No pages available. Add a page first.', 'info');
      return;
    }

    const pageNumber = firstPageCard.dataset?.pageNumber || firstPageCard.getAttribute('data-page-number');
    const pageNumberBadge = pageNumber ? document.getElementById(`page-number-badge-${pageNumber}`) : firstPageCard.querySelector('.page-number-badge');
    const pageIdentifierSection = pageNumber ? document.getElementById(`page-identifier-section-${pageNumber}`) : firstPageCard.querySelector('.page-identifier-section');
    const pageEditIdentifierBtn = pageNumber ? document.getElementById(`page-edit-identifier-btn-${pageNumber}`) : firstPageCard.querySelector('.page-edit-identifier-btn');
    const pageStatusBadges = pageNumber ? document.getElementById(`page-status-badges-${pageNumber}`) : firstPageCard.querySelector('.page-status-badges');
    const pageSnippet = pageNumber ? document.getElementById(`page-snippet-${pageNumber}`) : firstPageCard.querySelector('.page-snippet');
    const pageMetadata = pageNumber ? document.getElementById(`page-metadata-${pageNumber}`) : firstPageCard.querySelector('.page-metadata');
    const pageReorderButtons = pageNumber ? document.getElementById(`page-reorder-buttons-${pageNumber}`) : firstPageCard.querySelector('.page-reorder-buttons');
    const pageDeleteBtn = pageNumber ? document.getElementById(`page-delete-btn-${pageNumber}`) : firstPageCard.querySelector('.page-delete-btn');
    const hasMultiplePages = document.querySelectorAll('.page-card').length > 1;

    const steps = [
      {
        element: firstPageCard,
        popover: {
          title: '📄 Page Card Overview',
          description: '<strong>This page card contains all the information and controls you need.</strong> Let\'s explore each component below.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: pageNumberBadge || firstPageCard,
        popover: {
          title: '🔢 Page Number',
          description: '<strong>Sequential position in the document.</strong> Pages are numbered automatically starting from 1. This number helps you identify and navigate between pages.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: pageIdentifierSection || firstPageCard,
        popover: {
          title: '📝 Page Identifier',
          description: '<strong>Custom name for the page.</strong> Examples:<br/>• "Cover"<br/>• "Page 1"<br/>• Internal identifier<br/><br/>Defaults to "Untitled" or the uploaded filename. Helps organize your document.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: pageEditIdentifierBtn || firstPageCard,
        popover: {
          title: '✏️ Edit Identifier',
          description: '<strong>Click the edit icon to rename the page:</strong><br/>• Type a new name (up to 30 characters)<br/>• Press Enter or click away to save<br/>• Makes it easier to identify pages at a glance',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: pageStatusBadges || firstPageCard,
        popover: {
          title: '🏷️ Status Badges',
          description: '<strong>Indicates the current state of the page:</strong><br/>• <strong>"New"</strong> (yellow badge) - Page added, no text extracted yet<br/>• <strong>"Transcribed"</strong> (green badge) - Text extracted, ready for editing<br/><br/>Helps you quickly see which pages need attention.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: pageSnippet || firstPageCard,
        popover: {
          title: '📖 Text Preview Snippet',
          description: '<strong>Quick preview of extracted text.</strong> If text has been extracted, a preview snippet appears here. Shows "No preview available" if no text has been extracted yet.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: pageMetadata || firstPageCard,
        popover: {
          title: '📅 Page Metadata',
          description: '<strong>Important timestamps:</strong><br/>• <strong>Created:</strong> When the page was first added to the document<br/>• <strong>Last Modified:</strong> When the page was last edited<br/><br/>Helps you track when pages were added and updated.',
          side: 'top',
          align: 'start'
        }
      }
    ];

    if (hasMultiplePages && pageReorderButtons) {
      steps.push({
        element: pageReorderButtons,
        popover: {
          title: '⬆️⬇️ Reorder Pages',
          description: '<strong>When you have multiple pages, you can reorder them:</strong><br/>• <strong>↑ (Up arrow)</strong> - Move page earlier in sequence<br/>• <strong>↓ (Down arrow)</strong> - Move page later in sequence<br/><br/><strong>Note:</strong> First page can\'t move up, last page can\'t move down.',
          side: 'right',
          align: 'start'
        }
      });
    }

    if (pageDeleteBtn) {
      steps.push({
        element: pageDeleteBtn,
        popover: {
          title: '🗑️ Delete Page',
          description: '<strong>⚠️ Warning:</strong> This permanently removes the page from the document.<br/>• <strong>Cannot be undone</strong><br/>• Confirmation dialog appears to prevent accidents<br/>• Only delete pages you\'re sure you want to remove',
          side: 'left',
          align: 'start'
        }
      });
    }

    steps.push({
      element: firstPageCard,
      popover: {
        title: '🖱️ Click to Open',
        description: '<strong>Click anywhere on the page card</strong> to open it for editing. Once opened, you can:<br/>• View and edit the page image<br/>• Extract text using OCR<br/>• Edit individual words<br/>• Review and correct extracted text<br/><br/>The page card is your starting point for all page editing activities.',
        side: 'right',
        align: 'start'
      }
    });

    steps.push({
      element: 'body',
      popover: {
        title: '✅ Page Card Complete!',
        description: '<strong>You now understand all page card features:</strong><br/>• Page number and identifier<br/>• Status badges and text preview<br/>• Metadata and timestamps<br/>' + (hasMultiplePages ? '• Page reordering<br/>' : '') + '• Delete functionality<br/>• Click to open for editing<br/><br/>Use these features to efficiently manage and navigate your document pages!',
        side: 'center',
        align: 'center'
      }
    });

    const driver = this.createDriver(steps);
    driver?.drive();
  }
}
