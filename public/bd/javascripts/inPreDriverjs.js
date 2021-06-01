//////cookie Setting////
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
        $.post('/bd/setCookies',{cname:cname,cvalue:cvalue,expires:exdays*24*60*60*1000},function(data){
            console.log(data)
         })
       }else{
        $.post('/bd/clerCookies',{cname:cname},function(data){  console.log(data)})
       }
  }

  function setDytyCookie(cname, cvalue, exdays) {
    // var d = new Date();
    // d.setTime(d.getTime() + (exdays*60*1000));
    // var expires = "expires="+ d.toUTCString();
    // document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    if(cvalue.length > 0){
        $.post('/bd/setCookies',{cname:cname,cvalue:cvalue,expires:exdays*60*1000},function(data){
            console.log(data)
         })
       }else{
        $.post('/bd/clerCookies',{cname:cname},function(data){  console.log(data)})
       }
  }

////Randanm OTP/////////
function randamNumber(){
    var tex="";
    for(var i=0; i < 4; i++){
        tex+=''+Math.floor(Math.random() * 10)+'';    
    }
    return tex;

}
////////////Login and Register/////
var timerr;
function mkeydown(){
clearTimeout(timerr);
}

function mkeyup(){
    clearTimeout(timerr);
    timerr=setTimeout(veryfyMobileNumber,1000) ; 
}

function veryfyMobileNumber(){
   //////call otp API////
   var mobile=$("#mobile").val()
    if(mobile.length===10){        ;
        var otp=randamNumber();
        $("#otp1").val(otp);
       // alert(otp)
        $("#mobile").css({"color":"green"});
        ////////Check Mobile No Exist in our System/////
        $.post('/bd/preDrv/checkMobileExist',{mobile:mobile},function(data){
            if(data=='exist'){
                ///////Login Function////
                $("#password-content").css({"display": "block"});
                $("#login-content").css({"display": "block"});
                $("#password").focus();
                $("#submit-content").css({"display": "none"});
                $("#name-content").css({"display": "none"})
                $("#otp-content").css({"display": "none"});
                $("#email-content").css({"display": "none"})
                

            }else{
                //////Send OTP////
                $.post('/bd/drv/otpSend',{mobile:mobile,otp:otp},function(data){
                    if(data.status=='success'){
                        $("#mobile").css({"background-color": "Green","color":"#FFF"});
                        $("#otp-content").css({"display": "block"});   
                        $("#otp").val('');
                        $("#otp").focus();
                        
                        $("#name-content").css({"display": "none"})
                        $("#password-content").css({"display": "none"})
                        $("#submit-content").css({"display": "none"})
                        $("#email-content").css({"display": "none"})
                        $("#login-content").css({"display": "none"});
                        $("#login-content").css({"display": "none"});
                    }else{
                        $("#mobile").css({"background-color": "#c44630","color":"#FFF"});
                    }
                   }); 
            }
        })

       
    }else{
        $("#mobile").css({"color":"red"});  
    }
 
}

function verifyOTP(){
    var otp1=$("#otp1").val();
    var otp=$("#otp").val();
    if(otp.length==4 && otp==otp1){
        $("#otpnotmatch").css({"display": "none"})
        //alert('match')
        $("#name-content").css({"display": "block"})
        $("#password-content").css({"display": "block"})
        $("#submit-content").css({"display": "block"})
        $("#email-content").css({"display": "block"})
        $("#otp-content").css({"display": "none"})
        $("#login-content").css({"display": "none"});
        $("#submit-btn").val('Rigister');
        $("#name").focus();
        
    }else{
        $("#otpnotmatch").css({"display": "block"})
    }

}

function resendOTP(){
    $("#resendOTP").hide()
}

