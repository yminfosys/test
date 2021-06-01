var map;
function initMap() { 
  var maplat=$("#maplat").val();
  var maplng=$("#maplng").val();
  map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
       center: {lat: Number(maplat), lng: Number(maplng)},
        mapTypeId: 'roadmap',
        //disableDefaultUI: true,
        map:map
      });

      document.getElementById("loadmap").addEventListener("click", function(){ 
        var maplat=$("#maplat").val();
        var maplng=$("#maplng").val();
        map.setCenter({lat: Number(maplat), lng: Number(maplng)});
      });

      ///////Add CenterMArker pin////////
      $('<div/>').addClass('centerMarker').appendTo(map.getDiv());
      //////End Circle Marker/////

      google.maps.event.addListener(map, 'drag', function() {
        var maplocationmode=$("#maplocationmode").val();
        if(maplocationmode=="1"){
          $("#demandlatlng").val(''+map.getCenter().toJSON().lat+','+ map.getCenter().toJSON().lng+'')
        }else if(maplocationmode=="2"){
          $("#mPickuplatlng").val(''+map.getCenter().toJSON().lat+','+ map.getCenter().toJSON().lng+'')
        }else if(maplocationmode=="3"){
          $("#mDroplatlng").val(''+map.getCenter().toJSON().lat+','+ map.getCenter().toJSON().lng+'')
        }
      });
  }
  
  /////END INIT///////

  function latlngFocas(a){
   
    if(a==1){
      $("#maplocationmode").val(1);
    }else{
      if(a==2){
        $("#maplocationmode").val(2); 
      }else{
        $("#maplocationmode").val(3);
      }
    }
  }

var driverList=[];
var driverReciveList=[];
var timeinterval;
function getActiveDriverList(){
        driverList=[];
        driverReciveList=[];
     $("#refreshbtn").css({"display" : "none"});   
    var driverCity=$("#driverCity").val();
    var out='<button id="refreshbtn" onclick="getActiveDriverList()" type="button" class="btn btn-success"><i class="fa fa-refresh" aria-hidden="true"></i> Refresh List</button>';
    $.post('/india/admin/sub/monitorDriverList',{driverCity:driverCity,driveType:"preRide"},function(data){
     alert(data.length)
     console.log(data);
     if(data.length > 0){
      data.forEach(function(val,indx,ary){
        out+='<ul id="'+val.pilot.pilotID+'_driverlist" class="list-group">\
        <li class="list-group-item active ">\
        <span  style="font-size: medium;" class="badge"><div id="'+val.pilot.pilotID+'_currentlocation"><img onclick="mapp(\'' + val.driver.location.coordinates[1] + '\',\'' + val.driver.location.coordinates[0] + '\')" style="width: 20px; width: 10px; cursor: pointer;" src="/india/images/maplogo.png"></div></span>\
        <span style="font-size: medium;" class="badge"><img style="width: 20px; width: 20px;" src="/india/images/DriverMarker'+val.pilot.travelmod+'.png"></span>\
          '+val.pilot.name+'\
        </li>\
        <li class=" list-group-item list-group-item-info ">\
            <span style="font-size:small; color: chartreuse;" class="badge"><div id="'+val.pilot.pilotID+'_track"><img style="width: 22px;" src="/india/images/gif/circle.gif"></div></span>\
            Mob: '+val.pilot.mobileNumber+' ID: '+val.pilot.pilotID+' <br>\
            Duty: '+val.pilot.dutyStart+' - '+val.pilot.breakStart+', '+val.pilot.BreakEnd+' - '+val.pilot.dutyEnd+'<br>\
            <button onclick="dropdriver(\'' + val.pilot.pilotID + '\')" type="button" class="btn btn-success btn-xs">Drop</button>\
            <button onclick="getcurrentlocation(\'' + val.pilot.pilotID + '\')" type="button" class="btn btn-success btn-xs">Get-Current Location</button>\
            <button onclick="getcurrentbooking(\'' + val.pilot.pilotID + '\')" type="button" class="btn btn-success btn-xs">Is Any Bookings</button><br>\
            <div id="'+val.pilot.pilotID+'_booking"></div>\
            </li>\</ul>'
        driverList.push(val.pilot.pilotID);
        if(indx===ary.length -1){
          $("#DriverList").html(out);
          $("#refreshbtn").css({"display" : "block"});
          clearInterval(timeinterval);
          autoDriverTracking(driverList);

          console.log("Driver List",driverList)
        }

       });
     }else{
      $("#DriverList").html('<button onclick="getActiveDriverList()" type="button" class="btn btn-success"><i class="fa fa-refresh" aria-hidden="true"></i> Refresh List</button>'); 
     }
     
    }) 

    $.post('/india/admin/sub/driverNFtotal',{},function(data){
      if(data){
        if(data.length > 0){
          $("#dNF").html('<button onclick="getDriverNotFound()" class="btn btn-primary" type="button">\
          Driver Not Found <span class="badge">'+data.length+'</span>\
        </button>');
        }   
      }
      })
  
    
}

