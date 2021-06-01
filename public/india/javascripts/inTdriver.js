///////////SET COOKES//////////
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  
  

  function setCookie(cname, cvalue, exdays) {
    // var d = new Date();
    // d.setTime(d.getTime() + (exdays*24*60*60*1000));
    // var expires = "expires="+ d.toUTCString();
    // document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    if(cvalue.length > 1){
        $.post('/india/setCookies',{cname:cname,cvalue:cvalue,expires:exdays*24*60*60*1000},function(data){
            console.log(data)
         })
       }else{
        $.post('/india/clerCookies',{cname:cname},function(data){  console.log(data)})
       }
  }

  function setDytyCookie(cname, cvalue, exdays) {
    // var d = new Date();
    // d.setTime(d.getTime() + (exdays*60*1000));
    // var expires = "expires="+ d.toUTCString();
    // document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    if(cvalue.length > 0){
        $.post('/india/setCookies',{cname:cname,cvalue:cvalue,expires:exdays*60*1000},function(data){
            console.log(data)
         })
       }else{
        $.post('/india/clerCookies',{cname:cname},function(data){  console.log(data)})
       }
  }

///////////END SET COOKES//////

///////////MAP INIT//////////
var map;
var centerMarker;
var circle;
var wachID;
function initMap() { 
  var ln=JSON.parse(getCookie("reglatlng")) 
    console.log(ln) ;
    map = new google.maps.Map(document.getElementById('map'), {
          zoom: 14,
          center: {lat: Number(ln.lat), lng: Number(ln.lng)},
          mapTypeId: 'roadmap',
          disableDefaultUI: true,
          map:map
        });
        
    ////////WatchLocation///////    
    var driverLocTimer;
    function wachLocation(){ 
      wachID= setInterval(function(){
        $.post('/india/GetTdriverLocation',{},function(driverloc){
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
 //////End Circle Marker//////


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

 /////Check setSystem ONLINE or OFFLINE  
 var setSystem=getCookie("setSystem");
 if(setSystem=="ONLINE"){
   document.getElementById("toggle").checked = true;
   onlineExicute();    

 }

   /////Off line Online /////////
   document.getElementById("toggle").addEventListener("click", function(){
   if(document.getElementById("toggle").checked == true){      
     onlineExicute();
   }else{
    offlineExecute()
   }
 }); 
/////OFFline  /////////
 function offlineExecute(){
    setCookie("setSystem","",1);
    setCookie("driverBusy","",1);    
    clearWachposition();      
    clearDemandArea();
    $("#offline-content").css({"display":"block"});
    $("#map").css({"display":"none"});
    /////Android Interface
    andRoid(0);
    //////////////// 

    $.post('/india/TrideDutyoffline',{},function(data){ 
      console.log(data);
    })

    
 }

 /////Online  /////////
 function onlineExicute(){   
   wachLocation();
   clearDemandArea();   
     setCookie("setSystem","ONLINE",1);
   /////Android Interface
      andRoid(getCookie("countryCode"));
   ////////////////
   $("#map").css({"display":"block"});
   $("#offline-content").css({"display":"none"});
    

   ////////Page INit/////
  pageInitiate();

  
   
 }

 var pilotID=getCookie("pilotID");
 //////Driver City And Fule Peice Update////
 $.post('/india/tdrv/CityFulepriceUpdate',{pilotID:pilotID},function(cityFule){        
   if(cityFule=="0"){
     alert("City Name Not Registert Please Contact Your local Office");
   }else{
     console.log("cityFule",cityFule);
   }
 })

 ////////Page INit/////
 function pageInitiate(){
    
  if($("#bookingID").val()){
    $.post('/india/tdrv/getPageInitiateDetails',{bookingID:$("#bookingID").val()},function(data){ 
    
        if($("#mapclick").val()=="clinelocat"){
          $("#clineLocated").css({"display":"block"});
        }        
            
      if($("#orderStage").val()=='accept'){
       $("#pickDrop-Content").css({"display":"block"});
       $("#orderNO").text(data.ride.bookingID);
       $("#bookingID").val(data.ride.bookingID)
       $("#CustID").val(data.ride.CustID);
       $("#OrderOTP").val(data.ride.preRideOTP);
       $("#telsms").html('<a href="tel:'+data.cust.isdCode+data.cust.mobileNumber+'"><button type="button" class="btn btn-warning btn-ms"><i class="fa fa-phone" aria-hidden="true"></i></button></a>\
       <a href="sms:'+data.cust.isdCode+data.cust.mobileNumber+'"><button type="button" class="btn btn-warning btn-ms"><i class="fa fa-comments" aria-hidden="true"></i></button></a>');
       $("#address").html('<p>Pick up: <br> <strong>'+data.cust.name+'</strong> <br>'+data.ride.picupaddress+'</p>');
       $("#mapBtn").html('<button onclick="googlemapbtn(\'' + 1 + '\',\'' + data.ride.picuklatlng + '\',\'' + data.ride.bookingID + '\')" type="button" class="btn btn-info mybtn"><i class="fa fa-location-arrow" aria-hidden="true"></i></button>'); 

       //$("#clineLocated").css({"display":"block"});
      }else{
       if($("#orderStage").val()=='startRide'){
        $("#ringtone").css({"display":"none"});           
        $("#pickDrop-Content").css({"display":"block"});
        $("#orderNO").text(data.ride.bookingID);
        $("#bookingID").val(data.ride.bookingID)
        $("#CustID").val(data.ride.CustID);
        $("#OrderOTP").val(data.ride.preRideOTP);
        $("#telsms").html('<a href="tel:'+data.cust.isdCode+data.cust.mobileNumber+'"><button type="button" class="btn btn-warning btn-xs"><i class="fa fa-phone" aria-hidden="true"></i></button></a>\
        <a href="sms:'+data.cust.isdCode+data.cust.mobileNumber+'"><button type="button" class="btn btn-warning btn-xs"><i class="fa fa-comments" aria-hidden="true"></i></button></a>');
        $("#address").html('<p>Drop to: <br> <strong>'+data.cust.name+'</strong> <br>'+data.ride.dropaddress+'</p>');
        $("#mapBtn").html('<button onclick="googlemapbtn(\'' + 2 + '\',\'' + data.ride.droplatlng + '\',,\'' + data.ride.bookingID + '\')" type="button" class="btn btn-info mybtn"><i class="fa fa-location-arrow" aria-hidden="true"></i></button>'); 
        $("#startRide").css({"display":"none"});
        $("#clineLocated").css({"display":"none"});
        $("#finishride").css({"display":"block"});

       }else{
         if($("#orderStage").val()=='finishRide'){
          $("#pickDrop-Content").css({"display":"none"});
          $("#billAndfeedback").css({"display":"block"}); 
          $("#orderNO").text(data.ride.bookingID);
          $("#CustID").val(data.ride.CustID);
          $("#OrderOTP").val(data.ride.preRideOTP);                 
              $("#OTP-Content").css({"display":"none"});
              $("#startRide").css({"display":"none"});
              $("#finishride").css({"display":"none"});
              $("#pickdropfooter").css({"display":"none"});
              $("#pickdropHead").css({"display":"none"});
              $("#amt").text(data.ride.totalamount)

         }
          
         

       }

      }
     })

  }
}

/////continueNextRide /////////
document.getElementById("continueNextRide").addEventListener("click", function(){    
  $.post('/india/drv/finishEverythingAndSetNormal',{
    CustID:$("#CustID").val(),
    bookingID: $("#orderNO").text() 
  },function(data){
    if(data){
     
      $("#billAndfeedback").css({"display":"none"});
      
      incetiveAndBooking();
    }
    
  });
  
});

function incetiveAndBooking(){
  //alert("ddd")
  $.post('/india/tdrv/bookingIncentiveDetails',{},function(data){
    console.log("tttdd inst", data)
    $("#booking").text(data.noOfBooking);
    $("#earning").text(data.totalErning.toFixed(0));
    $("#cash").text(data.driverCashCollectio.toFixed(0));
  });
}

incetiveAndBooking();


  ///////FOR ANDROID //////
 function andRoid(a){
  Android.onlineOffline(a);
  }



}
///////////END MAP INIT//////

function ringingTime(){
  var timer;
  var count = 15;
  timer=setInterval(function(){
      count=count-1;
      var min=parseInt(count/60);
      var sec=(count % 60);
      if(sec < 10){
          sec='0'+sec+'';
      }
      $("#ringClock").html(''+sec+'')
      if(count < 1){          
          clearInterval(timer);
          $("#ringtone").css({"display":"none"})
          
      }
  },1000);

}



///////Handel Socket io  parameter/////// 
var socket = io('//'+document.location.hostname+':'+document.location.port);  
socket.on('openAcceptWindow', function (data) {
  console.log('openAcceptWindow',data);
  if(data.pilotID==getCookie("pilotID")){
/////////Confrm Accept Windo Open Properly//////
$.post('/india/tdrv/confrmAcceptWindowOpenProperly',{pilotID:data.pilotID},function(dat){
  $("#ringtone").css({"display":"block"});
  $("#pickupFrom").text(data.pickuoAddress);
  $("#pilotID").val(data.pilotID);
  $("#CustID").val(data.CustID);
  ringingTime();
  setTimeout(function(){
      $("#ringtone").css({"display":"none"});
      $.post('/india/tdrv/resetRingtone',{pilotID:data.pilotID},function(dat){
          console.log(dat);
      });
  },14*1000)
     })

  } 
     
  
});

    //////////Driver Accept /////////
    function acceptRide(){                        
      var pilotID= $("#pilotID").val(); 
      var CustID= $("#CustID").val(); 
      $.post('/india/tdrv/AcceptCallByTdriver',{pilotID:pilotID,CustID:CustID},function(data){            
      if(data){ 
          $("#ringtone").css({"display":"none"});
          Android.stopRingtone();     
      }        
     
      });
  }
        ///////Display List Accept Call Details /////
        socket.on('CallAcceptListDisplay', function (resp) {            
          ///////Genareate Driver Busy Coockes/////
          //setCookie("driverBusy","busy",30);
          if(resp.pilotID==getCookie("pilotID")){
              $.post('/india/tdrv/clineDetalls',{pilotID:resp.pilotID,CustID:resp.CustID,bookingID:resp.bookingID},function(data){
                  $("#pickDrop-Content").css({"display":"block"});
                  $("#orderNO").text(data.ride.bookingID);
                  $("#bookingID").val(data.ride.bookingID)
                  $("#CustID").val(data.ride.CustID);
                  $("#OrderOTP").val(data.ride.preRideOTP);                    
                  $("#telsms").html('<a href="tel:'+data.cust.isdCode+data.cust.mobileNumber+'"><button type="button" class="btn btn-warning btn-ms"><i class="fa fa-phone" aria-hidden="true"></i></button></a>\
                  <a href="sms:'+data.cust.isdCode+data.cust.mobileNumber+'"><button type="button" class="btn btn-warning btn-ms"><i class="fa fa-comments" aria-hidden="true"></i></button></a>');
                  $("#address").html('<p>Pick up: <br> <strong>'+data.cust.name+'</strong> <br>'+data.ride.picupaddress+'</p>');
                  $("#mapBtn").html('<button onclick="googlemapbtn(\'' + 1 + '\',\'' + data.ride.picuklatlng + '\',\'' + data.ride.bookingID + '\')" type="button" class="btn btn-info mybtn"><i class="fa fa-location-arrow" aria-hidden="true"></i></button>'); 

                  //$("#clineLocated").css({"display":"block"});
              })

          }
      });


  ///////Google Map BTN //////////
  function googlemapbtn(a,b,bookingID){
    var lanlng=[b];
   console.log("picuklatlng",lanlng)
  if(a==1){
      if /* if we're on iOS, open in Apple Maps */
      ((navigator.platform.indexOf("iPhone") != -1) || 
       (navigator.platform.indexOf("iPad") != -1) || 
       (navigator.platform.indexOf("iPod") != -1)){
          window.open("maps://maps.google.com/maps?daddr="+lanlng[0]+","+lanlng[1]+", &amp;ll=");
       }else{
          window.open("https://maps.google.com/maps?daddr="+lanlng[0]+","+lanlng[1]+"&amp;ll=");
       } /* else use Google */

        //////Start Car LogBook Reding For PreRide//////
        $.post("/india/tdrv/startCarLoogbook",{bookingID:bookingID},function(data){console.log(data)});
        $("#clineLocated").css({"display":"block"});
       
       
  }else{
      if(a==2){
     // alert("drop")
      if /* if we're on iOS, open in Apple Maps */
  ((navigator.platform.indexOf("iPhone") != -1) || 
   (navigator.platform.indexOf("iPad") != -1) || 
   (navigator.platform.indexOf("iPod") != -1)){
      window.open("maps://maps.google.com/maps?daddr="+lanlng[0]+","+lanlng[1]+" &amp;ll=");
   }else{
      window.open("https://maps.google.com/maps?daddr="+lanlng[0]+","+lanlng[1]+"&amp;ll=");
   } /* else use Google */
  }
}
}

////////// On Cline Clocated/////////
function clineLocated(){ 
  $.post('/india/tdrv/clinelocatedCheckDistance',{CustID:$("#CustID").val(),bookingID:$("#bookingID").val()},function(respon){
  console.log("respon",respon)
  if(Number(respon.distance) < 1000){
    clineLocatedStart($("#CustID").val(),$("#bookingID").val());  
   }else{
       alert("You have not reach your destination");
   }

  });

}
function clineLocatedStart(CustID, bookingID){
  $("#clineLocated").css({"display":"none"});
  $("#startRide").css({"display":"block"});
  timeDisplay(bookingID);
  $.post("/india/tdrv/CarLoogbookClineLocate",{CustID:CustID,bookingID:bookingID},function(data){
    console.log(data)
    if(data=="error"){
      alert("GPS Location Not Found Please Check and Try Again")
      $("#clineLocated").css({"display":"block"});
      $("#startRide").css({"display":"none"});
    }
  });
}

function timeDisplay(bookingID){
  //alert(bookingID)
  var timer;
  var count = 60*5;
  $("#timeBtn").css({"display":"none"});
  $("#OrderCancelTimer").css({"display":"block"}); 
  timer=setInterval(function(){
      count=count-1;
      var min=parseInt(count/60);
      var sec=(count % 60);
      if(sec < 10){
          sec='0'+sec+'';
      }
      $("#timeDisplay").html('<p>'+min+':'+sec+'</p>')
      if(count < 0){
          $("#timeDisplay").html('<p>0:00</p>')
          clearInterval(timer);
          $("#timeBtn").css({"display":"block"}); 
          $("#timeBtn").html('<div class="btn btn-danger" onclick="cancelOrderByDriver('+bookingID+')">Cancel Order</div>\
          <div style="margin-top: 5px;" onclick="timeDisplay('+bookingID+')" class="btn btn-primary">Wait Again</div>') 
      }
  },1000);

}


  
function otpinput(){        
var valu=$("#otpp").val()
if(valu.length >3){
  
  if($("#OrderOTP").val()==valu){
      $.post('/india/tdrv/startRide',{CustID:$("#CustID").val(),bookingID: $("#orderNO").text()},function(data){
          
              if(data){
                  $("#address").html('<p>Drop To: <br> <strong>'+data.cust.name+'</strong> <br>'+data.ride.dropaddress+'</p>');
                  $("#mapBtn").html('<button onclick="googlemapbtn(\'' + 2 + '\',\'' + data.ride.droplatlng + '\',\'' + data.ride.bookingID + '\')" type="button" class="btn btn-info mybtn"><i class="fa fa-location-arrow" aria-hidden="true"></i></button>');
                  $("#OTP-Content").css({"display":"none"});
                  $("#startRide").css({"display":"none"});
                  $("#OrderCancelTimer").css({"display":"none"});
                  $("#finishride").css({"display":"block"});
                  $("#otpp").val("");                            
                  googlemapbtn( 2 , data.ride.droplatlng,data.ride.bookingID);    
                 
              }

          });
      
  }else{
      $("#otpp").css({"background-color": "#df0d0d","color": "#FFF" })
  }
}
}  
/////////Start Ride ////////
function startRide(){     
$("#OTP-Content").css({"display":"block"});
}
////////Finish Ride///////   
function finishride(){   
  
  $.post('/india/tdrv/finishCheckDistance',{CustID:$("#CustID").val(),bookingID:$("#bookingID").val()},function(respon){
    console.log("respon",respon)
    // if(Number(respon.distance) < 2000){
    //   finishRideStart($("#CustID").val(),$("#bookingID").val());  
    //  }else{
    //      alert("You have not reach your destination");
    //  }
     
     if(Number(respon.travelmod)>1){
      if(Number(respon.distance) < 4000){
        finishRideStart($("#CustID").val(),$("#bookingID").val());
      }else{
          alert("You have not reach your destination");
         
      }

    }else{
      if(Number(respon.distance) < 2000){
        finishRideStart($("#CustID").val(),$("#bookingID").val());
      }else{
          alert("You have not reach your destination");
    
      }
    }
  
    });


}

function finishRideStart(CustID,bookingID){
  $.post('/india/tdrv/finishRide',{CustID:CustID,bookingID:bookingID},function(respon){
    if(respon){           
                $("#pickDrop-Content").css({"display":"none"});
                $("#billAndfeedback").css({"display":"block"});                  
                $("#OTP-Content").css({"display":"none"});
                $("#startRide").css({"display":"none"});
                $("#finishride").css({"display":"none"});
                $("#pickdropfooter").css({"display":"none"});
                $("#pickdropHead").css({"display":"none"});
                $("#amt").text(Number(respon.billAmount).toFixed(0));
            }
  })
}

function validateForm() {
  var x = document.forms["myForm"]["withdrawlAmount"].value;
  if (x > 49) {
      
      return true;
  }else{
      alert("amount Should be more the 50");
      return false;  
  }
  }


function ledger(){
  
  $.post('/india/tdrv/ledger',{},function(data){
    console.log("ledger", data)
    /////Driver Cetegory//////
    if(Number(data.driverCetegory)== 1){
      /////For Driver category 1////
      var totalEarning=Number(data.dailyCollection.dailyledger.driverpayout)+Number(data.dailyCollection.dailyledger.incentive)+Number(data.previousEarning);
      var totalcollection=Number(data.previousDue)+Number(data.dailyCollection.dailyledger.cashCollection); 
      var btnn='';
      var o=' '
      
      if(Number(data.previousDue)>=Number(data.previousEarning)){
        btnn='<input type="hidden" id="payAmount" name="payAmount" class="form-control" value="'+Math.abs(Number(data.previousDue) - Number(data.previousEarning)).toFixed(2)+'" >\
        <input type="hidden" id="CustID" name="CustID" value="'+data.pilot.pilotID+'">\
        <input type="hidden" id="typeOfReqest" name="typeOfReqest" value="TrideDeposit">\
        <input type="hidden" id="mobileNumber" name="mobileNumber" value="'+data.pilot.mobileNumber+'">\
        <input type="hidden" id="email" name="email" value="'+data.pilot.email+'">\
        <button onclick="icicipay()" type="button" class="btn btn-success btn-block col-xs-12 col-sm-12">Deposit &#8377; '+Math.abs(Number(data.previousDue) - Number(data.previousEarning)).toFixed(2)+'</button>'
        //alert(Math.abs(totalcollection - totalEarning).toFixed(2))
      }else{
        btnn='<form name="myForm" action="/india/withdrawal" onsubmit="return validateForm()" method="POST" class="form-inline" role="form">\
        <input type="hidden" name="withdrawlAmount" class="form-control" value="'+Math.abs(Number(data.previousDue) - Number(data.previousEarning)).toFixed(2)+'" >\
        <input type="hidden" name="pilotID" value="'+data.pilot.pilotID+'">\
        <input type="hidden" name="typeOfReqest" value="TrideWidthral">\
        <button  type="type="submit"" class="btn btn-info btn-block col-xs-12 col-sm-12">Withdrawal &#8377; '+Math.abs(Number(data.previousDue) - Number(data.previousEarning)).toFixed(2)+'</button>\
      </form>'
        //alert(Math.abs(totalcollection - totalEarning).toFixed(2))
      }

      $("#accountLedger").css({"display": "block"})
      $("#accountLedger").html('<div class="container-fluid">\
      <div style="margin-top: 5px;" class="row">\
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">\
             <ul class="list-group">\
                 <li class="list-group-item active ">\
                   <span style="font-size: medium;" class="badge">&#8377; '+totalcollection.toFixed(2)+'</span>\
                   Total Cash Collection  <span>\
                      <button type="button" class="btn btn-info btn-xs">View Details</button>\
                      </span>\
                 </li>\
                 <li class=" list-group-item list-group-item-info ">\
                     <span class="badge">&#8377; '+data.previousDue.toFixed(2)+'</span>\
                     Previous Due\
                   </li>\
                   <li class=" list-group-item list-group-item-info ">\
                     <span class="badge">&#8377; '+data.dailyCollection.dailyledger.cashCollection.toFixed(2)+'</span>\
                     Todays Collection\
                   </li>\
               </ul>\
          </div>\
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">\
             <ul class="list-group">\
                 <li class="list-group-item active ">\
                   <span style="font-size: medium; " class="badge">&#8377; '+totalEarning.toFixed(2)+' </span>\
                   Driver Earning  <span>\
                      <button type="button" class="btn btn-info btn-xs">View Details</button>\
                      </span>\
                 </li>\
                 <li class=" list-group-item list-group-item-info ">\
                     <span class="badge">&#8377; '+data.previousEarning.toFixed(2)+'</span>\
                     Previous Earning\
                   </li>\
                   <li class=" list-group-item list-group-item-info ">\
                      <span class="badge">&#8377; '+Number(data.dailyCollection.dailyledger.driverpayout).toFixed(2)+'</span>\
                      Today s Driver Pay @ '+data.driverpayout+'/KM<br>\
                    </li>\
                    <li class=" list-group-item list-group-item-info ">\
                      <span class="badge">&#8377; '+Number(data.dailyCollection.dailyledger.incentive).toFixed(2)+'</span>\
                      Today s Incentive, <br> No of Orders: '+Number(data.dailyCollection.dailyledger.noOfBooking).toFixed(0)+' , Km Travels: '+Number(data.dailyCollection.dailyledger.kmTravels).toFixed(0)+'\
                  </ul>\
           </div>\
        </div>\
      <div class="row">\
         <div class="col-xs-12 col-sm-12">\
             '+btnn+'\
          </div>\
     <div style="margin-top: 20px;" class="row">\
         <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">\
          <button onclick="closeME()" type="button" class="btn btn-danger  col-xs-4 col-sm-4 col-xs-offset-4 col-sm-offset-4">Back</button>\
        </div>\
     </div>\
  </div>');
  sidebartoggle();
      
    }else{
      /////Category Null//////
      var totalEarning=Number(data.dailyCollection.dailyledger.driverpayout)+Number(data.dailyCollection.dailyledger.fuelCost)+Number(data.dailyCollection.dailyledger.incentive)+Number(data.dailyCollection.dailyledger.maintenance)+Number(data.previousEarning);
      var totalcollection=Number(data.previousDue)+Number(data.dailyCollection.dailyledger.cashCollection); 
      var btnn='';
      
      if(Number(data.previousDue)>=Number(data.previousEarning)){
        btnn='<input type="hidden" id="payAmount" name="payAmount" class="form-control" value="'+Math.abs(Number(data.previousDue) - Number(data.previousEarning)).toFixed(2)+'" >\
        <input type="hidden" id="CustID" name="CustID" value="'+data.pilot.pilotID+'">\
        <input type="hidden" id="typeOfReqest" name="typeOfReqest" value="TrideDeposit">\
        <input type="hidden" id="mobileNumber" name="mobileNumber" value="'+data.pilot.mobileNumber+'">\
        <input type="hidden" id="email" name="email" value="'+data.pilot.email+'">\
        <button onclick="icicipay()" type="button" class="btn btn-success btn-block col-xs-12 col-sm-12">Deposit &#8377; '+Math.abs(Number(data.previousDue) - Number(data.previousEarning)).toFixed(2)+'</button>'
        //alert(Math.abs(totalcollection - totalEarning).toFixed(2))
      }else{
        btnn='<form name="myForm" action="/india/withdrawal" onsubmit="return validateForm()" method="POST" class="form-inline" role="form">\
        <input type="hidden" name="withdrawlAmount" class="form-control" value="'+Math.abs(Number(data.previousDue) - Number(data.previousEarning)).toFixed(2)+'" >\
        <input type="hidden" name="pilotID" value="'+data.pilot.pilotID+'">\
        <input type="hidden" name="typeOfReqest" value="TrideWidthral">\
        <button  type="type="submit"" class="btn btn-info btn-block col-xs-12 col-sm-12">Withdrawal &#8377; '+Math.abs(Number(data.previousDue) - Number(data.previousEarning)).toFixed(2)+'</button>\
      </form>'

      }
  
      $("#accountLedger").css({"display": "block"})
      $("#accountLedger").html('<div class="container-fluid">\
      <div style="margin-top: 5px;" class="row">\
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">\
             <ul class="list-group">\
                 <li class="list-group-item active ">\
                   <span style="font-size: medium;" class="badge">&#8377; '+totalcollection.toFixed(2)+'</span>\
                   Total Cash Collection  <span>\
                      <button type="button" class="btn btn-info btn-xs">View Details</button>\
                      </span>\
                 </li>\
                 <li class=" list-group-item list-group-item-info ">\
                     <span class="badge">&#8377; '+data.previousDue.toFixed(2)+'</span>\
                     Previous Due\
                   </li>\
                   <li class=" list-group-item list-group-item-info ">\
                     <span class="badge">&#8377; '+data.dailyCollection.dailyledger.cashCollection.toFixed(2)+'</span>\
                     Todays Collection\
                   </li>\
               </ul>\
          </div>\
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">\
             <ul class="list-group">\
                 <li class="list-group-item active ">\
                   <span style="font-size: medium; " class="badge">&#8377; '+totalEarning.toFixed(2)+' </span>\
                   Driver Earning  <span>\
                      <button type="button" class="btn btn-info btn-xs">View Details</button>\
                      </span>\
                 </li>\
                 <li class=" list-group-item list-group-item-info ">\
                     <span class="badge">&#8377; '+data.previousEarning.toFixed(2)+'</span>\
                     Previous Earning\
                   </li>\
                 <li class=" list-group-item list-group-item-info ">\
                     <span class="badge">&#8377; '+Number(data.dailyCollection.dailyledger.fuelCost).toFixed(2)+'</span>\
                     Today s Fuel Cost \
                   </li>\
                   <li class=" list-group-item list-group-item-info ">\
                      <span class="badge">&#8377; '+Number(data.dailyCollection.dailyledger.driverpayout).toFixed(2)+'</span>\
                      Today s Minute Charges <br>\
                    </li>\
                    <li class=" list-group-item list-group-item-info ">\
                      <span class="badge">&#8377; '+Number(data.dailyCollection.dailyledger.incentive).toFixed(2)+'</span>\
                      Today s Incentive<br>\
                    </li>\
                    <li class=" list-group-item list-group-item-info ">\
                      <span class="badge">&#8377; '+Number(data.dailyCollection.dailyledger.maintenance).toFixed(2)+'</span>\
                      Today s Car Maintenance<br> and insurance\
                    </li>\
                  </ul>\
           </div>\
        </div>\
      <div class="row">\
         <div class="col-xs-12 col-sm-12">\
                 <input type="hidden" id="payAmount" name="payAmount" class="form-control" value="" > '+btnn+'\
          </div>\
     <div style="margin-top: 20px;" class="row">\
         <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">\
          <button onclick="closeME()" type="button" class="btn btn-danger  col-xs-4 col-sm-4 col-xs-offset-4 col-sm-offset-4">Back</button>\
        </div>\
     </div>\
  </div>')
  sidebartoggle();

    }
  })
}

function closeME(){
  $("#accountLedger").css({"display": "none"});
}


////////Cancel Order By Customer/////

socket.on("OrderCancelByCustomer",function(data){
  console.log("OrderCancelByCustomer",data)
  if(data.pilotID==getCookie("pilotID")){
      setCookie("driverBusy","",1); 
      alert("Ride Calcel By Customer");
      window.location='/india/tdrv'
  }  
});

function driverPaymentBreakdown(){
  $("#accountLedger").css({"display": "block"});
  $("#accountLedger").html('<div class="row">\
  <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">\
      <div class="panel panel-success">\
        <div class="panel-heading">\
              <h3 class="panel-title">Driver Payment Break-Down</h3>\
              <button type="button" class="btn btn-danger btn-xs" onclick="closeIncentiveModule()">Close</button>\
        </div>\
        <div class="panel-body">\
            <ul id="conteent"  class="list-group">\
            </ul>\
        </div>\
      </div>\
    </div>\
  </div>')
 
  for(var i=5; i <= 20; i+=5){
   
  $.post('/india/tdrv/paymentBreakdown',{distance:i},function(data){
    
    if(Number(data.distance)==20){
      var content='Kilometer More Then 15:'
    }else{
      var content='Kilometer Up to '+data.distance+':'
    }
    $("#conteent").append('<li style="margin-bottom: 5px;" class="list-group-item active ">\
    <span style="font-size: medium;" class="badge">&#8377; '+Number(data.driverpayout).toFixed(2)+'</span>\
    '+content+'\
  </li>');
  });
  }
  sidebartoggle();

}


function incentive(){
  
  $("#accountLedger").css({"display": "block"})
  var incetiveCity=$("#incetiveCity").val();
  var incentiveTravelMode=$("#incentiveTravelMode").val();
  //alert(incentiveTravelMode)
    $.post('/india/admin/incentiveModule',{incetiveCity:incetiveCity,incentiveTravelMode:incentiveTravelMode},function(data){
        if(data.length >0){
            var out='<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">\
            <ul class="list-group">\
                <li class="list-group-item active ">\
                  Incentive Module\
                  <button type="button" class="btn btn-danger btn-xs" onclick="closeIncentiveModule()">Close</button>\
                </li>';
            data.forEach(function(val,key,ary){
                out+='\
                    <li class=" list-group-item list-group-item-info ">\
                        <span class="badge">Incentive &#8377; '+val.incetiveAmount+'</span>\
                        Incetive Slot: '+val.incetiveSlot+',<br>Order Count: '+val.numberOfBooking+', Travel Km : '+val.inctravelKM+'\
                      </li>\
                 '
                if(key===ary.length -1){
                    $("#accountLedger").html('<input type="hidden"  id="incetiveCity"  value="'+incetiveCity+'"><div class="col-md-4 col-lg-4 col-md-offset-4 col-lg-offset-4">\
                    </div>'+out+'</ul>\
                    </div>');
                    sidebartoggle();
                } 
            })
        }else{
            $("#accountLedger").html('<div class="col-md-4 col-lg-4 col-md-offset-4 col-lg-offset-4">\
            <button type="button" class="btn btn-danger" onclick="closeIncentiveModule()">Close</button>\
            </div>\
            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">\
                <ul class="list-group">\
            <li class=" list-group-item list-group-item-info ">\
            No Incetive Module Found\
          </li>\
          </ul>\
             </div>') ;
             sidebartoggle();
        }
        
    })
}

function referaFriend(){
  $("#accountLedger").css({"display": "block"})
  $("#accountLedger").html('<div style="margin-bottom: 1px;" class="panel panel-default">\
  <div class="panel-heading">\
        <h3 class="panel-title">Refer and Earn</h3>\
        <button type="button" class="btn btn-danger btn-xs" onclick="closeIncentiveModule()">Close</button>\
  </div>\
  <div  class="panel-body">\
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">\
          <a   href="#" class="thumbnail">\
              <img src="/india/images/banner-1.png" alt="">\
          </a>\
          <div class="col-sm-8 col-sm-offset-2">\
          <ul class="list-group">\
              <li class="list-group-item">\
                  <span class="badge">&#8377; 0</span>\
                  Total Earnings \
              </li>\
          </ul>\
         </div>\
         <p style="height: 210px;" class="text-center">Keep Referring and Earn Bonus, We are Campaigns for you in your City</p>\
         <div class="col-sm-12">\
          <ul class="list-group">\
              <li class="list-group-item">\
                  <span class="badge">'+$("#mobileno").val()+'</span>\
                  Your Referral Code \
              </li>\
          </ul>\
         </div>\
      </div>\
  </div>\
</div>');
  sidebartoggle();
}

function closeIncentiveModule(){
  $("#accountLedger").css({"display": "none"})
}



function icicipay(){      
  var payAmount=Number($("#payAmount").val());
  var CustID=$("#CustID").val();
  var typeOfReqest=$("#typeOfReqest").val();
  var mobileNumber=$("#mobileNumber").val();
  var email=$("#email").val();
  console.log("payAmount", payAmount , "")
  $.post('/india/icici/tokengen',{
    payAmount:payAmount,
    CustID:CustID,
    typeOfReqest:typeOfReqest,
    mobileNumber:mobileNumber,
    email:email
   },function(data){
   payCheckout(data); 
   })
  
 }
 

 function payCheckout(req){
   Layer.checkout({
     token: req.tokenID,
     accesskey: req.ACCESS_KEY,
     return_url: req.return_url,
     redirect: true
     },
     function(response) {
       console.log("response.status",response)
       if (response.status == "cancelled") {
         alert("Transection Calcel By User")            
         window.location.href="../india/tdrv"
       }
       $.post('/india/icici/paydetails',{payment_token_id:response.payment_token_id,status:response.status},function(data){
          console.log("Payment Details", data) 
          if(data){
              window.location.href='../india/preDriverCash';
           }

          });

          if (response.status == "created") {
              window.location.href='../india/preDriverCash';   
              } else if (response.status == "pending") {
              window.location.href='../india/preDriverCash';     
              } else if (response.status == "failed") {      
                  window.location.href='../india/preDriverCash';
              }
         
       
         // if (response.status == "captured") {                            
         //    // response.payment_token_id
         //    // response.payment_id
               
         // } else if (response.status == "created") {
 
 
         // } else if (response.status == "pending") {
 
 
         // } else if (response.status == "failed") {
 
 
         // } else if (response.status == "cancelled") {
 
         // }
     },
     function(err) {
         //integration errors
         console.log("integration Error", err)
     }
 );
 } 