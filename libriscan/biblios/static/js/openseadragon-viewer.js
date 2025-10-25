/**
 * OpenSeadragon Viewer
 * Handles image zoom, pan, and rotation with auto-height adjustment
 */

let viewerInstance = null;

/**
 * Initialize OpenSeadragon viewer
 */
function initializeViewer(imageUrl, containerId = 'openseadragon-viewer') {
  if (viewerInstance) {
    viewerInstance.destroy();
    viewerInstance = null;
  }

  const container = document.getElementById(containerId);
  if (!container || !imageUrl) return null;

  try {
    viewerInstance = OpenSeadragon({
      id: containerId,
      prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/',
      tileSources: { type: 'image', url: imageUrl },
      
      // Display settings
      minZoomLevel: 1,
      defaultZoomLevel: 1,
      homeFillsViewer: true,
      constrainDuringPan: true,
      visibilityRatio: 1,
      degrees: 0,
      
      // Zoom behavior
      zoomPerScroll: 1.2,
      maxZoomPixelRatio: 3,
      
      // Controls
      showNavigationControl: true,
      showRotationControl: true,
      showFullPageControl: true,
      showFlipControl: true,
      navigationControlAnchor: OpenSeadragon.ControlAnchor.TOP_LEFT,
      
      // Navigation
      showNavigator: true,
      navigatorPosition: 'BOTTOM_RIGHT',
      navigatorSizeRatio: 0.15,
      navigatorAutoFade: true,
      
      // Mouse gestures
      gestureSettingsMouse: {
        scrollToZoom: true,
        clickToZoom: false,
        dblClickToZoom: true
      },
      
      // Touch gestures
      gestureSettingsTouch: {
        pinchToZoom: true,
        dblClickToZoom: true
      },
      
      // Keyboard shortcuts
      showSequenceControl: false
    });

    // Auto-adjust height to match image aspect ratio
    viewerInstance.addHandler('open', function() {
      const image = viewerInstance.world.getItemAt(0);
      if (!image) return;
      
      const aspectRatio = image.getContentSize().y / image.getContentSize().x;
      const height = Math.max(400, Math.min(1200, container.clientWidth * aspectRatio));
      container.style.height = height + 'px';
    });

    return viewerInstance;
  } catch (error) {
    console.error('Viewer initialization failed:', error);
    if (typeof LibriscanUtils !== 'undefined') {
      LibriscanUtils.showToast('Failed to load image viewer', 'error');
    }
    return null;
  }
}

/**
 * Reinitialize for HTMX page swaps
 */
function reinitializeViewer(imageUrl, containerId = 'openseadragon-viewer') {
  return initializeViewer(imageUrl, containerId);
}

/**
 * Clean up viewer instance
 */
function destroyViewer() {
  if (viewerInstance) {
    viewerInstance.destroy();
    viewerInstance = null;
  }
}

// Export to global scope
window.initializeViewer = initializeViewer;
window.reinitializeViewer = reinitializeViewer;
window.destroyViewer = destroyViewer;
