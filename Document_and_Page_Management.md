## Working with Documents

Documents are the individual digitized items in your library. Each document contains one or more pages with scanned images and extracted text. Documents can be organized within a Series or exist independently as orphaned documents within a collection.

### Understanding Document Status

Documents and their pages can have various status indicators:

- **New** (Green badge): Document or page has been newly created and not yet processed
- **In Progress** (Blue badge): Document or page is currently being worked on or transcribed
- **Ready for Review** (Orange badge): Document or page has been transcribed and is awaiting review
- **Approved**: Available for pages - Page has been reviewed and approved
- **Transcribed** (Green badge): Text has been successfully extracted from the page

### Creating Documents

#### Creating Documents Within a Series

To create a document within a Series:

1. Navigate to the Series page where you want to add the document
2. Click the "Add New Document" button (displayed in pink/magenta)
3. Enter a unique Identifier for the document (letters, numbers, and hyphens only)
4. The Series dropdown will be pre-selected with the current Series
5. If working with historical texts, check "Use long s (ſ) detection" to properly recognize the historical long s character
6. Click "Submit" to create the document
7. The document will be created with "New" status and appear in the Series document list

**NOTE:** The identifier you choose will be used in URLs and file exports, so choose something meaningful and consistent with your naming conventions.

#### Creating Orphaned Documents

Orphaned documents are documents that exist within a collection but are not assigned to any Series. This is useful for standalone items that don't fit into a Series structure.

To create an orphaned document:

1. Navigate to the collection page (not a Series page)
2. Click the "Add New Document" button in the "Documents in this collection" section
3. Enter a unique Identifier for the document (letters, numbers, and hyphens only)
4. In the Series dropdown, select "-----" (the empty option at the top)
5. Configure additional settings such as long s detection if needed
6. Click "Submit" to create the orphaned document
7. The document will appear in the "Documents in this collection" section on the collection page

### Viewing Documents

Documents can be viewed in multiple locations depending on their organization:

#### Viewing Documents in a Series

1. Navigate to the Series page
2. All documents belonging to that Series will be listed in the "Documents in this series" section
3. Each document displays its identifier, status badge, and creation/modification dates
4. Click on any document identifier to view its details and pages

#### Viewing Orphaned Documents

1. Navigate to the collection page
2. Orphaned documents are shown in the "Documents in this collection" section
3. These documents are not part of any Series
4. Click on any document identifier to view its details and pages

#### Viewing Document Details and Pages


When you open a document, you will see:

- Document identifier and edit controls at the top
- A "Pages in this document" section listing all pages
- For each page: page number, status badge, extracted text preview, and creation/modification dates
- Options to add new pages, delete pages, or change page status
- Export options at the bottom of the page


### Editing Documents

To edit document properties:

1. Navigate to the document page
2. Click the edit icon (pencil) next to the document identifier
3. Modify the identifier or Series assignment as needed
4. To move a document to a different Series, select the new Series from the dropdown
5. To make a document orphaned, select "-----" in the Series dropdown
6. Click "Save" to apply your changes

**NOTE:** Changing a document's Series assignment or orphaned status does not affect the pages or extracted text. All page data remains intact during the move.

### Deleting Documents

**WARNING:** This action cannot be undone. All document content, pages, extracted text, and associated data will be permanently deleted.

To delete a document:

1. Navigate to the Series or collection page containing the document
2. Click the trash icon next to the document identifier
3. A confirmation dialog will appear titled "Confirm Delete Document"
4. The dialog will display a warning: "This action cannot be undone"
5. Type "Delete" in the confirmation field exactly as shown
6. Click "Delete Document" to permanently remove the document
7. All pages and extracted text associated with this document will also be deleted

### Exporting Documents

LibriScan provides multiple export formats to suit different use cases. Export options are available at the bottom of each document page under the "Export Document" section.

#### Export Format Options

**PDF with Images**
- Creates a complete PDF document with embedded page images
- Preserves the visual appearance of the original scanned pages
- Ideal for archival purposes or when image quality is important
- *Use case: Archival copies, presentations, or when visual fidelity is required*

