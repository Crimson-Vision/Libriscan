/* Navigation Tutorial - For navbar navigation links */

import { TutorialBase } from './base.js';

export class NavigationTutorials extends TutorialBase {
  startNavigationWalkthrough() {
    const navbar = document.getElementById('main-navbar');
    const logoLink = document.getElementById('navbar-logo-link');
    const userWelcome = document.getElementById('navbar-user-welcome');
    const themeToggle = document.getElementById('theme-toggle-label');
    const homeLink = document.getElementById('navbar-home-link');
    const organizationsLink = document.getElementById('navbar-organizations-link');
    const searchTrigger = document.getElementById('navbar-search-trigger');
    const searchDropdown = document.getElementById('navbar-search-dropdown');
    const adminLink = document.getElementById('navbar-admin-link');
    const logoutLink = document.getElementById('navbar-logout-link');
    const loginLink = document.getElementById('navbar-login-link');

    // Check if Admin link is visible (staff users only)
    const isAdminVisible = !!adminLink && !adminLink.closest('li')?.classList.contains('hidden');

    const steps = [
      {
        element: navbar || 'body',
        popover: {
          title: '🧭 Navigation Bar',
          description: 'This navigation bar provides quick access to all major features of Libriscan. Let\'s explore each section.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: logoLink || navbar || 'body',
        popover: {
          title: '🏠 LibriScan Logo',
          description: '<strong>Click the logo to return to the homepage:</strong><br/>• Quick way to navigate back to the main page<br/>• Available from anywhere in the application',
          side: 'bottom',
          align: 'start'
        }
      }
    ];

    // Add user welcome badge if visible
    if (userWelcome && !userWelcome.classList.contains('hidden')) {
      steps.push({
        element: userWelcome || navbar || 'body',
        popover: {
          title: '👋 Welcome Message',
          description: '<strong>Your personalized welcome:</strong><br/>• Shows your name<br/>• Confirms you\'re logged in<br/>• Only visible when authenticated',
          side: 'bottom',
          align: 'start'
        }
      });
    }

    steps.push({
      element: themeToggle || navbar || 'body',
      popover: {
        title: '🌙 Theme Toggle',
        description: '<strong>Switch between light and dark modes:</strong><br/>• Click the moon/sun icon<br/>• Toggle anytime for comfortable viewing<br/>• Your preference is saved',
        side: 'bottom',
        align: 'center'
      }
    });

    steps.push({
      element: homeLink || navbar || 'body',
      popover: {
        title: '🏠 Home',
        description: '<strong>Navigate to the homepage:</strong><br/>• View all your documents<br/>• Access pending reviews<br/>• See recent work<br/>• Same as clicking the logo',
        side: 'bottom',
        align: 'center'
      }
    });

    steps.push({
      element: organizationsLink || navbar || 'body',
      popover: {
        title: '🏛️ Organizations',
        description: '<strong>Manage your organizations:</strong><br/>• View all organizations you belong to<br/>• Access collections and series<br/>• Manage organizational settings<br/>• Your workspace hub',
        side: 'bottom',
        align: 'center'
      }
    });

    steps.push({
      element: searchTrigger || searchDropdown || navbar || 'body',
      popover: {
        title: '🔍 Search',
        description: '<strong>Quick document search:</strong><br/>• Click to open search dropdown<br/>• Search by document ID, collection, or series<br/>• Results appear instantly<br/>• Click any result to navigate directly',
        side: 'bottom',
        align: 'center'
      }
    });

    // Conditionally add Admin link tutorial only if visible
    if (isAdminVisible) {
      steps.push({
        element: adminLink || navbar || 'body',
        popover: {
          title: '⚙️ Admin',
          description: '<strong>Access Django admin panel:</strong><br/>• Only available to staff users<br/>• Manage users, organizations, and system settings<br/>• Advanced administrative functions<br/>• Use with caution',
          side: 'bottom',
          align: 'center'
        }
      });
    }

    // Add logout/login based on authentication status
    if (logoutLink) {
      steps.push({
        element: logoutLink || navbar || 'body',
        popover: {
          title: '🚪 Logout',
          description: '<strong>Sign out of your account:</strong><br/>• Ends your current session<br/>• Returns to login page<br/>• Keeps your data secure',
          side: 'bottom',
          align: 'center'
        }
      });
    } else if (loginLink) {
      steps.push({
        element: loginLink || navbar || 'body',
        popover: {
          title: '🔐 Login',
          description: '<strong>Sign in to your account:</strong><br/>• Access your documents and organizations<br/>• Required for most features<br/>• Secure authentication',
          side: 'bottom',
          align: 'center'
        }
      });
    }

    steps.push({
      element: navbar || 'body',
      popover: {
        title: '✅ Navigation Complete!',
        description: '<strong>You now understand the navigation bar:</strong><br/>• <strong>Logo:</strong> Return to homepage<br/>• <strong>Theme Toggle:</strong> Switch light/dark mode<br/>• <strong>Home:</strong> Main document view<br/>• <strong>Organizations:</strong> Manage your workspace<br/>• <strong>Search:</strong> Quick document search' + (isAdminVisible ? '<br/>• <strong>Admin:</strong> Administrative panel' : '') + '<br/>• <strong>Logout/Login:</strong> Session management<br/><br/>Use these links to navigate efficiently!',
        side: 'bottom',
        align: 'center'
      }
    });

    const driver = this.createDriver(steps);
    driver?.drive();
  }
}