function mapp(lat,lng){
  
  if /* if we're on iOS, open in Apple Maps */
  ((navigator.platform.indexOf("iPhone") != -1) || 
   (navigator.platform.indexOf("iPad") != -1) || 
   (navigator.platform.indexOf("iPod") != -1)){
      window.open("maps://maps.google.com/maps?daddr="+lat+","+lng+", &amp;ll=");
   }else{
      window.open("https://maps.google.com/maps?daddr="+lat+","+lng+"&amp;ll=");
   } /* else use Google */
}

function dropdriver(pilotID){
$.post('/india/admin/sub/monitorDriverDrop',{pilotID:pilotID},function(data){
  if(data=="success"){
    $("#"+pilotID+"_driverlist").css({"display":"none"});
  }  
})
}

function getcurrentlocation(pilotID){
  $.post('/india/admin/sub/monitorgetcurrentlocation',{pilotID:pilotID},function(data){
     
  })
  }


  function getcurrentbooking(pilotID){
    //alert(pilotID);
    $.post('/india/admin/sub/monitorgetcurrentbooking',{pilotID:pilotID},function(data){
      //console.log(data);
       if(data.order.length > 0){
         var gg="";
         data.order.forEach(function(val,indx,arry){
        gg+='OrderID:'+val.bookingID+',';
        if(indx===arry.length - 1){
          $("#"+pilotID+"_booking").html(gg);
        }
      });
       }else{
        $("#"+pilotID+"_booking").html('Empty')
       }
    })
    }

function autoDriverTracking(listDrv){
  var timeint=listDrv.length * 500;
  if(timeint < 1000 * 60){
    timeint=1000 * 20;
  }
  trackdriver(listDrv);
  console.log("autoDriverTracking List",listDrv)
  timeinterval=setInterval(function(){
    trackdriver(listDrv);

  },timeint);
}

function trackdriver(listDrv){
  driverReciveList=[];
  var cot=0;
  listDrv.forEach(function(val,indx,aryt){
    /////send virtual Request to each driver/////
    $("#"+val+"_track").html('<img style="width: 22px;" src="/india/images/gif/circle.gif">')
    console.log("test Dtiver ID", val)
    $.post('/india/admin/sub/senddrivertracrequiest', {pilotID:val}, function(data){      
      if(data){
        cot++;
        console.log(data);
        if(indx===aryt.length -1 && cot==aryt.length){
          ////////exicute tracking result/////
          setTimeout(function(){
            console.log("arry list",driverReciveList, driverList  )
            driverList.forEach(function(dd){
            var exist=driverReciveList.indexOf(dd);
            if(exist < 0){
              //////Tracking Fail////
              console.log("Fail", dd)
              $("#"+dd+"_track").html('<img style="width: 22px;" src="/india/images/trackingfail.png">')
            }else{
              /////Track Success////// 
              console.log("success", dd)           
              $("#"+dd+"_track").html('<img style="width: 22px;" src="/india/images/tracking.png">')  
            }
            })
          },500);
        }
      }
    })      
      
    });
}


///////////Receive Requiest By Socket Io////////
var socket = io('//'+document.location.hostname+':'+document.location.port);
socket.on('preRideTrackingPcktReceive', function (data) {
  console.log("receiveid",data,new Date())
  driverReciveList.push(Number(data.pilotID));
});

