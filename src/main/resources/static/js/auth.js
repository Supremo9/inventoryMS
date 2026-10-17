/* ==========================================================
   Inventory Management System — Auth Pages
   Handles: password toggles, Lucide init, shake-on-error,
            and small UX niceties for login/register.
   ========================================================== */
(function () {
    'use strict';

    /* ---------- Lucide icons ---------- */
    function initIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /* ---------- Password visibility toggle ---------- */
    function togglePassword(fieldId, btn) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const isText = field.type === 'text';
        field.type = isText ? 'password' : 'text';

        btn.innerHTML = isText
            ? '<i data-lucide="eye" class="w-4 h-4"></i>'
            : '<i data-lucide="eye-off" class="w-4 h-4"></i>';

        initIcons();
    }

    /* ---------- Auto-bind password toggle buttons ---------- */
    function bindPasswordToggles() {
        document.querySelectorAll('[data-password-toggle]').forEach(function (btn) {
            const targetId = btn.getAttribute('data-password-toggle');
            btn.addEventListener('click', function () {
                togglePassword(targetId, btn);
            });
        });
    }

    /* ---------- Shake form on error ---------- */
    function shakeIfError() {
        const hasError =
            document.querySelector('.auth-alert-error') ||
            new URLSearchParams(window.location.search).has('error');

        if (hasError) {
            const form = document.querySelector('form');
            if (form) {
                form.classList.add('shake');
                // Remove the class after the animation so it can be re-triggered
                setTimeout(() => form.classList.remove('shake'), 600);
            }
        }
    }

    /* ---------- Focus the first input with an error ---------- */
    function focusFirstError() {
        const errorEl = document.querySelector('.text-red-400');
        if (!errorEl) return;

        // Walk backward to find the associated input in the same wrapper
        let wrapper = errorEl.closest('div');
        while (wrapper && !wrapper.querySelector('input')) {
            wrapper = wrapper.parentElement;
        }
        if (wrapper) {
            const input = wrapper.querySelector('input');
            if (input) input.focus();
        }
    }

    /* ---------- Boot ---------- */
    document.addEventListener('DOMContentLoaded', function () {
        initIcons();
        bindPasswordToggles();
        shakeIfError();
        focusFirstError();
    });
})();