/* ==========================================================
   Inventory Management System — Analytics Page
   Sets up 4 charts: line, bar, doughnut, time series.
   ========================================================== */
(function () {
    'use strict';

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

    const PALETTE = [
        '#a78bfa', '#f472b6', '#38bdf8', '#facc15',
        '#34d399', '#fb923c', '#f87171', '#818cf8',
    ];

    /* ================= 1. LINE — value per top product ================= */
    function buildLineChart() {
        const canvas = document.getElementById('lineChart');
        if (!canvas) return;

        const data = window.__chartData.line;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height || 300);
        grad.addColorStop(0, 'rgba(167, 139, 250, 0.35)');
        grad.addColorStop(1, 'rgba(167, 139, 250, 0)');

        new Chart(canvas, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Value (₱)',
                    data: data.values,
                    borderColor: '#a78bfa',
                    backgroundColor: grad,
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
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (c) => '  ₱' + Number(c.parsed.y).toLocaleString('en-PH', {
                                minimumFractionDigits: 2, maximumFractionDigits: 2,
                            }),
                        },
                    },
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#71717a', maxRotation: 0, autoSkip: true },
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: {
                            color: '#71717a',
                            callback: (v) => '₱' + Number(v).toLocaleString('en-PH'),
                        },
                    },
                },
            },
        });
    }

    /* ================= 2. BAR — top products by quantity ================= */
    function buildBarChart() {
        const canvas = document.getElementById('barChart');
        if (!canvas) return;

        const data = window.__chartData.bar;

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Quantity',
                    data: data.values,
                    backgroundColor: PALETTE.slice(0, data.labels.length),
                    borderRadius: 8,
                    borderSkipped: false,
                    maxBarThickness: 40,
                    hoverBackgroundColor: '#c4b5fd',
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (c) => '  ' + c.parsed.y + ' units',
                        },
                    },
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#71717a', maxRotation: 0, autoSkip: true },
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#71717a', precision: 0 },
                    },
                },
            },
        });
    }

    /* ================= 3. PIE (doughnut) — categories ================= */
    function buildDoughnutChart() {
        const canvas = document.getElementById('doughnutChart');
        if (!canvas) return;

        const data = window.__chartData.pie;

        new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: PALETTE.slice(0, data.labels.length),
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
                            label: (c) => {
                                const total = c.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = total ? ((c.parsed / total) * 100).toFixed(1) : 0;
                                return '  ' + c.parsed + ' product(s)  (' + pct + '%)';
                            },
                        },
                    },
                },
            },
        });
    }

    /* ================= 4. TIME SERIES — 7-day activity ================= */
    function buildTimeSeriesChart() {
        const canvas = document.getElementById('timeSeriesChart');
        if (!canvas) return;

        const data = window.__chartData.ts;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height || 300);
        grad.addColorStop(0, 'rgba(244, 114, 182, 0.45)');
        grad.addColorStop(1, 'rgba(244, 114, 182, 0)');

        new Chart(canvas, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Products added',
                    data: data.values,
                    borderColor: '#f472b6',
                    backgroundColor: grad,
                    borderWidth: 2.5,
                    tension: 0.35,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: '#0d0d14',
                    pointBorderColor: '#f472b6',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7,
                    pointHoverBackgroundColor: '#f472b6',
                    pointHoverBorderColor: '#ffffff',
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (c) => '  ' + c.parsed.y + ' product(s)',
                        },
                    },
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#71717a' },
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#71717a', precision: 0 },
                    },
                },
            },
        });
    }

    /* ---------- Boot ---------- */
    document.addEventListener('DOMContentLoaded', () => {
        initIcons();
        bindSidebarToggle();
        setupChartDefaults();
        buildLineChart();
        buildBarChart();
        buildDoughnutChart();
        buildTimeSeriesChart();
    });
})();