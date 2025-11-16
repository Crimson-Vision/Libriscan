/* Document View Tutorials - For document detail page */

import { TutorialBase } from './base.js';

export class DocumentTutorials extends TutorialBase {
  // Event listeners are handled by the main tutorial.js loader

  startDocumentWalkthrough() {
    // Check if pages exist
    const hasPages = document.querySelector('.page-card') !== null;
    const pagesContainer = document.getElementById('pagesContainer');
    const pagesSection = document.getElementById('pages-section');
    
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
        element: '#document-breadcrumb',
        popover: {
          title: '📍 Breadcrumb Navigation',
          description: 'Use the breadcrumbs at the top to navigate back to the Organization or Collection. Click on any level to go back to that section.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#document-header-card',
        popover: {
          title: '📚 Document Header',
          description: 'The document title is displayed here. You can edit the title using the edit icon, change the document status using the status dropdown, or delete the document using the delete button.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: pagesSection ? '#pages-section' : '#pagesContainer',
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
      const pagesEmpty = document.getElementById('pages-empty');
      steps.push({
        element: pagesEmpty || pagesContainer?.querySelector('.card') || 'body',
        popover: {
          title: '📭 No Pages Yet',
          description: 'This document doesn\'t have any pages yet. You\'ll need to add pages and upload images to start extracting text. Use the "Add New Page" button below to get started.',
          side: 'top',
          align: 'center'
        }
      });
    }

    // Add "Add New Page" button step
    const addPageButton = document.getElementById('page-create-link') || document.querySelector('a[href*="page/new"]');
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
    const exportSection = document.getElementById('export-section');
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

    // Try to find elements by ID first (more reliable), fall back to class selectors
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
}
