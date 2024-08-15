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

    // Define custom icons for each category
    const icons = {
        'Acacia': L.icon({
            iconUrl: 'images/acacia-marker.png',  // Gambar untuk Acacia
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        }),
        'Oil palm': L.icon({
            iconUrl: 'images/oil-palm-marker.png',  // Gambar untuk Oil palm
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        }),
        'gr-Mixture': L.icon({
            iconUrl: 'images/gr-mixture-marker.png',  // Gambar untuk gr-Mixture
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        }),
        'Hevea': L.icon({
            iconUrl: 'images/hevea-marker.png',  // Gambar untuk Hevea
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        }),
        'Coconut palm': L.icon({
            iconUrl: 'images/coconut-palm-marker.png',  // Gambar untuk Coconut palm
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        }),
        'Paraserianthes': L.icon({
            iconUrl: 'images/paraserianthes-marker.png',  // Gambar untuk Paraserianthes
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        }),
        'Uncategorized': L.icon({
            iconUrl: 'images/default-marker.png',  // Gambar default jika kategori tidak ditemukan
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        })
    };
    
    // Object to hold layer groups by category
    const layerGroups = {};

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
                        // Extract coordinates (assumed to be [longitude, latitude])
                        const [lng, lat] = feature.geometry.coordinates;

                        // Determine the category of the feature
                        const category = feature.properties.Jenis_Tumbuhan || 'Uncategorized';

                        // Add category to the set
                        categories.add(category);

                        // Create a marker with the appropriate icon for this category
                        const marker = L.marker([lat, lng], { icon: icons[category] || icons['Uncategorized'] })
                            .bindPopup(`
                                <strong>Properties:</strong><br>
                                ${Object.entries(feature.properties).map(([key, value]) => `${key}: ${value}`).join('<br>')}
                            `);

                        // Initialize the layer group if it doesn't exist
                        if (!layerGroups[category]) {
                            layerGroups[category] = L.featureGroup();
                        }

                        // Add marker to the appropriate layer group
                        layerGroups[category].addLayer(marker);
                    } else {
                        console.log(`Feature ${index} is not a Point, type: ${feature.geometry.type}`);
                    }
                });

                // Populate checkboxes with categories
                categories.forEach(category => {
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.value = category;
                    checkbox.id = `checkbox-${category}`;
                    checkbox.className = 'layer-checkbox';

                    const label = document.createElement('label');
                    label.htmlFor = checkbox.id;
                    label.textContent = category;

                    const br = document.createElement('br');

                    // Add checkbox to the div
                    layerCheckboxesDiv.appendChild(checkbox);
                    layerCheckboxesDiv.appendChild(label);
                    layerCheckboxesDiv.appendChild(br);

                    // Add event listener to handle layer visibility
                    checkbox.addEventListener('change', function () {
                        if (this.checked) {
                            map.addLayer(layerGroups[category]);
                        } else {
                            map.removeLayer(layerGroups[category]);
                        }
                    });
                });

                // Add layer groups to the map but hide them initially
                Object.values(layerGroups).forEach(layerGroup => {
                    map.addLayer(layerGroup); // Ensure all markers are loaded
                    map.removeLayer(layerGroup); // Start with layers hidden
                });

                // Show the checkbox container after the categories are loaded
                document.getElementById('layer-checkbox-container').style.display = 'block';

                // Set the view to include all markers
                map.fitBounds(Object.values(layerGroups).reduce((bounds, layerGroup) => bounds.extend(layerGroup.getBounds()), L.latLngBounds([])));
            })
            .catch(error => {
                console.error('Error fetching the GeoJSON data:', error);
            });
    });

    // Sidebar toggle functionality
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
