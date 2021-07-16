// Add console.log to check to see if our code is working.
console.log("working");

// We create the tile layer that will be the background of our map.
let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    accessToken: API_KEY
});

// We create the tile layer that will be the secondary of our map.
let satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    accessToken: API_KEY
});

// D3a. We create the tile layer that will be the third of our map. (Navigation Night)
let nightMode = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/navigation-night-v1/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    accessToken: API_KEY
});

// Create a base layer that holds all three maps.
let baseMaps = {
    Streets: streets,
    Satellite: satelliteStreets,
    "Night Mode": nightMode
  };

// Create the earthquake layer for our map.
let earthquakes = new L.layerGroup();
// 1. Add a 2nd layer group for the tectonic plate data.
let tectonic = new L.LayerGroup();
// D2.1 add a third layer group variable for the major earthquake data.
let majorEarthquakes = new L.LayerGroup();

// We define an object that contains the overlays. This overlay will be visible all the time.
let overlays = {
    Earthquakes: earthquakes,
    // 2. Add a reference to the tectonic plates group to the overlays object.
    "Tectonic Plates": tectonic,
    //D2.2 Add a reference to the major earthquakes group to the overlays object. 
    "Major Earthquakes": majorEarthquakes
  };

// Create the map object with center, zoom level and default layer.
let map = L.map('mapid', {
    center: [40.7, -94.5],
    zoom: 3,
    layers: [streets]
})

// Pass our map layers into our layers control and add the layers control to the map.
L.control.layers(baseMaps, overlays).addTo(map);

// Accessing the earthquake GeoJSON URL
let past7days = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Grabbing our GeoJSON data.
d3.json(past7days).then(function(data){
    console.log(data);
    // This function returns the style data for each of the earthquakes we plot on
    // the map. We pass the magnitude of the earthquake into a function
    // to calculate the radius.
    function styleInfo(feature) {
        return {
        opacity: 1,
        fillOpacity: 1,
        fillColor: getColor(feature.properties.mag),
        color: "#000000",
        radius: getRadius(feature.properties.mag),
        stroke: true,
        weight: 0.5
        };
    }

    // This function determines the color of the circle based on the magnitude of the earthquake.
    function getColor(magnitude) {
        if (magnitude > 5) {
        return "#ea2c2c";
        }
        if (magnitude > 4) {
        return "#ea822c";
        }
        if (magnitude > 3) {
        return "#ee9c00";
        }
        if (magnitude > 2) {
        return "#eecc00";
        }
        if (magnitude > 1) {
        return "#d4ee00";
        }
        return "#98ee00";
  }

    // This function determines the radius of the earthquake marker based on its magnitude.
    // Earthquakes with a magnitude of 0 will be plotted with a radius of 1.
    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 4;
    }

    // Creating a GeoJSON layer with the retrieved data.
    L.geoJson(data, {
        // We set the style for each circleMarker using our styleInfo function.
        style: styleInfo,
        pointToLayer: function(feature,latlng){
            return L.circleMarker(latlng);
        },
        // We create a popup for each circleMarker to display the magnitude and
        //  location of the earthquake after the marker has been created and styled.
        onEachFeature: function(feature, layer) {
        layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
        }
    }).addTo(earthquakes);

    earthquakes.addTo(map);

    // Create a legend control object.
    let legend = L.control({
        position: "bottomright"
    });

    // Then add all the details for the legend.
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        const magnitudes = [0, 1, 2, 3, 4, 5];
        const colors = [
        "#98ee00",
        "#d4ee00",
        "#eecc00",
        "#ee9c00",
        "#ea822c",
        "#ea2c2c"
        ];

        // Looping through our intervals to generate a label with a colored square for each interval.
        for (var i = 0; i < magnitudes.length; i++) {
            console.log(colors[i]);
            div.innerHTML +=
            "<i style='background: " + colors[i] + "'></i> " +
            magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
        }
        return div;
    };

    legend.addTo(map);
    
} );

// Accessing the tectonic GeoJSON URL
let tectonicData = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// 3. Use d3.json to make a call to get our Tectonic Plate geoJSON data.
d3.json(tectonicData).then(function(data) {
    console.log(data)

    // Create a style objet
    let myStyle = {
        color: "#751082",
        weight: 2.5
        }

    //Add the tectonic layer group variable created in Step 1 to the map
    L.geoJson(data, {
        style: myStyle
    }).addTo(tectonic);

    //Next, add the tectonic layer group variable to the map, i.e, tectonicPlates.addTo(map)
    tectonic.addTo(map);
});

// D2.3 Accessing the tectonic GeoJSON URL
let majorEarthquakeData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";

// D2.4 Callback method to make a call to the major earthquake data from the GeoJSON Summary Feed 
d3.json(majorEarthquakeData).then(function(data){
    console.log(data)

    // Use the same parameters in the styleInfo() function that will make a call to the getColor() and getRadius() functions.
    function styleInfo(feature) {
        return {
        opacity: 1,
        fillOpacity: 1,
        fillColor: getColor(feature.properties.mag),
        color: "#000000",
        radius: getRadius(feature.properties.mag),
        stroke: true,
        weight: 0.5
        };
    }
    // change the getColor() function to use only three colors for the following magnitudes; magnitude less than 5, a magnitude greater than 5, and a magnitude greater than 6.
    function getColor(magnitude) {
        if (magnitude > 6) {
        return "red";
        }
        if (magnitude > 5) {
        return "orange";
        }
        return "yellow";}

    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 4;}
    
    //pass the major earthquake data into the GeoJSON layer
    L.geoJson(data, {
        // We set the style for each circleMarker using our styleInfo function.
        style: styleInfo,
        pointToLayer: function(feature,latlng){
            return L.circleMarker(latlng);
        },
        // We create a popup for each circleMarker to display the magnitude and
        //  location of the earthquake after the marker has been created and styled.
        onEachFeature: function(feature, layer) {
        layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
        }
    }).addTo(majorEarthquakes);

    majorEarthquakes.addTo(map);
    

});
 