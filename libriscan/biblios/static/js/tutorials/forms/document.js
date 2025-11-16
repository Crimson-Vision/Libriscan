/* Document Form Tutorial - For document create/edit forms */

import { TutorialBase } from '../base.js';

export class DocumentFormTutorials extends TutorialBase {
  // Event listeners are handled by the main tutorial.js loader

  startDocumentFormWalkthrough() {
    // Get form elements
    const formCard = document.getElementById('documentFormCard');
    const formTitle = document.getElementById('documentFormTitle');
    const identifierField = document.getElementById('documentIdentifierField');
    const identifierInput = identifierField?.querySelector('input[type="text"]');
    const seriesField = document.getElementById('documentSeriesField');
    const seriesSelect = document.getElementById(seriesField?.querySelector('select')?.id || '');
    const longSField = document.getElementById('documentLongSField');
    const longSCheckbox = longSField?.querySelector('input[type="checkbox"]');
    const cancelBtn = document.getElementById('documentFormCancelBtn');
    const submitBtn = document.getElementById('documentFormSubmitBtn');
    const isEditMode = formTitle?.textContent?.includes('Edit');
    
    // Check if series options exist (more than just the default "-----" option)
    const hasSeriesOptions = seriesSelect && seriesSelect.options.length > 1;

    const steps = [
      {
        element: formCard || 'body',
        popover: {
          title: isEditMode ? '✏️ Edit Document' : '📄 Create Document',
          description: isEditMode 
            ? 'This form allows you to edit an existing document. You can update the identifier, change the series assignment, and modify long s detection settings.'
            : 'This form allows you to create a new document in your collection. Fill in the required fields to get started.',
          side: 'center',
          align: 'center'
        }
      },
      {
        element: '#page-breadcrumb, #document-breadcrumb, #collection-breadcrumb, nav.breadcrumbs',
        popover: {
          title: '📍 Breadcrumb Navigation',
          description: 'Use the breadcrumbs at the top to navigate back to the Organization or Collection. Click on any level to return to that page.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: identifierField || formCard || 'body',
        popover: {
          title: '🏷️ Document Identifier',
          description: 'The identifier is a unique name for your document. <strong>Requirements:</strong><br/>' +
            '• Must be URL-friendly (letters, numbers, and hyphens only)<br/>' +
            '• Maximum 25 characters<br/>' +
            '• Spaces are automatically converted to hyphens<br/>' +
            '• Special characters are automatically removed<br/><br/>' +
            'The identifier appears in the document URL and helps identify the document in lists.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: identifierInput || identifierField || formCard || 'body',
        popover: {
          title: '✍️ Identifier Input',
          description: 'As you type, the identifier is automatically formatted to be URL-friendly. Invalid characters are removed, and spaces become hyphens. This ensures your document has a clean, accessible URL.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: seriesField || formCard || 'body',
        popover: {
          title: '📂 Series (Optional)',
          description: hasSeriesOptions
            ? 'The series dropdown allows you to assign this document to an existing series within the collection. Series help organize related documents together. Select a series from the dropdown, or leave it as "-----" to keep the document at the collection level.'
            : 'Series allow you to organize related documents together. Currently, there are no series in this collection. You can create a series first, then assign documents to it, or leave this field empty to add the document directly to the collection.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: longSField || formCard || 'body',
        popover: {
          title: '🔤 Long S Detection',
          description: 'The long s (⟨ſ⟩) was a historical letterform used in older texts. When enabled, this feature helps OCR recognize and convert the long s character to a modern "s" during text extraction. <strong>Recommended:</strong> Keep this enabled for historical documents, as it improves text recognition accuracy.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: cancelBtn || formCard || 'body',
        popover: {
          title: '❌ Cancel',
          description: 'Click Cancel to discard your changes and return to the collection page without saving. Any information you\'ve entered will be lost.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: submitBtn || formCard || 'body',
        popover: {
          title: isEditMode ? '💾 Save Changes' : '✅ Submit',
          description: isEditMode
            ? 'Click Submit to save your changes to the document. The document will be updated with the new identifier, series assignment, and long s detection setting.'
            : 'Click Submit to create the new document. After creation, you\'ll be redirected to the document page where you can add pages and extract text.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: 'body',
        popover: {
          title: '✅ Form Complete!',
          description: 'You now understand how to create or edit documents:<br/>' +
            '• <strong>Identifier:</strong> URL-friendly name (required)<br/>' +
            '• <strong>Series:</strong> Optional organization grouping<br/>' +
            '• <strong>Long S Detection:</strong> Improves OCR for historical documents<br/>' +
            '• <strong>Cancel:</strong> Discard changes and return<br/>' +
            '• <strong>Submit:</strong> Save and create/edit document<br/><br/>' +
            'After creating a document, you can add pages and start extracting text!',
          side: 'center',
          align: 'center'
        }
      }
    ];

    const driver = this.createDriver(steps);
    driver?.drive();
  }
}
