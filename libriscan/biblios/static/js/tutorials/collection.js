/* Collection View Tutorial - For collection detail page */

import { TutorialBase } from './base.js';

export class CollectionTutorials extends TutorialBase {
  startCollectionWalkthrough() {
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
          description: 'This is where you manage your collection, organize series and documents, and control access. Let\'s explore the key features.',
          side: 'center',
          align: 'center'
        }
      },
      {
        element: '#collection-breadcrumb',
        popover: {
          title: '📍 Breadcrumb Navigation',
          description: '<strong>Navigate back to previous levels:</strong><br/>• Click on Organization to return to the organization page<br/>• Use breadcrumbs to move up the hierarchy',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#collection-title',
        popover: {
          title: '📁 Collection Header',
          description: '<strong>Collection management controls:</strong><br/>• View the collection name<br/>• Click edit icon to update collection information<br/>• Click delete button to remove the collection<br/><br/>The header shows key information at a glance.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: editBtn || '#collection-title',
        popover: {
          title: '✏️ Edit Collection',
          description: '<strong>Click the edit icon to:</strong><br/>• Update collection name<br/>• Modify collection properties<br/>• Change collection settings<br/><br/>Changes won\'t affect existing series or documents.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: deleteBtn || '#collection-title',
        popover: {
          title: '🗑️ Delete Collection',
          description: '<strong>⚠️ Warning:</strong> This permanently removes the entire collection.<br/>• <strong>Including all series and documents within it</strong><br/>• <strong>Cannot be undone</strong><br/>• <strong>Will result in permanent data loss</strong><br/><br/>A confirmation dialog will appear to prevent accidental deletions.',
          side: 'left',
          align: 'start'
        }
      },
      {
        element: seriesSection || 'body',
        popover: {
          title: '📂 Series Section',
          description: '<strong>Series are groups of related documents.</strong> They help organize documents into logical categories. Use series when you have:<br/>• Multiple documents that belong together thematically<br/>• Documents organized chronologically<br/>• Related content that should be grouped',
          side: 'top',
          align: 'start'
        }
      }
    ];

    if (hasSeries) {
      const firstSeries = seriesList?.querySelector('.card');
      if (firstSeries) {
        steps.push({
          element: firstSeries,
          popover: {
            title: '📂 Series Card',
            description: '<strong>Each series card shows:</strong><br/>• Series name<br/>• Link to view and manage documents within it<br/><br/><strong>Click on a series</strong> to view its documents. <strong>Delete icon</strong> removes the series (and all documents within it).',
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
          description: '<strong>Series are optional.</strong> You can:<br/>• Organize documents directly in the collection<br/>• Or create series to group related documents together<br/><br/>Series help when you have many documents to organize.',
          side: 'top',
          align: 'center'
        }
      });
    }

    if (addSeriesBtn) {
      steps.push({
        element: addSeriesBtn,
        popover: {
          title: '➕ Add New Series',
          description: '<strong>Click to create a new series:</strong><br/>• Groups related documents together<br/>• Examples: "Local Deeds", "Correspondence", "Research Papers"<br/>• Helps organize your collection<br/><br/>After creating, you can add documents to the series.',
          side: 'top',
          align: 'center'
        }
      });
    }

    steps.push({
      element: documentsSection || 'body',
      popover: {
        title: '📄 Documents Section',
        description: '<strong>Documents are the core content of your collection.</strong><br/>• Each document contains multiple pages with images and extracted text<br/>• Documents can exist directly in the collection<br/>• Or be organized within series<br/><br/>This section shows all documents that are not part of any series.',
        side: 'top',
        align: 'start'
      }
    });

    if (hasDocuments) {
      const firstDocument = documentsList?.querySelector('.card');
      if (firstDocument) {
        steps.push({
          element: firstDocument,
          popover: {
            title: '📄 Document Card',
            description: '<strong>Each document card displays:</strong><br/>• Document identifier<br/>• Status badge<br/><br/><strong>Click on a document</strong> to view and edit its pages. <strong>Delete icon</strong> permanently removes the document and all its pages and extracted text.',
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
          description: '<strong>To get started:</strong><br/>• Click "Add New Document" button<br/>• Create documents<br/>• Add pages with images<br/>• Extract text using OCR<br/>• Start transcribing content',
          side: 'top',
          align: 'center'
        }
      });
    }

    if (addDocumentBtn) {
      steps.push({
        element: addDocumentBtn,
        popover: {
          title: '➕ Add New Document',
          description: '<strong>Click to create a new document:</strong><br/>• After creating, you can add pages<br/>• Upload page images<br/>• Extract text using OCR<br/>• Start editing extracted words',
          side: 'top',
          align: 'center'
        }
      });
    }

    steps.push({
      element: 'body',
      popover: {
        title: '✅ Collection Management Complete!',
        description: '<strong>You now understand collection management:</strong><br/>• <strong>Edit:</strong> Update collection information<br/>• <strong>Delete:</strong> Remove collections (with confirmation dialog)<br/>• <strong>Series:</strong> Organize related documents into groups<br/>• <strong>Documents:</strong> Create and manage document content<br/><br/><strong>⚠️ Remember:</strong> Delete actions permanently remove data and cannot be undone!',
        side: 'center',
        align: 'center'
      }
    });

    const driver = this.createDriver(steps);
    driver?.drive();
  }
}
