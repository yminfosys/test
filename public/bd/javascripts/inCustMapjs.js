var CenterChange='Enable';

function initMap() { 

    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer({
         polylineOptions:{strokeColor:"#36301e",strokeWeight:2}, 
         suppressMarkers:true 
        });
    var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 7,
          //center: {lat: 23.5659115, lng: 87.2727577},
          mapTypeId: 'roadmap',
          disableDefaultUI: true
        });
      //   directionsDisplay.setOptions({
      //   polylineOptions: {
      //     strokeColor: '#e21b25'
      //   },
      //   draggable: true
      // });
        directionsDisplay.setMap(map);

    var centerMarker;
    var circle;
    var wachID;
    var interval;
   
    ///////Clear Wach Location//////
    wachLocation();
   
    function wachLocation(){
        wachID=navigator.geolocation.watchPosition(function (position){
        ////////Call Circle Center Marker
        circleMarker(position);           
        cityLocation(position);
        setTimeout(function(){
          navigator.geolocation.clearWatch(wachID);
        },5000)
        },function error(msg){
            alert('Please enable your GPS position future.');       
        },{maximumAge:600000, timeout:5000, enableHighAccuracy: true});
    }
    function intervalTimer(){
      interval=setInterval(function(){
        wachLocation();
      },20000);
    }
    intervalTimer();
   

