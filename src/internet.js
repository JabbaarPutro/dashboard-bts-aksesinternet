(function() {
    let mapInstance;
    let geojsonLayer;
    const markers = L.layerGroup();
    const MIN_ZOOM_FOR_MARKERS = 6;
    let allPointData = [];
    let provinceData = {};
    let legendControl = null;

    let layananFilterTypes = [];
    let selectedLayananFilters = [];

    const config = {
        title: 'Dashboard Sebaran Akses Internet',
        mapTitle: 'Peta Sebaran Akses Internet Nasional',
        statLabels: { total: 'Total Lokasi', status1: 'Aktif', status2: 'Dalam Instalasi' },
        statusOptions: [ { value: 'Aktif', text: 'Aktif' }, { value: 'Dalam Instalasi', text: 'Dalam Instalasi' } ],
        networkLabel: 'Jenis Layanan'
    };

    const internetDashboard = {
        init: async function(map) {
            console.log("Inisialisasi dashboard Internet...");
            mapInstance = map;
            
            try {
                const response = await fetch(`/api/data?type=internet`);
                if (!response.ok) throw new Error('Gagal terhubung ke server.');
                const dataFromServer = await response.json();

                allPointData = dataFromServer.pointData;
                provinceData = dataFromServer.provinceData;
                
                layananFilterTypes = dataFromServer.filters.jenis_layanan || [];
                selectedLayananFilters = [...layananFilterTypes];
                
                document.getElementById('filters-container').innerHTML = getFilterHtml();
                updateDashboardUI(dataFromServer.lastUpdated);
                
                const geoJsonResponse = await fetch('/IndonesiaProvinsi.geojson');
                const geoJsonData = await geoJsonResponse.json();
                geojsonLayer = L.geoJSON(geoJsonData, { style, onEachFeature }).addTo(mapInstance);

                updatePointMarkers();
                addLegend();
                attachEventListeners();
                
            } catch (error) {
                console.error('Gagal memuat data Internet:', error);
                document.getElementById('error-message').classList.remove('hidden');
            }
        },

        destroy: function() {
            console.log("Membersihkan dashboard Internet...");
            if (geojsonLayer) geojsonLayer.remove();
            if (mapInstance.hasLayer(markers)) mapInstance.removeLayer(markers);
            markers.clearLayers();
            document.getElementById('filters-container').innerHTML = '';
            if (legendControl) { mapInstance.removeControl(legendControl); legendControl = null; }
            mapInstance.off('zoomend', toggleMarkersBasedOnZoom);
            mapInstance.off('click');
            mapInstance.off('zoomstart');
            document.getElementById('main-title').textContent = 'Dashboard';
            document.getElementById('map-title').textContent = 'Peta Sebaran';
            document.getElementById('last-updated').textContent = 'Memilih tampilan...';
            ['stat-total', 'stat-on-air', 'stat-on-progress'].forEach(id => document.getElementById(id).textContent = '0');
            document.getElementById('stat-label-total').textContent = 'Total';
            document.getElementById('stat-label-status1').textContent = 'Status 1';
            document.getElementById('stat-label-status2').textContent = 'Status 2';
            document.getElementById('tooltip').style.display = 'none';
        }
    };
    
    function updatePointMarkers() {
        markers.clearLayers();
        const statusFilter = document.getElementById('status-filter').value;
        
        allPointData.forEach(point => {
            const statusMatch = statusFilter === 'semua' || point.status === statusFilter;
            const layananMatch = selectedLayananFilters.length === 0 || selectedLayananFilters.includes(point.jenis_layanan);
            
            if (statusMatch && layananMatch) {
                const icon = createCustomIcon(point.status);
                const marker = L.marker([point.lat, point.lon], { icon });
                marker.bindPopup(`
                    <div class="popup-content">
                        <b>${point.nama_situs}</b><br>
                        ${point.kabupaten}<br>
                        Status: <span class="status-${point.status.replace(/\s+/g, '-').toLowerCase()}">${point.status}</span><br>
                        Layanan: <span class="network-type">${point.jenis_layanan || 'N/A'}</span>
                    </div>
                `);
                markers.addLayer(marker);
            }
        });
        updateFilteredStats();
        toggleMarkersBasedOnZoom();
    }
    
    function updateFilteredStats() {
        const statusFilter = document.getElementById('status-filter').value;
        const filteredPoints = allPointData.filter(p => {
            const statusMatch = (statusFilter === 'semua' || p.status === statusFilter);
            const layananMatch = (selectedLayananFilters.length === 0 || selectedLayananFilters.includes(p.jenis_layanan));
            return statusMatch && layananMatch;
        });
        
        const totalFiltered = filteredPoints.length;
        const status1Value = config.statusOptions[0].value;
        const status1Filtered = filteredPoints.filter(p => p.status === status1Value).length;
        const status2Filtered = totalFiltered - status1Filtered;
        document.getElementById('stat-total').textContent = totalFiltered.toLocaleString('id-ID');
        document.getElementById('stat-on-air').textContent = status1Filtered.toLocaleString('id-ID');
        document.getElementById('stat-on-progress').textContent = status2Filtered.toLocaleString('id-ID');
    }

    function getFilterHtml() {
        return `
            <div id="status-dropdown" class="relative w-full sm:w-60">
                <input type="hidden" id="status-filter" value="semua">
                <button id="status-dropdown-button" type="button" class="relative w-full cursor-default rounded-full bg-white py-2.5 pl-4 pr-10 text-left text-slate-700 shadow-md"><span id="status-selected-text" class="block truncate">Semua Status</span><span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"><svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg></span></button>
                <ul id="status-dropdown-options" class="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white hidden shadow-lg py-1"></ul>
            </div>
            <div id="layanan-dropdown" class="relative w-full sm:w-60">
                <button id="layanan-dropdown-button" type="button" class="relative w-full cursor-default rounded-full bg-white py-2.5 pl-4 pr-10 text-left text-slate-700 shadow-md"><span id="layanan-selected-text" class="block truncate">Semua Jenis Layanan</span><span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"><svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg></span></button>
                <ul id="layanan-dropdown-options" class="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white hidden shadow-lg"></ul>
            </div>
        `;
    }

    function createCheckboxFilter(containerId, buttonId, textId, filterData, selectedDataArray, label) {
        const container = document.getElementById(containerId);
        const button = document.getElementById(buttonId);
        const textElement = document.getElementById(textId);
        if (!container || !button || !textElement) return;
        container.innerHTML = '';
        const controlsHtml = `<div class="flex items-center justify-between px-3 py-2 border-b border-slate-200"><button data-action="select-all" class="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">Pilih Semua</button><button data-action="deselect-all" class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">Hapus Semua</button></div>`;
        container.insertAdjacentHTML('beforeend', controlsHtml);
        filterData.forEach(filter => {
            const li = document.createElement('li');
            li.className = 'text-slate-900 relative cursor-pointer select-none py-2 px-3 group';
            li.innerHTML = `<label class="flex items-center w-full h-full cursor-pointer"><input type="checkbox" value="${filter}" class="network-checkbox w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" checked><span class="font-normal block truncate ml-3">${filter}</span></label>`;
            container.appendChild(li);
        });
        const updateText = () => {
            if (selectedDataArray.length === 0 || selectedDataArray.length === filterData.length) {
                textElement.textContent = `Semua ${label}`;
            } else {
                textElement.textContent = `${selectedDataArray.length} ${label} Terpilih`;
            }
        };
        button.addEventListener('click', () => container.classList.toggle('hidden'));
        container.addEventListener('click', e => e.stopPropagation());
        container.querySelector('[data-action="select-all"]').addEventListener('click', () => {
            selectedDataArray.splice(0, selectedDataArray.length, ...filterData);
            container.querySelectorAll('.network-checkbox').forEach(cb => cb.checked = true);
            updateText();
            updatePointMarkers();
        });
        container.querySelector('[data-action="deselect-all"]').addEventListener('click', () => {
            selectedDataArray.length = 0;
            container.querySelectorAll('.network-checkbox').forEach(cb => cb.checked = false);
            updateText();
            updatePointMarkers();
        });
        container.querySelectorAll('.network-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const value = checkbox.value;
                if (checkbox.checked) {
                    if (!selectedDataArray.includes(value)) selectedDataArray.push(value);
                } else {
                    const index = selectedDataArray.indexOf(value);
                    if (index > -1) selectedDataArray.splice(index, 1);
                }
                updateText();
                updatePointMarkers();
            });
        });
        updateText();
    }
    
    function attachEventListeners() {
        const tooltip = document.getElementById('tooltip');
        mapInstance.on('zoomend', toggleMarkersBasedOnZoom);
        mapInstance.on('zoomstart', () => { tooltip.style.display = 'none'; });
        mapInstance.on('click', (e) => { 
            if (!e.originalEvent.target.closest('.leaflet-interactive')) { 
                tooltip.style.display = 'none'; 
                if (geojsonLayer) geojsonLayer.eachLayer(layer => geojsonLayer.resetStyle(layer)); 
            } 
        });
        
        const statusBtn = document.getElementById('status-dropdown-button');
        const statusOpts = document.getElementById('status-dropdown-options');
        statusBtn.addEventListener('click', () => {
            document.getElementById('layanan-dropdown-options').classList.add('hidden');
            statusOpts.classList.toggle('hidden');
        });
        statusOpts.addEventListener('click', (e) => {
            const li = e.target.closest('li');
            if(!li) return;
            document.getElementById('status-filter').value = li.dataset.value;
            document.getElementById('status-selected-text').textContent = li.textContent.trim();
            statusOpts.querySelectorAll('li').forEach(item => { item.classList.remove('active'); item.querySelector('.check-icon').classList.add('hidden'); });
            li.classList.add('active'); li.querySelector('.check-icon').classList.remove('hidden');
            statusOpts.classList.add('hidden');
            updatePointMarkers();
        });

        createCheckboxFilter(
            'layanan-dropdown-options',
            'layanan-dropdown-button',
            'layanan-selected-text',
            layananFilterTypes,
            selectedLayananFilters,
            'Layanan'
        );

        window.addEventListener('click', (e) => {
            if (!e.target.closest('#status-dropdown')) statusOpts.classList.add('hidden');
            if (!e.target.closest('#layanan-dropdown')) document.getElementById('layanan-dropdown-options').classList.add('hidden');
        });
    }

    function updateDashboardUI(lastUpdated) {
        document.getElementById('main-title').textContent = config.title;
        document.getElementById('map-title').textContent = config.mapTitle;
        document.getElementById('last-updated').textContent = `Terakhir Diperbaharui - ${lastUpdated || 'N/A'}`;
        document.getElementById('stat-label-total').textContent = config.statLabels.total;
        document.getElementById('stat-label-status1').textContent = config.statLabels.status1;
        document.getElementById('stat-label-status2').textContent = config.statLabels.status2;
        
        const statusOptionsContainer = document.getElementById('status-dropdown-options');
        statusOptionsContainer.innerHTML = `
            <li class="text-slate-900 relative cursor-default select-none py-2 pl-3 pr-9 group active" data-value="semua">
                <span class="font-normal block truncate">Semua Status</span>
                <span class="text-blue-600 absolute inset-y-0 right-0 items-center pr-4 check-icon flex"><svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clip-rule="evenodd" /></svg></span>
            </li>
            ${config.statusOptions.map(opt => `
                <li class="text-slate-900 relative cursor-default select-none py-2 pl-3 pr-9 group" data-value="${opt.value}">
                    <span class="font-normal block truncate">${opt.text}</span>
                    <span class="text-blue-600 absolute inset-y-0 right-0 items-center pr-4 check-icon hidden"><svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clip-rule="evenodd" /></svg></span>
                </li>
            `).join('')}
        `;
    }
    
