var map;
var largeInfoWindow;
var locationList;
var locations = [
  {title: "Location 1", location : {lat: 52.370215, lng: 4.895167}, other:"Other 1", id:0},
  {title: "Location 2", location : {lat: 52.366366, lng: 4.890910}, other:"Other 2", id:1},
  {title: "Location 3", location : {lat: 52.390215, lng: 4.875167}, other:"Other 3", id:2},
  {title: "Location 4", location : {lat: 52.400217, lng: 4.855167}, other:"Other 4", id:3},
  {title: "Location 5", location : {lat: 52.350257, lng: 4.805167}, other:"Other 5", id:4},
];

var locationObjects = [];

function filterLocations() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("filterInput");
    filter = input.value.toUpperCase();
    locationList([]);
    for (i = 0; i < locationObjects.length; i++) {
        title = locationObjects[i].title();
        if (title.indexOf(filter) > -1) {
          locationList.push(locationObjects[i]);
          locationObjects[i].marker.setMap(map);
        }
        else{
          locationObjects[i].marker.setMap(null);
        }
    }
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
  var self = this;
  this.title = ko.observable(location.title);
  this.location = ko.observable(location.location);
  this.other = ko.observable(location.other);
  this.id = ko.observable(location.id);
  this.venueList = ko.observableArray();
  this.drawMarker = function(bounds){
    self.marker = new google.maps.Marker({
      position : self.location(),
      map      : map,
      title    : self.title(),
      id       : self.id(),
      other : this.other()
    });

    self.marker.addListener('click', function () {
      populateInfoWindow(marker, largeInfoWindow);
    });

    bounds.extend(self.location());
  }
};

var ViewModel = function () {
  var self = this;

  locationList = ko.observableArray();
  var bounds = new google.maps.LatLngBounds();

  locations.forEach(function (location){
    var newLocation = new Location(location);
    locationObjects.push(newLocation);
    locationList.push(newLocation);
    newLocation.drawMarker(bounds);
    map.fitBounds(bounds);
  });

  this.currentLocation = ko.observable();

  this.setLocation = function(location){

    var list = location.venueList();

    var leng1 = location.venueList().lenght;

    if (location.venueList().length == 0){
      var position = location.location();
      var lat = position.lat;
      var lng = position.lng;
      var fourSquareUrl = 'https://api.foursquare.com/v2/venues/search?ll='+ lat +','+lng+'&limit=3&client_id=LXHO151SHSKBWMSF0ATQNA0NCK3C31FY3RDJAK2WCA1PFD0Y&client_secret=FYAOVUDOPK1I1HGKBIGOK5LOYS1YN2JGVZYN52MYMEHH35TL&v=20180628';
      $.getJSON(fourSquareUrl, function(data){

        var venues = data.response.venues;
        for(var i = 0; i < venues.length; i++){
          location.venueList.push(venues[i]);
        }
      }).error(function(e){
        console.log("An error occured");
      });
    }

    self.currentLocation(location);
    self.displayLocation(true);
  };

  this.displayLocation = ko.observable(false);
};

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 52.3702157, lng: 4.895167899999933},
    zoom: 15
  });

  largeInfoWindow = new google.maps.InfoWindow();

  ko.applyBindings(new ViewModel());
}
