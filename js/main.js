//declare vars in global scope
var map;
var dataStats ={};
var attributes;

//function to create map
function createMap() {

    //create the map
    map = L.map('map', {
        center: [45, -100],
        zoom: 3
    });

    //add base tilelayer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'
    }).addTo(map);

    //call getData function
    getData();
};

function calcStats(data) {
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for (var city of data.features) {
        //loop through each year
        for (var year = 1960; year <= 2020; year += 10) {
            //get dew point for current year
            var value = city.properties["dp_" + String(year)];
            //add value to array
            allValues.push(value);
        }
    }
    //get min, max, mean stats for our array
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);
    //calculate meanValue
    var sum = allValues.reduce(function(a, b){return a+b;});
    dataStats.mean = sum/ allValues.length;

    return dataStats.min;
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    //Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue / dataStats.min, 0.5715) * minRadius

    return radius;
};


function PopupContent(properties, attribute){
    this.properties = properties;
    this.attribute = attribute;
    this.year = attribute.split("_")[1];
    this.dewpoint = this.properties[attribute];
    this.formatted = "<p><b>City:</b> " + this.properties.City + "</p><p><b>Average dew point in " + this.year + ":</b> " + this.dewpoint + "°F</p>";
};


//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes) {

    //Determine the attribute for scaling the proportional symbols
    var attribute = attributes[0];

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    var filterValue = document.querySelector('input[name="filter"]:checked')?.value || 'all';

    var shouldDisplay = false;
    if (filterValue === 'all') {
        shouldDisplay = true;
    } else if (filterValue === 'below30' && dewpoint < 30) {
        shouldDisplay = true;
    } else if (filterValue === 'between30and499' && dewpoint >= 30 && dewpoint <= 49.9) {
        shouldDisplay = true;
    } else if (filterValue === '50andabove' && dewpoint >= 50) {
        shouldDisplay = true;
    }

    if (!shouldDisplay) return null;

    //create marker options
    var geojsonMarkerOptions = {
        fillColor: "#00827D",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.75
    };

    

    //Give each feature's circle marker a radius based on its attribute value
    geojsonMarkerOptions.radius = calcPropRadius(attValue);

    //create circle markers
    var layer = L.circleMarker(latlng, geojsonMarkerOptions);

    //create new popup content
    var popupContent = new PopupContent(feature.properties, attribute);

    //change the formatting
    popupContent.formatted = "<h3>" + popupContent.properties.City + "<br />" + popupContent.dewpoint + "°F</h3>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent.formatted, {
        offset: new L.Point(0, -geojsonMarkerOptions.radius / 2)
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;

};

//Add circle markers for point features to the map
function createPropSymbols(data, attributes) {

    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return pointToLayer(feature, latlng, attributes);
        },
        filter: function(feature) {
            return attributes.some(attr => feature.properties[attr] !== undefined);
        }
    }).addTo(map);
};

//Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute) {
    var year = attribute.split("_")[1];
    //update temporal legend
    document.querySelector("span.year").innerHTML = year;

    var filterValue = document.querySelector('input[name="filter"]:checked')?.value || 'all';

    map.eachLayer(function (layer) {
        if (layer.feature && layer.feature.properties[attribute] !== undefined) {
            //access feature properties
            var dewpoint = layer.feature.properties[attribute];

            var shouldDisplay = false;
            if (filterValue === 'all') {
                shouldDisplay = true;
            } else if (filterValue === 'below30' && dewpoint < 30) {
                shouldDisplay = true;
            } else if (filterValue === 'between30and499' && dewpoint >= 30 && dewpoint <= 49.9) {
                shouldDisplay = true;
            } else if (filterValue === '50andabove' && dewpoint >= 50) {
                shouldDisplay = true;
            }

            if (shouldDisplay) {

                //update each feature's radius based on new attribute values
                var radius = calcPropRadius(dewpoint);
                layer.setRadius(radius);

                //create new popup content
                var popupContent = new PopupContent(layer.feature.properties, attribute);

                //change the formatting
                popupContent.formatted = "<h3>" + popupContent.properties.City + "<br />" + popupContent.dewpoint + "°F</h3>";

                //update popup content            
                var popup = layer.getPopup();
                popup.setContent(popupContent.formatted).update();
                layer.addTo(map);
            } else {
                map.removeLayer(layer);
            }

        };
    });
};

