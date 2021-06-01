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
        $.post('/india/preRideGetDriverLocation',{},function(driverloc){
          if(driverloc){
            //alert(JSON.stringify(driverloc))
            //console.log("driverloc",driverloc);
                circleMarker(driverloc);  
          }
        });
      },2000);
      
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
            icon:new google.maps.MarkerImage('/india/images/bluecircle.png',
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
        $.post('/india/offlinePermission',{},function(offper){
          if(offper){
            offlineExecute();
          }else{
            alert("Please  Contact your Customer Care !! ")
            document.getElementById("toggle").checked = true;  
          }
        })
       // 
        

      }
    }); 

     ///////Handel Socket io  parameter/////// 
 var socket = io('//'+document.location.hostname+':'+document.location.port);
    socket.on('offlinereqbyadmin', function (data) {
    if(data.pilotID==getCookie("pilotID") && data.mode=="offline"){
      offlineExecute();
      document.getElementById("toggle").checked = false;
    }

  })

  var socket = io('//'+document.location.hostname+':'+document.location.port);
    socket.on('onlinereqbyadmin', function (data) {
    if(data.pilotID==getCookie("pilotID") && data.mode=="online"){
      onlineExicute();
      document.getElementById("toggle").checked = true;
    }

  })

    function offlineExecute(){
      document.getElementById("toggle").checked = false; 
      setCookie("setSystem","",1);
      var obj = { Name : getCookie("countryCode"), pilotID: getCookie("pilotID"), reqestType:"offline"};
      var str = JSON.stringify(obj);
      andRoid(str);
      setTimeout(function(){        
        $.post('/india/drv/dutyUpdate',{duty:'offline'},function(data){
          console.log(data);          
          if(data){
          $("#Offline").css({"display":"block"});
          $("#map").css({"display":"none"});
          $("#nofofride").css({"display":"none"});
          clearWachposition();
          //alert()
          //dutyHours Count//////
            dutyHourCount("0",function(duty){
              if(duty){
                ////////Call CashCollection//////         
                window.location.href="../india/preDriverCash?offline=exit";   
              }
            });
          }         
          
        });
      },1000*3);
    }
    
    function onlineExicute(){
       //////duty Hour Count/////       
       dutyHourCount("1", function(duty){
        if(duty=="success"){
        wachLocation();
    
        setCookie("setSystem","ONLINE",1);
        $("#Offline").css({"display":"none"});
        $("#nofofride").css({"display":"block"});
        $("#map").css({"display":"block"}); 
        
        
     
      /////Android Interface
      var obj = { Name : getCookie("countryCode"), pilotID: getCookie("pilotID"), reqestType:"online"};
      var str = JSON.stringify(obj);
      console.log(str);
      andRoid(str);
      ////////////////

     
      var pilotID=getCookie("pilotID");
      //////Driver City And Fule Peice Update////
      $.post('/india/preRideCityFulepriceUpdate',{pilotID:pilotID},function(cityFule){        
        if(cityFule=="0"){
          alert("City Name Not Registert Please Contact Your local Office");
        }else{
          console.log(cityFule);
        }
      })
    

      ///////DEmand Init/////////

      demandCallInitiate(pilotID);

      $.post('/india/preRidePageInitiate',{pilotID:pilotID,driverBusy:"busy"},function(rides){        
        console.log("Rides detals",rides)
        var smalest=0;
        var smalIndx=0

        var out="";
        var addressPart="";
        var btnPart="";
        var canceltimerPart="";
        var callpart="";
        var hiddenPart="";
        var timerPart="";
        var offIndex=0;
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

        if(val.callbookingStatus== "finishRide"){          
          $("#listItem"+indx+"").css({"display":"none"})
          $("#billAndfeedback").css({"display":"block"});                  
          $("#OTP-Content").css({"display":"none"});
          $("#startRide"+indx+"").css({"display":"none"});
          $("#finishride"+indx+"").css({"display":"none"});
          
          $("#amt").text(val.driverCashCollectio)
          $("#bookingIDFinish").val(val.bookingID);
          var offIndex=indx;
          
        }
         
            ////////check callbookingStatus ///////
            if(val.callbookingStatus=="clineLocate"){
              timerPart=' <div id="finish-timer'+indx+'" style="height: 50px; display:none;" class="col-xs-4 col-sm-4 col-xs-offset-4 col-sm-offset-4">\
                <img style="height: 100%; width: 100%;" src="/india/images/gif/circle1.gif">\
                <div id="timer-text'+indx+'" style="text-align: center; font-size: 25px; font-weight: bolder; position: relative; top: -80%;">10</div>\
                </div>'
              addressPart='<div id="listItem'+indx+'" class="row listItem">\
              <div id="nameAds'+indx+'" class="col-xs-9 col-sm-9">\
              <p class="prerideName"><span>Order ID: '+val.bookingID+'</span><br>Pickup Form : '+val.name+'</p>\
                  <p class="prerideads">'+val.picupaddress+'</p>\
              </div>\
              <div id="mapBtn'+indx+'" class="col-xs-3 col-sm-3">\
                  <button id="mapBtn" onclick="googlemapbtn(\'' + 1 + '\',\'' + val.picuklatlng + '\',\'' + val.bookingID + '\',\'' + indx + '\')" type="button" class="btn btn-info mybtn"><i class="fa fa-location-arrow" aria-hidden="true"></i></button>\
              </div>';
              btnPart='<input onclick="clineLocated(\''+indx+'\',\'' + val.picuklatlng + '\')" id="clineLocated'+indx+'" class="pickupPreridebtn1" type="button" value="Cline Located">\
              <input onclick="startRide(\''+indx+'\')" id="startRide'+indx+'" class="pickupPreridebtn" type="button" value="Start Ride">\
              <input onclick="finishride(\''+indx+'\',\'' + val.droplatlng + '\')" id="finishride'+indx+'" class="pickupPreridebtn1" type="button" value="Finish Ride">';
              canceltimerPart='<div class="OrderCancelTimer1" id="OrderCancelTimer'+indx+'">\
              <div style="margin-top: 5px;" class="col-xs-8 col-sm-8" >\
                  <div class="timeBtn1" id="timeBtn'+indx+'">\
                      <div class="btn btn-danger col-xs-6 col-sm-6" onclick="cancelOrderByDriver(\'' + val.bookingID + '\',\'' + indx + '\')">Cancel Order</div>\
                      <div onclick="timeDisplay(\'' + val.bookingID + '\',\'' + indx + '\')" class="btn btn-primary col-xs-6 col-sm-6">Wait Again</div>\
                  </div>\
              </div>\
              <div class="col-xs-4 col-sm-4" >\
                  <div class="timeDisplay" id="timeDisplay'+indx+'">\
                      <p>0:00</p>\
                  </div>\
              </div>\
              </div>';
            }else{
              if(val.callbookingStatus=="startRide"){
                timerPart=' <div id="finish-timer'+indx+'" style="height: 50px; display:none" class="col-xs-4 col-sm-4 col-xs-offset-4 col-sm-offset-4">\
                <img style="height: 100%; width: 100%;" src="/india/images/gif/circle1.gif">\
                <div id="timer-text'+indx+'" style="text-align: center; font-size: 25px; font-weight: bolder; position: relative; top: -80%;">10</div>\
                </div>'
                addressPart='<div id="listItem'+indx+'" class="row listItem">\
                <div id="nameAds'+indx+'" class="col-xs-9 col-sm-9">\
                <p class="prerideName"><span>Order ID: '+val.bookingID+'</span><br>Drop To : '+val.name+'</p>\
                    <p class="prerideads">'+val.dropaddress+'</p>\
                </div>\
                <div id="mapBtn'+indx+'" class="col-xs-3 col-sm-3">\
                    <button id="mapBtn" onclick="googlemapbtn(\'' + 2 + '\',\'' + val.droplatlng + '\',\'' + val.bookingID + '\',\'' + indx + '\')" type="button" class="btn btn-info mybtn"><i class="fa fa-location-arrow" aria-hidden="true"></i></button>\
                </div>';
                btnPart='<input onclick="clineLocated(\''+indx+'\',\'' + val.picuklatlng + '\')" id="clineLocated'+indx+'" class="pickupPreridebtn1" type="button" value="Cline Located">\
                <input onclick="startRide(\''+indx+'\')" id="startRide'+indx+'" class="pickupPreridebtn1" type="button" value="Start Ride">\
                <input onclick="finishride(\''+indx+'\',\'' + val.droplatlng + '\')" id="finishride'+indx+'" class="pickupPreridebtn" type="button" value="Finish Ride">';
                
              }else{
                timerPart=' <div id="finish-timer'+indx+'" style="height: 50px; display:none;" class="col-xs-4 col-sm-4 col-xs-offset-4 col-sm-offset-4">\
                <img style="height: 100%; width: 100%;" src="/india/images/gif/circle1.gif">\
                <div id="timer-text'+indx+'" style="text-align: center; font-size: 25px; font-weight: bolder; position: relative; top: -80%;">10</div>\
                </div>'
                addressPart='<div id="listItem'+indx+'" class="row listItem">\
                <div id="nameAds'+indx+'" class="col-xs-9 col-sm-9">\
                <p class="prerideName"><span>Order ID: '+val.bookingID+'</span><br>Pickup Form : '+val.name+'</p>\
                    <p class="prerideads">'+val.picupaddress+'</p>\
                </div>\
                <div id="mapBtn'+indx+'" class="col-xs-3 col-sm-3">\
                    <button id="mapBtn" onclick="googlemapbtn(\'' + 1 + '\',\'' + val.picuklatlng + '\',\'' + val.bookingID + '\',\'' + indx + '\')" type="button" class="btn btn-info mybtn"><i class="fa fa-location-arrow" aria-hidden="true"></i></button>\
                </div>';
                btnPart='<input style="display: none;" onclick="clineLocated(\''+indx+'\',\'' + val.picuklatlng + '\')" id="clineLocated'+indx+'" class="pickupPreridebtn" type="button" value="Cline Located">\
                <input onclick="startRide(\''+indx+'\')" id="startRide'+indx+'" class="pickupPreridebtn1" type="button" value="Start Ride">\
                <input onclick="finishride(\''+indx+'\',\'' + val.droplatlng + '\')" id="finishride'+indx+'" class="pickupPreridebtn1" type="button" value="Finish Ride">';
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
        
            out+=''+timerPart+''+addressPart+'<div class="col-xs-8 col-sm-8">\
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
            <div style="margin-top: -5px;" class="col-xs-4 col-sm-4 telmsg">\
                <a href="tel:'+val.isdCode+val.mobileNumber+'"><button type="button" class="btn btn-warning btn-ms"><i class="fa fa-phone" aria-hidden="true"></i></button></a>\
                <a href="sms:'+val.isdCode+val.mobileNumber+'"><button type="button" class="btn btn-warning btn-ms"><i class="fa fa-comments" aria-hidden="true"></i></button></a>\
            </div>\
            '+canceltimerPart+'\
            </div>';


            if(indx===ar.length -1){
               
                $("#rideList").html(out);
                $("#listItem"+smalIndx+"").css({"background-color":"#b0f1ee"})
                $("#listItem"+offIndex+"").css({"display":"none"});
                
            }
        });


      });
    }
    });

  }

  function demandCallInitiate(pilotID){
    $.post('/india/demandCallInitiate',{pilotID:pilotID,driverBusy:"busy",demandCall:"demandCall"},function(rides){ 
      if(rides){
        if(rides.demandCall=="demandCall"){
          $("#driverFreetoMove").css({"display":"block"});
          var out='<div class="container-fluid">\
          <div class="row">\
              <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">\
                  <div style="background-color:#facb3d; height: 65vh; text-align: center; " class="thumbnail">\
                  <img style="width: 30%; margin-top: 30px;" src="/india/images/centerpin.png" alt="">\
                      <div  class="caption">\
                          <p>'+rides.droplatlng[0]+' , '+rides.droplatlng[1]+'</p>\
                          <h3>Your Demand Location</h3>\
                          <p>\
                              <a onclick="openMap(\'' + rides.bookingID + '\',\'' + rides.droplatlng[0] + '\',\'' + rides.droplatlng[1] + '\',\'' + rides.pilotID + '\', \'' + rides.subAdminID + '\')" class="btn btn-primary"><i class="fa fa-location-arrow" aria-hidden="true"></i></a>\
                              <a id="inLocation" onclick="inLocation(\'' + rides.pilotID + '\', \'' + rides.bookingID + '\', \'' + rides.subAdminID + '\')" class="btn btn-default">I am in Location</a>\
                          </p>\
                      </div>\
                  </div>\
              </div>\
          </div>\
      </div>';
      $("#driverFreetoMove").html(out)
      $("#inLocation").css({"display": "block"})
        }
      }
      
    });
  }


    function andRoid(a){
     Android.onlineOffline(a);
    }
  
    var dutygap;
    function dutyHourCount(a,cb){      
      if(a=="1"){
        ////Olnune////
        dutyGapControl();
        cb("success");
      }else{        
        /////Offline///   
        if(getCookie("dutyCount") && getCookie("position")){
          var dutyLogo=JSON.parse(getCookie("dutyCount"));         
          var stoplatlng=JSON.parse(getCookie("position")); 
          
          var dutyhour=new Date().getTime() - new Date(dutyLogo.start).getTime();
         // alert(dutyhour);
          clearInterval(dutygap); 
          setDytyCookie("dutyCount"," ",1);      
          $.post('/india/updateDutylogdetails',{
            pilotID:dutyLogo.pilotID,
            dutyhour:dutyhour,
            loginTime:new Date(dutyLogo.start),
            logoutTime:new Date(),
            strtlat:dutyLogo.strtlatlng.lat,
            strtlng:dutyLogo.strtlatlng.lng,
            stoplat:stoplatlng.lat,
            stoplng:stoplatlng.lng,
          },function(data){
            console.log("dutyLog",data);            
            cb("success");            
          });
        }else{
          clearInterval(dutygap);
          cb("success");
        }    
                

      }

    }
    

   function dutyGapControl(){
    var pilotID= getCookie("pilotID");
    setTimeout(function(){      
      if(getCookie("dutyCount")){
        setDytyCookie("dutyCount",getCookie("dutyCount"),20);
      }else{
        if(getCookie("position")){
          var strtlatlng=JSON.parse(getCookie("position"));
          var dutyLogondetails={pilotID:pilotID, start:new Date(),strtlatlng:strtlatlng}
          setDytyCookie("dutyCount",JSON.stringify(dutyLogondetails),20);
          
        }

      }
     },1000*30)
    
    dutygap=setInterval(function(){
      if(getCookie("dutyCount")){
        setDytyCookie("dutyCount",getCookie("dutyCount"),15);
      }else{
        if(getCookie("position")){
          var strtlatlng=JSON.parse(getCookie("position"));
          var dutyLogondetails={pilotID:pilotID, start:new Date(),strtlatlng:strtlatlng}
          setDytyCookie("dutyCount",JSON.stringify(dutyLogondetails),20);
        }

      }
    },1000*60*5)
   } 


  
  /////continueNextRide /////////
  document.getElementById("continueNextRide").addEventListener("click", function(){ 
    var bookingID=$("#bookingIDFinish").val(); 
    //alert(bookingID)  
    $.post('/india/finishandUpdateRide',{bookingID:bookingID},function(data){
      if(data){
        //alert(data);
        onlineExicute();
        $("#billAndfeedback").css({"display":"none"});
        document.getElementById("toggle").checked = true;        
      }
      
    });
    
  });

