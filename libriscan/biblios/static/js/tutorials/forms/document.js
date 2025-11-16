/* Document Form Tutorial - For document create/edit forms */

import { TutorialBase } from '../base.js';

export class DocumentFormTutorials extends TutorialBase {
  startDocumentFormWalkthrough() {
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
    
    const hasSeriesOptions = seriesSelect && seriesSelect.options.length > 1;

    const steps = [
      {
        element: formCard || 'body',
        popover: {
          title: isEditMode ? '✏️ Edit Document' : '📄 Create Document',
          description: isEditMode 
            ? '<strong>Update an existing document:</strong> You can modify the identifier, change the series assignment, and adjust long s detection settings.'
            : '<strong>Create a new document in your collection:</strong> Fill in the required fields below to get started.',
          side: 'center',
          align: 'center'
        }
      },
      {
        element: '#page-breadcrumb, #document-breadcrumb, #collection-breadcrumb, nav.breadcrumbs',
        popover: {
          title: '📍 Breadcrumb Navigation',
          description: '<strong>Navigate back:</strong><br/>• Click on any breadcrumb level to return to that page<br/>• Use breadcrumbs to move up the hierarchy without losing your place',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: identifierField || formCard || 'body',
        popover: {
          title: '🏷️ Document Identifier',
          description: '<strong>Unique URL-friendly name (required):</strong><br/>• Letters, numbers, and hyphens only<br/>• Maximum 25 characters<br/>• Spaces automatically convert to hyphens<br/>• Special characters are automatically removed<br/>• Appears in the document URL',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: identifierInput || identifierField || formCard || 'body',
        popover: {
          title: '✍️ Auto-formatting',
          description: '<strong>As you type:</strong><br/>• Identifier is automatically formatted<br/>• Invalid characters are removed<br/>• Spaces become hyphens<br/><br/>This ensures your document has a clean, accessible URL.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: seriesField || formCard || 'body',
        popover: {
          title: '📂 Series (Optional)',
          description: hasSeriesOptions
            ? '<strong>Assign document to a series:</strong><br/>• Select an existing series from the dropdown<br/>• Or leave as "-----" to keep the document at the collection level<br/><br/>Series help organize related documents together.'
            : '<strong>No series available yet.</strong> You can:<br/>• Create a series first, then assign documents to it<br/>• Or leave this field empty to add the document directly to the collection',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: longSField || formCard || 'body',
        popover: {
          title: '🔤 Long S Detection',
          description: '<strong>Historical character recognition:</strong><br/>• The long s (⟨ſ⟩) was used in older texts<br/>• When enabled, helps OCR recognize and convert ⟨ſ⟩ to modern "s"<br/>• <strong>Recommended for historical documents</strong><br/><br/>Improves text recognition accuracy for historical content.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: cancelBtn || formCard || 'body',
        popover: {
          title: '❌ Cancel',
          description: '<strong>Discard changes:</strong><br/>• Returns to the collection page<br/>• Any information entered will be lost<br/>• Use if you don\'t want to save changes',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: submitBtn || formCard || 'body',
        popover: {
          title: isEditMode ? '💾 Save Changes' : '✅ Submit',
          description: isEditMode
            ? '<strong>Save updates:</strong> The document will be updated with the new identifier, series assignment, and long s detection setting.'
            : '<strong>Create document:</strong> After creation, you\'ll be redirected to the document page where you can add pages and extract text.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: 'body',
        popover: {
          title: '✅ Form Complete!',
          description: '<strong>You now understand document creation/editing:</strong><br/>• <strong>Identifier:</strong> URL-friendly name (required)<br/>• <strong>Series:</strong> Optional grouping for organization<br/>• <strong>Long S Detection:</strong> Improves OCR for historical documents<br/>• <strong>Cancel:</strong> Discard changes and return<br/>• <strong>Submit:</strong> Save and create/edit document<br/><br/><strong>Next steps:</strong> After creating, add pages and start extracting text!',
          side: 'center',
          align: 'center'
        }
      }
    ];

    const driver = this.createDriver(steps);
    driver?.drive();
  }
}