//Create new sequence controls
function createSequenceControls() {

    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function () {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element (slider)
            container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range">')

            //add step buttons
            container.insertAdjacentHTML('beforeend', '<button class="step" id="reverse" title="Reverse"><img src="img/reverse.png"></button>'); 
            container.insertAdjacentHTML('beforeend', '<button class="step" id="forward" title="Forward"><img src="img/forward.png"></button>');

            //disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });

    map.addControl(new SequenceControl());    // add listeners after adding control}

    //set slider attributes
    document.querySelector(".range-slider").max = 6;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;
    

    //click listener for buttons
    document.querySelectorAll('.step').forEach(function (step) {
        step.addEventListener("click", function () {
            var index = document.querySelector('.range-slider').value;

            //increment or decrement depending on button clicked
            if (step.id == 'forward') {
                index++;
                //if past the last attribute, wrap around to first attribute
                index = index > 6 ? 0 : index;
            } else if (step.id == 'reverse') {
                index--;
                //if past the first attribute, wrap around to last attribute
                index = index < 0 ? 6 : index;
            };

            //update slider
            document.querySelector('.range-slider').value = index;

            //pass new attribute to update symbols
            updatePropSymbols(attributes[index]);
        })
    });

    //input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function () {
        //get the new index value
        var index = this.value;

        //pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
    });
};


function createLegend(attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            container.innerHTML = '<p class="temporalLegend">Average dew point in <span class="year">1960</span></p>';

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="160px" height="60px">';

            //array of circle names to base loop on
            var circles = ["max", "mean", "min"];

            //Step 2: loop to add each circle and text to svg string  
            for (var i=0; i<circles.length; i++){  

                //Step 3: assign the r and cy attributes  
                var radius = calcPropRadius(dataStats[circles[i]]);  
                var cy = 59 - radius;  

                //circle string            
                svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#00827D" fill-opacity="0.75" stroke="#000000" cx="65"/>';

                //evenly space out labels            
                var textY = i * 20 + 20;            

                //text string            
                svg += '<text id="' + circles[i] + '-text" x="85" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + "°F" + '</text>';
            };

            //close svg string
            svg += "</svg>";

            //add attribute legend svg to container
            container.insertAdjacentHTML('beforeend',svg);

            return container;
        }
    });

    map.addControl(new LegendControl());
};


function createFilterControls() {
    var FilterControl = L.Control.extend({
        options: {
            position: 'topright'
        },

        onAdd: function () {
            var container = L.DomUtil.create('div', 'filter-control-container');

            container.innerHTML = `
                <form>
                    <label><input type="radio" name="filter" value="all" checked> All Data</label><br>
                    <label><input type="radio" name="filter" value="below30"> &lt; 30°F</label><br>
                    <label><input type="radio" name="filter" value="between30and499"> 30°F - 49.9°F</label><br>
                    <label><input type="radio" name="filter" value="50andabove"> 50°F and above</label>
                </form>
            `;

            container.addEventListener('change', function () {
                updatePropSymbols(attributes[document.querySelector('.range-slider').value]);
            });

            //disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });

    map.addControl(new FilterControl());

}

//Import GeoJSON data
function getData() {

    //load the data
    fetch("data/dewPointCities.geojson")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            //update the global attributes array
            attributes = processData(json);
            //calling our renamed function  
            calcStats(json); 
            //call function to create proportional symbols
            createPropSymbols(json, attributes);
            //call function to create sequence controls
            createSequenceControls();
            //call function to create filter controls
            createFilterControls();
            //call function to create legend
            createLegend();
        })
};

//build an attributes array from the data
function processData(data) {
    //empty array to hold attributes
    attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties) {
        //only take attributes with dewpoint values
        if (attribute.indexOf("dp") > -1) {
            attributes.push(attribute);
        };
    };

    return attributes;
};



document.addEventListener('DOMContentLoaded', createMap)