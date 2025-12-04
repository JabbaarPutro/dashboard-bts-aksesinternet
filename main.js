document.addEventListener('DOMContentLoaded', () => {

    const map = L.map('map', { 
        zoomControl: false, 
        attributionControl: false,
        maxBounds: [[-11.0, 95.0], [6.0, 141.0]],
        maxBoundsViscosity: 1.0, 
        minZoom: 5, 
        maxZoom: 19
    }).setView([-2.5489, 118.0149], 5);

    L.control.zoom({ position: 'topright' }).addTo(map);
    L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', {
        minZoom: 5, 
        maxZoom: 19, 
        subdomains: 'abcd',
        attribution: ''
    }).addTo(map);

    const dashboards = {
        bts: {
            path: './bts.js',
            objectName: 'btsDashboard'
        },
        internet: {
            path: './internet.js',
            objectName: 'internetDashboard'
        }
    };

    const btnBts = document.getElementById('btn-view-bts');
    const btnInternet = document.getElementById('btn-view-internet');
    let currentDashboard = null;

    /**
     * Fungsi untuk memuat file script secara dinamis
     * @param {string} path - URL ke file .js
     * @param {function} callback - Fungsi yang akan dijalankan setelah script dimuat
     */
    function loadScript(path, callback) {
        // Hapus script lama jika ada
        const oldScript = document.getElementById('dynamic-dashboard-script');
        if (oldScript) {
            oldScript.remove();
        }

        const script = document.createElement('script');
        script.id = 'dynamic-dashboard-script';
        script.src = path;
        script.onload = () => callback();
        document.head.appendChild(script);
    }

    function switchView(dashboardName) {
        if (currentDashboard && typeof currentDashboard.destroy === 'function') {
            currentDashboard.destroy();
        }

        const dashboardInfo = dashboards[dashboardName];
        if (!dashboardInfo) {
            console.error('Dashboard tidak ditemukan:', dashboardName);
            return;
        }

        loadScript(dashboardInfo.path, () => {
            currentDashboard = window[dashboardInfo.objectName];
            if (currentDashboard && typeof currentDashboard.init === 'function') {
                currentDashboard.init(map);
            }
        });
    }

    function updateButtonStyles(activeButton) {
        [btnBts, btnInternet].forEach(btn => {
            if (btn === activeButton) {
                btn.classList.add('bg-white', 'text-blue-600', 'shadow-md');
                btn.classList.remove('text-slate-600');
            } else {
                btn.classList.remove('bg-white', 'text-blue-600', 'shadow-md');
                btn.classList.add('text-slate-600');
            }
        });
    }

    btnBts.addEventListener('click', () => {
        updateButtonStyles(btnBts);
        switchView('bts');
    });

    btnInternet.addEventListener('click', () => {
        updateButtonStyles(btnInternet);
        switchView('internet');
    });

    updateButtonStyles(btnBts);
    switchView('bts');
});