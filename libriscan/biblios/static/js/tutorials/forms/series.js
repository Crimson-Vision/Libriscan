/* Series Form Tutorial - For series create/edit forms */

import { TutorialBase } from '../base.js';

export class SeriesFormTutorials extends TutorialBase {
  // Event listeners are handled by the main tutorial.js loader

  startSeriesFormWalkthrough() {
    // Get form elements
    const formCard = document.getElementById('seriesFormCard');
    const formTitle = document.getElementById('seriesFormTitle');
    const nameField = document.getElementById('seriesNameField');
    const nameInput = document.getElementById('id_name');
    const slugField = document.getElementById('seriesSlugField');
    const slugInput = document.getElementById('id_slug');
    const cancelBtn = document.getElementById('seriesFormCancelBtn');
    const submitBtn = document.getElementById('seriesFormSubmitBtn');
    const isEditMode = formTitle?.textContent?.includes('Edit');

    const steps = [
      {
        element: formCard || 'body',
        popover: {
          title: isEditMode ? '✏️ Edit Series' : '📂 Create New Series',
          description: isEditMode
            ? 'This form allows you to edit an existing series. You can update the series name and slug.'
            : 'This form allows you to create a new series in your collection. Series help organize related documents together. Fill in the required fields to get started.',
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
        element: nameField || formCard || 'body',
        popover: {
          title: '📝 Series Name',
          description: 'Enter a descriptive name for your series. This is the display name that will appear in lists and navigation. Examples: "Local Deeds", "Correspondence", "Research Papers". The name can contain spaces and special characters.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: nameInput || nameField || formCard || 'body',
        popover: {
          title: '✍️ Auto-Generated Slug',
          description: 'As you type the series name, the slug field below is automatically generated. The slug is a URL-friendly version of the name (lowercase, with spaces converted to hyphens). You can manually edit the slug if needed, but it must follow the format: lowercase letters, numbers, and hyphens only.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: slugField || formCard || 'body',
        popover: {
          title: '🔗 Series Slug',
          description: 'The slug is a URL-friendly identifier for your series. <strong>Requirements:</strong><br/>' +
            '• Only lowercase letters, numbers, and hyphens<br/>' +
            '• No spaces or special characters<br/>' +
            '• Used in the series URL<br/><br/>' +
            'The slug is automatically generated from the series name, but you can edit it manually if you want a different URL format.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: slugInput || slugField || formCard || 'body',
        popover: {
          title: '⚠️ Slug Format',
          description: 'If you manually edit the slug, make sure it follows the required format. Invalid characters will be rejected. The slug must be unique within the collection.',
          side: 'bottom',
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
          title: isEditMode ? '💾 Update Series' : '✅ Create Series',
          description: isEditMode
            ? 'Click "Update Series" to save your changes. The series will be updated with the new name and slug.'
            : 'Click "Create Series" to create the new series. After creation, you\'ll be redirected to the collection page where you can see your new series and start adding documents to it.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: 'body',
        popover: {
          title: '✅ Series Form Complete!',
          description: 'You now understand how to create or edit series:<br/>' +
            '• <strong>Series Name:</strong> Display name (can contain spaces)<br/>' +
            '• <strong>Slug:</strong> URL-friendly identifier (auto-generated, can be edited)<br/>' +
            '• <strong>Cancel:</strong> Discard changes and return<br/>' +
            '• <strong>Submit:</strong> Save and create/edit series<br/><br/>' +
            'After creating a series, you can add documents to organize your collection!',
          side: 'center',
          align: 'center'
        }
      }
    ];

    const driver = this.createDriver(steps);
    driver?.drive();
  }
}
