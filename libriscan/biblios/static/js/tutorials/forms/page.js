/* Page Form Tutorial - For page upload/create forms */

import { TutorialBase } from '../base.js';

export class PageFormTutorials extends TutorialBase {
  startPageFormWalkthrough() {
    const header = document.getElementById('pageUploadHeader');
    const formCard = document.getElementById('pageUploadCard');
    const numberField = document.getElementById('pageField_number');
    const numberInput = numberField?.querySelector('input[type="number"]');
    const imageField = document.getElementById('pageField_image');
    const imageInput = imageField?.querySelector('input[type="file"]');
    const identifierField = document.getElementById('pageField_identifier');
    const identifierInput = identifierField?.querySelector('input[type="text"]');
    const submitBtn = document.getElementById('submitBtn');

    const steps = [
      {
        element: header || formCard || 'body',
        popover: {
          title: '📤 Upload Page',
          description: '<strong>Add a new page to your document:</strong> Upload a page image, then extract text from it using OCR. Let\'s go through each field step by step.',
          side: 'center',
          align: 'center'
        }
      },
      {
        element: numberField || formCard || 'body',
        popover: {
          title: '🔢 Page Number',
          description: '<strong>Sequential position in the document:</strong><br/>• Typically numbered 1, 2, 3...<br/>• Determines the order of pages<br/>• Helps organize your document<br/>• Appears in page navigation',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: imageField || formCard || 'body',
        popover: {
          title: '🖼️ Page Image (Required)',
          description: '<strong>⚠️ This is the most important field!</strong><br/>• Upload a JPG or PNG image file<br/>• Maximum size: 5.0 MB (or as configured)<br/>• Image should be clear and readable<br/><br/>After uploading, you\'ll be able to extract text from this image using OCR.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: imageInput || imageField || formCard || 'body',
        popover: {
          title: '📁 File Selection',
          description: '<strong>Select your image:</strong><br/>• Click "Choose File" to select an image from your computer<br/>• Once selected, the system validates format and size automatically<br/>• Upload button becomes enabled when a valid file is selected',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: identifierField || formCard || 'body',
        popover: {
          title: '🏷️ Page Identifier',
          description: '<strong>Auto-generated from filename:</strong><br/>• Unique name for the page (no spaces)<br/>• Generated when image is selected<br/>• Helps identify the page in lists<br/><br/>The identifier field is disabled until a valid image is selected.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: identifierInput || identifierField || formCard || 'body',
        popover: {
          title: '✏️ Editing Identifier',
          description: '<strong>After selecting an image:</strong><br/>• Identifier field becomes editable<br/>• Based on the uploaded filename by default<br/>• Spaces are automatically removed<br/>• You can change it to any identifier you prefer<br/><br/>The identifier appears in page lists.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: submitBtn || formCard || 'body',
        popover: {
          title: '⬆️ Upload Page',
          description: '<strong>Button is disabled until valid image is selected.</strong> Once enabled, clicking "Upload Page" will:<br/>1. Upload the image to the server<br/>2. Create the page record in the document<br/>3. Redirect you to the page view<br/><br/>Then you can extract text from the page using OCR.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: 'body',
        popover: {
          title: '✅ Upload Complete!',
          description: '<strong>You now understand page uploads:</strong><br/>• <strong>Page Number:</strong> Sequential or custom numbering<br/>• <strong>Image:</strong> JPG or PNG file (max 5.0 MB)<br/>• <strong>Identifier:</strong> Auto-generated from filename (editable)<br/>• <strong>Upload:</strong> Submit to add the page<br/><br/><strong>Next steps:</strong> After uploading, you\'ll be taken to the page view where you can extract text and start editing!',
          side: 'center',
          align: 'center'
        }
      }
    ];

    const driver = this.createDriver(steps);
    driver?.drive();
  }
}
