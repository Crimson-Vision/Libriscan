/* Collection View Tutorial - For collection detail page */

import { TutorialBase } from './base.js';

export class CollectionTutorials extends TutorialBase {
  // Event listeners are handled by the main tutorial.js loader

  startCollectionWalkthrough() {
    // Check if series and documents exist
    const seriesList = document.getElementById('collectionSeriesList');
    const documentsList = document.getElementById('collectionDocumentsList');
    const hasSeries = seriesList?.querySelector('.card') !== null;
    const hasDocuments = documentsList?.querySelector('.card') !== null;
    const seriesSection = document.getElementById('collectionSeriesSection');
    const documentsSection = document.getElementById('collectionDocumentsSection');
    const editBtn = document.getElementById('collectionEditBtn');
    const deleteBtn = document.getElementById('collectionDeleteBtn');
    const addSeriesBtn = document.getElementById('collectionAddSeriesBtn');
    const addDocumentBtn = document.getElementById('collectionAddDocumentBtn');

    const steps = [
      {
        element: 'body',
        popover: {
          title: 'Welcome to Collection View! 📚',
          description: 'This is the collection detail page where you can manage your collection, organize series and documents, and control access. Let\'s explore the key features.',
          side: 'center',
          align: 'center'
        }
      },
      {
        element: '#collection-breadcrumb',
        popover: {
          title: '📍 Breadcrumb Navigation',
          description: 'Use the breadcrumbs at the top to navigate back to the Organization. Click on the organization name to return to the organization page.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#collection-title',
        popover: {
          title: '📁 Collection Header',
          description: 'The collection name is displayed here. You can edit the collection name using the edit icon, or delete the entire collection using the delete button.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: editBtn || '#collection-title',
        popover: {
          title: '✏️ Edit Collection',
          description: 'Click the edit icon to modify the collection name and other properties. This allows you to update the collection information without affecting its contents.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: deleteBtn || '#collection-title',
        popover: {
          title: '🗑️ Delete Collection',
          description: '<strong>⚠️ Warning:</strong> The delete button permanently removes the entire collection, including all series and documents within it. <strong>This action cannot be undone and will result in permanent data loss.</strong> A confirmation dialog will appear when you click delete to prevent accidental deletions.',
          side: 'left',
          align: 'start'
        }
      },
      {
        element: seriesSection || 'body',
        popover: {
          title: '📂 Series Section',
          description: 'Series are groups of related documents within your collection. They help organize documents into logical categories. Use series when you have multiple documents that belong together thematically or chronologically.',
          side: 'top',
          align: 'start'
        }
      }
    ];

    // Add series-specific steps
    if (hasSeries) {
      const firstSeries = seriesList?.querySelector('.card');
      if (firstSeries) {
        steps.push({
          element: firstSeries,
          popover: {
            title: '📂 Series Card',
            description: 'Each series card shows the series name. Click on a series to view and manage its documents. You can delete a series using the delete icon on the right. <strong>Note:</strong> Deleting a series will also delete all documents within that series.',
            side: 'right',
            align: 'start'
          }
        });
      }
    } else {
      steps.push({
        element: seriesList?.querySelector('.card') || seriesSection || 'body',
        popover: {
          title: '📭 No Series Yet',
          description: 'This collection doesn\'t have any series yet. Series are optional - you can organize documents directly in the collection, or create series to group related documents together.',
          side: 'top',
          align: 'center'
        }
      });
    }

    // Add "Add New Series" button step
    if (addSeriesBtn) {
      steps.push({
        element: addSeriesBtn,
        popover: {
          title: '➕ Add New Series',
          description: 'Click this button to create a new series within this collection. Series help organize related documents together. For example, you might create a series for "Local Deeds" or "Correspondence" to group similar documents.',
          side: 'top',
          align: 'center'
        }
      });
    }

    // Add documents section step
    steps.push({
      element: documentsSection || 'body',
      popover: {
        title: '📄 Documents Section',
        description: 'Documents are the core content of your collection. Each document can contain multiple pages with images and extracted text. Documents can exist directly in the collection or be organized within series. This section shows all documents that are not part of any series.',
        side: 'top',
        align: 'start'
      }
    });

    // Add document-specific steps
    if (hasDocuments) {
      const firstDocument = documentsList?.querySelector('.card');
      if (firstDocument) {
        steps.push({
          element: firstDocument,
          popover: {
            title: '📄 Document Card',
            description: 'Each document card shows the document identifier and status badge. Click on a document to view and edit its pages. You can delete a document using the delete icon on the right. <strong>Warning:</strong> Deleting a document will permanently remove it and all its pages and extracted text.',
            side: 'right',
            align: 'start'
          }
        });
      }
    } else {
      steps.push({
        element: documentsList?.querySelector('.card') || documentsSection || 'body',
        popover: {
          title: '📭 No Documents Yet',
          description: 'This collection doesn\'t have any documents yet. Documents are where you upload page images and extract text. You\'ll need to create documents and add pages to start transcribing content.',
          side: 'top',
          align: 'center'
        }
      });
    }

    // Add "Add New Document" button step
    if (addDocumentBtn) {
      steps.push({
        element: addDocumentBtn,
        popover: {
          title: '➕ Add New Document',
          description: 'Click this button to create a new document in this collection. After creating a document, you can add pages with images and extract text from them using OCR.',
          side: 'top',
          align: 'center'
        }
      });
    }

    // Final summary
    steps.push({
      element: 'body',
      popover: {
        title: '✅ Collection Management Complete!',
        description: 'You now understand how to manage collections:<br/>' +
          '• <strong>Edit:</strong> Update collection information<br/>' +
          '• <strong>Delete:</strong> Remove collections (with confirmation dialog)<br/>' +
          '• <strong>Series:</strong> Organize related documents into groups<br/>' +
          '• <strong>Documents:</strong> Create and manage document content<br/><br/>' +
          '<strong>Remember:</strong> Always be careful with delete actions - they permanently remove data and cannot be undone!',
        side: 'center',
        align: 'center'
      }
    });

    const driver = this.createDriver(steps);
    driver?.drive();
  }
}
