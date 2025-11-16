/* Homepage Tutorial - For index/homepage with document listings */

import { TutorialBase } from './base.js';

export class HomepageTutorials extends TutorialBase {
  // Helper: Switch to tab if not already active
  switchToTab(tabTriggerId, tabPanelId) {
    const tabTrigger = document.getElementById(tabTriggerId);
    const tabPanel = document.getElementById(tabPanelId);
    
    if (!tabTrigger || !tabPanel) return false;
    
    const isActive = tabTrigger.classList.contains('tab-active') && !tabPanel.classList.contains('hidden');
    if (!isActive) {
      tabTrigger.click();
      return true; // Tab switched
    }
    return false; // Already active
  }

  startHomepageWalkthrough() {
    const homepageSearch = document.getElementById('homepage-search');
    const homepageSearchWrapper = document.getElementById('homepage-search-wrapper');
    const searchFilterRow = document.getElementById('search-filter-row');
    const viewToggleButtons = document.getElementById('view-toggle-buttons');
    const listViewBtn = document.getElementById('list-view-btn');
    const gridViewBtn = document.getElementById('grid-view-btn');
    const mainTabs = document.getElementById('main-tabs');
    const allDocumentsTabTrigger = document.getElementById('all-documents-tab-trigger');
    const pendingReviewsTabTrigger = document.getElementById('pending-reviews-tab-trigger');
    
    const isPendingReviewsVisible = !!pendingReviewsTabTrigger && 
                                     !pendingReviewsTabTrigger.classList.contains('hidden');

    const steps = [
      {
        element: 'body',
        popover: {
          title: 'Welcome to Libriscan! 🏛️',
          description: 'This is your homepage where you can filter, browse, and manage all your documents. Let\'s explore the key features.',
          side: 'center',
          align: 'center'
        }
      },
      {
        element: homepageSearch || homepageSearchWrapper || searchFilterRow || 'body',
        popover: {
          title: '🔍 Filter Documents',
          description: '<strong>Filter documents by typing:</strong><br/>• Filter by document ID, collection, or series<br/>• Filtered results appear in a dropdown below<br/>• Click any result to go directly to that document<br/><br/>This helps you quickly find specific documents.',
          side: 'bottom',
          align: 'start'
        }
      }
    ];

    // Add view toggle buttons step only if they exist and are visible
    if (viewToggleButtons && listViewBtn && gridViewBtn && !viewToggleButtons.classList.contains('hidden')) {
      steps.push({
        element: viewToggleButtons || searchFilterRow || 'body',
        popover: {
          title: '👁️ View Toggle (List/Grid)',
          description: '<strong>Switch between list and grid views:</strong><br/>• <strong>List View</strong> - Table format with detailed information<br/>• <strong>Grid View</strong> - Card-based layout for visual browsing<br/><br/>Only available for "All Documents" and "Pending Reviews" tabs. "Where You Left Off" always shows cards.',
          side: 'bottom',
          align: 'end'
        }
      });
    }

    // Build navigation tabs description based on what's visible
    let tabsDescription = '<strong>Switch between different document views:</strong><br/>• <strong>All Documents</strong> - Browse all documents you can access<br/>';
    if (isPendingReviewsVisible) {
      tabsDescription += '• <strong>Pending Reviews</strong> - Documents awaiting your review (Archivists only)<br/>';
    }
    tabsDescription += '• <strong>Where You Left Off</strong> - Your recent text editing work<br/><br/>Click any tab to switch views.';
    
    steps.push({
      element: mainTabs || 'body',
      popover: {
        title: '📑 Navigation Tabs',
        description: tabsDescription,
        side: 'bottom',
        align: 'start'
      }
    });

    steps.push({
      element: 'body',
      popover: {
        title: '🎉 Homepage Overview Complete!',
        description: '<strong>You now understand the homepage basics:</strong><br/>• <strong>Filter:</strong> Filter documents quickly<br/>• <strong>View Toggle:</strong> Switch between list and grid views (for applicable tabs)<br/>• <strong>Tabs:</strong> Navigate between All Documents, ' + (isPendingReviewsVisible ? 'Pending Reviews, ' : '') + 'and Where You Left Off<br/><br/>Check out tab-specific tutorials to learn more about each view!',
        side: 'center',
        align: 'center'
      }
    });

    const driver = this.createDriver(steps);
    driver?.drive();
  }

  startAllDocumentsWalkthrough() {
    const switched = this.switchToTab('all-documents-tab-trigger', 'all-documents-tab');
    if (switched) {
      setTimeout(() => this.runAllDocumentsWalkthrough(), 100);
      return;
    }
    this.runAllDocumentsWalkthrough();
  }

