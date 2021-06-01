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
  circleMarker(position);
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
                  //driverMarkes();
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
            //driverMarkes();
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
  var pickuplat=$("#pickuplat").val();
  var pickuplng=$("#pickuplng").val();
  var droplat=$("#droplat").val();
  var droplng=$("#droplng").val();
  var pickuplocation=$("#picuplocation").val();
  var droplocation=$("#droplocation").val();




    var origin={lat:Number(pickuplat),lng:Number(pickuplng)} ;
    var dist={lat:Number(droplat),lng:Number(droplng)};
    
    
   if(pickuplat && pickuplocation){

    directionRooteService(origin,dist,2,function(resp){
      //console.log("direction Responce", resp )
      var alldist=parseInt(Number(resp.distance)/1000) + 1; 
      var time=Number(resp.time)/60;
         $("#travelTime").val(time);
         $("#distance").val(alldist);
         
     })

    $("#footerContent").css({"display":"none"});
    $("#delivertDrescription").css({"display":"block"})
    $("#delivertDrescription").css({"height":"84vh" , "top":"13vh"})
    $("#delivertDrescription").html('<div class="row">\
    <div style="height:84vh; overflow-y: auto;" class="col-xs-12 col-sm-12">\
        <div class="panel panel-success">\
              <div class="panel-heading">\
                    <h3 class="panel-title">Pick Up</h3>\
              </div>\
              <div class="panel-body">\
              <div class="form-group">\
                  <label for="input" class="col-sm-2 control-label">Address: '+pickuplocation+'</label>\
              </div>\
                <div class="form-group">\
                    <label for="input" class="col-sm-2 control-label">Name:</label>\
                    <div class="col-sm-10">\
                        <input type="text" id="pickupName" class="form-control" value="" placeholder="Pickup Person Name">\
                    </div>\
                </div>\
                <div class="form-group">\
                    <label for="textarea" class="col-sm-2 control-label">Driver Direction:</label>\
                    <div class="col-sm-10">\
                        <textarea id="pickupDirection" class="form-control" rows="3" required="required"></textarea>\
                    </div>\
                </div>\
                <div class="form-group">\
                    <label for="input" class="col-sm-2 control-label">Mobile No:</label>\
                    <div class="col-sm-10">\
                        <input type="number" id="pickupMobile" class="form-control" value="" required="required" pattern="" title="">\
                    </div>\
                </div>\
              </div>\
        </div>\
        <div class="panel panel-success">\
            <div class="panel-heading">\
                  <h3 class="panel-title">Drop</h3>\
            </div>\
            <div class="panel-body">\
              <div class="form-group">\
                  <label for="input" class="col-sm-2 control-label">Address: '+droplocation+'</label>\
              </div>\
              <div class="form-group">\
                  <label for="input" class="col-sm-2 control-label">Name:</label>\
                  <div class="col-sm-10">\
                      <input type="text" id="dropName" class="form-control" value="" placeholder="Drop Person Name">\
                  </div>\
              </div>\
              <div class="form-group">\
                  <label for="textarea" class="col-sm-2 control-label">Driver Direction:</label>\
                  <div class="col-sm-10">\
                      <textarea name="" id="dropDirection" class="form-control" rows="3" required="required"></textarea>\
                  </div>\
              </div>\
              <div class="form-group">\
                  <label for="input" class="col-sm-2 control-label">Mobile No:</label>\
                  <div class="col-sm-10">\
                      <input type="number"  id="dropMobile" class="form-control" value="" required="required" pattern="" title="">\
                  </div>\
              </div>\
              <div class="form-group">\
                  <div class="col-sm-10 col-sm-offset-2">\
                      <button onclick="ContinueNext()"  class="btn btn-primary">Continue</button>\
                  </div>\
              </div>\
            </div>\
      </div>\
    </div>\
</div> ')
   }
  })

  
  
     
    
} ///////End IntMap ///////// 


function CloseAll(div){  
  $("#"+div+"").css({"display":"none"})
  $("#mapContent").css({"display":"block"}); 
  CenterChange='Enable';
  }

