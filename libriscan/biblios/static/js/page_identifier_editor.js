document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.edit-identifier-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const card = btn.closest('.page-card');
            const input = card.querySelector('.page-identifier-input');
            card.querySelector('.page-identifier-display').classList.add('hidden');
            input.classList.remove('hidden');
            btn.classList.add('hidden');
            input.focus().select();
        });
    });
    
    document.querySelectorAll('.page-identifier-input').forEach(input => {
        const card = input.closest('.page-card');
        const display = card.querySelector('.page-identifier-display');
        const btn = card.querySelector('.edit-identifier-btn');
        const toggle = (show) => {
            display.classList.toggle('hidden', !show);
            input.classList.toggle('hidden', show);
            btn.classList.toggle('hidden', !show);
        };
        
        input.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
        });
        input.addEventListener('input', (event) => event.target.value = event.target.value.replace(/\s/g, ''));
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') event.preventDefault() || input.blur();
            else if (event.key === 'Escape') {
                input.value = display.textContent === 'Untitled' ? '' : display.textContent;
                toggle(true);
            }
        });
        input.addEventListener('htmx:beforeRequest', () => {
            if (input.value.trim().replace(/\s/g, '').length > 30) {
                LibriscanUtils.showToast('Identifier too long', 'error');
                return false;
            }
        });
    });
    
    document.body.addEventListener('htmx:afterRequest', (event) => {
        const input = event.target;
        if (!input.classList.contains('page-identifier-input')) return;
        const card = input.closest('.page-card');
        const display = card.querySelector('.page-identifier-display');
        const btn = card.querySelector('.edit-identifier-btn');
        const xhr = event.detail.xhr;
        
        try {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status === 200) {
                display.textContent = data.display;
                display.classList.remove('hidden');
                input.classList.add('hidden');
                btn.classList.remove('hidden');
                LibriscanUtils.showToast('Updated', 'success');
            } else {
                LibriscanUtils.showToast(data.error || 'Failed', 'error');
            }
        } catch {
            LibriscanUtils.showToast('Failed', 'error');
        }
    });
});