  runAllDocumentsWalkthrough() {
    const allDocumentsTabTrigger = document.getElementById('all-documents-tab-trigger');
    const allDocumentsTab = document.getElementById('all-documents-tab');

    const allDocumentsTable = allDocumentsTab?.querySelector('.table');
    const allDocumentsEmpty = document.getElementById('all-documents-empty');
    const allDocumentsPagination = document.getElementById('all-documents-pagination');
    const viewToggleButtons = document.getElementById('view-toggle-buttons');
    const listViewBtn = document.getElementById('list-view-btn');
    const gridViewBtn = document.getElementById('grid-view-btn');

    const steps = [
      {
        element: allDocumentsTabTrigger || 'body',
        popover: {
          title: '📄 All Documents Tab',
          description: '<strong>View all documents you have access to:</strong><br/>• Shows documents from all your organizations<br/>• Displays in table format (List view) or cards (Grid view)<br/>• Includes document ID, organization, collection, series, and status<br/>• Click "Open" button to view document details',
          side: 'bottom',
          align: 'start'
        }
      }
    ];

    // Add view toggle if visible
    if (viewToggleButtons && listViewBtn && gridViewBtn && !viewToggleButtons.classList.contains('hidden')) {
      steps.push({
        element: viewToggleButtons || 'body',
        popover: {
          title: '👁️ View Toggle (List/Grid)',
          description: '<strong>Switch between list and grid views:</strong><br/>• <strong>List View</strong> - Table format with detailed information<br/>• <strong>Grid View</strong> - Card-based layout for visual browsing<br/><br/>Click the buttons above to switch views.',
          side: 'bottom',
          align: 'end'
        }
      });
    }

    if (allDocumentsTable) {
      steps.push({
        element: allDocumentsTable || allDocumentsTab,
        popover: {
          title: '📊 Documents Table',
          description: '<strong>Document listing shows:</strong><br/>• <strong>Document ID</strong> - Unique identifier<br/>• <strong>Organization</strong> - Which organization owns it<br/>• <strong>Collection</strong> - Parent collection<br/>• <strong>Series</strong> - Parent series (if applicable)<br/>• <strong>Status</strong> - Current workflow status (New, In Progress, Ready for Review, Approved)<br/>• <strong>Actions</strong> - "Open" button to view document<br/><br/>In Grid view, this becomes a card layout.',
          side: 'top',
          align: 'start'
        }
      });
    } else if (allDocumentsEmpty) {
      steps.push({
        element: allDocumentsEmpty || allDocumentsTab,
        popover: {
          title: '📭 No Documents Yet',
          description: '<strong>No documents available.</strong> To get started:<br/>• Go to an organization<br/>• Create a collection<br/>• Add documents<br/>• Upload pages and extract text',
          side: 'top',
          align: 'center'
        }
      });
    }

    if (allDocumentsPagination) {
      steps.push({
        element: allDocumentsPagination || allDocumentsTab,
        popover: {
          title: '⬅️➡️ Pagination',
          description: '<strong>Navigate through multiple pages of documents:</strong><br/>• Use Previous/Next buttons to move between pages<br/>• Page number shows current page and total pages<br/>• Only appears when there are more than 10 documents',
          side: 'top',
          align: 'center'
        }
      });
    }

    steps.push({
      element: 'body',
      popover: {
        title: '✅ All Documents Complete!',
        description: '<strong>You now understand the All Documents tab:</strong><br/>• Browse all documents across organizations<br/>• Switch between List and Grid views<br/>• Navigate through pages with pagination<br/>• Open documents to view details<br/><br/>Use the filter and search features to quickly find specific documents!',
        side: 'center',
        align: 'center'
      }
    });

    const driver = this.createDriver(steps);
    driver?.drive();
  }

  startPendingReviewsWalkthrough() {
    const pendingReviewsTabTrigger = document.getElementById('pending-reviews-tab-trigger');
    if (!pendingReviewsTabTrigger || pendingReviewsTabTrigger.classList.contains('hidden')) {
      LibriscanUtils?.showToast('Pending Reviews tab is only available to Archivists.', 'info');
      return;
    }

    const switched = this.switchToTab('pending-reviews-tab-trigger', 'pending-reviews-tab');
    if (switched) {
      setTimeout(() => this.runPendingReviewsWalkthrough(), 100);
      return;
    }
    this.runPendingReviewsWalkthrough();
  }

