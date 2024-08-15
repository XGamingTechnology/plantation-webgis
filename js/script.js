document.addEventListener('DOMContentLoaded', function () {
    // Initialize the map
    const map = L.map('map').setView([51.505, -0.09], 13);

    const basemaps = {
        osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }),
        satellite: L.tileLayer('https://{s}.tile.satellite.com/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.satellite.com/copyright">Satellite</a> contributors'
        })
    };

    // Add default basemap
    basemaps.osm.addTo(map);

    document.getElementById('basemap-select').addEventListener('change', function (event) {
        const selectedBasemap = event.target.value;

        // Remove all tile layers
        map.eachLayer(function (layer) {
            if (layer instanceof L.TileLayer) {
                map.removeLayer(layer);
            }
        });

        // Add selected basemap
        basemaps[selectedBasemap].addTo(map);
    });

     // Pindahkan kontrol zoom ke pojok kanan bawah
    map.zoomControl.setPosition('bottomright');

    // Define a function to create icons with specific opacity
    function createIcon(iconUrl, opacity) {
        return L.icon({
            iconUrl: iconUrl,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
            className: 'custom-icon',
        });
    }

    // Object to hold layer groups, opacities by category, and population counts
    const layerGroups = {};
    const categoryOpacities = {};
    const categoryCounts = {};  // Object to hold counts for each type of plant

    // Handle GeoJSON file selection
    document.getElementById('geojson-select').addEventListener('change', function (event) {
        const selectedGeojson = event.target.value;

        // Hide the checkbox container initially
        document.getElementById('layer-checkbox-container').style.display = 'none';

        // Clear previous checkboxes
        const layerCheckboxesDiv = document.getElementById('layer-checkboxes');
        layerCheckboxesDiv.innerHTML = '';

        // Clear existing layers and reset population counts
        Object.values(layerGroups).forEach(layerGroup => {
            map.removeLayer(layerGroup);
        });
        Object.keys(categoryCounts).forEach(category => {
            categoryCounts[category] = 0;
        });

        if (selectedGeojson === 'none') {
            return; // Do nothing if "None" is selected
        }

        // Fetch the selected GeoJSON data
        fetch(selectedGeojson)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('GeoJSON data:', data);

                if (!data || !data.features || data.features.length === 0) {
                    throw new Error('No features in GeoJSON data');
                }

                // First, count the total population per plant type
                data.features.forEach((feature) => {
                    if (feature.geometry.type === 'Point') {
                        const category = feature.properties.Jenis_Tumbuhan || 'Uncategorized';

                        // Increment the population count for this category
                        if (!categoryCounts[category]) {
                            categoryCounts[category] = 0;
                        }
                        categoryCounts[category]++;
                    }
                });

                // Then, create markers and popups
                const categories = new Set();
                data.features.forEach((feature) => {
                    if (feature.geometry.type === 'Point') {
                        const [lng, lat] = feature.geometry.coordinates;
                        const category = feature.properties.Jenis_Tumbuhan || 'Uncategorized';
                        categories.add(category);

                        if (!layerGroups[category]) {
                            layerGroups[category] = L.featureGroup();
                            categoryOpacities[category] = 1; // Default opacity
                        }

                        const iconUrl = `images/${category.toLowerCase().replace(/ /g, '-')}-marker.png`;
                        const marker = L.marker([lat, lng], { icon: createIcon(iconUrl, categoryOpacities[category]) })
                            .bindPopup(`
                                <div class="table-responsive">
                                    <table class="table table-sm table-striped">
                                        <tr><th>Jenis Tumbuhan:</th><td>${feature.properties.Jenis_Tumbuhan || ''}</td></tr>
                                        <tr><th>Kategori Tumbuhan:</th><td>${feature.properties.Kategori_Tumbuhan || ''}</td></tr>
                                        <tr><th>Kesehatan:</th><td>${feature.properties.kesehatan || ''}</td></tr>
                                        <tr><th>Skala Perkebunan:</th><td>${feature.properties.skala_perkebunan || ''}</td></tr>
                                        <tr><th>X:</th><td>${lng.toFixed(5)}</td></tr>
                                        <tr><th>Y:</th><td>${lat.toFixed(5)}</td></tr>
                                        <tr><th>Populasi:</th><td>${categoryCounts[category]}</td></tr>
                                    </table>
                                </div>
                            `);

                        // Apply the initial opacity
                        marker.on('add', function () {
                            const markerElement = marker.getElement();
                            if (markerElement) {
                                markerElement.style.opacity = categoryOpacities[category];
                            }
                        });

                        layerGroups[category].addLayer(marker);
                    }
                });

                categories.forEach(category => {
                    const categoryDiv = document.createElement('div');
                    categoryDiv.className = 'category-control';

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.value = category;
                    checkbox.id = `checkbox-${category}`;
                    checkbox.className = 'layer-checkbox';

                    const label = document.createElement('label');
                    label.htmlFor = checkbox.id;
                    label.textContent = category;

                    const legendIcon = document.createElement('img');
                    legendIcon.src = `images/${category.toLowerCase().replace(/ /g, '-')}-marker.png`;
                    legendIcon.style.width = '20px';
                    legendIcon.style.height = '20px';
                    legendIcon.style.verticalAlign = 'middle';
                    legendIcon.style.marginRight = '8px';

                    const slider = document.createElement('input');
                    slider.type = 'range';
                    slider.className = 'opacity-slider';
                    slider.min = '0';
                    slider.max = '1';
                    slider.step = '0.1';
                    slider.value = categoryOpacities[category];
                    slider.style.width = '100%';

                    checkbox.addEventListener('change', function () {
                        if (this.checked) {
                            map.addLayer(layerGroups[category]);
                        } else {
                            map.removeLayer(layerGroups[category]);
                        }
                    });

                    slider.addEventListener('input', function () {
                        categoryOpacities[category] = this.value;
                        layerGroups[category].eachLayer(layer => {
                            const markerElement = layer.getElement();
                            if (markerElement) {
                                markerElement.style.opacity = categoryOpacities[category];
                            }
                        });
                    });

                    categoryDiv.appendChild(legendIcon);
                    categoryDiv.appendChild(checkbox);
                    categoryDiv.appendChild(label);
                    categoryDiv.appendChild(slider);
                    layerCheckboxesDiv.appendChild(categoryDiv);
                });

                // Add layer groups to the map but hide them initially
                Object.values(layerGroups).forEach(layerGroup => {
                    map.addLayer(layerGroup);
                    map.removeLayer(layerGroup);
                });

                document.getElementById('layer-checkbox-container').style.display = 'block';
                map.fitBounds(Object.values(layerGroups).reduce((bounds, layerGroup) => bounds.extend(layerGroup.getBounds()), L.latLngBounds([])));
            })
            .catch(error => {
                console.error('Error fetching the GeoJSON data:', error);
            });
    });

    const sidebar = document.querySelector('.sidebar');
    const mapContainer = document.querySelector('.map-container');
    const sidebarToggle = document.getElementById('sidebar-toggle');

    // Function to check screen width and hide sidebar by default on mobile
    function checkScreenWidth() {
        if (window.innerWidth <= 576) {
            sidebar.classList.remove('visible');
            mapContainer.classList.remove('shifted');
            sidebarToggle.innerHTML = `<i class="fas fa-chevron-right"></i>`;
        } else {
            sidebar.classList.add('visible');
            mapContainer.classList.add('shifted');
            sidebarToggle.innerHTML = `<i class="fas fa-chevron-left"></i>`;
        }
    }

    // Run check on initial load and on window resize
    checkScreenWidth();
    window.addEventListener('resize', checkScreenWidth);

    sidebarToggle.addEventListener('click', function () {
        const isVisible = sidebar.classList.toggle('visible');
        mapContainer.classList.toggle('shifted', isVisible);
        sidebarToggle.innerHTML = `<i class="fas fa-chevron-${isVisible ? 'left' : 'right'}"></i>`;
    });
});