var demandtimer;
function gotodemand(subAdminID){
  var count=0;
  var demandlatlng=$("#demandlatlng").val();
  var demandDriverid=$("#demandDriverid").val();
  demandlatlng=demandlatlng.split(",");
  $("#gotodemand").html('<img style="width: 40px;" src="/india/images/gif/progress.gif">');
  demandtimer=setInterval(function(){
    ///////call demand area////////
    console.log("subAdminID",subAdminID)
    
    $.post('/india/admin/sub/gotodemandrequiest', {lat:demandlatlng[0],lng:demandlatlng[1],pilotID:demandDriverid,subAdminID:subAdminID}, function(data){ 
      console.log("Test data",data);
    });
    count++;
    if(count > 3){
      clearInterval(demandtimer);
      alert("Driver Demand not not Set");
      $("#gotodemand").html('Go to Demand Area');
    }
  },1000*5);
}

socket.on('gotodemandreceivedata', function (data) {
  var subAdminID=$("#subAdminID").val();
  if(subAdminID==data.subAdminID){
    clearInterval(demandtimer);
    alert("Driver Demand Initiated")
    $("#gotodemand").html('Go to Demand Area');
  }
});


socket.on('driverInGotoDemandarea', function (data) {
  var subAdminID=$("#subAdminID").val();
  if(subAdminID==data.subAdminID){
    var sdf='Driver '+data.pilotID+' has arrived in  Demand Area'
    
    alert(sdf);
    
  }
});



function getDriverNotFound(){

  $.post('/india/admin/sub/gatherDriverNF',{},function(data){
    if(data.length>0){
        var out="";
        $("#driverNF").css({"display":"block"});
        
        data.forEach(function(val){
            out+=' <ul id="Entry'+val.entryNo+'"  class="list-group">\
            <li class="list-group-item active ">\
              <span style="font-size: 12px; cursor: pointer; background-color: rgb(204, 121, 91); " onclick="resolve(\'' + val.entryNo + '\',\'' + val.CustID + '\')" class="badge">Resolve</span>\
              <span style="font-size: 12px;cursor: pointer; " onclick="findCust(\'' + val.entryNo + '\',\'' + val.CustID + '\')" class="badge">Custome Details</span>\
              Driver Not Found At : '+val.originAds+' - ['+val.originLat+','+val.originLng+'] <br> To : '+val.distAds+' - ['+val.distLat+','+val.distLng+'] \
              <br>Request Type :'+val.DriverType+' Total Distance : '+val.totalDistance+' Travel Mode : '+val.travelmod+' <br> Date : '+new Date(val.date)+'  \
            </li>\
            <li style="display: none; " id="cust'+val.entryNo+'" class=" list-group-item list-group-item-info "></li>\
            </ul>';
        })
        $("#driverNFList").html(out)
    }
})
  
}


function closeDriverNF(){
  $("#driverNF").css({"display":"none"});
}

function findCust(entryNo,CustID){
 
  $.post('/india/admin/sub/driverNFcust',{CustID:CustID},function(data){
    if(data){     
      $("#cust"+entryNo+"").css({"display":"block"});
      $("#cust"+entryNo+"").html('Cust Name: '+data.name+'<br>\
      Mobile No: +91 '+data.mobileNumber+'\
      Email Id : '+data.email+'')
    }
  })
  
}

function resolve(entryNo,CustID){
  $.post('/india/admin/sub/driverNFresolve',{entryNo:entryNo},function(data){
    if(data){
      $("#Entry"+entryNo+"").css({"display":"none"});
    }
  })
   
}


socket.on('driverNotFount', function (data) {
  $.post('/india/admin/sub/driverNFtotal',{},function(data){
    if(data){
      if(data.length > 0){
        $("#dNF").html('<button onclick="getDriverNotFound()" class="btn btn-primary" type="button">\
        Driver Not Found <span class="badge">'+data.length+'</span>\
      </button>');
      }
      
    }
  })
});

///////////On Behalf Customer Order////////

