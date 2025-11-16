/* Tutorial System Loader - Conditionally loads tutorials based on page */

const TUTORIAL_BASE_PATH = window.TUTORIAL_BASE_PATH || './tutorials/';

const TUTORIAL_CONFIG = {
  'startTutorial': { path: 'page.js', class: 'PageTutorials', method: 'startPageWalkthrough' },
  'startKeyboardShortcuts': { path: 'page.js', class: 'PageTutorials', method: 'startKeyboardShortcuts' },
  'startWordEditingTutorial': { path: 'page.js', class: 'PageTutorials', method: 'startWordEditing' },
  'startDocumentTutorial': { path: 'document.js', class: 'DocumentTutorials', method: 'startDocumentWalkthrough' },
  'startPageCardTutorial': { path: 'document.js', class: 'DocumentTutorials', method: 'startPageCardWalkthrough' },
  'startCollectionTutorial': { path: 'collection.js', class: 'CollectionTutorials', method: 'startCollectionWalkthrough' },
  'startOrganizationTutorial': { path: 'organization.js', class: 'OrganizationTutorials', method: 'startOrganizationWalkthrough' },
  'startOrganizationListTutorial': { path: 'organization.js', class: 'OrganizationTutorials', method: 'startOrganizationListWalkthrough' },
  'startHomepageTutorial': { path: 'homepage.js', class: 'HomepageTutorials', method: 'startHomepageWalkthrough' },
  'startAllDocumentsTutorial': { path: 'homepage.js', class: 'HomepageTutorials', method: 'startAllDocumentsWalkthrough' },
  'startPendingReviewsTutorial': { path: 'homepage.js', class: 'HomepageTutorials', method: 'startPendingReviewsWalkthrough' },
  'startWhereYouLeftOffTutorial': { path: 'homepage.js', class: 'HomepageTutorials', method: 'startWhereYouLeftOffWalkthrough' },
  'startNavigationTutorial': { path: 'navigation.js', class: 'NavigationTutorials', method: 'startNavigationWalkthrough' },
  'startDocumentFormTutorial': { path: 'forms/document.js', class: 'DocumentFormTutorials', method: 'startDocumentFormWalkthrough' },
  'startSeriesFormTutorial': { path: 'forms/series.js', class: 'SeriesFormTutorials', method: 'startSeriesFormWalkthrough' },
  'startPageFormTutorial': { path: 'forms/page.js', class: 'PageFormTutorials', method: 'startPageFormWalkthrough' },
};

const tutorialCache = new Map();

function getModulePath(relativePath) {
  const base = TUTORIAL_BASE_PATH.endsWith('/') ? TUTORIAL_BASE_PATH : TUTORIAL_BASE_PATH + '/';
  return base + relativePath;
}

async function loadTutorial(buttonId) {
  if (!window.driver?.js?.driver) {
    console.warn('⚠️ Driver.js not loaded');
    LibriscanUtils?.showToast('Tutorial system not available', 'error');
    return null;
  }

  const config = TUTORIAL_CONFIG[buttonId];
  if (!config) {
    console.warn(`No tutorial found for: ${buttonId}`);
    return null;
  }

  // Check cache
  if (tutorialCache.has(config.path)) {
    return tutorialCache.get(config.path);
  }

  try {
    const module = await import(getModulePath(config.path));
    const TutorialClass = module[config.class];
    
    if (!TutorialClass) {
      throw new Error(`Class ${config.class} not found`);
    }

    const instance = new TutorialClass();
    tutorialCache.set(config.path, instance);
    return instance;
  } catch (error) {
    console.error(`Error loading tutorial: ${buttonId}`, error);
    LibriscanUtils?.showToast('Failed to load tutorial', 'error');
    return null;
  }
}

function initTutorials() {
  if (!window.driver?.js?.driver) {
    console.warn('⚠️ Driver.js not loaded');
    return;
  }

  for (const [buttonId, config] of Object.entries(TUTORIAL_CONFIG)) {
    const button = document.getElementById(buttonId);
    if (!button) continue;

    button.addEventListener('click', async (event) => {
      event.preventDefault();
      const instance = await loadTutorial(buttonId);
      if (instance && typeof instance[config.method] === 'function') {
        instance[config.method]();
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTutorials);
} else {
  initTutorials();
}