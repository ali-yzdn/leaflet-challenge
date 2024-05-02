// Define function to create Leaflet map
function createMap(earthquakeData, platesData) {
    // Create base layers
    let streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Create map object
    let myMap = L.map('map', {
        center: [0, 0],
        zoom: 2,
        layers: [streetMap] 
    });

    // Define function to determine marker size based on magnitude
    function getMarkerSize(magnitude) {
        return magnitude * 5;
    }

    // Define function to determine marker color based on depth
    function getMarkerColor(depth) {
        let hue = 340; // Hue for pink color
        let saturation = 100;
        let lightness = 50 - (depth * 0.5); // Adjust lightness based on depth - getting darker with depth increasing 
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    // Create earthquake layer
    let earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: getMarkerSize(feature.properties.mag),
                fillColor: getMarkerColor(feature.geometry.coordinates[2]),
                color: "#000",
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.7
            }).bindPopup(`<b>Location:</b> ${feature.properties.place}<br><b>Magnitude:</b> ${feature.properties.mag}<br><b>Depth:</b> ${feature.geometry.coordinates[2]} km`);
        }
    }).addTo(myMap);

    // Create tectonic plates layer
    let tectonicPlates = L.geoJSON(platesData, {
        style: function (feature) {
            return {
                color: 'yellow', // Border color
                weight: 2 // Border width
            };
        }
    }).addTo(myMap);

    // Create overlay object
    let overlayMaps = {
        "Earthquakes": earthquakes,
        "Tectonic Plates": tectonicPlates
    };

    // Add layer control to the map
    L.control.layers(null, overlayMaps).addTo(myMap);

    // Create legend
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend');
        let depths = [0, 10, 30, 50, 70, 100];

        div.innerHTML += "<b>Depth legend</b><br>";

        for (let i = 0; i < depths.length; i++) {
            let depthRange = depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] : '+');
            let color = getMarkerColor(depths[i]);
            let colorStyle = `background:${color}; width: 15px; height: 15px; display: inline-block; margin-right: 5px;`;
            div.innerHTML += `<div style="${colorStyle}"></div> ${depthRange} km<br>`;
        }

        return div;
    };

    legend.addTo(myMap);
}

// Fetch earthquake data using D3
let earthquakeDataPromise = d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson');

// Fetch tectonic plates GeoJSON data using D3
let platesDataPromise = d3.json('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json');

// Once both promises are resolved, create the map
Promise.all([earthquakeDataPromise, platesDataPromise])
    .then(function (data) {
        let earthquakeData = data[0];
        let platesData = data[1];
        createMap(earthquakeData, platesData);
    });