  runPendingReviewsWalkthrough() {
    const pendingReviewsTabTrigger = document.getElementById('pending-reviews-tab-trigger');
    const pendingReviewsTab = document.getElementById('pending-reviews-tab');

    const pendingReviewsTable = pendingReviewsTab.querySelector('.table');
    const pendingReviewsEmpty = document.getElementById('pending-reviews-empty');
    const pendingReviewsPagination = document.getElementById('pending-reviews-pagination');
    const viewToggleButtons = document.getElementById('view-toggle-buttons');
    const listViewBtn = document.getElementById('list-view-btn');
    const gridViewBtn = document.getElementById('grid-view-btn');

    const steps = [
      {
        element: pendingReviewsTabTrigger || 'body',
        popover: {
          title: '👀 Pending Reviews Tab',
          description: '<strong>Documents awaiting your review:</strong><br/>• Only visible to Archivists<br/>• Shows documents with "Ready for Review" status<br/>• Click "Review" button to open and review documents<br/>• Helps you prioritize review work',
          side: 'bottom',
          align: 'start'
        }
      }
    ];

    // Add view toggle if visible
    if (viewToggleButtons && listViewBtn && gridViewBtn && !viewToggleButtons.classList.contains('hidden')) {
      steps.push({
        element: viewToggleButtons || 'body',
        popover: {
          title: '👁️ View Toggle (List/Grid)',
          description: '<strong>Switch between list and grid views:</strong><br/>• <strong>List View</strong> - Table format with detailed information<br/>• <strong>Grid View</strong> - Card-based layout for visual browsing<br/><br/>Click the buttons above to switch views.',
          side: 'bottom',
          align: 'end'
        }
      });
    }

    if (pendingReviewsTable) {
      steps.push({
        element: pendingReviewsTable || pendingReviewsTab,
        popover: {
          title: '📋 Review Queue',
          description: '<strong>Documents ready for review:</strong><br/>• Status badge shows "Ready for Review"<br/>• Same information as All Documents tab<br/>• Use List or Grid view to browse<br/>• Click "Review" to open and approve or request changes',
          side: 'top',
          align: 'start'
        }
      });
    } else if (pendingReviewsEmpty) {
      steps.push({
        element: pendingReviewsEmpty || pendingReviewsTab,
        popover: {
          title: '✅ All Caught Up!',
          description: '<strong>No documents pending review.</strong> Great work! All documents are up to date.',
          side: 'top',
          align: 'center'
        }
      });
    }

    if (pendingReviewsPagination) {
      steps.push({
        element: pendingReviewsPagination || pendingReviewsTab,
        popover: {
          title: '⬅️➡️ Pagination',
          description: '<strong>Navigate through review queue:</strong><br/>• Use Previous/Next buttons to move between pages<br/>• Only appears when there are more than 10 documents pending review',
          side: 'top',
          align: 'center'
        }
      });
    }

    steps.push({
      element: 'body',
      popover: {
        title: '✅ Review Queue Complete!',
        description: '<strong>You now understand the Pending Reviews tab:</strong><br/>• View documents awaiting review<br/>• Switch between List and Grid views<br/>• Navigate through pages with pagination<br/>• Review and approve or request changes<br/><br/>Keep track of documents that need your attention!',
        side: 'center',
        align: 'center'
      }
    });

    const driver = this.createDriver(steps);
    driver?.drive();
  }

  startWhereYouLeftOffWalkthrough() {
    const switched = this.switchToTab('recent-work-tab-trigger', 'recent-work-tab');
    if (switched) {
      setTimeout(() => this.runWhereYouLeftOffWalkthrough(), 100);
      return;
    }
    this.runWhereYouLeftOffWalkthrough();
  }

  runWhereYouLeftOffWalkthrough() {
    const recentWorkTabTrigger = document.getElementById('recent-work-tab-trigger');
    const recentWorkTab = document.getElementById('recent-work-tab');

    const recentTextblocksGrid = document.getElementById('recent-textblocks-grid');
    const recentTextblocksEmpty = document.getElementById('recent-textblocks-empty');

    const steps = [
      {
        element: recentWorkTabTrigger || 'body',
        popover: {
          title: '⏰ Where You Left Off',
          description: '<strong>Your recent editing work:</strong><br/>• Shows recent text blocks you\'ve edited<br/>• Displays the text you edited and page context<br/>• Includes timestamp and user info<br/>• Click "Continue Editing" to resume work on that page<br/><br/>Always shown in card format (no list/grid toggle).',
          side: 'bottom',
          align: 'start'
        }
      }
    ];

    if (recentTextblocksGrid && recentTextblocksGrid.children.length > 0) {
      steps.push({
        element: recentTextblocksGrid || recentWorkTab,
        popover: {
          title: '📝 Recent Work Cards',
          description: '<strong>Each card shows:</strong><br/>• Document ID of the page you were editing<br/>• Your edit - The text you last modified<br/>• Page context - Surrounding text for reference<br/>• User and timestamp - Who edited and when<br/>• Continue Editing button - Resume work on that page<br/><br/>Cards are organized in a grid layout.',
          side: 'top',
          align: 'start'
        }
      });
    } else if (recentTextblocksEmpty) {
      steps.push({
        element: recentTextblocksEmpty || recentWorkTab,
        popover: {
          title: '📭 No Recent Edits',
          description: '<strong>No recent edits found.</strong> Start transcribing text to see your recent work here. Once you edit words on pages, they\'ll appear in this section.',
          side: 'top',
          align: 'center'
        }
      });
    }

    steps.push({
      element: 'body',
      popover: {
        title: '✅ Where You Left Off Complete!',
        description: '<strong>You now understand the Where You Left Off tab:</strong><br/>• View your recent editing work<br/>• See what text you edited and page context<br/>• Quickly resume work on pages you were editing<br/>• Always displayed in card format<br/><br/>This helps you quickly continue your transcription work!',
        side: 'center',
        align: 'center'
      }
    });

    const driver = this.createDriver(steps);
    driver?.drive();
  }
}
