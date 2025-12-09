/**
 * Document Status Dropdown Handler
 */

(function() {
    'use strict';

    const STATUS_CONFIG = {
        'N': { label: 'New', badgeClass: 'badge-ghost', iconName: 'edit' },
        'I': { label: 'In Progress', badgeClass: 'badge-info', iconName: 'clock' },
        'R': { label: 'Ready for Review', badgeClass: 'badge-warning', iconName: 'shield-check' },
        'A': { label: 'Approved', badgeClass: 'badge-success', iconName: 'check-circle' }
    };

    /**
     * Update the status badge display
     * @param {string} status - Status code (N, I, R, A)
     */
    function updateBadge(status) {
        const config = STATUS_CONFIG[status];
        if (!config) return;

        const badge = document.getElementById('statusBadge');
        const button = document.getElementById('statusButton');
        if (!badge || !button) return;

        let iconElement = document.getElementById('statusIcon') || (() => {
            const element = document.createElement('span');
            element.id = 'statusIcon';
            badge.appendChild(element);
            return element;
        })();
        
        let textElement = document.getElementById('statusText') || (() => {
            const element = document.createElement('span');
            element.id = 'statusText';
            badge.appendChild(element);
            return element;
        })();

        badge.className = `badge badge-sm ${config.badgeClass} gap-1.5 px-3 py-1.5 font-semibold`;
        window.SVGLoader.loadIcon(config.iconName, { cssClass: 'size-3' }).then(svg => {
            iconElement.innerHTML = svg;
        });
        textElement.textContent = config.label;

        button.classList.add('animate-pulse');
        setTimeout(() => button.classList.remove('animate-pulse'), 1000);
    }

    /**
     * Initialize status dropdown functionality
     * @param {string} currentStatus - Current document status
     */
    window.initStatusDropdown = function(currentStatus) {
        updateBadge(currentStatus);
        window.currentStatus = currentStatus;

        const button = document.getElementById('statusButton');
        if (!button) return;

        // Handle HTMX before request - disable button
        document.body.addEventListener('htmx:beforeRequest', function(event) {
            if (event.target.classList.contains('status-option')) {
                const newStatus = event.target.getAttribute('data-status');
                if (newStatus === window.currentStatus) {
                    event.preventDefault();
                    document.getElementById('statusDropdown')?.blur();
                    return;
                }
                button.disabled = true;
            }
        });

        // Handle HTMX after response - update badge
        document.body.addEventListener('htmx:afterSettle', function(event) {
            if (event.target.classList.contains('status-option')) {
                try {
                    const response = event.detail.xhr;
                    if (response.status === 200) {
                        const data = JSON.parse(response.responseText);
                        if (data.status) {
                            updateBadge(data.status);
                            window.currentStatus = data.status;
                            
                            window.LibriscanUtils?.showToast(
                                `Status updated to "${data.status_display}"`, 
                                'success', 
                                2000
                            );
                            document.getElementById('statusDropdown')?.blur();
                        }
                    }
                } catch (error) {
                    console.error('Error parsing status response:', error);
                } finally {
                    button.disabled = false;
                }
            }
        });

        // Handle HTMX errors
        document.body.addEventListener('htmx:responseError', function(event) {
            if (event.target.classList.contains('status-option')) {
                try {
                    const response = event.detail.xhr;
                    const errorData = JSON.parse(response.responseText);
                    window.LibriscanUtils?.showToast(
                        `Failed to update status: ${errorData.error || 'Unknown error'}`, 
                        'error', 
                        4000
                    );
                } catch (error) {
                    window.LibriscanUtils?.showToast(
                        'Failed to update status', 
                        'error', 
                        4000
                    );
                } finally {
                    button.disabled = false;
                }
            }
        });
    };
})();