////////CAll pickup placesearch content//////
var arrayDistinc=[];
function pickupsearch(a){
  arrayDistinc=[]; 
  var out='<a onclick="CloseAll(\'placesearch\')" class="list-group-item active"><i class="fa fa-map-marker" aria-hidden="true"></i></span> &nbsp; Select From Map</a>';
    $.post('/india/previousplacesearch',{type:a,CustID:$("#CustID").val()},function(data){
      console.log("pickup drop ref",data)
      if(data.length > 0){
        data.forEach(function(val, indx, ary){
          var b=arrayDistinc.indexOf(val.formated_address);
            if(b < 0){
              arrayDistinc.push(val.formated_address);
              //var details=JSON.stringify({ads:val.formated_address, lat:val.latlong[0], lng:val.latlong[1]});
              var details=[""+val.formated_address+"", ""+val.location.coordinates[1]+"", ""+val.location.coordinates[0]+""];
             console.log(details)
              out+='<a id="abc" class="list-group-item saveGeocode"> '+val.formated_address+' <input id="type" type="hidden" value="'+a+'"/> <input id="ads" type="hidden" value="'+val.formated_address+'"/> <input id="lat" type="hidden" value="'+val.location.coordinates[1]+'"/> <input id="lng" type="hidden" value="'+val.location.coordinates[0]+'"/> </a>';
            }
            
            if(indx===ary.length -1){
              $("#placesearch").css({"display":"Block"}); 
              $("#mapContent").css({"display":"none"});       
              $("#searchPlace").focus()
              $("#searchPlace").val("")
              $("#placeList").html(out);
              $(".searchGif").css({"display":"none"});
            }
          });
      }else{
        $("#placesearch").css({"display":"Block"}); 
        $("#mapContent").css({"display":"none"});        
        $("#searchPlace").focus()
        $("#searchPlace").val("")
        $("#placeList").html(out);
        $(".searchGif").css({"display":"none"});
      }
     
    }) 
    
    
    }


    var timerr;
    function searchdown(){
        clearTimeout(timerr)
        $(".searchGif").css({"display":"none"});
        
      }
      var out;
      function searchup(){
        $(".searchGif").css({"display":"none"});
        clearTimeout(timerr)
        $(".searchGif").css({"display":"block"});
        timerr=setTimeout(function(){
          var quary=$("#searchPlace").val();
          var pickuplat=$("#pickuplat").val();
          var pickuplng=$("#pickuplng").val();
          var origin={lat:Number(pickuplat),lng:Number(pickuplng)};
          var location=''+origin.lat+' ,'+origin.lng+'';
          out='<a onclick="CloseAll(\'placesearch\')" class="list-group-item active"><i class="fa fa-map-marker" aria-hidden="true"></i></span> &nbsp; Select From Map</a>'
          $.post('/india/placesearch',{quary:quary,location:location},function(data){ 
            if(data.status=='OK'){
            data.predictions.forEach(function(val,indx){ 
             out+='<a id="abc" class="list-group-item searchItem"> '+val.description+' <input type="hidden" value="'+val.place_id+'"/> </a>    '
            ///{lat:'+val.geometry.location.lat+', lng:'+val.geometry.location.lng+'}
            })
            $("#placeList").html(out);
            $(".searchGif").css({"display":"none"});
            
          }else{
            
            out+='<a  class="list-group-item"> <img class="imgIcon"  src="/images/not-found.png"></span> Address not Found</a>      '
            $("#placeList").html(out);
            $(".searchGif").css({"display":"none"});
          }
          });
        },1000)
      } 


 function cheageDeliveryMode(a){
   $("#deliveryModeIMG"+a+"").css({"border": "3px solid rgb(9, 218, 44)"});
   $("#ModeofDelivery").val(a);
   
   for(var i=0; i<10; i++){
    if(i!=a){
      $("#deliveryModeIMG"+i+"").css({"border": "1px solid #000"});
      
    }
  }
  
 }   

 function modofdel(a){
   switch (a){
    case 1:
      return "Push Bike";
    break;
  
    case 2:
      return "Motor Bike";
    break;
    case 3:
      return "Car";
    break;
    case 4:
      return "Van";
    break;

   }

 }
 
 function ContinueNext(changeType){
  var pickuplat=$("#pickuplat").val();
  var pickuplng=$("#pickuplng").val();
  var droplat=$("#droplat").val();
  var droplng=$("#droplng").val();
  var pickuplocation=$("#picuplocation").val();
  var droplocation=$("#droplocation").val();
  var ModeofDelivery=$("#ModeofDelivery").val();

  var travelTime=$("#travelTime").val();
  var distance=$("#distance").val();
  if(Number(distance) < 5){
    distance=5;
  }
  if(changeType){
    getPrice({distance:distance,travelTime:travelTime,ModeofDelivery:ModeofDelivery,deliveryType:Number(changeType)});
    $("#deliveryType").val(changeType);
  }else{
    getPrice({distance:distance,travelTime:travelTime,ModeofDelivery:ModeofDelivery,deliveryType:1});
    $("#deliveryType").val(1);

    ////Initiate Value///////
  var pickupName=$("#pickupName").val();
  var pickupDirection=$("#pickupDirection").val();
  var pickupMobile=$("#pickupMobile").val();
  var dropName=$("#dropName").val();
  var dropDirection=$("#dropDirection").val();
  var dropMobile=$("#dropMobile").val();

  $("#pickupName_s").val(pickupName);
  $("#pickupDirection_s").val(pickupDirection);
  $("#pickupMobile_s").val(pickupMobile);
  $("#dropName_s").val(dropName);
  $("#dropDirection_s").val(dropDirection);
  $("#dropMobile_s").val(dropMobile);
  }



  
  

  var deliveryPrice=$("#deliveryPrice").val();
  
    $("#footerContent").css({"display":"none"});
    $("#delivertDrescription").css({"display":"block"})
    $("#delivertDrescription").css({"height":"37vh" , "top":"60vh"})
    $("#delivertDrescription").html('<div class="row">\
    <div class="col-xs-2 col-sm-2 col-xs-offset-5 col-sm-offset-10 ">\
        <img id="expend" onclick="expendDetails(1)" style="width: 100%;" src="/india/images/expend1Arrow.png">\
        <img id="dexpend" onclick="expendDetails(2)" style="width: 100%; display: none;" src="/india/images/expendArrow.png">\
    </div>\
    <div class="col-xs-12 col-sm-12">\
        <div class="col-xs-3 col-sm-3">\
            <img style="width: 100%; border: 1px solid rgb(218, 9, 9);" class="img-circle" src="/india/images/delideryMod'+ModeofDelivery+'.png">\
            <span style="font-size: xx-small; text-align: center; margin-left: 10%;">'+modofdel(Number(ModeofDelivery))+'</span>\
        </div>\
        <div class="col-xs-9 col-sm-9">\
            <div class="col-xs-4 col-sm-4">\
                <img id="deliveryType1" onclick="changeDelivertType(1)" style="width: 100%; border: 3px solid rgb(9, 218, 44); padding: 1px;" class="img-rounded" src="/india/images/urgent.png">\
                <span style="font-size: 8px; text-align: center; margin-left: 10%;" >Urgent</span>\
            </div>\
            <div class="col-xs-4 col-sm-4">\
                <img id="deliveryType2" onclick="changeDelivertType(2)" style="width: 100%; border: 1px solid rgb(8, 8, 8); padding: 1px;" class="img-rounded" src="/india/images/sameday.jpeg">\
                <span style="font-size:8px; text-align: center; margin-left: 10%;" >Same-Day</span>\
            </div>\
            <div class="col-xs-4 col-sm-4">\
                <img id="deliveryType3" onclick="changeDelivertType(3)" style="width: 100%; border: 1px solid rgb(5, 5, 5); padding: 1px;" class="img-rounded" src="/india/images/nextDay.png">\
                <span style="font-size: 8px; text-align: center; margin-left: 10%;" >Next-Day</span>\
            </div>\
        </div>\
    </div>\
    <div class="col-xs-4 col-sm-4 col-xs-offset-4 col-sm-offset-4">\
        <button type="button" class="btn btn-primary col-xs-12 col-sm-12">&#8377; '+Number(deliveryPrice).toFixed(2)+'</button>\
    </div>\
    <div style="margin-top: 10px;" class="col-xs-8 col-sm-8 col-xs-offset-2 col-sm-offset-2">\
        <button onclick="conframDelivery()" type="button" class="btn btn-success col-xs-12 col-sm-12 ">Confram Delivery</button>\
    </div>\
</div>')
 
}


 function expendDetails(i){
  if(i==1){
    $("#delivertDrescription").css({"height":"84vh" , "top":"13vh"})
    $("#expend").css({"display":"none"})
    $("#dexpend").css({"display":"block"})
  }else{
    $("#delivertDrescription").css({"height":"37vh" , "top":"60vh"})
    $("#dexpend").css({"display":"none"})
    $("#expend").css({"display":"block"})
  }
  
 }

 function changeDelivertType(a){
  ContinueNext(a)
  $("#deliveryType"+a+"").css({"border": "3px solid rgb(9, 218, 44)"});
  for(var i=0; i<10; i++){
   if(i!=a){
     $("#deliveryType"+i+"").css({"border": "1px solid #000"});
     
   }
 }

 }

 function getPrice(inp){
  //distance:distance,travelTime:travelTime,ModeofDelivery:ModeofDelivery,deliveryType:1
console.log(inp)
  switch(Number(inp.deliveryType)){
    case 1:
      var price=((Number(inp.distance)*2)+(Number(inp.travelTime)* 0.50))*Number(inp.ModeofDelivery)
      $("#deliveryPrice").val(price);
      
    break;
    case 2:
      var dist=Number(inp.distance)/10;
      var price=10*Number(inp.ModeofDelivery)*dist;
      $("#deliveryPrice").val(price);
    break; 
    case 3:
      var dist=Number(inp.distance)/10;
      var price=5*Number(inp.ModeofDelivery)*dist;
      $("#deliveryPrice").val(price);
    break;
  }
  
 }

 
 function conframDelivery(){
  var pickuplat=$("#pickuplat").val();
  var pickuplng=$("#pickuplng").val();
  var droplat=$("#droplat").val();
  var droplng=$("#droplng").val();
  var pickuplocation=$("#picuplocation").val();
  var droplocation=$("#droplocation").val();
  var ModeofDelivery=$("#ModeofDelivery").val();

  var pickupName=$("#pickupName_s").val();
  var pickupDirection=$("#pickupDirection_s").val();
  var pickupMobile=$("#pickupMobile_s").val();
  var dropName=$("#dropName_s").val();
  var dropDirection=$("#dropDirection_s").val();
  var dropMobile=$("#dropMobile_s").val();
  var deliveryPrice=$("#deliveryPrice").val();
  var deliveryType=$("#deliveryType").val();

  $.post('/india/conframDelivery',{
    pickuplat:pickuplat,
    pickuplng:pickuplng,
    droplat:droplat,
    droplng:droplng,
    pickuplocation:pickuplocation,
    droplocation:droplocation,
    ModeofDelivery:ModeofDelivery,
    pickupName:pickupName,
    pickupDirection:pickupDirection,
    pickupMobile:pickupMobile,
    dropName:dropName,
    dropDirection:dropDirection,
    dropMobile:dropMobile,
    deliveryPrice:deliveryPrice,
    deliveryType:deliveryType

  },function(data){
    $("#delivertDrescription").html('<div class="row">\
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">\
        <p style="text-align: center; font-size: larger; margin-top: 50px;">Your Order Is Confarm</p>\
        <p style="text-align: center; font-size: larger;">Order ID : '+data.NewBookinid+'</p>\
        <p style="text-align: center; font-size: larger;">Processing......</p>\
        <p><img style="width: 100%; height: 20px;" src="/india/images/gif/378.gif"></p>\
        <p style="text-align: center; font-size: 12px;">Status; Waiting for Driver Responce</p>\
    </div>\
    </div>')
    console.log(data)

  })

 }

 
 






