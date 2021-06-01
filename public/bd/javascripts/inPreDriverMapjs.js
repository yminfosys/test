var map;
var centerMarker;
var circle;
var wachID;
function initMap() { 
 
    map = new google.maps.Map(document.getElementById('map'), {
          zoom: 7,
         //center: {lat: 23.5659115, lng: 87.2727577},
          mapTypeId: 'roadmap',
          disableDefaultUI: true,
          map:map
        });
        
    ////////WatchLocation///////    
    var driverLocTimer;
    function wachLocation(){      
     
        wachID= setInterval(function(){        
          if(getCookie("position")){
            circleMarker(JSON.parse(getCookie("position")));
          }
         },2000);
      
     
        // wachID=navigator.geolocation.watchPosition(function (position){
        // ////////Call Circle Center 
       
        // circleMarker(position);         
        // clearTimeout(driverLocTimer);
                 
        
        // },function error(msg){
        //     alert('Please enable your GPS position future.');       
        // },{maximumAge:600000, timeout:5000, enableHighAccuracy: true});
    }
  
   
    /////////Clear Watch location////
    function clearWachposition(){
      clearInterval(wachID);
     // navigator.geolocation.clearWatch(wachID);
    }

    

    ///////////Circle Marker/////////
  
    function circleMarker(position){
      var pos={lat:Number(position.lat) ,lng:Number(position.lng) };    
        //var pos={lat:position.coords.latitude,lng:position.coords.longitude};      
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
            radius:Number(position.accuracy) , ///   // 10 miles in metres
            fillColor: 'rgb(73, 136, 161)',
            strokeColor:'rgb(198, 232, 235)',
            
          });
        circle.bindTo('center', centerMarker, 'position')
        map.setZoom(14);
                
          }else{
            centerMarker.setPosition(pos);              
                map.setCenter(pos);
                map.setZoom(14);
            circle.setRadius(Number(position.accuracy));
    
            // $("#centerLocation").val(''+position.coords.latitude+','+position.coords.longitude+'');
            // $("#pickuplatlong").val('{"lat":"'+position.coords.latitude+'","lng":"'+position.coords.longitude+'"}')        
          }
        
      }
     //////End Circle Marker//////

  /////Check setSystem ONLINE or OFFLINE  
  var setSystem=getCookie("setSystem");
  if(setSystem=="ONLINE"){
    document.getElementById("toggle").checked = true;
    onlineExicute();    

  }

      /////Off line Online Button  /////////
    document.getElementById("toggle").addEventListener("click", function(){
      if(document.getElementById("toggle").checked == true){        
        onlineExicute();
      }else{
        setCookie("setSystem","",1);
      andRoid(0);        
                
        setTimeout(function(){
          $.post('/bd/drv/dutyUpdate',{duty:'offline'},function(data){
            console.log(data)
           
            $("#Offline").css({"display":"block"});
            $("#map").css({"display":"none"});
            $("#nofofride").css({"display":"none"});
            clearWachposition();

            //////dutyHours Count//////
              dutyHourCount(0);

             ////////Call CashCollection//////         
              window.location.href="../bd/preDriverCash?offline=1";
          });
        },1000);
         
        
      }
    }); 
    
    function onlineExicute(){     
      wachLocation();
    
        setCookie("setSystem","ONLINE",1);

        $("#Offline").css({"display":"none"});
        $("#nofofride").css({"display":"block"});
        $("#map").css({"display":"block"});
      
     
      /////Android Interface
      andRoid(getCookie("countryCode"));
      ////////////////

      //////duty Hour Count/////
      
      dutyHourCount(1);
      var pilotID=getCookie("pilotID");
      //////Driver City And Fule Peice Update////
      $.post('/bd/preRideCityFulepriceUpdate',{pilotID:pilotID},function(cityFule){
        
        if(cityFule=="0"){
          alert("City Name Not Registert Please Contact Your local Office");
        }else{
          console.log(cityFule);
        }
      })


     

      $.post('/bd/preRidePageInitiate',{pilotID:pilotID,driverBusy:"busy"},function(rides){
        
        console.log("Rides detals",rides)
        var smalest=0;
        var smalIndx=0

        var out="";
        var addressPart="";
        var btnPart="";
        var canceltimerPart="";
        var callpart="";
        var hiddenPart="";

        rides.forEach(function(val,indx,ar){
          if(indx==0){
            smalest=val.bookingID;
            smalIndx=indx;
        }else{
            if(smalest > val.bookingID){
                smalest=val.bookingID;
                smalIndx=indx;
            }                

        }

            ////////check callbookingStatus ///////

            if(val.callbookingStatus=="clineLocate"){
              addressPart='<div id="listItem'+indx+'" class="row listItem">\
              <div id="nameAds'+indx+'" class="col-xs-9 col-sm-9">\
              <p class="prerideName"><span>Order ID: '+val.bookingID+'</span><br>Pickup Form : '+val.name+'</p>\
                  <p class="prerideads">'+val.picupaddress+'</p>\
              </div>\
              <div id="mapBtn'+indx+'" class="col-xs-3 col-sm-3">\
                  <button id="mapBtn" onclick="googlemapbtn(\'' + 1 + '\',\'' + val.picuklatlng + '\',\'' + val.bookingID + '\')" type="button" class="btn btn-info mybtn"><i class="fa fa-location-arrow" aria-hidden="true"></i></button>\
              </div>';
              btnPart='<input onclick="clineLocated(\''+indx+'\')" id="clineLocated'+indx+'" class="pickupPreridebtn1" type="button" value="Cline Located">\
              <input onclick="startRide(\''+indx+'\')" id="startRide'+indx+'" class="pickupPreridebtn" type="button" value="Start Ride">\
              <input onclick="finishride(\''+indx+'\')" id="finishride'+indx+'" class="pickupPreridebtn1" type="button" value="Finish Ride">';
              canceltimerPart='<div class="OrderCancelTimer1" id="OrderCancelTimer'+indx+'">\
              <div style="margin-top: 5px;" class="col-xs-9 col-sm-9" >\
                  <div class="timeBtn1" id="timeBtn'+indx+'">\
                      <div class="btn btn-danger col-xs-6 col-sm-6" onclick="cancelOrderByDriver(\'' + val.bookingID + '\',\'' + indx + '\')">Cancel Order</div>\
                      <div onclick="timeDisplay(\'' + val.bookingID + '\',\'' + indx + '\')" class="btn btn-primary col-xs-6 col-sm-6">Wait Again</div>\
                  </div>\
              </div>\
              <div class="col-xs-3 col-sm-3" >\
                  <div class="timeDisplay" id="timeDisplay'+indx+'">\
                      <p>0:00</p>\
                  </div>\
              </div>\
              </div>';
            }else{
              if(val.callbookingStatus=="startRide"){
                addressPart='<div id="listItem'+indx+'" class="row listItem">\
                <div id="nameAds'+indx+'" class="col-xs-9 col-sm-9">\
                <p class="prerideName"><span>Order ID: '+val.bookingID+'</span><br>Drop To : '+val.name+'</p>\
                    <p class="prerideads">'+val.dropaddress+'</p>\
                </div>\
                <div id="mapBtn'+indx+'" class="col-xs-3 col-sm-3">\
                    <button id="mapBtn" onclick="googlemapbtn(\'' + 2 + '\',\'' + val.droplatlng + '\',\'' + val.bookingID + '\')" type="button" class="btn btn-info mybtn"><i class="fa fa-location-arrow" aria-hidden="true"></i></button>\
                </div>';
                btnPart='<input onclick="clineLocated(\''+indx+'\')" id="clineLocated'+indx+'" class="pickupPreridebtn1" type="button" value="Cline Located">\
                <input onclick="startRide(\''+indx+'\')" id="startRide'+indx+'" class="pickupPreridebtn1" type="button" value="Start Ride">\
                <input onclick="finishride(\''+indx+'\')" id="finishride'+indx+'" class="pickupPreridebtn" type="button" value="Finish Ride">';
                
              }else{
                addressPart='<div id="listItem'+indx+'" class="row listItem">\
                <div id="nameAds'+indx+'" class="col-xs-9 col-sm-9">\
                <p class="prerideName"><span>Order ID: '+val.bookingID+'</span><br>Pickup Form : '+val.name+'</p>\
                    <p class="prerideads">'+val.picupaddress+'</p>\
                </div>\
                <div id="mapBtn'+indx+'" class="col-xs-3 col-sm-3">\
                    <button id="mapBtn" onclick="googlemapbtn(\'' + 1 + '\',\'' + val.picuklatlng + '\',\'' + val.bookingID + '\')" type="button" class="btn btn-info mybtn"><i class="fa fa-location-arrow" aria-hidden="true"></i></button>\
                </div>';
                btnPart='<input onclick="clineLocated(\''+indx+'\')" id="clineLocated'+indx+'" class="pickupPreridebtn" type="button" value="Cline Located">\
                <input onclick="startRide(\''+indx+'\')" id="startRide'+indx+'" class="pickupPreridebtn1" type="button" value="Start Ride">\
                <input onclick="finishride(\''+indx+'\')" id="finishride'+indx+'" class="pickupPreridebtn1" type="button" value="Finish Ride">';
                canceltimerPart='<div class="OrderCancelTimer" id="OrderCancelTimer'+indx+'">\
                <div style="margin-top: 5px;" class="col-xs-9 col-sm-9" >\
                    <div class="timeBtn" id="timeBtn'+indx+'">\
                        <div class="btn btn-danger col-xs-6 col-sm-6" onclick="cancelOrderByDriver(\'' + val.bookingID + '\',\'' + indx + '\')">Cancel Order</div>\
                        <div onclick="timeDisplay(\'' + val.bookingID + '\',\'' + indx + '\')" class="btn btn-primary col-xs-6 col-sm-6">Wait Again</div>\
                    </div>\
                </div>\
                <div class="col-xs-3 col-sm-3" >\
                    <div class="timeDisplay" id="timeDisplay'+indx+'">\
                        <p>5:00</p>\
                    </div>\
                </div>\
                </div>';
              }

            }
        
            out+=''+addressPart+'<div class="col-xs-9 col-sm-9">\
            <input type="hidden" id="preRideOTP'+indx+'" value="'+val.preRideOTP+'">\
            <input type="hidden" id="CustID'+indx+'" value="'+val.CustID+'">\
            <input type="hidden" id="pilotID'+indx+'" value="'+val.pilotID+'">\
            <input type="hidden" id="droplatlng'+indx+'" value="'+val.droplatlng+'">\
            <input type="hidden" id="picuklatlng'+indx+'" value="'+val.picuklatlng+'">\
            <input type="hidden" id="dropaddress'+indx+'" value="'+val.dropaddress+'">\
            <input type="hidden" id="name'+indx+'" value="'+val.name+'">\
            <input type="hidden" id="bookingID'+indx+'" value="'+val.bookingID+'">\
            '+btnPart+'\
            </div>\
            <div class="col-xs-3 col-sm-3 telmsg">\
                <a href="tel:'+val.isdCode+val.mobileNumber+'"><button type="button" class="btn btn-warning btn-xs"><i class="fa fa-phone" aria-hidden="true"></i></button></a>\
                <a href="sms:'+val.isdCode+val.mobileNumber+'"><button type="button" class="btn btn-warning btn-xs"><i class="fa fa-comments" aria-hidden="true"></i></button></a>\
            </div>\
            '+canceltimerPart+'\
            </div>';


            if(indx===ar.length -1){
               
                $("#rideList").html(out);
                $("#listItem"+smalIndx+"").css({"background-color":"#91bb2f"})
            }
        });
      });

    }

    function andRoid(a){
     Android.onlineOffline(a);
    }
    
    function dutyHourCount(a){      
      if(a==1){
        ////Olnune////
        if(getCookie("dutyCount")){
          setDytyCookie("dutyCount",getCookie("dutyCount"),20);
        }else{
          console.log("SDDDDDD")
          var pilotID=getCookie("pilotID");
          var strtlatlng=JSON.parse(getCookie("position"))
          var dutyLogondetails={pilotID:pilotID, start:new Date(),strtlatlng:strtlatlng}
          setDytyCookie("dutyCount",JSON.stringify(dutyLogondetails),20);          
        }
      }else{
        /////Offline///       
        var dutyLogo=JSON.parse(getCookie("dutyCount"));         
        var stoplatlng=JSON.parse(getCookie("position"));         
        $.post('/bd/updateDutylogdetails',{
          pilotID:dutyLogo.pilotID,
          startTime:dutyLogo.start,
          strtlat:dutyLogo.strtlatlng.lat,
          strtlng:dutyLogo.strtlatlng.lng,
          stoplat:stoplatlng.lat,
          stoplng:stoplatlng.lng,
        },function(data){
          console.log("dutyLog",data);
        });         

      }

    }


  
  /////continueNextRide /////////
  document.getElementById("continueNextRide").addEventListener("click", function(){ 
    var bookingID=$("#bookingIDFinish").val(); 
    //alert(bookingID)  
    $.post('/bd/finishandUpdateRide',{bookingID:bookingID},function(data){
      if(data){
        onlineExicute();
        $("#billAndfeedback").css({"display":"none"});
        document.getElementById("toggle").checked = true;        
      }
      
    });
    
  });

 
  

}/////End INITMAP