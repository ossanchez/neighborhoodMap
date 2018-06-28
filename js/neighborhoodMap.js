var map;
var locations = [
  {title: "Location 1", location : {lat: 52.370215, lng: 4.895167}, other:"Other 1"},
  {title: "Location 2", location : {lat: 52.366366, lng: 4.890910}, other:"Other 2"},
  {title: "Location 3", location : {lat: 52.390215, lng: 4.875167}, other:"Other 3"},
  {title: "Location 4", location : {lat: 52.400217, lng: 4.855167}, other:"Other 4"},
  {title: "Location 5", location : {lat: 52.350257, lng: 4.805167}, other:"Other 5"},
];

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 52.3702157, lng: 4.895167899999933},
    zoom: 15
  });

  var markers = [];

  var largeInfoWindow = new google.maps.InfoWindow();

  var bounds = new google.maps.LatLngBounds();

  for (var i = 0; i < locations.length; i++){
    var position = locations[i].location;
    var title = locations[i].title;
    var markerName = locations[i].other;

    var marker = new google.maps.Marker({
      position : position,
      map      : map,
      title    : title,
      id       : i,
      animtion : google.maps.Animation.DROP,
      other : markerName
    });

    markers.push(marker);

    marker.addListener('click', function () {
      populateInfoWindow(this, largeInfoWindow);
    });

    bounds.extend(position);
  }
  map.fitBounds(bounds);
}

function populateInfoWindow(marker, infoWindow){
  if (infoWindow.marker != marker){
    infoWindow.marker = marker;
    infoWindow.setContent('<div>' + marker.other + '</div>');
    infoWindow.open(map, marker);

    infoWindow.addListener('closeclick', function(){
      infoWindow.setMarker = null;
    });
  }
}


var Location = function(location){
  this.title = ko.observable(location.title);
  this.location = ko.observable(location.location);
  this.other = ko.observable(location.other);
};

var ViewModel = function () {
  var self = this;

  this.locationList = ko.observableArray();

  locations.forEach(function (location){
    var newLocation = new Location(location);
    self.locationList.push(newLocation);
  });
};

ko.applyBindings(new ViewModel());
