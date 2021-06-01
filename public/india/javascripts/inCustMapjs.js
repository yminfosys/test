var CenterChange='Enable';
var forcelySetPicuploction="Deseble";
var centerMarker;
var circle;
var wachID;
var interval;
var placetimer;
var mrkerTimer;
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
    directionsDisplay.setMap(map);
    

    ////// Watch Position ///////////
    wachLocation();
    function wachLocation(){
      wachID=navigator.geolocation.watchPosition(function (position){
      ////////Call Circle Center Marker
      
      var pos={lat:position.coords.latitude,lng:position.coords.longitude};
      
      console.log("watch",pos);
      circleMarker(position);
      driverMarkes(); 
      if(forcelySetPicuploction=="Enable"){
        findPlaceBylntlng(pos,"force");
        forcelySetPicuploction="Deseble";
      }else{
        findPlaceBylntlng(pos,"normal");
      }
      
      
      },function error(msg){
          alert('Please enable your GPS position future.');       
      },{maximumAge:600000, timeout:5000, enableHighAccuracy: true});
  }

    ////////Clear Watchposition/////////
    function clearWachposition(){
    if (wachID != null) {
        navigator.geolocation.clearWatch(wachID);
        wachID = null;
      }
    }
    ////////Center AND Crircel Marker///////
    function circleMarker(position){
      var pos={lat:position.coords.latitude,lng:position.coords.longitude};
       if(!centerMarker){
          centerMarker=new google.maps.Marker({
          position: pos, 
         // icon:'http://www.robotwoods.com/dev/misc/bluecircle.png',
          icon:new google.maps.MarkerImage('/india/images/bluecircle.png',
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

        ///////Add CenterMArker pin////////
        $('<div/>').addClass('centerMarker').appendTo(map.getDiv());
        //////End Circle Marker//////

        ////////coseing-msg//////////
       // $('#coseing-msg').addClass('coseing-msg').appendTo(map.getDiv());
        ////////
              
        }else{
          centerMarker.setPosition(pos);
          
            map.setCenter(pos)
            
                   
          
          map.setZoom(14); 
          circle.setRadius(position.coords.accuracy); 
        }
      
    } 

   ///////Add Navigation Button////////
   $('<div/>').addClass('navigationMarker').appendTo(map.getDiv())
   //do something onclick
   .click(function() { 
    $("#picuplocation").val("");    
    $("#pickuplat").val("");
    $("#pickuplng").val("");
    $("#droplocation").val("");
    $("#droplat").val("");
    $("#droplng").val("");
    console.log("wachID", wachID)
    if(wachID==null){
      wachLocation();     
    }
    CenterChange="Enable";
    forcelySetPicuploction="Enable";   
   });
   var dropMarker=new google.maps.Marker({        
    // icon:'http://www.robotwoods.com/dev/misc/bluecircle.png',
     icon:new google.maps.MarkerImage('/india/images/drop.png',
                                     new google.maps.Size(50,50),
                                     new google.maps.Point(0,0),
                                     new google.maps.Point(25,50)),
     map:map
   
   });
  var pickupMarker=new google.maps.Marker({        
  // icon:'http://www.robotwoods.com/dev/misc/bluecircle.png',
  icon:new google.maps.MarkerImage('/india/images/pickup.png',
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

  ///////// Map Grag /////////////
var centertimer;
google.maps.event.addListener(map, 'drag', function() {
  clearWachposition();
  if(CenterChange=='Enable'){ 
  clearTimeout(centertimer);
  centertimer=setTimeout(function(){
    findPlaceBylntlng({lat:map.getCenter().toJSON().lat,lng:map.getCenter().toJSON().lng},"force");
   },300);
  }

});

    /////Pickup And Drrop Location////////
console.log("geocodeSaver",$("#geocodeSaver").val())
     ///////////Find Place By Lat Lng/////  
  function findPlaceBylntlng(latlng,type){
    var picuplocation=$("#picuplocation").val();    
    var geocodeSave=$("#geocodeSaver").val();
    
    var pickuplat=$("#pickuplat1").val();
    var pickuplng=$("#pickuplng1").val();
    var droplat=$("#droplat1").val();
    var droplng=$("#droplng1").val();

    ///////Cll All Nerest Driver Marker/////    
    if(type=="force"){
      setNewPickupDropAddress(latlng);
    }else{
      if(geocodeSave){
         setExisitingPickupDropAddress({
              pickuplat:pickuplat,
              pickuplng:pickuplng,
              droplat:droplat,
              droplng:droplng
          }); 
      }else{
        if(!picuplocation){
          setNewPickupDropAddress(latlng);
        }
      }
    


    }

    

    

  }

  function setNewPickupDropAddress(latlng){
    console.log("new geocode")
    var searchmod=$("#ModeofSearch").val();
    $.post('/india/geoplace',{lat:latlng.lat,lng:latlng.lng},function(data){
      if(searchmod=='0'){
            /////Update LatLng Address for Geocod and Local Storage//////
            
              $.post('/india/localstorageandgeocode',{lat:latlng.lat,lng:latlng.lng,pickupads:data.results[0].formatted_address,type:"pickup"},function(ddd){
                $("#picuplocation").val(data.results[0].formatted_address);
                $("#pickuplat").val(latlng.lat);
                $("#pickuplng").val(latlng.lng);
                ///////Add pickup Marker/////       
                pickupMarker.setPosition(latlng)
                pickupwindow.open(map, pickupMarker);
                driverMarkes();
                updateDemand({lat:Number(latlng.lat),lng:Number(latlng.lng)});
                cityLocation({lat:Number(latlng.lat),lng:Number(latlng.lng)});
              });
            
            
      }else{
       

        $.post('/india/localstorageandgeocode',{lat:latlng.lat,lng:latlng.lng,dropads:data.results[0].formatted_address,type:"drop"},function(ddd){
          $("#droplocation").val(data.results[0].formatted_address);
          $("#droplat").val(latlng.lat);
          $("#droplng").val(latlng.lng);
          ///////Add drop Marker/////
          dropMarker.setPosition(latlng);
          dropwindow.open(map, dropMarker);
          driverMarkes();
        });
      
      }
    });
  }


  function setExisitingPickupDropAddress(inp){
   
    if(inp.pickuplat){
      ///////Add pickup Marker/////       
      pickupMarker.setPosition({lat:Number(inp.pickuplat),lng:Number(inp.pickuplng)})
      pickupwindow.open(map, pickupMarker);
      clearWachposition();
      map.setCenter({lat:Number(inp.pickuplat),lng:Number(inp.pickuplng)});       
      CenterChange="Diseble";
      driverMarkes();
      updateDemand({lat:Number(inp.pickuplat),lng:Number(inp.pickuplng)});
    }
    if(inp.droplat){
      ///////Add drop Marker/////
      dropMarker.setPosition({lat:Number(inp.droplat),lng:Number(inp.droplng)});
      dropwindow.open(map, dropMarker);
      clearWachposition()
      map.setCenter({lat:Number(inp.droplat),lng:Number(inp.droplng)});
      
      }
    $("#picuplocation").val($("#picuplocation1").val());
    $("#pickuplat").val($("#pickuplat1").val());
    $("#pickuplng").val($("#pickuplng1").val());
    $("#droplocation").val($("#droplocation1").val());
    $("#droplat").val($("#droplat1").val());
    $("#droplng").val($("#droplng1").val());
    

  }

///////Update Demand Location////////
function updateDemand(latlng){
  $.post('/india/updateDemndLocation',{lat:latlng.lat,lng:latlng.lng},function(dd){
    console.log(dd);
  })
}


  function driverMarkes(){
    var pickuplat=$("#pickuplat").val();
    var pickuplng=$("#pickuplng").val();
      if(pickuplat){
        allnerestDriverMarker({lat:Number(pickuplat),lng:Number(pickuplng)});
      }else{
        if(map.getCenter()){
          allnerestDriverMarker({lat:map.getCenter().toJSON().lat,lng:map.getCenter().toJSON().lng});
        }
        
      }
    // mrkerTimer=setInterval(function(){
    //   if(pickuplat){
    //     allnerestDriverMarker({lat:Number(pickuplat),lng:Number(pickuplng)});
    //   }else{
    //     allnerestDriverMarker({lat:map.getCenter().toJSON().lat,lng:map.getCenter().toJSON().lng});
    //   }
    // },1000*5)
        
    
       
  }

  ///////ALL Nerest Driver Marker///////
  var driverlist=[];
   function allnerestDriverMarker(latlng){
      driverlist=[];
      var totalcount=0;
      var count=0;
      $.each($(".modeImg"),function(i){
        totalcount=$(".modeImg").length;
       // console.log(totalcount);
        var tm=i+1;
        count++;
        //console.log(count);
        markerlist({
          tm:tm,
          latlng:latlng,
          count:count,
          totalcount:totalcount
        },function(allmarkerList){
          console.log("allmarkerList",allmarkerList)
          setDriverMarker(allmarkerList);
        });
      });
  }

   function markerlist(inp,cb){   
    $.post('/india/nearbyalldriver',{
      lat:inp.latlng.lat,
      lng:inp.latlng.lng,
      travelmod:inp.tm
     },function(data){
     if(data.driver.length>0){
      activTravalModeNerestTime({
        dist:data.driver[0].location.coordinates,
        status:"OK",
        origin:inp.latlng,
        tm:data.tm
      });
      data.driver.forEach(function(val,key,arr){          
        driverlist.push({lat:Number(val.location.coordinates[1]), lng:Number(val.location.coordinates[0]), tm:data.tm})
        if(key=== arr.length -1){
         // console.log("inp.totalcount",inp.totalcount,"inp.count",inp.count)
           if(inp.totalcount == inp.count){
             /////END ALL LOOP             
             cb(driverlist)
           }
        }
      });
     }else{
      activTravalModeNerestTime({
        dist:[],
        status:"NOT",
        origin:inp.latlng,
        tm:data.tm
      });
      if(inp.totalcount == inp.count){
        /////END ALL LOOP
        
        cb(driverlist)
      }
     }
    });
  }
  var driverMarkers=[];
  function setDriverMarker(allmarkerList){
    clearDriverMarker();
    allmarkerList.forEach(function(val,indx){
     // console.log("markerValue",val)
       driverMarkers.push(new google.maps.Marker({
         position: {lat:val.lat, lng:val.lng},
         //icon:new google.maps.MarkerImage('/images/ic_bike.png'),
         icon:{
             url: "/india/images/DriverMarker"+val.tm+".png", // url
             scaledSize: new google.maps.Size(50, 25), // scaled size
             origin: new google.maps.Point(0,0), // origin
             anchor: new google.maps.Point(22, 22), // anchor
             
             
         },
         map: map,
         }));
     })

  }

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

  function activTravalModeNerestTime(inp){

  if(inp.status == 'OK' ){
    $.post('/india/customertimeforother',{
        origlat:Number(inp.origin.lat),
        origlng: Number(inp.origin.lng),
        distelat:Number(inp.dist[1]),
        distelng:Number(inp.dist[0]),
        travelmod:inp.tm
      },function(outp){ 
        $("#timee"+outp.tmode+"").css({"display":"block"}); 
        $("#timee"+outp.tmode+"").text(outp.time)   
        $("#gif"+outp.tmode+"").css({"display":"none"});
      });
   
  }else{
    $("#timee"+inp.tm+"").css({"display":"none"});
     
  $("#gif"+inp.tm+"").css({"display":"block"});
  }
}

///////Search Pickup Drop///////
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

document.getElementById("placeList").addEventListener("click", function(e) {
  //console.log(e.target.querySelector('input').value);
  if (e.target && e.target.matches("a.searchItem")) {
    e.target.className = "searchItem"; // new class name here
  // alert("clicked " + e.target.innerText);
   //alert("Placeid " + e.target.querySelector('input').value);
   
    $.post('/india/placeidtogeocod',{placeid:e.target.querySelector('input').value},function(data){
      if(data.status=='OK'){
        var geoloc=data.results[0].geometry.location
        var placeID=data.results[0].place_id
        CloseAll('placesearch');
        CenterChange='disable';
        findPlaceBylntlng(geoloc,"force");
        
      }
    });
  }
  if (e.target && e.target.matches("a.saveGeocode")) {
       e.target.className = "saveGeocode";
       if(e.target.querySelector('#type').value=="1"){
          $("#picuplocation").val(e.target.querySelector('#ads').value);
          $("#pickuplat").val(e.target.querySelector('#lat').value);
          $("#pickuplng").val(e.target.querySelector('#lng').value);
          pickupMarker.setPosition({lat:Number(e.target.querySelector('#lat').value),lng:Number(e.target.querySelector('#lng').value)})
          pickupwindow.open(map, pickupMarker);
         
       }else{
        $("#droplocation").val(e.target.querySelector('#ads').value);
        $("#droplat").val(e.target.querySelector('#lat').value);
        $("#droplng").val(e.target.querySelector('#lng').value);
        dropMarker.setPosition({lat:Number(e.target.querySelector('#lat').value),lng:Number(e.target.querySelector('#lng').value)});
        dropwindow.open(map, dropMarker);
       }
       CloseAll('placesearch');

  }

});





///////////////Direction rood Service/////
function directionRooteService(orgn,dist,mode, cb){
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
      //console.log("Direction respons",response);      
      directionsDisplay.setDirections(response); 
      var distt=response.routes[0].legs[0].distance.value;
      var time=response.routes[0].legs[0].duration_in_traffic.value;
      cb({distance:distt,time:time});
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}


  ////////Contunue Button////////////     
  document.getElementById("naxtBtn").addEventListener("click", function(){ 
    CenterChange='disable';
    clearInterval(mrkerTimer);
    clearWachposition();
      
    $(".centerMarker").css({"display":"none"})
    var pickuplat=$("#pickuplat").val();
    var pickuplng=$("#pickuplng").val();
    var droplat=$("#droplat").val();
    var droplng=$("#droplng").val();

    var origin={lat:Number(pickuplat),lng:Number(pickuplng)} ;
    var dist={lat:Number(droplat),lng:Number(droplng)};
    var travelmod=$("#ModeofTravel").val();
    directionRooteService(origin,dist,2,function(resp){
     //console.log("direction Responce", resp )
     var alldist=parseInt(Number(resp.distance)/1000) + 1; 
     var time=Number(resp.time)/60;
        $("#travelTime").val(time);
      var countt=0;
      $.each($(".modeImg"),function(i){
        j=i+1;
            var hour=new Date().getHours();
            var mm=new Date().getMinutes();
        $.post('/india/getPrice',{travelmod:j,distance:alldist,time:time,hour:hour,mm:mm},function(dataa){
          console.log("dataa",dataa)
          var displayPrice=Number(dataa.price)+Number(dataa.generalTimeCost);
          $("#tm"+dataa.travelmod+"").css({"display":"block"})
          $("#tm"+dataa.travelmod+"").html('&#8377;'+displayPrice.toFixed(2)+'');
          $("#tmPrice"+dataa.travelmod+"").val(dataa.price.toFixed(2));
          $("#tmTimecost"+dataa.travelmod+"").val(dataa.generalTimeCost.toFixed(2));
          $("#tmPreMinuteCost"+dataa.travelmod+"").val(Number(dataa.GenarelPerMinutCharge).toFixed(2));
          $("#tmPreRidePrice"+dataa.travelmod+"").val(dataa.preRidePrice.toFixed(2));
          $("#tmPreRideTimecost"+dataa.travelmod+"").val(dataa.preRideTimeCost.toFixed(2));
          $("#tmPreRidePreMinuteCost"+dataa.travelmod+"").val(Number(dataa.preRideperMinutCharge).toFixed(2));
            if(Number(dataa.shereRideCapacity) > 0){
          $("#tmShareRide"+dataa.travelmod+"").val((Number(dataa.price) + Number(dataa.generalTimeCost)) / dataa.shereRideCapacity);
          console.log("share price", (Number(dataa.price) + Number(dataa.generalTimeCost))  / dataa.shereRideCapacity);
          }else{
            $("#tmShareRide"+dataa.travelmod+"").val(0);
          }
          countt++;                        
          if(countt==$(".modeImg").length-1){
            $("#footer-content").css({"display":"none"});
            $("#footer-prebooking").css({"display":"block"});                
            $("#modeImg"+travelmod+"").css({"border": "4px solid rgb(42, 204, 36)"});
            var totalprice=Number($("#tmPrice"+travelmod+"").val())+Number($("#tmTimecost"+travelmod+"").val());
            //$("#totalAmt").text(totalprice);
            $("#totalDistance").val(alldist);
            $("#confrmBtn").html('Ride Now &#8377; '+Number(totalprice).toFixed(2)+'')
            //$("#booimg").html('<img class="tm-img" src="/india/images/tm'+travelmod+'.png">');
            var tmPreRidePrice=Number($("#tmPreRidePrice"+travelmod+"").val()) + Number($("#tmPreRideTimecost"+travelmod+"").val()) ;
            if(Number(tmPreRidePrice)>0){
             // $("#promoMsg").css({"display":"block"});
              $("#confrmBtn").css({"width":"50%"});
             // $("#promoMsg").html('<marquee>Reduce price @ &#8377;'+Number(tmPreRidePrice).toFixed(2)+'/km Tab on Pre-Ride button</marquee>')
              $("#preRideBtn").html('Pre-Ride &#8377; '+Number(tmPreRidePrice).toFixed(2)+'')
              
            }else{
              $("#promoMsg").css({"display":"none"});
              $("#preRideBtn").css({"display":"none"});
              $("#confrmBtn").css({"width":"100%"})
              
            }
            var tmShareRide= $("#tmShareRide"+travelmod+"").val();
              if(Number(tmShareRide)>0){
                $("#shareRideBtn").css({"display":"block"});
                $("#shareRideBtn").html('Share-Ride &#8377; '+ Number(tmShareRide).toFixed(2)+'')
                
              }else{
                $("#shareRideBtn").css({"display":"none"});
                $("#shareRideBtn").html('Share-Ride')
              }

            
            }              
        });
      })
    });
  });


  ////////Notification ////////
$("#notification").appendTo(map.getDiv());
$("#promoMsg").appendTo(map.getDiv());

  //////Get City Location For Price Control//////
  var getLocation=0;
  function cityLocation(latlng){
    if(getLocation==0){
      getLocation=1;
      $.post('/india/updateCustomerCityName',{lat:latlng.lat, lng:latlng.lng},function(data){
        if(data){
          console.log("City Update:" ,data)
          if(data.msg=="ok"){
            $("#cityfail").css({"display":"none"});
          }else{
            //alert(data.msg);
            $("#cityfail").css({"display":"block"});
            $("#cityfail").html(' <div style="margin-top: 25%;" class="col-xs-10 col-sm-10  col-xs-offset-1 col-sm-offset-1 ">\
            <div class="panel panel-success">\
                <div class="panel-heading">\
                      <h3 class="panel-title">City Not Found</h3>\
                </div>\
                <div class="panel-body">\
                     <p>'+data.msg+'</p>\
                    <button type="button" class="btn btn-danger col-xs-10 col-sm-10 col-xs-offset-1 col-sm-offset-1 ">Call Helpline For details</button>\
                </div>\
          </div>\
        </div>');
          }
        }
      });
    }
  }


  var ttw;
  ttw=setInterval(function(){
    if(map.getCenter()){
      $("#loding").css({"display":"none"})
      clearInterval(ttw)
    }
    
  },500)
  

}////ENT INT MAP/////