**Text-only PDF**
- Generates a PDF containing only the extracted text from each page
- More compact than the image PDF and is searchable
- Suitable for text analysis or when file size is a concern
- *Use case: Text analysis, reduced file size, accessibility, full-text search*

**Plain Text**
- Exports the extracted text as a simple text file (.txt) with minimal formatting
- Most portable format, can be opened in any text editor
- Can be imported into other applications
- *Use case: Data processing, importing into other systems, plain text analysis*

#### How to Export a Document

1. Navigate to the document page you want to export
2. Scroll to the bottom of the page to find the "Export Document" section
3. Choose your preferred export format by clicking on one of the three options
4. The export will be generated and downloaded to your computer
5. The filename will include the document identifier for easy identification

**NOTE:** Export availability depends on the document having transcribed pages. If no pages have been transcribed, some export options may be limited or unavailable.

---

## Working with Pages

Pages are the individual scanned images within a document. Each page contains an image of the original material and can have extracted text associated with it. LibriScan supports automatic text extraction and manual transcription workflows.
 
### Understanding Page Status

Pages progress through different status levels as they are processed. You can update page status using the "New" button dropdown on each document page.

- **New**: Initial status when a page is first uploaded - indicates no processing has been done
- **In Progress**: Page is currently being transcribed or worked on - useful for tracking active work
- **Ready for Review**: Page transcription is complete and awaiting quality review
- **Approved**: Page has been reviewed and approved - indicates finalized content
- **Transcribed**: Text has been automatically extracted and is available (shown as green badge)

**NOTE:** The "Transcribed" status appears automatically when text extraction is successful. Other status values can be manually set to track your workflow progress.

### Creating and Uploading Pages

#### Image Requirements

Before uploading pages, ensure your images meet these requirements:

- **File Format**: JPG (JPEG) or PNG only - other formats are not supported
- **Maximum File Size**: 5.0 MB per image - larger files will be rejected
- **Image Quality**: Higher resolution (300 DPI or more) provides better text extraction results
- **File Naming**: Use consistent, descriptive names to help with organization
- **Color Mode**: Color, grayscale, or black and white images are all supported

**WARNING:** Images exceeding 5.0 MB must be compressed or resized before upload. The system will reject larger files.

#### Uploading a New Page

To upload a new page:

1. Navigate to the document where you want to add a page
2. Scroll to the bottom of the page list
3. Click the "Add New Page" button (displayed in pink/magenta)
4. In the "Upload Page" dialog, enter the page Number
5. Click the "Choose File" button in the Image section
6. Select a JPG or PNG image file from your computer (maximum 5.0 MB)
7. Verify the filename appears next to the "Choose File" button
8. Click the "Upload Page" button to process and add the page
9. The page will be added to the document and appear in the page list
10. Text extraction will begin automatically if the image quality is sufficient

**NOTE:** Page numbers help maintain document order but don't need to be sequential. You can use page numbers like 1, 2, 3 or match the original document's pagination such as "iv" for roman numerals or "12" for page 12.

### Viewing Pages

To view pages within a document:

1. Navigate to the document page
2. All pages are listed in the "Pages in this document" section
3. Each page entry shows:
 - Page number
 - Status badge (New, Transcribed, In Progress, etc.)
 - Preview of extracted text (first few lines)
 - Creation date and time
 - Last modification date and time
 - Expand/collapse arrows to show or hide detailed information
4. Click the expand arrow (>) next to a page number to see full extracted text
5. Click the collapse arrow (v) to hide the expanded view

### Updating Page Status

You can manually update page status to track your transcription and review workflow.

1. Navigate to the document containing the page
2. Locate the page you want to update in the "Pages in this document" section
3. Click the "New" button dropdown next to the page (the button text will match current status)
4. Select the new status from the dropdown menu:
 - In Progress - when you begin working on the page
 - Ready for Review - when transcription is complete and needs review
 - Approved - when the page has been reviewed and finalized
