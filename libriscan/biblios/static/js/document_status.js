/**
 * Document Status Dropdown Handler
 */

(function() {
    'use strict';

    const STATUS_CONFIG = {
        'N': { label: 'New', badgeClass: 'badge-ghost', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>' },
        'I': { label: 'In Progress', badgeClass: 'badge-info', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>' },
        'R': { label: 'Ready for Review', badgeClass: 'badge-warning', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>' },
        'A': { label: 'Approved', badgeClass: 'badge-success', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>' }
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
        iconElement.innerHTML = config.icon;
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




