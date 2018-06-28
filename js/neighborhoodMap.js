var map;
var largeInfoWindow;
var model;
var locations = [
  {title: 'Poort', location : {lat: 52.343088, lng: 5.152480}, id:0},
  {title: 'Muziekwijk', location : {lat: 52.366366, lng: 5.190798}, id:1},
  {title: 'Centrum', location : {lat: 52.375128, lng: 5.219184}, id:2},
  {title: 'Parkwijk', location : {lat: 52.376643, lng: 5.244861}, id:3},
  {title: 'Buiten', location : {lat: 52.3941717, lng: 5.277912}, id:4},
  {title: 'Oostvardes', location : {lat: 52.402831, lng: 5.300028}, id:5},
];
/**
* Get the information related to the venues close to a given location.
* This function uses the FourSquare API to get the venues names.
*/
function getFourSquareInfo (location){
  // Only call the API if we havn't called it before
  if (location.venueList().length == 0){
    var position = location.location();
    var lat = position.lat;
    var lng = position.lng;
    var fourSquareUrl = 'https://api.foursquare.com/v2/venues/search?ll='+
    lat +','+lng+'&limit=10&client_id=LXHO151SHSKBWMSF0ATQNA0NCK3C31FY3RDJAK'+
    '2WCA1PFD0Y&client_secret=FYAOVUDOPK1I1HGKBIGOK5LOYS1YN2JGVZYN52MYMEHH'+
    '35TL&v=20180628';
    $.getJSON(fourSquareUrl, function(data){
      var venues = data.response.venues;
      var addedVenues = 0;
      for(var i = 0; i < venues.length; i++){
        // Don't add the venues that are related to transport
        if (venues[i].name.toLowerCase().indexOf('station') == -1 &&
        venues[i].name.toLowerCase().indexOf('bus ') == -1 &&
        venues[i].name.toLowerCase().indexOf('spoor') == -1){
          location.venueList.push(venues[i])
          addedVenues +=1;
          // We only want to display 3
          if(addedVenues >= 3){
            break;
          }
        };
      }
    }).error(function(e){
      // Show an alert informing that the call failed
      alert('Location information was not loaded correctly, try again later.');
    });
  }
}

/**
* Creates an info window for a given marker
*/
function populateInfoWindow(marker, infoWindow){
  if (infoWindow.marker != marker){
    infoWindow.marker = marker;
    infoWindow.setContent('<h3>' + marker.title + '</h3>');
    infoWindow.open(map, marker);
  }
}

/**
* Animates a marker and makes sure that the others are not animated
*/
function animateMarker(marker, otherLocations){
  for (var i = 0; i < otherLocations.length; i++){
    otherLocations[i].marker.setAnimation(null);
  }
  marker.setAnimation(google.maps.Animation.BOUNCE);
}

/**
* Updates the current location and due to the bindings all elements related to
* it.
*/
function updateCurrentLocation (self){
  populateInfoWindow(self.marker, largeInfoWindow);
  getFourSquareInfo(self);
  animateMarker(self.marker, self.model.locationList());
  self.model.currentLocation(self);
  self.model.displayLocation(true);
}

/**
* Location object.
* Has all the information for a given location
*/
var Location = function(vm, location){
  var self = this;
  this.title = ko.observable(location.title);
  this.location = ko.observable(location.location);
  this.other = ko.observable(location.other);
  this.id = ko.observable(location.id);
  this.venueList = ko.observableArray();
  this.model = vm;

  // Draws a marker in the map
  this.drawMarker = function(bounds){
    self.marker = new google.maps.Marker({
      position : self.location(),
      map      : map,
      title    : self.title(),
      id       : self.id(),
      other : this.other(),
      animation: google.maps.Animation.DROP
    });
    // When the marker is clicked update the location
    self.marker.addListener('click', function () {
      updateCurrentLocation (self);
    });

    bounds.extend(self.location());
  }
};

/**
* ViewModel for the application
*/
var ViewModel = function () {
  var self = this;
  // The location that is currently selected
  this.currentLocation = ko.observable();
  // List of all the locations
  this.locationObjects = [];
  // List of the locations that will be rendered
  this.locationList = ko.observableArray();
  var bounds = new google.maps.LatLngBounds();

  // For each location create a location object and add it to the list
  locations.forEach(function (location){
    var newLocation = new Location(self, location);
    self.locationObjects.push(newLocation);
    self.locationList.push(newLocation);
    newLocation.drawMarker(bounds);
    map.fitBounds(bounds);
  });

  // Function to update the location when a location is selected
  this.setLocation = function(location){
    updateCurrentLocation (location);
  };

  // Function to filter the locations based on the input text
  this.filterLocations = function () {
    input = document.getElementById('filterInput');
    filter = input.value.toUpperCase();
    self.locationList([]);
    // Check the locations that match the search criteria and add them to
    // the observable list so they will be rendered
    for (i = 0; i < self.locationObjects.length; i++) {
      title = self.locationObjects[i].title();
      if (title.toUpperCase().indexOf(filter) > -1) {
        self.locationList.push(self.locationObjects[i]);
        self.locationObjects[i].marker.setMap(map);
      } else{
        self.locationObjects[i].marker.setMap(null);
      }
    }
  }

  // Boolean indicating if a location has been selected
  this.displayLocation = ko.observable(false);

  // Boolean indicating if the sidebar should be visible
  this.showSidebar = ko.observable(true);
  this.sizeSidebar = function (){
    this.showSidebar(!this.showSidebar());
  }

  // Change the class of the map if the side bar is visible
  this.sideBarStatus = ko.pureComputed(function() {
    return self.showSidebar() ? "main" : "smallmain";
  });
};


/**
* Call back function to initialize the map
*/
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 52.3702157, lng: 4.895167899999933},
    zoom: 15
  });

  largeInfoWindow = new google.maps.InfoWindow();

  model = new ViewModel();

  ko.applyBindings(model);
}
