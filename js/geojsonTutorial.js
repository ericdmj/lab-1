//creates lines made of three points with specific lats/longs
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

//creates a style for an object
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

//creates a GeoJSON layer with the myLines LineStrings and styled according to myStyle and adds it to the map
L.geoJSON(myLines, {
    style: myStyle
}).addTo(map);

//creates polygon feature geometries for particular parties and provides the lats/longs for the corners of each shape
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

//creates a GeoJSON layer with the states features and assigns each a color by case and adds to the map
L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(map);

//creates the styling for markers
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};
//creates a GeoJSON layer--though it was originally an undefined object so I changed it to geojsonFeature--and defines how the point spawns a Leaflet layer as a circle
L.geoJSON(geojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map);


//defines onEachFeature function running a test to potential bind a popup 
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

//defines a feature with various properties and as a point with given lat/long
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

//creates a GeoJSON layer using the geojsonFeature variable defined above,
//calls the function once for each created Feature, and adds it to the map
L.geoJSON(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(map);

//defines multiple features each with various properties and as a point with given lat/long
var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];

//creates a GeoJSON layer using the someFeatures defined above but deciding via a filter whether to add it to the map
L.geoJSON(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(map);