function loginprocess(){
    var password=$("#password").val();
    var mobile=$("#mobile").val();
    $.post('/bd/preDrv/login',{password:password,mobile:mobile},function(data){
        if(data=='success'){
            window.location='/bd/Predrv'
        }else{
            $("#password").css({"background-color": "#c44630","color":"#FFF"});
            alert('Password dose not match')
        }
    });

}



 ///////End Login and Register///////


 //////Logout/////////
 function logout(){
    if(getCookie("setSystem")){
     alert("1st Go OffLine and Try Again")
    }else{       
        window.location="../bd/preDrv/logout"
    }
 }



 /////////Driver Page ////////////

  ///////Handel Socket io  parameter/////// 
  var socket = io('//'+document.location.hostname+':'+document.location.port);
  socket.on('refreshPreRideList', function (data) {
  console.log('inCommingCall',data);
  console.log("test data",data.pilotID)
  if(data.pilotID==getCookie("pilotID")){

      ////Check existing call////
      $.post('/bd/existingPrerideCall',{pilotID:data.pilotID,driverBusy:data.driverBusy},function(rides){
        console.log("Ride Details",rides)
        var out="";
        var addressPart="";
        var btnPart="";
        var canceltimerPart="";
        var smalest=0;
        var smalIndx=0
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
         $.post("/bd/startCarLoogbook",{bookingID:bookingID},function(data){console.log(data)});
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

////////Cancel Order By Customer/////
var socket = io('//'+document.location.hostname+':'+document.location.port);
socket.on("OrderCancelByCustomer",function(data){
    console.log("OrderCancelByCustomer",data)
    if(data.pilotID==getCookie("pilotID")){
        alert("Ride Calcel By Customer");
        window.location='/bd/preDrv'
    }  
});

////////// On Cline Clocated/////////
function clineLocated(indx){
    var CustID=$("#CustID"+indx+"").val(); 
    var bookingID=$("#bookingID"+indx+"").val();   
    $.post('/bd/preRideClinelocated',{CustID:CustID,bookingID:bookingID},function(respon){
    console.log("respon",respon)
        if(respon){                    
            $("#clineLocated"+indx+"").css({"display":"none"});
            $("#startRide"+indx+"").css({"display":"block"});
            $("#listItem"+indx+"").css({"background-color":"#91bb2f"})
            timeDisplay(bookingID,indx)
            $.post("/bd/startCarLoogbook",{bookingID:bookingID},function(data){console.log(data)});
        }

    });
}

/////////Start Ride ////////
function startRide(indx){        
    var OTP=$("#preRideOTP"+indx+"").val();   
    $("#OTP-Content").css({"display":"block"});
    $("#OTP-Content").html('<h3>Enter OTP</h3>\
    <input type="number" onkeyup="otpinput(\''+OTP+'\',\''+indx+'\')" id="otpp" maxlength="4" >')
}

function otpinput(otp,indx){         
    var valu=$("#otpp").val()
    var CustID=$("#CustID"+indx+"").val(); 
    var bookingID=$("#bookingID"+indx+"").val();
    var name=$("#name"+indx+"").val();
    var dropaddress=$("#dropaddress"+indx+"").val();
    var droplatlng=$("#droplatlng"+indx+"").val();
   if(valu.length >3){       
       if(otp==valu){
           $.post('/bd/preRideStartRide',{CustID:CustID,bookingID:bookingID},function(responce){
                if(responce){
                    $("#OTP-Content").css({"display":"none"});
                    $("#startRide"+indx+"").css({"display":"none"});
                    $("#finishride"+indx+"").css({"display":"block"});
                    $("#mapBtn"+indx+"").html('<button id="mapBtn" onclick="googlemapbtn(\'' + 2 + '\',\'' + droplatlng + '\')" type="button" class="btn btn-info mybtn"><i class="fa fa-location-arrow" aria-hidden="true"></i></button>')
                    $("#nameAds"+indx+"").html('<p class="prerideName">Drop To : '+name+'</p>\
                    <p class="prerideads">'+dropaddress+'</p>');                    
                    googlemapbtn(2,droplatlng);
                    ///////Close Cancle Timer Watch/////
                    $("#timeBtn"+indx+"").css({"display":"none"});
                    $("#OrderCancelTimer"+indx+"").css({"display":"none"});
                }
           })
       }else{
        $("#otpp").css({"background-color": "#df0d0d","color": "#FFF" })
       }
    }
}


////////Finish Ride///////   
function finishride(indx){
    var CustID=$("#CustID"+indx+"").val(); 
    var bookingID=$("#bookingID"+indx+"").val();
    var picuklatlng=$("#picuklatlng"+indx+"").val();
    picuklatlng=picuklatlng.split(",");
    
        $.post('/bd/preRideFinish',{
            CustID:CustID,
            bookingID:bookingID,
            picuklat:picuklatlng[0], 
            picuklng:picuklatlng[1]
            
        },function(respon){
            console.log("respon",respon)
                if(respon){ 
                    
                   // $("#pickDrop-Content").css({"display":"none"});
                   $("#listItem"+indx+"").css({"display":"none"})
                    $("#billAndfeedback").css({"display":"block"});                  
                    $("#OTP-Content").css({"display":"none"});
                    $("#startRide"+indx+"").css({"display":"none"});
                    $("#finishride"+indx+"").css({"display":"none"});
                    //$("#pickdropfooter"+indx+"").css({"display":"none"});
                    //$("#pickdropHead"+indx+"").css({"display":"none"});
                    $("#amt").text(respon.billAmount)
                    $("#bookingIDFinish").val(bookingID);
                }

            });
        
}

///////Pre Ride Cash Collection/////////////

///////Calcel Timer Watch//////
function timeDisplay(bookingID,indx){
    //alert(bookingID)
    var timer;
    var count = 15;
    $("#timeBtn"+indx+"").css({"display":"none"});
    $("#OrderCancelTimer"+indx+"").css({"display":"block"}); 
    timer=setInterval(function(){
        count=count-1;
        var min=parseInt(count/60);
        var sec=(count % 60);
        if(sec < 10){
            sec='0'+sec+'';
        }
        $("#timeDisplay"+indx+"").html('<p>'+min+':'+sec+'</p>')
        if(count < 0){
            $("#timeDisplay"+indx+"").html('<p>0:00</p>')
            clearInterval(timer);
            $("#timeBtn"+indx+"").css({"display":"block"}); 
            $("#timeBtn"+indx+"").html('<div class="btn btn-danger col-xs-6 col-sm-6" onclick="cancelOrderByDriver(\'' + bookingID + '\',\'' + indx + '\')">Cancel Order</div>\
            <div onclick="timeDisplay(\'' + bookingID + '\',\'' + indx + '\')" class="btn btn-primary col-xs-6 col-sm-6">Wait Again</div>') 
        }
    },1000);

}

function cancelOrderByDriver(bookingID,indx){
    $.post('/bd/cancelOrderByPreDriver',{bookingID:bookingID},function(data){
        console.log(data);
        if(data=="ok"){
            $("#listItem"+indx+"").css({"display":"none"})
            $("#OrderCancelTimer"+indx+"").css({"display":"none"});
            $("#timeBtn"+indx+"").css({"display":"none"});
        }
    });
    }





