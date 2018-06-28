var map;
var largeInfoWindow;
var locations = [
  {title: "Location 1", location : {lat: 52.370215, lng: 4.895167}, other:"Other 1", id:0},
  {title: "Location 2", location : {lat: 52.366366, lng: 4.890910}, other:"Other 2", id:1},
  {title: "Location 3", location : {lat: 52.390215, lng: 4.875167}, other:"Other 3", id:2},
  {title: "Location 4", location : {lat: 52.400217, lng: 4.855167}, other:"Other 4", id:3},
  {title: "Location 5", location : {lat: 52.350257, lng: 4.805167}, other:"Other 5", id:4},
];


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
  var self = this;
  this.title = ko.observable(location.title);
  this.location = ko.observable(location.location);
  this.other = ko.observable(location.other);
  this.id = ko.observable(location.id);
  this.drawMarker = function(bounds){
    var marker = new google.maps.Marker({
      position : self.location(),
      map      : map,
      title    : self.title(),
      id       : self.id(),
      other : this.other()
    });

    marker.addListener('click', function () {
      populateInfoWindow(marker, largeInfoWindow);
    });

    bounds.extend(self.location());
  }
};

var ViewModel = function () {
  var self = this;

  this.locationList = ko.observableArray();
  var bounds = new google.maps.LatLngBounds();


  locations.forEach(function (location){
    var newLocation = new Location(location);
    self.locationList.push(newLocation);
    newLocation.drawMarker(bounds);
    map.fitBounds(bounds);
  });
};

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 52.3702157, lng: 4.895167899999933},
    zoom: 15
  });

  largeInfoWindow = new google.maps.InfoWindow();

  ko.applyBindings(new ViewModel());
}
