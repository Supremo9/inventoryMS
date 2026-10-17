/* ==========================================================
   Profile Page — sidebar toggle, avatar preview, auto-dismiss
   ========================================================== */
(function () {
    'use strict';

    function initIcons() {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

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

    /* ---------- Live avatar preview ---------- */
    function bindAvatarPreview() {
        const input = document.getElementById('avatar-input');
        const preview = document.getElementById('avatar-preview');
        const submitBtn = document.getElementById('avatar-submit');
        const form = document.getElementById('avatar-form');

        if (!input || !preview || !form) return;

        input.addEventListener('change', () => {
            const file = input.files && input.files[0];
            if (!file) return;

            // Show preview
            const url = URL.createObjectURL(file);
            preview.innerHTML = '<img src="' + url + '" alt="Preview" />';

            // Auto-submit the form
            if (submitBtn) submitBtn.click();
        });
    }

    /* ---------- Auto-dismiss alerts ---------- */
    function autoDismissAlerts() {
        document.querySelectorAll('.p-alert').forEach((alert) => {
            setTimeout(() => {
                alert.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                alert.style.opacity = '0';
                alert.style.transform = 'translateY(-8px)';
                setTimeout(() => alert.remove(), 400);
            }, 3500);
        });
    }

    /* ---------- Confirm remove image ---------- */
    function bindRemoveImage() {
        const btn = document.getElementById('remove-avatar-btn');
        if (!btn) return;
        btn.addEventListener('click', (e) => {
            if (!confirm('Remove your profile image?')) e.preventDefault();
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initIcons();
        bindSidebarToggle();
        bindAvatarPreview();
        autoDismissAlerts();
        bindRemoveImage();
    });
})();