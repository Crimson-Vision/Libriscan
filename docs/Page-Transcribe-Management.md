# Page Text Management User Guide

A comprehensive guide to editing and managing extracted text in Libriscan's page view interface.

## Table of Contents

1. [Overview](#overview)
2. [Page Layout](#page-layout)
3. [Image Viewer](#image-viewer)
4. [Page Navigation](#page-navigation)
5. [Text Extraction](#text-extraction)
6. [Raw Text Display](#raw-text-display)
7. [Confidence Indicators](#confidence-indicators)
8. [Filter Dropdown](#filter-dropdown)
9. [Word Selection & Editing](#word-selection--editing)
10. [Word Details Panel](#word-details-panel)
11. [Word Visibility Control](#word-visibility-control)
12. [Suggestions System](#suggestions-system)
13. [Review Flagging](#review-flagging)
14. [Audit History](#audit-history)
15. [Revert to Original](#revert-to-original)
16. [Keyboard Shortcuts](#keyboard-shortcuts)
17. [Complete User Workflow](#complete-user-workflow)
18. [Formatted Text View](#formatted-text-view)

---

## Overview

The Page View is where you interact with document pages, view scanned images, and edit extracted text. This interface is split into two main sections:

- **Left Panel**: High-resolution image viewer with page navigation
- **Right Panel**: Extracted text display with word editing capabilities

This guide covers all features available in the page editing interface.

---

## Page Layout

### Two-Panel Layout

- **Left Panel**: Contains the scanned page image in a high-resolution viewer
- **Right Panel**: Contains the extracted text with tabs for "Raw Text" and "Formatted" views

### Breadcrumb Navigation

At the top of the page, you'll see a breadcrumb trail showing your current location:
```
Organization > Collection > [Series] > Document > Page X
```

Click any level in the breadcrumb to navigate back to that section.

---

## Image Viewer

The left panel features an **OpenSeadragon** high-resolution image viewer for zooming, panning, and inspecting document pages.

### Viewer Controls

Located in the top-left corner of the image viewer:

- **Zoom In** (+): Magnify the image
- **Zoom Out** (-): Reduce magnification
- **Home**: Reset to default view
- **Full Page**: Fit entire page to viewer
- **Rotation Controls**: Rotate the image if needed
- **Flip Controls**: Flip the image horizontally/vertically

### Navigation Controls

- **Navigator Thumbnail**: Small overview in the bottom-right corner showing your current view position
- **Double-click**: Zoom in at the clicked location
- **Mouse Scroll**: Zoom in/out
- **Click and Drag**: Pan around the image
- **Touch Gestures**: On touch devices, pinch to zoom and drag to pan

### Keyboard Navigation in Viewer

When focused on the viewer:
- Arrow keys move the view
- Plus (+) and Minus (-) keys zoom in/out
- Home key resets to default view

---

## Page Navigation

Navigate between pages using the navigation controls above the image viewer.

### Navigation Methods

1. **Previous Button** (← Previous): Go to the previous page
2. **Page Dropdown**: Click the current page number to open a dropdown menu
   - Select any page number to jump directly to it
   - Current page is highlighted with a checkmark
3. **Next Button** (Next →): Go to the next page

### Navigation States

- Buttons are **disabled** when:
  - Previous: You're on the first page
  - Next: You're on the last page
- The page dropdown shows all available pages in the document

---

## Text Extraction

If text hasn't been extracted yet, you'll see a prompt in the right panel.

### Extract Button

1. **Locate the "Extract" button** in the right panel
2. **Click "Extract"** to start OCR (Optical Character Recognition)
3. The button will be disabled during extraction
4. You'll see a loading indicator while processing
5. Once complete, extracted words will appear in the Raw Text tab

### When Extraction is Unavailable

If the Extract button is disabled:
- The page may already have text blocks
- A cloud service may not be configured for your organization
- Contact your administrator if you need extraction enabled

---

## Raw Text Display

The **Raw Text** tab shows all extracted words as individual clickable buttons, organized by line.

### Word Display Features

- **Word Buttons**: Each word is a clickable button
- **Line Numbers**: Displayed as badges at the start of each line
- **Line Dividers**: Horizontal dividers separate each line of text
- **Confidence Indicators**: Color-coded based on OCR confidence

### Clicking Words

**Click any word** to:
- Open the Word Details Panel below
- Enable keyboard navigation
- View word-specific information and editing options

### Word Colors

Words are color-coded by confidence level:

- **Green**: High confidence (likely correct)
- **Yellow**: Medium confidence (may need review)
- **Red**: Low confidence (likely needs correction)
- **Dashed border**: Accepted words (confidence set to 100%)
- **Red background**: Words flagged for review

---

## Confidence Indicators

Each word displays a color indicator based on its OCR confidence score.

### Confidence Levels

1. **High Confidence** (🟢 Green)
   - Confidence: 80-100%
   - Usually accurate, may still need verification

2. **Medium Confidence** (🟡 Yellow)
   - Confidence: 50-79%
   - Should be reviewed and corrected if needed

3. **Low Confidence** (🔴 Red)
   - Confidence: Below 50%
   - Likely incorrect, requires correction

4. **Accepted** (Dashed border)
   - Manually verified and accepted
   - Confidence set to 100%

### Visual Indicators

- Words with **red background** are flagged for review
- Words with **dashed borders** have been accepted
- Colors help you quickly identify which words need attention

---

## Filter Dropdown

The **Filter dropdown** (top-right of the Raw Text tab) lets you toggle visibility of different word types.

### Filter Options

#### Confidence Levels
- **High**: Show/hide high-confidence words (green)
- **Medium**: Show/hide medium-confidence words (yellow)
- **Low**: Show/hide low-confidence words (red)
- **Accepted**: Show/hide accepted words (dashed border)

#### Word Visibility Controls
- **Omit**: Show/hide words marked to be omitted from output
- **Merge with Prior**: Show/hide words marked to merge with previous word

#### Review Flags
- **Raise for Review**: Show/hide words flagged for review (red background)

#### Layout Elements
- **Line Numbers & Dividers**: Toggle visibility of line numbers and dividers

### Using the Filter

1. Click the **Filter** button (top-right of Raw Text tab)
2. Check/uncheck items to toggle their visibility
3. Uncheck "Select/Deselect All" to hide all items, then check only what you need
4. Use filters to focus on specific word types that need attention

**Pro Tip**: Hide high-confidence words to focus on words that need correction!

---

## Word Selection & Editing

### Selecting a Word

1. **Click any word** in the Raw Text display
2. The **Word Details Panel** opens below the text display
3. The selected word is highlighted
4. Keyboard navigation is now enabled

### Editing a Word

#### Method 1: Double-Click
1. **Double-click** the word in the Word Details Panel
2. The word becomes an editable text input
3. Type your correction
4. Press **Enter** to save or **Esc** to cancel

#### Method 2: Edit Button
1. Click the **Edit** button (pencil icon) next to the word
2. Or press **E** on your keyboard
3. The word becomes editable
4. Make your changes and press **Enter** to save

### Saving Changes

- **Enter**: Save changes and automatically advance to the next word
- **Esc**: Cancel editing and revert to original value
- **Click Save button**: Save changes without auto-advancing

### Word Navigation

Once a word is selected, navigate between words:

- **Previous Word**: Click "Previous" button or press **←** (Left Arrow)
- **Next Word**: Click "Next" button or press **→** (Right Arrow)
- **Position Indicator**: Shows "X of Y" (current word position)

---

## Word Details Panel

The Word Details Panel appears below the Raw Text display when you click a word. It contains two tabs:

### Word Details Tab

Shows information and editing controls for the selected word.

#### Word Display
- Large display of the current word text
- Click Edit or double-click to modify
- Shows word position (e.g., "384 of 384")

#### Navigation Controls
- **Previous** button with **←** indicator
- **Next** button with **→** indicator
- Word position counter

#### Word Visibility Control
Dropdown to control how the word appears in exports:
- **Include (I)**: Normal output, word appears as-is
- **Merge (M)**: Merge this word with the previous word (no space between)
- **Omit (O)**: Exclude this word from output completely

#### Confidence Level
- Displays current OCR confidence percentage
- **Accept Button**: Sets confidence to 100% (appears when confidence < 100%)
- Accepting automatically advances to the next word

#### Suggestions
- Shows alternative word suggestions based on context
- **Click a suggestion** to apply it
- Or press **1-9** keys to quickly apply the first nine suggestions
- Applying a suggestion auto-advances to the next word

#### Review Flag
- Flag icon button to mark words for review
- Flagged words have red background in the text display
- Toggle flag by clicking the button or pressing **F**

#### Actions Dropdown
- Three-dot menu (top-right of panel)
- **Revert to Original**: Restore word to original OCR value (if edited)

### Audit History Tab

Shows complete edit history for the word:

- **Current Text**: What the word says now
- **Word ID**: Unique identifier
- **Change Count**: Number of times the word was edited
- **Timezone**: Your timezone for timestamps

#### History Timeline

Each change in the timeline shows:

- **Emoji Indicators**:
  - ✨ Created - Original OCR extraction
  - 📝 Changed - Text was modified
  - ↩️ Revert - Word was reverted to original
  - 🔰 First Change - First edit made

- **Change Details**:
  - Field that changed (Text, Confidence, Type, Visibility Control)
  - Old value → New value
  - User who made the change
  - Timestamp of the change

- **Original Value**: Always shown at the bottom of the timeline

**Use Audit History to**:
- Track word evolution over time
- See who made what changes
- Understand edit context
- Verify edit accuracy

---

## Word Visibility Control

Control how words appear in exported documents.

### Visibility Options

#### Include (I) - Default
- Word appears normally in output
- Space before and after as normal

#### Merge with Prior (M)
- Merges this word with the previous word
- No space between the merged words
- Useful for correcting word boundaries or joining split words

#### Omit (O)
- Word is excluded from output completely
- Useful for removing artifacts, errors, or unwanted text

### Setting Visibility Control

1. Select a word to open Word Details Panel
2. Click the **Word Visibility Control** dropdown
3. Select desired option:
   - Include (normal)
   - Merge with Prior
   - Omit
4. Change takes effect immediately for exports

---

## Suggestions System

The system provides alternative word suggestions based on OCR analysis and context.

### Viewing Suggestions

1. Select a word to open Word Details Panel
2. Suggestions appear in the **Suggestions** section
3. Each suggestion shows:
   - Suggested word text
   - Badge indicating suggestion number (1, 2, 3...)

### Applying Suggestions

#### Method 1: Click
- **Click any suggestion** to apply it
- Automatically advances to next word

#### Method 2: Keyboard (Fastest)
- Press **1-9** keys to apply the first nine suggestions
- **1** = First suggestion
- **2** = Second suggestion
- And so on...
- Automatically advances to next word

### When Suggestions Don't Appear

If no suggestions are shown:
- The word may not have good alternatives
- The OCR confidence is already very high
- Context may be insufficient for suggestions

---

## Review Flagging

Flag words for later review when you want to mark them but don't have time to fix them immediately.

### Flagging a Word

1. Select a word to open Word Details Panel
2. Click the **flag icon** button (top-right, orange icon)
3. Or press **F** on your keyboard
4. Word background turns **red** in the Raw Text display
5. Flag icon appears next to the word

### Unflagging a Word

- Click the flag button again (or press **F** again)
- Red background and flag icon are removed

### Finding Flagged Words

- **Visual**: Flagged words have red backgrounds in Raw Text display
- **Filter**: Use Filter dropdown → "Raise for Review" to show only flagged words
- Navigate through flagged words to review them systematically

### Use Cases

- Mark words that need supervisor review
- Flag ambiguous words for later decision
- Identify words requiring additional research
- Track words needing second-pass review

---

## Audit History

Every word tracks its complete edit history, showing all changes made over time.

### Accessing Audit History

1. Select a word to open Word Details Panel
2. Click the **Audit History** tab
3. View the complete timeline of changes

### History Information

- **Word ID**: Unique identifier for this word
- **Current Text**: What the word says now
- **Change Count**: Total number of edits
- **Timezone**: Your timezone for accurate timestamps

### Timeline Display

Each entry shows:

- **Icon**: Indicates change type (Created, Changed, Reverted, etc.)
- **Field**: What changed (Text, Confidence, Type, Visibility Control)
- **Old Value → New Value**: Shows the change
- **User**: Who made the change
- **Timestamp**: When the change was made

### Understanding Changes

- **Text Changes**: Old word → New word
- **Confidence Changes**: Old percentage → New percentage
- **Type Changes**: Word classification changes
- **Visibility Changes**: Include/Merge/Omit changes

### Original Value

The original OCR-extracted value is always shown at the bottom of the timeline, marked with a finish flag (🏁).

**Use Audit History to**:
- Verify edit accuracy
- Track word evolution
- Understand edit context
- Review work history
- Identify patterns in corrections

---

## Revert to Original

Restore a word to its original OCR-extracted value, undoing all edits.

### When Available

- **Revert to Original** appears in the Actions dropdown (three-dot menu)
- Only available if the word has been edited
- Disabled if word hasn't been changed

### Using Revert

1. Select an edited word
2. Click the **Actions dropdown** (three-dot menu, top-right)
3. Click **"Revert to Original"**
4. Confirmation dialog appears:
   - **Warning**: This action cannot be undone
   - **Message**: All current changes will be permanently lost
5. Click **"Revert to Original"** to confirm
6. Word returns to original OCR value

### What Gets Reverted

- Word text returns to original OCR extraction
- Confidence level returns to original OCR value
- All manual edits are removed
- Visibility control returns to default (Include)

**Note**: This action is permanent and cannot be undone. The revert action itself is recorded in audit history.

---

## Keyboard Shortcuts

Keyboard shortcuts speed up your editing workflow significantly.

### Prerequisites

**Important**: You must first **click on a word** to activate keyboard navigation and enable shortcuts.

### Navigation Shortcuts

| Key | Action |
|-----|--------|
| **←** (Left Arrow) | Move to previous word |
| **→** (Right Arrow) | Move to next word |

### Editing Shortcuts

| Key | Action |
|-----|--------|
| **E** | Enter edit mode for current word |
| **Enter** | Save changes and advance to next word |
| **Esc** | Cancel editing and revert to original |

### Quick Actions

| Key | Action |
|-----|--------|
| **A** | Accept word (set confidence to 100%) and advance to next |
| **1-9** | Apply suggestion 1-9 and advance to next word |
| **F** | Toggle review flag |

### Shortcut Workflow Tips

**Fast Editing Workflow**:
1. Click first word to activate
2. Press **→** to navigate forward
3. Press **E** to edit when needed
4. Press **Enter** to save and auto-advance
5. Press **A** to accept high-confidence words quickly
6. Press **1-9** to apply suggestions rapidly

**Focus on Low-Confidence Words**:
1. Use Filter dropdown to hide high-confidence words
2. Navigate through visible words with **→**
3. Press **1-9** to apply suggestions
4. Press **F** to flag ambiguous words for later
5. Press **A** to accept corrected words

---

## Complete User Workflow

Here's a typical workflow from page upload to finished editing:

### Step 1: Upload Page

1. Go to Document page
2. Click **"Add New Page"**
3. Upload page image (JPG or PNG)
4. Set page number and identifier
5. Click **"Upload Page"**

### Step 2: Extract Text

1. You're redirected to the Page View
2. Right panel shows **"No Text Extracted Yet"**
3. Click the **"Extract"** button
4. Wait for OCR processing to complete
5. Extracted words appear in Raw Text tab

### Step 3: Review Extracted Text

1. **Scroll through** the Raw Text display
2. Notice **color indicators**:
   - Green = High confidence
   - Yellow = Medium confidence
   - Red = Low confidence
3. **Use Filter dropdown** to focus on words needing attention:
   - Uncheck "High" to hide confident words
   - Check only "Low" and "Medium" to focus on problem words

### Step 4: Select and Edit Words

1. **Click a word** to open Word Details Panel
2. Review:
   - Current word text
   - Confidence level
   - Suggestions (if available)
3. **Edit options**:
   - **Type correction**: Press **E**, type correction, press **Enter**
   - **Apply suggestion**: Click suggestion or press **1-9**
   - **Accept word**: Press **A** (if confident it's correct)
   - **Flag for review**: Press **F** (if unsure)

### Step 5: Navigate and Continue

1. Press **→** (Right Arrow) to move to next word
2. Repeat editing process for each word
3. Use **←** (Left Arrow) to go back if needed
4. Position indicator shows progress (e.g., "150 of 384")

### Step 6: Check Audit History (Optional)

1. For words you're unsure about, click **Audit History** tab
2. Review previous edits to understand word evolution
3. Verify edit accuracy
4. Switch back to Word Details tab to continue editing

### Step 7: Manage Word Visibility (As Needed)

1. For words that shouldn't appear in output:
   - Select word
   - Change **Word Visibility Control** to **"Omit"**
2. For words that should merge with previous:
   - Select word
   - Change **Word Visibility Control** to **"Merge with Prior"**

### Step 8: Review Flagged Words

1. Use Filter dropdown
2. Check only **"Raise for Review"**
3. Navigate through flagged words
4. Review each one and:
   - Make corrections if needed
   - Accept if correct
   - Unflag if no longer needed

### Step 9: Final Review

1. Review the **Formatted Text** tab to see final output
2. Switch back to **Raw Text** tab if corrections needed
3. Continue editing until satisfied

### Step 10: Export (When Complete)

1. Return to Document page
2. Use **Export** options:
   - PDF with Images
   - Text-only PDF
   - Plain Text

---

## Formatted Text View

The **Formatted** tab shows how your text will appear in exports.

### Features

- **Clean Layout**: Text displayed as continuous paragraphs
- **No Color Indicators**: Pure text output
- **Proper Formatting**: Line breaks and structure preserved
- **Review Mode**: See final output without word blocks

### Using Formatted View

1. Click the **"Formatted"** tab
2. Review the text as it will appear in exports
3. Switch back to **Raw Text** tab to make corrections
4. Changes in Raw Text automatically update Formatted view

### When to Use

- **Final Review**: Check how text looks in output
- **Readability**: Read text without word blocks in the way
- **Verification**: Ensure formatting is correct
- **Quality Check**: Spot any remaining issues

---

## Tips & Best Practices

### Efficient Editing

1. **Start with Filter**: Hide high-confidence words to focus on problems
2. **Use Keyboard Shortcuts**: Much faster than clicking
3. **Apply Suggestions**: Often faster than typing corrections
4. **Accept Confident Words**: Use **A** key to quickly accept verified words
5. **Flag Ambiguous Words**: Mark uncertain words for later rather than guessing

### Quality Control

1. **Review Flagged Words**: Regularly check flagged words
2. **Check Audit History**: Verify edits when uncertain
3. **Use Formatted View**: Review final output before exporting
4. **Focus on Low Confidence**: Prioritize red and yellow words

### Workflow Optimization

1. **Edit in Batches**: Process multiple words before checking Formatted view
2. **Use Auto-Advance**: Accepting/applying suggestions auto-advances
3. **Navigate Efficiently**: Use arrow keys to move through words quickly
4. **Filter Strategically**: Toggle filters to focus on specific word types

### Common Patterns

- **Historical Documents**: Often need manual correction due to handwriting
- **Low Confidence Words**: Usually need correction or verification
- **Merge Words**: Common when OCR splits words incorrectly
- **Omit Artifacts**: Remove page numbers, stamps, or other non-content text

---

## Troubleshooting

### Word Details Panel Not Appearing

- **Solution**: Click on a word in the Raw Text display to activate the panel

### Keyboard Shortcuts Not Working

- **Solution**: Make sure you've clicked on a word first to activate keyboard navigation

### Suggestions Not Showing

- **Reason**: Word may not have good alternatives or OCR confidence is already high
- **Solution**: Manually type corrections

### Cannot Edit Word

- **Solution**: Click Edit button or press **E** to enter edit mode, or double-click the word

### Filter Not Working

- **Solution**: Make sure you've checked/unchecked the filter options correctly
- Try clicking "Select/Deselect All" first, then choose specific options

### Image Viewer Not Loading

- **Solution**: Refresh the page
- Check if the image file exists
- Contact administrator if issue persists

**Remember**: Click a word first to activate editing features and keyboard shortcuts!