function calculateOrder(){
  var mPickuplatlng=$("#mPickuplatlng").val().trim();
  var mDroplatlng=$("#mDroplatlng").val().trim();
  var mPickupAds=$("#mPickupAds").val().trim();
  var mDropAds=$("#mDropAds").val().trim();
  var mCustMobile=$("#mCustMobile").val().trim();
  var mDriverID=$("#mDriverID").val().trim();
  var travelTypemode=$("#travelTypemode").val().trim();
  var paymentType=$("#paymentType").val().trim();
  if(mPickuplatlng && mDroplatlng && mCustMobile && mDriverID && travelTypemode){
    //////GET DISTANCE //////////////////
    var pickuplatlng=mPickuplatlng.split(",");
    var dropLatlng=mDroplatlng.split(",");
    $.post('/india/getDistance',{
      orig:''+Number(pickuplatlng[0])+' , '+Number(pickuplatlng[1])+'',
      diste:''+Number(dropLatlng[0])+' , '+Number(dropLatlng[1])+'',
      travelmod:"2"
    },function(data){
      var alldist=parseInt(Number(data.result.rows[0].elements[0].distance.value)/1000) + 1; 
      var time=Number(data.result.rows[0].elements[0].duration.value)/60;
      var hour=new Date().getHours();
      var mm=new Date().getMinutes();
     
      $.post('/india/subAdminGetprice',{travelmod:travelTypemode,distance:alldist,time:time,hour:hour,mm:mm,custMobile:mCustMobile},function(dataa){
        if(dataa.errormsg){
          alert(dataa.errormsg)
        }
       
        var PreRidePrice=dataa.preRidePrice.toFixed(2);
        var PreRideTimecost=dataa.preRideTimeCost.toFixed(2);
        var PreRidePreMinuteCost=Number(dataa.preRideperMinutCharge).toFixed(2);
        var total=Number(PreRidePrice)+Number(PreRideTimecost);
        $("#orderdetails").css({"display":"block"})
        $("#orderdetails").html('<p>Distance Fare : &#8377; '+PreRidePrice+' , Time Fare : &#8377; '+PreRideTimecost+' </p>\
        <p>Total Fare : &#8377; '+total.toFixed(0)+'</p>\
        <input type="hidden" id="PreRidePrice" value="'+PreRidePrice+'">\
        <input type="hidden" id="PreRideTimecost" value="'+PreRideTimecost+'">\
        <input type="hidden" id="PreRidePreMinuteCost" value="'+PreRidePreMinuteCost+'">\
        <input type="hidden" id="alldist" value="'+alldist+'">\
        <input type="hidden" id="time" value="'+time+'">');
        
      });
    });
    
    
  }else{
    alert("Set Value Properly");
  }
  
}

function onbehalfCusOrder(){
  var mPickuplatlng=$("#mPickuplatlng").val().trim();
  var mDroplatlng=$("#mDroplatlng").val().trim();
  var mPickupAds=$("#mPickupAds").val().trim();
  var mDropAds=$("#mDropAds").val().trim();
  var mCustMobile=$("#mCustMobile").val().trim();
  var mDriverID=$("#mDriverID").val().trim();
  var travelTypemode=$("#travelTypemode").val().trim();
  var paymentType=$("#paymentType").val().trim();

  var PreRidePrice=$("#PreRidePrice").val();
  var PreRideTimecost=$("#PreRideTimecost").val();
  var PreRidePreMinuteCost=$("#PreRidePreMinuteCost").val();

  var alldist=$("#alldist").val();
  var time=$("#time").val();

  var pickuplatlng=mPickuplatlng.split(",");
  var dropLatlng=mDroplatlng.split(",");

  $.post('/india/admin/sub/PreRideCallAndBooking',{
    //pilotID:incomdata.pilotID,
    //CustID:incomdata.CustID,
    mCustMobile:mCustMobile,
    mDriverID:mDriverID,
    /////For create booking////                   
    originAds:mPickupAds,
    distAds:mDropAds,
    originLat:pickuplatlng[0],
    originLng:pickuplatlng[1],
    distLat:dropLatlng[0],
    distLng:dropLatlng[1],
    travelmod:travelTypemode,
    DriverType:"preRide",
    totalAmt:Number(PreRidePrice),
    timeFare:Number(PreRideTimecost),
    perMinuteTimeCost:Number(PreRidePreMinuteCost),
    totalDistance:alldist,
    travalTime:time,
    payMode:paymentType,
    
   },function(resp){
    if(resp){
      if(resp.status==400){
        alert("Worng DriderID")
      }else{
        $("#orderdetails").append('<p>OTP : '+resp.otp+' , OrderID : '+resp.bookingID+'</p>')
        alert("Booking Created Successfully")
      }
    }
   });

  
}

