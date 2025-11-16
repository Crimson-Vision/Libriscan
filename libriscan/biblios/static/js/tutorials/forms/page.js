/* Page Form Tutorial - For page upload/create forms */

import { TutorialBase } from '../base.js';

export class PageFormTutorials extends TutorialBase {
  // Event listeners are handled by the main tutorial.js loader

  startPageFormWalkthrough() {
    // Get form elements
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
          description: 'This form allows you to add a new page to your document. You\'ll upload a page image, and then extract text from it using OCR. Let\'s go through each field step by step.',
          side: 'center',
          align: 'center'
        }
      },
      {
        element: numberField || formCard || 'body',
        popover: {
          title: '🔢 Page Number',
          description: 'Enter the page number for this page. This number determines the order of pages in your document. Pages are typically numbered sequentially starting from 1, but you can use any numbering scheme that makes sense for your document.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: numberInput || numberField || formCard || 'body',
        popover: {
          title: '📝 Numbering Tips',
          description: 'The page number helps organize your document. You can use:<br/>' +
            '• Sequential numbers: 1, 2, 3...<br/>' +
            'The number appears in page navigation and helps you identify pages quickly.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: imageField || formCard || 'body',
        popover: {
          title: '🖼️ Page Image',
          description: '<strong>This is the most important field!</strong> Upload a JPG or PNG image file of the page you want to transcribe. <strong>Requirements:</strong><br/>' +
            '• File format: JPG or PNG only<br/>' +
            '• Maximum size: 5.0 MB (or as configured)<br/>' +
            '• Image should be clear and readable<br/><br/>' +
            'After uploading, you\'ll be able to extract text from this image using OCR.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: imageInput || imageField || formCard || 'body',
        popover: {
          title: '📁 File Selection',
          description: 'Click the "Choose File" button to select an image from your computer. Once you select a valid file, the upload button will be enabled. The system will automatically validate the file format and size.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: identifierField || formCard || 'body',
        popover: {
          title: '🏷️ Page Identifier',
          description: 'The page identifier is automatically generated from the filename when you upload an image. It\'s a unique name for the page (without spaces) that helps identify it. The identifier field is disabled until a valid image is selected.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: identifierInput || identifierField || formCard || 'body',
        popover: {
          title: '✏️ Editing Identifier',
          description: 'After selecting a valid image file, the identifier field becomes enabled. You can edit it if needed, but remember:<br/>' +
            '• No spaces allowed (spaces are automatically removed)<br/>' +
            '• Based on the uploaded filename by default<br/>' +
            '• Can be changed to any identifier you prefer<br/><br/>' +
            'The identifier appears in page lists and helps you identify pages at a glance.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: submitBtn || formCard || 'body',
        popover: {
          title: '⬆️ Upload Page',
          description: 'The upload button is disabled until you select a valid image file. Once enabled, click "Upload Page" to:<br/>' +
            '1. Upload the page image to the server<br/>' +
            '2. Create the page record in the document<br/>' +
            '3. Redirect you to the page view<br/><br/>' +
            'After uploading, you can extract text from the page using OCR.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: 'body',
        popover: {
          title: '✅ Upload Complete!',
          description: 'You now understand how to upload pages:<br/>' +
            '• <strong>Page Number:</strong> Sequential or custom numbering<br/>' +
            '• <strong>Image:</strong> JPG or PNG file (max 5.0 MB)<br/>' +
            '• <strong>Identifier:</strong> Auto-generated from filename (can be edited)<br/>' +
            '• <strong>Upload:</strong> Submit to add the page<br/><br/>' +
            '<strong>Next Steps:</strong> After uploading, you\'ll be taken to the page view where you can extract text and start editing!',
          side: 'center',
          align: 'center'
        }
      }
    ];

    const driver = this.createDriver(steps);
    driver?.drive();
  }
}
