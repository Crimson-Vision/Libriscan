/* Organization View Tutorial - For organization detail page */

import { TutorialBase } from './base.js';

export class OrganizationTutorials extends TutorialBase {
  startOrganizationWalkthrough() {
    const organizationCard = document.getElementById('organization-card');
    const organizationHeader = document.getElementById('organization-header');
    const organizationIcon = document.getElementById('organization-icon');
    const organizationName = document.getElementById('organization-name');
    const organizationLocation = document.getElementById('organization-location');
    const organizationUserRoleBadge = document.getElementById('organization-user-role-badge');
    const collectionsSection = document.getElementById('collections-section');
    const collectionsList = document.getElementById('collections-list');
    const collectionsEmpty = document.getElementById('collections-empty');
    const hasCollections = collectionsList?.querySelector('.card') !== null;
    const collectionCreateLink = document.getElementById('collection-create-link');

    const steps = [
      {
        element: 'body',
        popover: {
          title: 'Welcome to Organization View! 🏛️',
          description: 'This is where you manage your organization and its collections. Let\'s explore the key features.',
          side: 'center',
          align: 'center'
        }
      },
      {
        element: organizationCard || 'body',
        popover: {
          title: '🏛️ Organization Header',
          description: '<strong>Organization information:</strong><br/>• Organization icon and name<br/>• Location (city and state)<br/>• Your role within this organization<br/><br/>This card shows key information about the organization.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: organizationIcon || organizationHeader || organizationCard || 'body',
        popover: {
          title: '🏛️ Organization Icon',
          description: '<strong>Organization identifier:</strong> The icon represents this organization. Each organization has its own identity within Libriscan.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: organizationName || organizationHeader || organizationCard || 'body',
        popover: {
          title: '📝 Organization Name',
          description: '<strong>Full organization name:</strong> This is the display name of the organization you\'re currently viewing.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: organizationLocation || organizationCard || 'body',
        popover: {
          title: '📍 Organization Location',
          description: '<strong>Geographic location:</strong> Shows the city and state where this organization is located (if provided).',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: organizationUserRoleBadge || organizationCard || 'body',
        popover: {
          title: '👤 Your Role Badge',
          description: '<strong>Your role in this organization:</strong><br/>• <strong>Editor</strong> - Can edit documents and pages<br/>• <strong>Archivist</strong> - Can review and approve documents<br/>• <strong>Guest</strong> - Read-only access<br/><br/>Your role determines what actions you can perform.',
          side: 'top',
          align: 'end'
        }
      },
      {
        element: collectionsSection || 'body',
        popover: {
          title: '📂 Collections Section',
          description: '<strong>Collections are groups of documents within an organization.</strong> They help organize related documents together. Each collection can contain:<br/>• Multiple series (optional)<br/>• Multiple documents<br/>• Pages with images and extracted text',
          side: 'top',
          align: 'start'
        }
      }
    ];

    if (hasCollections) {
      const firstCollectionCard = collectionsList?.querySelector('.card');
      const firstCollection = document.querySelector('[id^="collection-card-"]');
      
      if (firstCollection || firstCollectionCard) {
        steps.push({
          element: firstCollection || firstCollectionCard || collectionsList,
          popover: {
            title: '📂 Collection Card',
            description: '<strong>Each collection card displays:</strong><br/>• Collection name with icon<br/>• Link to view and manage the collection<br/>• Delete button (if you have permissions)<br/><br/><strong>Click on a collection</strong> to view its series and documents.',
            side: 'right',
            align: 'start'
          }
        });

        // Try to find a delete button if it exists
        const firstCollectionDeleteBtn = document.querySelector('[id^="collection-delete-btn-"]');
        if (firstCollectionDeleteBtn) {
          steps.push({
            element: firstCollectionDeleteBtn,
            popover: {
              title: '🗑️ Delete Collection',
              description: '<strong>⚠️ Warning:</strong> This permanently removes the collection.<br/>• <strong>Including all series and documents within it</strong><br/>• <strong>Cannot be undone</strong><br/>• <strong>Will result in permanent data loss</strong><br/><br/>Only visible if you have permission to delete. A confirmation dialog will appear.',
              side: 'left',
              align: 'start'
            }
          });
        }
      }
    } else {
      steps.push({
        element: collectionsEmpty || collectionsList || collectionsSection || 'body',
        popover: {
          title: '📭 No Collections Yet',
          description: '<strong>This organization doesn\'t have any collections yet.</strong> Collections help organize your documents. To get started:<br/>• Click "Add New Collection" button<br/>• Create a collection<br/>• Add documents and pages<br/>• Start transcribing content',
          side: 'top',
          align: 'center'
        }
      });
    }

    if (collectionCreateLink) {
      steps.push({
        element: collectionCreateLink,
        popover: {
          title: '➕ Add New Collection',
          description: '<strong>Click to create a new collection:</strong><br/>• Collections organize related documents together<br/>• After creating, you can add series and documents<br/>• Each collection can have its own structure<br/><br/>This is the starting point for organizing your transcription work.',
          side: 'top',
          align: 'center'
        }
      });
    }

    steps.push({
      element: 'body',
      popover: {
        title: '✅ Organization Management Complete!',
        description: '<strong>You now understand organization management:</strong><br/>• <strong>Organization Info:</strong> View organization details and your role<br/>• <strong>Collections:</strong> Organize documents into collections<br/>• <strong>Create Collections:</strong> Start organizing your transcription work<br/><br/><strong>Next Steps:</strong> Create collections, then add documents and start transcribing!',
        side: 'center',
        align: 'center'
      }
    });

    const driver = this.createDriver(steps);
    driver?.drive();
  }

  startOrganizationListWalkthrough() {
    const organizationsList = document.querySelector('.list');
    const organizationsEmpty = document.getElementById('organizations-empty');
    
    // Check if organizations exist by looking for list items with links (not the empty state)
    const organizationLinks = organizationsList?.querySelectorAll('li > a.list-row');
    const hasOrganizations = !organizationsEmpty && organizationLinks && organizationLinks.length > 0;

    // If no organizations, only show the empty state message
    if (!hasOrganizations && organizationsEmpty) {
      const steps = [
        {
          element: organizationsEmpty || organizationsList || 'body',
          popover: {
            title: '📭 No Organizations Found',
            description: '<strong>You don\'t have access to any organizations yet.</strong><br/><br/>To get access to an organization, you need to be added by an administrator.<br/><br/><strong>Please contact your system administrator</strong> to request access to an organization.',
            side: 'top',
            align: 'center'
          }
        }
      ];
      const driver = this.createDriver(steps);
      driver?.drive();
      return;
    }

    // If organizations exist, show the full tutorial
    const steps = [
      {
        element: 'body',
        popover: {
          title: 'Welcome to Organizations! 🏛️',
          description: 'This page shows all organizations you have access to. Let\'s explore how to work with organizations.',
          side: 'center',
          align: 'center'
        }
      }
    ];

    const firstOrgLink = organizationLinks?.[0];
    if (firstOrgLink) {
      steps.push({
        element: firstOrgLink || organizationsList || 'body',
        popover: {
          title: '🏛️ Organization Entry',
          description: '<strong>Each organization shows:</strong><br/>• Organization icon<br/>• Full organization name<br/>• Short name (abbreviation)<br/><br/><strong>Click on any organization</strong> to view its details, collections, and documents.',
          side: 'right',
          align: 'start'
        }
      });
    }

    steps.push({
      element: organizationsList || 'body',
      popover: {
        title: '📋 Your Organizations',
        description: '<strong>All organizations you can access are listed here:</strong><br/>• Each organization has its own collections and documents<br/>• Your role may differ across organizations<br/>• Click any organization to start working with it',
        side: 'top',
        align: 'start'
      }
    });

    steps.push({
      element: 'body',
      popover: {
        title: '✅ Organization List Complete!',
        description: '<strong>You now understand the organization list:</strong><br/>• View all organizations you can access<br/>• Click any organization to view details<br/>• Each organization has its own collections and documents<br/><br/>Click on an organization to get started!',
        side: 'center',
        align: 'center'
      }
    });

    const driver = this.createDriver(steps);
    driver?.drive();
  }
}