function createCustomIcon(status) {
    const isPrimaryStatus = status === 'Aktif';
    const color = isPrimaryStatus ? '#3b82f6' : '#f97316';
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="20px" height="20px" style="filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.3));">
        <circle cx="12" cy="12" r="10"/>
    </svg>`;
    return L.divIcon({
        html: svgIcon,
        className: '',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
}

function style(feature) {
    const provinceName = feature.properties.state;
    const data = provinceData[provinceName.toUpperCase()];
    const total = data ? data.total : 0;
    return {
        fillColor: getColor(total),
        weight: 1,
        opacity: 1,
        color: '#e2e8f0',
        fillOpacity: 0.7
    };
}

function getColor(d) {
    return d > 100 ? '#06417b' :
           d > 50 ? '#08519c' :
           d > 25 ? '#3182bd' :
           d > 10 ? '#6baed6' :
           d > 0 ? '#9ecae1' : '#c6dbef';
}

function addLegend() {
    legendControl = L.control({ position: "bottomright" });
    legendControl.onAdd = function() {
        const div = L.DomUtil.create("div", "info legend");
        const grades = [0, 10, 25, 50, 100];
        let labels = ["<strong>Total Titik per Provinsi</strong>"];
        
        for (let i = 0; i < grades.length; i++) {
            labels.push(
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] : '+')
            );
        }
        div.innerHTML = labels.join('<br>');
        return div;
    };
    legendControl.addTo(mapInstance);
}

function toggleMarkersBasedOnZoom() {
    const zoom = mapInstance.getZoom();
    if (zoom >= MIN_ZOOM_FOR_MARKERS) {
        if (!mapInstance.hasLayer(markers)) mapInstance.addLayer(markers);
    } else {
        if (mapInstance.hasLayer(markers)) mapInstance.removeLayer(markers);
    }
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: (e) => {
            const hoveredLayer = e.target;
            hoveredLayer.setStyle({ weight: 3, color: '#1E40AF', fillOpacity: 0.9 }).bringToFront();

            updateInfo(hoveredLayer);
            const tooltip = document.getElementById('tooltip');
            tooltip.style.display = 'block';
        },
        mousemove: (e) => {
            const tooltip = document.getElementById('tooltip');
            const mapContainer = document.getElementById('map');
            const mapRect = mapContainer.getBoundingClientRect();
            
            const offsetX = 15;
            const offsetY = 15;
            const tooltipWidth = tooltip.offsetWidth;
            const tooltipHeight = tooltip.offsetHeight;
            
            let x = e.containerPoint.x + offsetX;
            let y = e.containerPoint.y + offsetY;
            
            if (x + tooltipWidth > mapRect.width) {
                x = e.containerPoint.x - tooltipWidth - offsetX;
            }
            
            if (y + tooltipHeight > mapRect.height) {
                y = e.containerPoint.y - tooltipHeight - offsetY;
            }
            
            x = Math.max(10, x);
            y = Math.max(10, y);
            
            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
        },
        mouseout: (e) => {
            if (geojsonLayer) geojsonLayer.resetStyle(e.target);
            document.getElementById('tooltip').style.display = 'none';
        },
        click: (e) => {
            mapInstance.fitBounds(e.target.getBounds());
        }
    });
}

function updateInfo(layer) {
    const tooltip = document.getElementById('tooltip');
    const props = layer.feature.properties;
    const provinceName = props.state;
    const data = provinceData[provinceName.toUpperCase()];
    let content;
    
    if (data) {
        const { total, onAir, dalamPembangunan, regencies } = data;
        let regencyListHtml = (regencies && Object.keys(regencies).length > 0)
            ? Object.entries(regencies)
                .sort(([, a], [, b]) => b.total - a.total)
                .map(([name, counts]) => `
                    <div class="regency-item">
                        <span class="regency-name">${name}</span>
                        <div class="regency-counts">
                            <span class="regency-count blue">${counts.onAir || 0}</span>
                            <span class="regency-count orange">${counts.dalamPembangunan || 0}</span>
                        </div>
                    </div>
                `).join('')
            : '<div class="regency-item"><span class="regency-name">Data kabupaten tidak tersedia.</span></div>';
            
        content = `
            <div class="province-name">${provinceName.toUpperCase()}</div>
            <div class="stats-container">
                <div class="total-bts">
                    <div class="total-label">${config.statLabels.total}</div>
                    <div class="total-number">${total || 0}</div>
                </div>
                <div class="status-indicators">
                    <div class="status-item">
                        <span class="status-dot blue"></span>
                        <span class="status-blue">${config.statLabels.status1} : ${onAir || 0}</span>
                    </div>
                    <div class="status-item">
                        <span class="status-dot orange"></span>
                        <span class="status-orange">${config.statLabels.status2} : ${dalamPembangunan || 0}</span>
                    </div>
                </div>
            </div>
            <div class="regency-section">
                <div class="regency-title">Sebaran per Kabupaten/Kota</div>
                <div class="regency-list">${regencyListHtml}</div>
            </div>
        `;
    } else {
        content = `
            <div class="province-name">${provinceName ? provinceName.toUpperCase() : 'PROVINSI TIDAK DIKENAL'}</div>
            <div class="stats-container">
                <div class="total-bts">
                    <div class="total-label">Total</div>
                    <div class="total-number">0</div>
                </div>
            </div>
            <div class="regency-section">
                <div class="regency-title">Data tidak tersedia</div>
            </div>
        `;
    }
    tooltip.innerHTML = content;
}

function calculateTooltipPosition(clickPoint, tooltipElement) {
    const mapContainer = document.getElementById("map");
    const mapRect = mapContainer.getBoundingClientRect();
    
    tooltipElement.style.display = "block";
    tooltipElement.style.visibility = "hidden";
    
    const tooltipRect = tooltipElement.getBoundingClientRect();
    const relativeX = clickPoint.x;
    const relativeY = clickPoint.y;
    
    const spaceOnRight = mapRect.width - relativeX;
    const spaceOnLeft = relativeX;
    const tooltipWidth = tooltipRect.width;
    
    const spaceBelow = mapRect.height - relativeY;
    const spaceAbove = relativeY;
    const tooltipHeight = tooltipRect.height;
    
    let finalX, finalY;
    const offsetX = 15;
    const offsetY = 15;
    
    // Horizontal positioning
    if (spaceOnRight >= tooltipWidth + offsetX) {
        finalX = relativeX + offsetX;
    } else if (spaceOnLeft >= tooltipWidth + offsetX) {
        finalX = relativeX - tooltipWidth - offsetX;
    } else {
        finalX = Math.max(10, Math.min(relativeX - tooltipWidth / 2, mapRect.width - tooltipWidth - 10));
    }
    
    // Vertical positioning
    if (spaceBelow >= tooltipHeight + offsetY) {
        finalY = relativeY + offsetY;
    } else if (spaceAbove >= tooltipHeight + offsetY) {
        finalY = relativeY - tooltipHeight - offsetY;
    } else {
        finalY = Math.max(10, Math.min(relativeY - tooltipHeight / 2, mapRect.height - tooltipHeight - 10));
    }
    
    finalX = Math.max(10, Math.min(finalX, mapRect.width - tooltipWidth - 10));
    finalY = Math.max(10, Math.min(finalY, mapRect.height - tooltipHeight - 10));
    
    tooltipElement.style.visibility = "visible";
    return { x: finalX, y: finalY };
}
    window.internetDashboard = internetDashboard;
})();