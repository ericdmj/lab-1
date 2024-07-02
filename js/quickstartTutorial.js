//creates the map 'map' and sets the options to modify its state--in this case gives the geographical center and zoom
var map = L.map('map').setView([51.505, -0.09], 13);

//loads and adds to the map the tilelayer from OpenStreetMap and adds a copyright string to the attribution control
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(map);

//adds a marker set to the specific lat/long
var marker = L.marker([51.5, -0.09]).addTo(map);

//adds a circle overlay centered at the indicated lat/long with the other indicated charateristics
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(map);

//adds a polygon overlay with vertices at the indicated lats/longs
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);

//binds a popup to each of the indicated shapes with the indicated text, with the one for marker being activated on loading
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

//creates a standalone popup
var popup = L.popup();

//sets the popup to open at any point on the map where clicked and display lat/long of that location
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

//executes the function onMapClick when execute some function when the user clicks on the map
map.on('click', onMapClick);