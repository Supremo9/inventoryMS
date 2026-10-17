/* ==========================================================
   Inventory Management System — Dashboard v2
   Handles: sidebar toggle, slide-in panel, Chart.js setup.
   ========================================================== */
(function () {
    'use strict';

    /* ---------- Lucide ---------- */
    function initIcons() {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    /* ---------- Mobile sidebar ---------- */
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

    /* ---------- Slide-in Add Product panel ---------- */
    function bindSlidePanel() {
        const panel = document.getElementById('add-panel');
        const backdrop = document.getElementById('add-panel-backdrop');
        if (!panel || !backdrop) return;

        const openBtns = document.querySelectorAll('[data-open-panel]');
        const closeBtns = document.querySelectorAll('[data-close-panel]');

        const open = () => {
            panel.classList.add('open');
            backdrop.classList.add('open');
            document.body.style.overflow = 'hidden';
        };
        const close = () => {
            panel.classList.remove('open');
            backdrop.classList.remove('open');
            document.body.style.overflow = '';
        };

        openBtns.forEach((b) => b.addEventListener('click', open));
        closeBtns.forEach((b) => b.addEventListener('click', close));
        backdrop.addEventListener('click', close);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

        // Auto-open if server-side validation errors exist
        if (document.querySelector('#add-panel [data-has-error="true"]')) open();
    }

    /* ---------- Chart.js defaults ---------- */
    function setupChartDefaults() {
        if (typeof Chart === 'undefined') return;
        Chart.defaults.color = '#9ca3af';
        Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
        Chart.defaults.font.size = 12;
        Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';
        Chart.defaults.plugins.legend.display = false;
        Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 15, 22, 0.95)';
        Chart.defaults.plugins.tooltip.borderColor = 'rgba(139, 92, 246, 0.3)';
        Chart.defaults.plugins.tooltip.borderWidth = 1;
        Chart.defaults.plugins.tooltip.padding = 10;
        Chart.defaults.plugins.tooltip.cornerRadius = 8;
        Chart.defaults.plugins.tooltip.titleColor = '#ffffff';
        Chart.defaults.plugins.tooltip.bodyColor = '#d4d4d8';
    }

    /* ---------- Line Chart: Inventory value by product ---------- */
    function buildLineChart() {
        const canvas = document.getElementById('lineChart');
        if (!canvas) return;

        const data = window.__lineChartData || { labels: [], values: [] };

        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 300);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.35)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.0)');

        new Chart(canvas, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Stock Value',
                    data: data.values,
                    borderColor: '#a78bfa',
                    backgroundColor: gradient,
                    borderWidth: 2.5,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: '#0d0d14',
                    pointBorderColor: '#a78bfa',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7,
                    pointHoverBackgroundColor: '#a78bfa',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 2,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (ctx) => '  ₱' + Number(ctx.parsed.y).toLocaleString('en-PH', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }),
                        },
                    },
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#71717a', font: { size: 11 } },
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: {
                            color: '#71717a',
                            font: { size: 11 },
                            callback: (v) => '₱' + Number(v).toLocaleString('en-PH'),
                        },
                    },
                },
            },
        });
    }

    /* ---------- Doughnut Chart: Category distribution ---------- */
    function buildDoughnutChart() {
        const canvas = document.getElementById('doughnutChart');
        if (!canvas) return;

        const data = window.__doughnutChartData || { labels: [], values: [] };

        const palette = [
            '#a78bfa', '#f472b6', '#38bdf8', '#facc15',
            '#34d399', '#fb923c', '#f87171', '#818cf8',
        ];

        new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: palette.slice(0, data.labels.length),
                    borderColor: '#0d0d14',
                    borderWidth: 3,
                    hoverOffset: 10,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '68%',
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = total ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
                                return '  ' + ctx.parsed + ' item(s)  (' + pct + '%)';
                            },
                        },
                    },
                },
            },
        });
    }

    /* ---------- Boot ---------- */
    document.addEventListener('DOMContentLoaded', () => {
        initIcons();
        bindSidebarToggle();
        bindSlidePanel();
        setupChartDefaults();
        buildLineChart();
        buildDoughnutChart();
    });
})();