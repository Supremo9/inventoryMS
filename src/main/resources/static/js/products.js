/* ==========================================================
   Inventory Management System — Products Page
   Handles: sidebar, create/edit panels, delete modal,
            live search, row animations, toasts.
   ========================================================== */
(function () {
    'use strict';

    function initIcons() {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    /* ================= SIDEBAR ================= */
    function bindSidebarToggle() {
        const toggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');
        if (!toggle || !sidebar) return;

        toggle.addEventListener('click', () => sidebar.classList.toggle('open'));

        document.addEventListener('click', (e) => {
            if (window.innerWidth >= 1024) return;
            if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    /* ================= SLIDE PANELS (create + edit) ================= */
    function bindPanels() {
        const backdrop = document.getElementById('slide-backdrop');
        const panels = {
            create: document.getElementById('panel-create'),
            edit: document.getElementById('panel-edit'),
        };

        const open = (key) => {
            const panel = panels[key];
            if (!panel) return;
            panel.classList.add('open');
            if (backdrop) backdrop.classList.add('open');
            document.body.style.overflow = 'hidden';

            // Trigger stagger animation on the panel's children
            const inner = panel.querySelector('.panel-animate');
            if (inner) {
                inner.classList.remove('panel-animate');
                void inner.offsetWidth; // force reflow to restart animation
                inner.classList.add('panel-animate');
            }
        };

        const closeAll = () => {
            Object.values(panels).forEach((p) => p && p.classList.remove('open'));
            if (backdrop) backdrop.classList.remove('open');
            document.body.style.overflow = '';
        };

        document.querySelectorAll('[data-open-panel]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const key = btn.getAttribute('data-open-panel');
                if (key === 'edit') {
                    populateEditForm(btn);
                }
                open(key);
            });
        });

        document.querySelectorAll('[data-close-panel]').forEach((btn) => {
            btn.addEventListener('click', closeAll);
        });

        if (backdrop) backdrop.addEventListener('click', closeAll);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeAll();
        });

        // Auto-open if the server said so (validation error)
        const autoOpen = document.body.getAttribute('data-open-panel');
        if (autoOpen && panels[autoOpen]) open(autoOpen);
    }

    /* ---------- Populate edit form from data attributes ---------- */
    function populateEditForm(btn) {
        const form = document.getElementById('edit-form');
        if (!form) return;

        const id = btn.getAttribute('data-product-id') || '';
        const name = btn.getAttribute('data-product-name') || '';
        const category = btn.getAttribute('data-product-category') || '';
        const price = btn.getAttribute('data-product-price') || '';
        const quantity = btn.getAttribute('data-product-quantity') || '';

        // Update form action to include the id
        form.setAttribute('action', '/products/update/' + id);

        // Set values
        const set = (name, val) => {
            const el = form.querySelector('[name="' + name + '"]');
            if (el) el.value = val;
        };
        set('name', name);
        set('category', category);
        set('price', price);
        set('quantity', quantity);

        // Update the "Updating product #N" label
        const idLabel = document.getElementById('edit-id-label');
        if (idLabel) idLabel.textContent = id;

        // Flash the pencil icon
        btn.classList.remove('action-btn-flash');
        void btn.offsetWidth;
        btn.classList.add('action-btn-flash');
    }

    /* ================= DELETE MODAL ================= */
    function bindDeleteModal() {
        const modal = document.getElementById('delete-modal');
        const backdrop = document.getElementById('delete-modal-backdrop');
        const form = document.getElementById('delete-form');
        const nameEl = document.getElementById('delete-product-name');
        const idEl = document.getElementById('delete-product-id');

        if (!modal || !backdrop || !form) return;

        let pendingRow = null;

        const open = (btn, row) => {
            const id = btn.getAttribute('data-product-id');
            const name = btn.getAttribute('data-product-name');
            form.setAttribute('action', '/products/delete/' + id);
            if (nameEl) nameEl.textContent = name || 'this product';
            if (idEl) idEl.textContent = '#' + id;
            pendingRow = row;

            modal.classList.add('open');
            backdrop.classList.add('open');
            document.body.style.overflow = 'hidden';

            // Focus the cancel button first (safer default)
            setTimeout(() => {
                const cancel = modal.querySelector('[data-close-delete]');
                if (cancel) cancel.focus();
            }, 100);
        };

        const close = () => {
            modal.classList.remove('open');
            backdrop.classList.remove('open');
            document.body.style.overflow = '';
            pendingRow = null;
        };

        document.querySelectorAll('[data-delete-product]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const row = btn.closest('tr[data-row]');
                open(btn, row);
            });
        });

        document.querySelectorAll('[data-close-delete]').forEach((btn) => {
            btn.addEventListener('click', close);
        });

        backdrop.addEventListener('click', close);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('open')) close();
        });

        // On confirm, animate the row out, then submit
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (pendingRow) {
                pendingRow.classList.add('row-removing');
            }
            // Let the animation play, then submit
            setTimeout(() => form.submit(), 400);
        });
    }

    /* ================= LIVE CLIENT-SIDE SEARCH ================= */
    function bindLiveSearch() {
        const input = document.getElementById('search-input');
        const table = document.getElementById('products-table');
        if (!input || !table) return;

        input.addEventListener('input', () => {
            const q = input.value.trim().toLowerCase();
            let visible = 0;

            table.querySelectorAll('tbody tr[data-row]').forEach((row) => {
                const match = row.textContent.toLowerCase().includes(q);
                row.style.display = match ? '' : 'none';
                if (match) visible++;
            });

            const empty = document.getElementById('no-results');
            if (empty) empty.classList.toggle('hidden', visible !== 0);
        });
    }

    /* ================= TOAST AUTO-DISMISS ================= */
    function autoDismissToast() {
        const toast = document.getElementById('toast');
        if (!toast) return;
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }

    /* ================= ROW ENTRANCE ANIMATION ================= */
    function animateRows() {
        document.querySelectorAll('tr[data-row]').forEach((row, i) => {
            row.style.animationDelay = (i * 0.03) + 's';
            row.classList.add('row-entering');
        });
    }

    /* ================= BOOT ================= */
    document.addEventListener('DOMContentLoaded', () => {
        initIcons();
        bindSidebarToggle();
        bindPanels();
        bindDeleteModal();
        bindLiveSearch();
        autoDismissToast();
        animateRows();
    });
})();