5. The page status will update immediately
6. The new status badge will be displayed next to the page number

**NOTE:** Status updates are tracked with timestamps in the "Last Modified" field, allowing you to monitor workflow progress.

### Text Extraction and Transcription

LibriScan automatically attempts to extract text from uploaded page images using Optical Character Recognition (OCR) technology.

#### How Text Extraction Works

1. When you upload a page image, the system queues it for text extraction
2. OCR processing analyzes the image and attempts to recognize text
3. If successful, extracted text is saved and the page receives a "Transcribed" status badge
4. The extracted text appears as a preview in the page list
5. You can expand the page to view the complete extracted text
6. If extraction fails or produces poor results, the page may remain with "New" status

#### Factors Affecting Text Extraction Quality

Text extraction quality depends on several factors:

- **Image Resolution**: Higher resolution (300 DPI or more) produces better results
- **Image Quality**: Clear, well-lit scans with good contrast extract more accurately
- **Font Type**: Printed text extracts better than handwriting; standard fonts work better than decorative fonts
- **Document Condition**: Clean pages without stains, tears, or fading produce better results
- **Language and Characters**: Standard English text extracts most reliably; historical or specialized characters may need manual review
- **Long s Detection**: Enable "Use long s (ſ) detection" when creating documents with historical texts to improve accuracy

#### Reviewing and Correcting Extracted Text

To review and verify extracted text:

1. Navigate to the document page
2. Click the expand arrow next to any transcribed page
3. Review the extracted text for accuracy
4. Compare the extracted text with the original image if available
5. Update the page status to "Ready for Review" when initial review is complete
6. Update the page status to "Approved" after final verification

**NOTE:** Currently, text editing must be done outside of LibriScan. Export the document in your preferred format, make corrections in a text editor or word processor, then re-import if needed.

### Deleting Pages

**WARNING:** This action cannot be undone. All page content, extracted text, and associated data will be permanently deleted.

To delete a page:

1. Navigate to the document containing the page
2. Locate the page you want to delete in the "Pages in this document" section
3. Click the trash icon next to the page number
4. A confirmation dialog will appear titled "Confirm Delete Page"
5. The dialog will show: "Are you sure you want to delete page [X]?"
6. The dialog warns: "This action cannot be undone"
7. Review the warning message about permanent deletion of page content and extracted text
8. Click "Delete Page" to permanently remove the page
9. The page will be immediately removed from the document

**NOTE:** Deleting a page does not affect other pages in the document or renumber remaining pages. Page numbers remain as originally assigned.

---

## Best Practices and Tips

### Organizing Your Content

- Use Collections to group materials by broad categories 
- Create Series within Collections for more specific groupings
- Use consistent naming conventions for identifiers to make documents easier to find and sort
- Consider leaving some documents orphaned if they don't fit naturally into any Series
- Use descriptive slugs that will make sense in URLs and exports

### Optimizing Image Quality

- Scan at 300 DPI or higher for best text extraction results
- Ensure good lighting and contrast when photographing or scanning documents
- Crop images to remove borders and unnecessary background before upload
- Compress large images to stay under the 5.0 MB limit while maintaining readability
- Save images in JPG format for photographs and PNG for line art or diagrams
- Keep original high-resolution backups before compressing for upload

### Managing Workflow

- Use page status indicators to track progress through your transcription workflow
- Set pages to "In Progress" when you begin work to avoid duplication of effort
- Mark pages "Ready for Review" when initial transcription is complete
- Reserve "Approved" status for pages that have passed final quality review
- Export documents regularly to create backups of your transcribed content
- Use the Text-only PDF format for full-text searching across multiple documents

### Text Extraction Tips

- Enable "Use long s (ſ) detection" for historical documents to improve accuracy
- Review automatically extracted text carefully, especially for historical or specialized materials
- Poor extraction quality usually indicates a need for better source images
- Consider rescanning pages that fail to extract text or produce poor results
- Remember that handwritten text may not extract reliably and may require manual transcription
- Use consistent page numbering to maintain document structure in exports

---


