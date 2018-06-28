var map;
var largeInfoWindow;
var model;
var locations = [
  {title: "Poort", location : {lat: 52.343088, lng: 5.152480}, id:0},
  {title: "Muziekwijk", location : {lat: 52.366366, lng: 5.190798}, id:1},
  {title: "Centrum", location : {lat: 52.375128, lng: 5.219184}, id:2},
  {title: "Parkwijk", location : {lat: 52.376643, lng: 5.244861}, id:3},
  {title: "Buiten", location : {lat: 52.3941717, lng: 5.277912}, id:4},
  {title: "Oostvardes", location : {lat: 52.402831, lng: 5.300028}, id:5},
];

function changeSelectedLocation (vm, location){
  if (location.venueList().length == 0){
    var position = location.location();
    var lat = position.lat;
    var lng = position.lng;
    var fourSquareUrl = 'https://api.foursquare.com/v2/venues/search?ll='+ lat +','+lng+'&limit=10&client_id=LXHO151SHSKBWMSF0ATQNA0NCK3C31FY3RDJAK2WCA1PFD0Y&client_secret=FYAOVUDOPK1I1HGKBIGOK5LOYS1YN2JGVZYN52MYMEHH35TL&v=20180628';
    $.getJSON(fourSquareUrl, function(data){

      var venues = data.response.venues;
      var addedVenues = 0;
      for(var i = 0; i < venues.length; i++){
        if (venues[i].name.toLowerCase().indexOf('station') == -1 &&
        venues[i].name.toLowerCase().indexOf('bus ') == -1 &&
        venues[i].name.toLowerCase().indexOf('spoor') == -1){
          location.venueList.push(venues[i])
          addedVenues +=1;
          if(addedVenues >= 3){
            break;
          }
        };
      }
    }).error(function(e){
      alert("Location information was not loaded correctly, try again later.");
    });
  }

  vm.currentLocation(location);
  vm.displayLocation(true);
}

function populateInfoWindow(marker, infoWindow){
  if (infoWindow.marker != marker){
    infoWindow.marker = marker;
    infoWindow.setContent('<h3>' + marker.title + '</h3>');
    infoWindow.open(map, marker);
  }
}

function animateMarker(marker, otherLocations){

  for (var i = 0; i < otherLocations.length; i++){
    otherLocations[i].marker.setAnimation(null);
  }
  marker.setAnimation(google.maps.Animation.BOUNCE);
}

function updateMarker (self){
  populateInfoWindow(self.marker, largeInfoWindow);
  changeSelectedLocation(self.model, self);
  animateMarker(self.marker, self.model.locationList());
}

var Location = function(vm, location){
  var self = this;
  this.title = ko.observable(location.title);
  this.location = ko.observable(location.location);
  this.other = ko.observable(location.other);
  this.id = ko.observable(location.id);
  this.venueList = ko.observableArray();
  this.model = vm;
  this.drawMarker = function(bounds){
    self.marker = new google.maps.Marker({
      position : self.location(),
      map      : map,
      title    : self.title(),
      id       : self.id(),
      other : this.other(),
      animation: google.maps.Animation.DROP
    });

    self.marker.addListener('click', function () {
      updateMarker (self);
    });

    bounds.extend(self.location());
  }
};

var ViewModel = function () {
  var self = this;
  this.locationObjects = [];

  this.locationList = ko.observableArray();
  var bounds = new google.maps.LatLngBounds();

  locations.forEach(function (location){
    var newLocation = new Location(self, location);
    self.locationObjects.push(newLocation);
    self.locationList.push(newLocation);
    newLocation.drawMarker(bounds);
    map.fitBounds(bounds);
  });

  this.currentLocation = ko.observable();

  this.setLocation = function(location){
    updateMarker (location);
  };


  this.filterLocations = function () {
    input = document.getElementById("filterInput");
    filter = input.value.toUpperCase();
    self.locationList([]);
    for (i = 0; i < self.locationObjects.length; i++) {
      title = self.locationObjects[i].title();
      if (title.toUpperCase().indexOf(filter) > -1) {
        self.locationList.push(self.locationObjects[i]);
        self.locationObjects[i].marker.setMap(map);
      }
      else{
        self.locationObjects[i].marker.setMap(null);
      }
    }
  }
  this.displayLocation = ko.observable(false);
};

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 52.3702157, lng: 4.895167899999933},
    zoom: 15
  });

  largeInfoWindow = new google.maps.InfoWindow();

  model = new ViewModel();

  ko.applyBindings(model);
}
