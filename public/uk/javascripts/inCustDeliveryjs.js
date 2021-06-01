function initMap() { 
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer({
         polylineOptions:{strokeColor:"#36301e",strokeWeight:2}, 
         suppressMarkers:true 
        });
    var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 7,
          center: {lat: 23.5659115, lng: 87.2727577},
          mapTypeId: 'roadmap',
          disableDefaultUI: true
        });
     
        directionsDisplay.setMap(map);
$('<div/>').addClass('centerMarker').appendTo(map.getDiv());      
    
} ///////End IntMap  






