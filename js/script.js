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

    // Object to hold layer groups and opacities by category
    const layerGroups = {};
    const categoryOpacities = {};

    // Handle GeoJSON file selection
    document.getElementById('geojson-select').addEventListener('change', function (event) {
        const selectedGeojson = event.target.value;

        // Hide the checkbox container initially
        document.getElementById('layer-checkbox-container').style.display = 'none';

        // Clear previous checkboxes
        const layerCheckboxesDiv = document.getElementById('layer-checkboxes');
        layerCheckboxesDiv.innerHTML = '';

        // Clear existing layers
        Object.values(layerGroups).forEach(layerGroup => {
            map.removeLayer(layerGroup);
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

                // Extract categories and create checkboxes
                const categories = new Set();
                data.features.forEach((feature, index) => {
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
                                <strong>Properties:</strong><br>
                                ${Object.entries(feature.properties).map(([key, value]) => `${key}: ${value}`).join('<br>')}
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

    sidebar.classList.add('visible');
    mapContainer.classList.add('shifted');

    sidebarToggle.addEventListener('click', function () {
        const isVisible = sidebar.classList.toggle('visible');
        mapContainer.classList.toggle('shifted', isVisible);
        sidebarToggle.innerHTML = `<i class="fas fa-chevron-${isVisible ? 'left' : 'right'}"></i>`;
    });
});
