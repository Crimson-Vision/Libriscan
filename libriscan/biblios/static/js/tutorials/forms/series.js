/* Series Form Tutorial - For series create/edit forms */

import { TutorialBase } from '../base.js';

export class SeriesFormTutorials extends TutorialBase {
  startSeriesFormWalkthrough() {
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
          title: isEditMode ? '✏️ Edit Series' : '📂 Create Series',
          description: isEditMode
            ? '<strong>Update an existing series:</strong> You can modify the series name and slug.'
            : '<strong>Create a series to organize related documents together.</strong> Fill in the fields below to get started.',
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
        element: nameField || formCard || 'body',
        popover: {
          title: '📝 Series Name',
          description: '<strong>Display name for your series:</strong><br/>• Can contain spaces and special characters<br/>• Examples: "Local Deeds", "Correspondence", "Research Papers"<br/>• This is what users will see in lists and navigation<br/>• The slug below is automatically generated from this name',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: nameInput || nameField || formCard || 'body',
        popover: {
          title: '✍️ Auto-generated Slug',
          description: '<strong>As you type the name:</strong><br/>• Slug field below is automatically updated<br/>• Name is converted to lowercase<br/>• Spaces become hyphens<br/>• You can manually edit the slug if needed',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: slugField || formCard || 'body',
        popover: {
          title: '🔗 Series Slug',
          description: '<strong>URL-friendly identifier (required):</strong><br/>• Lowercase letters, numbers, and hyphens only<br/>• No spaces or special characters<br/>• Used in the series URL<br/>• Must be unique within the collection<br/><br/>Auto-generated from name, but editable.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: slugInput || slugField || formCard || 'body',
        popover: {
          title: '⚠️ Slug Format',
          description: '<strong>If editing manually:</strong><br/>• Ensure format follows requirements<br/>• Invalid characters will be rejected<br/>• Slug must be unique within collection<br/><br/>The system will validate your input.',
          side: 'bottom',
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
          title: isEditMode ? '💾 Update Series' : '✅ Create Series',
          description: isEditMode
            ? '<strong>Save updates:</strong> The series will be updated with the new name and slug.'
            : '<strong>Create series:</strong> After creation, you\'ll be redirected to the collection page where you can see your new series and start adding documents to it.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: 'body',
        popover: {
          title: '✅ Series Form Complete!',
          description: '<strong>You now understand series creation/editing:</strong><br/>• <strong>Name:</strong> Display name (can contain spaces)<br/>• <strong>Slug:</strong> URL-friendly identifier (auto-generated, editable)<br/>• <strong>Cancel:</strong> Discard changes and return<br/>• <strong>Submit:</strong> Save and create/edit series<br/><br/><strong>Next steps:</strong> After creating, add documents to organize your collection!',
          side: 'center',
          align: 'center'
        }
      }
    ];

    const driver = this.createDriver(steps);
    driver?.drive();
  }
}