function clearDataCustOrder(){
  $("#demandlatlng").val("")
  $("#mPickuplatlng").val("")
  $("#mDroplatlng").val("")
  $("#mCustMobile").val("")
  $("#mDriverID").val("")
  $("#orderdetails").css({"display":"none"})
}



function deliveryDetails(){
  $("#deliveryDetails").css({"display":"block"})
  $.post('/india/admin/sub/getDeliveryList',{},function(data){
    console.log(data);
    $("#deliveryDetails").html('  <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">\
  <ul id="deliverydataList" class="list-group">\
  </ul>\
</div>\
</div>')
    if(data.length>0){
      data.forEach(function(val){
        $("#deliveryDetails").append('<li class="list-group-item active ">\
        <span style="font-size: 12px; cursor: pointer; background-color: rgb(109, 202, 190); " onclick="confrmDelivery(\''+val.bookingID+'\')" class="badge">Confram</span>\
        <span style="font-size: 12px; " class="badge">&#8377; '+Number(val.deliveryPrice).toFixed(2)+'</span>\
        <span style="font-size: 12px; " class="badge">CustID:'+val.CustID+'</span>\
         Delivery Requiest  Order ID: '+val.bookingID+'\
      </li>\
      <li class=" list-group-item list-group-item-info ">\
         <span style="font-size: 12px; " class="badge">Mode: '+val.ModeofDelivery+'</span>\
         <span style="font-size: 12px; " class="badge">Type: '+val.deliveryType+'</span>\
         Name: '+val.pickupName+'<br>\
          Pickup:'+val.pickuplocation+'<br> LatLng: '+val.pickuplat+','+val.pickuplng+'<br>\
          Direction:'+val.pickupDirection+' <br>\
          Mobile:'+val.pickupMobile+' <br><br>\
          Name: '+val.dropName+'<br>\
          Drop:'+val.droplocation+'<br> LatLng: '+val.droplat+','+val.droplng+'<br>\
          Direction:'+val.dropDirection+' <br>\
          Mobile:'+val.dropMobile+'<br>\
          Date: '+new Date(val.ate)+'\
        </li>')
      })

    }
  })
//   $("#deliveryDetails").html('  <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">\
//   <ul id="deliverydataList" class="list-group">\
    // <li class="list-group-item active ">\
    //   <span style="font-size: 12px; cursor: pointer; background-color: rgb(109, 202, 190); " onclick="confrmDelivery()" class="badge">Confram</span>\
    //   <span style="font-size: 12px; " class="badge">&#8377; 20.00</span>\
    //   <span style="font-size: 12px; " class="badge">CustID:1003</span>\
    //    Delivery Requiest  Order ID: 12345\
    // </li>\
    // <li class=" list-group-item list-group-item-info ">\
    //    <span style="font-size: 12px; " class="badge">Mode: 1</span>\
    //    <span style="font-size: 12px; " class="badge">Type: 1</span>\
    //    Name: Sukanta<br>\
    //     Pickup:bhd jhfdjg jhdfgjhfj<br> LatLng: 55.77888,87.66666<br>\
    //     Direction:kjhdfkghfdkghjh jfdjghdjfghf <br>\
    //     Mobile:7674356567 <br>\
    //     Name: Sukanta<br>\
    //     Drop:bhd jhfdjg jhdfgjhfj<br> LatLng: 55.77888,87.66666<br>\
    //     Direction:kjhdfkghfdkghjh jfdjghdjfghf <br>\
    //     Mobile:5637465<br>\
    //     Date: 12344 56666\
    //   </li>\
// </ul>\
// </div>\
// </div>')
}


function confrmDelivery(bookingID){
  alert(bookingID)
}


  