/////// Duty Hours Control //////// 
setInterval(function(){
  var timeHours=new Date().getHours();
  $.post('/india/dutyhoursControl',{timeHours:timeHours},function(data){
    if(data){
      if(data.Status=="offline" && data.noofBooking < 1 ){
         var setSystem=getCookie("setSystem");
        if(setSystem=="ONLINE"){
          document.getElementById("toggle").checked = false;
          offlineExecute();
          console.log("Auto offline done");   
      
        }
        
      }else{
        //////Online//////
        console.log("online Permission Granted");
      }
    }
  });
},1000*10);


 ////////Map Ctrl Marker//////
 var demand=0;
 $('<div/>').addClass('demandArea').appendTo(map.getDiv())
 //do something onclick
 .click(function() {
   if(demand==1){
    //////Set Normal/////
    clearDemandArea();
    demand=0; 
   }else{
     demand=1;
     demandArea();
   
   }
   
 });
 $('<div/>').addClass('demandUpdate').appendTo(map.getDiv())
 //do something onclick
 .click(function() {
  demandArea();
 });

 function demandArea(){
 /////Get Demand Area Marker//////
 $("#map-msg").appendTo(map.getDiv())
  $("#map-msg").css({"display":"block"});
 $.post('/india/drv/getDemadndArea',{lat:map.getCenter().toJSON().lat,lng:map.getCenter().toJSON().lng},function(data){
  console.log(data)
  $("#map-msg").css({"display":"none"});
    if(data){
      var driverlist=[];        
      data.forEach(function(val,key,arr){          
         driverlist.push({lat:Number(val.location.coordinates[1]), lng:Number(val.location.coordinates[0])})
        if(key === arr.length -1){ 
          AllDemandMarker(driverlist);           
          }
      });
     
    }
  
 });

  $(".demandUpdate").css({"display":"block"});
  setCookie("stopMapSetCenter","YES",1);
 }

 function clearDemandArea(){
  //alert("clerdemand");
  $(".demandUpdate").css({"display":"none"});
  setCookie("stopMapSetCenter","NO",1);
  $("#map-msg").css({"display":"none"});
  clearDemandMarker();
 }

 ///////Nearest Demand Marker////////
 var DemandMarkers=[];
 var angleDegrees=90;
 function AllDemandMarker(DemandLocetion,type){    
   clearDemandMarker();
 DemandLocetion.forEach(function(val,indx){
  
   DemandMarkers.push(new google.maps.Marker({
     position: {lat:val.lat, lng:val.lng},
     //icon:new google.maps.MarkerImage('/images/ic_bike.png'),
     icon:{
         url: "/india/images/demand-marker.png", // url
         scaledSize: new google.maps.Size(20, 20), // scaled size
         origin: new google.maps.Point(0,0), // origin
         anchor: new google.maps.Point(10, 10), // anchor            
         
     },
     map: map,
     }));
     
     

 })
 }

///////Clear Demand Marker////////
 function clearDemandMarker(){
 if(DemandMarkers.length>0){
   DemandMarkers.forEach(function(valu,key,arry){
     valu.setMap(null);
     if(key===arry.length-1){
       DemandMarkers=[];
     }
 });
 }

 }
  

}/////End INITMAP