///////////////Direction rood Service/////
function directionRooteService(orgn,dist,mode){
  if(mode=='1'){
    var reqst={
      origin: {lat:Number(orgn.lat) ,lng: Number(orgn.lng)},
      destination: {lat:Number(dist.lat) ,lng: Number( dist.lng)},
      travelMode: 'WALKING',
      unitSystem: google.maps.UnitSystem.METRIC
    }

  }else{
    var reqst={
      origin: {lat:Number(orgn.lat) ,lng: Number(orgn.lng)},
      destination: {lat:Number(dist.lat) ,lng: Number( dist.lng)},
      travelMode: 'DRIVING',
      unitSystem: google.maps.UnitSystem.METRIC,
      drivingOptions: {
      departureTime: new Date(Date.now()),  // for the time N milliseconds from now.
      trafficModel: 'optimistic'
    }

    }
  }
 
directionsService.route(reqst, function(response, status) {
    if (status === 'OK') {
      console.log("Direction respons",response);      
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}
    
    ///////Clear Wach Location//////
  function clearWachposition(){
    clearInterval(interval);
    navigator.geolocation.clearWatch(wachID);
  }
  google.maps.event.addListener(map, 'drag', function() {
    clearWachposition()
   
  });
  document.getElementById("picuplocation").addEventListener("click", function(){
    clearWachposition();
    $("#ModeofSearch").val('0');
    CenterChange='Enable';
  });
  document.getElementById("droplocation").addEventListener("click", function(){
    clearWachposition();
    $("#ModeofSearch").val('1');
    CenterChange='Enable';
  });
 
  

 
  var centertimer;
   /////Get Address  from map center changes ////////
   google.maps.event.addListener(map, 'center_changed', function() {
       if(CenterChange=='Enable'){
         clearTimeout(centertimer);
        centertimer=setTimeout(function(){
          findPlaceBylntlng({lat:map.getCenter().toJSON().lat,lng:map.getCenter().toJSON().lng});
         },300);
        
       }
  })
  ///////////Circle Marker/////////
  
  function circleMarker(position){
    var pos={lat:position.coords.latitude,lng:position.coords.longitude};
        ////////Find Pickup Address////       
        findPlaceBylntlng(pos); 
    if(!centerMarker){
        centerMarker=new google.maps.Marker({
        position: pos, 
       // icon:'http://www.robotwoods.com/dev/misc/bluecircle.png',
        icon:new google.maps.MarkerImage('/bd/images/bluecircle.png',
                                        new google.maps.Size(50,50),
                                        new google.maps.Point(0,0),
                                        new google.maps.Point(8,8)),
        map:map
      
      });
      circle = new google.maps.Circle({
        map: map,
        radius:position.coords.accuracy, ///   // 10 miles in metres
        fillColor: 'rgb(73, 136, 161)',
        strokeColor:'rgb(198, 232, 235)',
        
      });
    circle.bindTo('center', centerMarker, 'position')
    map.setZoom(14);
            
      }else{
        centerMarker.setPosition(pos);
        map.setCenter(pos)
        map.setZoom(14); 
        circle.setRadius(position.coords.accuracy);

        // $("#centerLocation").val(''+position.coords.latitude+','+position.coords.longitude+'');
        // $("#pickuplatlong").val('{"lat":"'+position.coords.latitude+'","lng":"'+position.coords.longitude+'"}')        
      }
    
  }
 //////End Circle Marker//////

      ///////Add CenterMArker pin////////
      $('<div/>').addClass('centerMarker').appendTo(map.getDiv());
      
      ///////Add Navigation Button////////
    $('<div/>').addClass('navigationMarker').appendTo(map.getDiv())
    //do something onclick
    .click(function() {
      wachLocation();
      intervalTimer();
    });
      

var dropMarker=new google.maps.Marker({        
       // icon:'http://www.robotwoods.com/dev/misc/bluecircle.png',
        icon:new google.maps.MarkerImage('/bd/images/drop.png',
                                        new google.maps.Size(50,50),
                                        new google.maps.Point(0,0),
                                        new google.maps.Point(25,50)),
        map:map
      
      });
var pickupMarker=new google.maps.Marker({        
// icon:'http://www.robotwoods.com/dev/misc/bluecircle.png',
    icon:new google.maps.MarkerImage('/bd/images/pickup.png',
                                    new google.maps.Size(50,50),
                                    new google.maps.Point(0,0),
                                    new google.maps.Point(25,50)),
    map:map
    

});
   
var pickupwindow = new google.maps.InfoWindow({
    content: "Pickup"
  });
var dropwindow = new google.maps.InfoWindow({
content: "Drop"
});
  

  ///////////Find Place By Lat Lng/////
  var driversMarkeTimer;
  function findPlaceBylntlng(latlng){
    var searchmod=$("#ModeofSearch").val();
     $.post('/bd/geoplace',{lat:latlng.lat,lng:latlng.lng},function(data){       
    if(searchmod=='0'){
        setCookie("pickuplatlong",JSON.stringify(latlng),1);
        setCookie("picuplocation",data.results[0].formatted_address,1);
        $("#picuplocation").val(data.results[0].formatted_address);

       ///////Update Demand Location////////
        $.post('/bd/updateDemndLocation',{lat:latlng.lat,lng:latlng.lng},function(dd){
          console.log(dd);
        })
     
        ///////Add pickup Marker/////       
        pickupMarker.setPosition(latlng)
        pickupwindow.open(map, pickupMarker);
        
        clearTimeout(driversMarkeTimer);
        driversMarkeTimer=setTimeout(function(){
          driversMarke();
        },1000);
    }else{
        setCookie("droplatlong",JSON.stringify(latlng),1);
        setCookie("droplocation",data.results[0].formatted_address,1);
        $("#droplocation").val(data.results[0].formatted_address);
       
        ///////Add drop Marker/////
        dropMarker.setPosition(latlng);
        dropwindow.open(map, dropMarker);
        
    }
        
     }); 
  }

  ///////Nearest Driver Marker////////
    var driverMarkers=[];
    var angleDegrees=90;
    function nereastDriver(driverLocetion,type){
    var travelmod=$("#ModeofTravel").val();
    clearDriverMarker();
    driverLocetion.forEach(function(val,indx){
     
      driverMarkers.push(new google.maps.Marker({
        position: {lat:val.lat, lng:val.lng},
        //icon:new google.maps.MarkerImage('/images/ic_bike.png'),
        icon:{
            url: "/bd/images/DriverMarker"+travelmod+".png", // url
            scaledSize: new google.maps.Size(50, 25), // scaled size
            origin: new google.maps.Point(0,0), // origin
            anchor: new google.maps.Point(22, 22), // anchor
            
            
        },
        map: map,
        }));
        
        

    })
    }

///////Clear Nearest Driver Marker////////
    function clearDriverMarker(){
    if(driverMarkers.length>0){
    driverMarkers.forEach(function(valu,key,arry){
        valu.setMap(null);
        if(key===arry.length-1){
        driverMarkers=[];
        }
    });
    }

    }
     ////////////Nearest Driver//////////
     function driversMarke(){
         var latLong=JSON.parse(getCookie("pickuplatlong"));
        var travelmod=$("#ModeofTravel").val();
  ////////////Fetch Marker Velue form database////////      
       $.post('/bd/nearby',{
         lat:latLong.lat,
         lng:latLong.lng,
         travelmod:travelmod
        },function(data){
        if(data.length>0){
          activTravalModeNerestTime(data[0].location.coordinates,'OK');
          var driverlist=[];        
          data.forEach(function(val,key,arr){          
             driverlist.push({lat:Number(val.location.coordinates[1]), lng:Number(val.location.coordinates[0])})
            if(key === arr.length -1){ 
              nereastDriver(driverlist);           
              }
          });
        }else{
          /////clear driver////
          clearDriverMarker();
          activTravalModeNerestTime([],'NOT');
        }
       });
  
      }

      ////////Contunue Button////////////     
    document.getElementById("naxtBtn").addEventListener("click", function(){
      CenterChange='Disable';
      $(".centerMarker").css({"display":"none"})
      var origin=JSON.parse(getCookie("pickuplatlong")) ;
      var dist=JSON.parse(getCookie("droplatlong")) ;
      var travelmod=$("#ModeofTravel").val();
      directionRooteService(origin,dist,travelmod);
      
      var countt=0;
          $.each($(".modeImg"),function(i){
            j=i+1;
            $.post('/bd/getDistance',{travelmod:j,orig:''+Number(origin.lat)+' , '+Number(origin.lng)+'',diste:''+Number(dist.lat)+' , '+Number(dist.lng)+''},function(data){
              //alert(data.rows[0].elements[0].distance.value);          
              var distance=data.result.rows[0].elements[0].distance.value;
              var time=data.result.rows[0].elements[0].duration.value;             
                      
              distance=parseInt(distance/1000) + 1; 
             //////////Set Time for Other Travel mode
              if(data.travelmod >1){
                time=Number(time)/60;
                setCookie("travalTime",time,1);                
              }           
            $.post('/bd/getPrice',{travelmod:data.travelmod,distance:distance},function(dataa){
              $("#tm"+dataa.travelmod+"").css({"display":"block"})
              $("#tm"+dataa.travelmod+"").html('&#2547;'+dataa.price+'');
              $("#tmPrice"+dataa.travelmod+"").val(dataa.price);
              $("#tmPreRidePrice"+dataa.travelmod+"").val(dataa.preRidePrice[Number(dataa.travelmod)-1]);
                if(dataa.shereRideCapacity[Number(dataa.travelmod)-1] > 0){
              $("#tmShareRide"+dataa.travelmod+"").val(dataa.price / dataa.shereRideCapacity[Number(dataa.travelmod)-1]);
              console.log("share price",dataa.price / dataa.shereRideCapacity[Number(dataa.travelmod)-1])
              }else{
                $("#tmShareRide"+dataa.travelmod+"").val(0);
              }
              countt++;                        
              if(countt==$(".modeImg").length-1){
                $("#footer-content").css({"display":"none"});
                $("#footer-prebooking").css({"display":"block"});                
                $("#modeImg"+travelmod+"").css({"border": "4px solid rgb(42, 204, 36)"});
                var totalprice=$("#tmPrice"+travelmod+"").val();
                //$("#totalAmt").text(totalprice);
                $("#totalDistance").val(distance);
                $("#confrmBtn").html('Ride Now &#2547; '+totalprice+'')
                //$("#booimg").html('<img class="tm-img" src="/bd/images/tm'+travelmod+'.png">');
                var tmPreRidePrice= $("#tmPreRidePrice"+travelmod+"").val();
                if(Number(tmPreRidePrice)>0){
                  $("#promoMsg").css({"display":"block"});
                  $("#confrmBtn").css({"width":"50%"});
                  $("#promoMsg").html('<marquee>Reduce price @ &#2547;'+tmPreRidePrice+'/km Tab on Pre-Ride button</marquee>')
                  $("#preRideBtn").html('Pre-Ride &#2547; '+ Number(distance) * Number(tmPreRidePrice)+'')
                }else{
                  $("#promoMsg").css({"display":"none"});
                  $("#preRideBtn").css({"display":"none"});
                  $("#confrmBtn").css({"width":"100%"})
                  
                }
                var tmShareRide= $("#tmShareRide"+travelmod+"").val();
                  if(Number(tmShareRide)>0){
                    $("#shareRideBtn").css({"display":"block"});
                    $("#shareRideBtn").html('Share-Ride &#2547; '+ Number(tmShareRide).toFixed(0)+'')
                    
                  }else{
                    $("#shareRideBtn").css({"display":"none"});
                    $("#shareRideBtn").html('Share-Ride')
                  }

                
                }              
            });
          });
          

        }); 
    });
//////// End Contunue Button////////////   

      
      document.getElementById("placeList").addEventListener("click", function(e) {
        //console.log(e.target.querySelector('input').value);
        if (e.target && e.target.matches("a.searchItem")) {
          e.target.className = "searchItem"; // new class name here
        // alert("clicked " + e.target.innerText);
         //alert("Placeid " + e.target.querySelector('input').value);
         
          $.post('/bd/placeidtogeocod',{placeid:e.target.querySelector('input').value},function(data){
            if(data.status=='OK'){
              var geoloc=data.results[0].geometry.location
              var placeID=data.results[0].place_id
              CloseAll('placesearch');
              CenterChange='disable';
              findPlaceBylntlng(geoloc);
              
            }
          });
        }
      });

 ////////activTravalModeNerestDistanceandTime///////
 function activTravalModeNerestTime(data,status){
      ////////timeanddistancs between
      var travelmod=$("#ModeofTravel").val();
      if(status == 'OK' ){
      
      var origin=JSON.parse(getCookie("pickuplatlong")) ;
      $.post('/bd/distbtwnActive',{orig:''+Number(origin.lat)+' , '+Number(origin.lng)+'',diste:''+Number(data[1])+' , '+Number(data[0])+''},function(data){
       
        $("#timee"+travelmod+"").css({"display":"block"}); 
        $("#timee"+travelmod+"").text(data.rows[0].elements[0].duration.text)   
        $("#gif"+travelmod+"").css({"display":"none"});
        
      })
    }else{
      $("#timee"+travelmod+"").css({"display":"none"});
       
    $("#gif"+travelmod+"").css({"display":"block"});
    }
 } 

   
////////Notification ////////
$("#notification").appendTo(map.getDiv());
$("#promoMsg").appendTo(map.getDiv());

  //////Get City Location For Price Control//////
  var getLocation=0;
  function cityLocation(position){
    
    if(getLocation==0){
      getLocation=1;
      //alert("gg");
      $.post('/bd/preRideUpdateCitywisePrice',{lat:position.coords.latitude, lng:position.coords.longitude},function(data){
        if(data){
          console.log(data)
       
        }
      });
    }
  }

} ///////End IntMap  






