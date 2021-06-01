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
        $.post('/india/preDrv/checkMobileExist',{mobile:mobile},function(data){
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
                $.post('/india/drv/otpSend',{mobile:mobile,otp:otp},function(data){
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
    $.post('/india/preDrv/login',{password:password,mobile:mobile},function(data){
        if(data=='success'){
            window.location='/india/Predrv'
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
        window.location="../india/preDrv/logout"
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
      $.post('/india/existingPrerideCall',{pilotID:data.pilotID,driverBusy:data.driverBusy},function(rides){
        console.log("Ride Details",rides)
        var out="";
        var addressPart="";
        var btnPart="";
        var canceltimerPart="";
        var smalest=0;
        var smalIndx=0
        var timerPart="";
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
                btnPart='<input onclick="clineLocated(\''+indx+'\',\'' + val.picuklatlng + '\')" id="clineLocated'+indx+'" class="pickupPreridebtn1" type="button" value="Client Located">\
                <input onclick="startRide(\''+indx+'\')" id="startRide'+indx+'" class="pickupPreridebtn" type="button" value="Start Ride">\
                <input onclick="finishride(\''+indx+'\',\'' + val.droplatlng + '\')" id="finishride'+indx+'" class="pickupPreridebtn1" type="button" value="Finish Ride">';
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
                    timerPart=' <div id="finish-timer'+indx+'" style="height: 50px; display:none;" class="col-xs-4 col-sm-4 col-xs-offset-4 col-sm-offset-4">\
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
                  <div style="margin-top: 5px;" class="col-xs-8 col-sm-8" >\
                      <div class="timeBtn" id="timeBtn'+indx+'">\
                          <div class="btn btn-danger col-xs-6 col-sm-6" onclick="cancelOrderByDriver(\'' + val.bookingID + '\',\'' + indx + '\')">Cancel Order</div>\
                          <div onclick="timeDisplay(\'' + val.bookingID + '\',\'' + indx + '\')" class="btn btn-primary col-xs-6 col-sm-6">Wait Again</div>\
                      </div>\
                  </div>\
                  <div class="col-xs-4 col-sm-4" >\
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

            }
        });

      });
   

  
  }
  });


  ///////Google Map BTN //////////
  function googlemapbtn(a,b,bookingID,indx){
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
         $.post("/india/startCarLoogbook",{bookingID:bookingID},function(data){console.log(data)});
         $("#clineLocated"+indx+"").css({"display":"block"});
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
        window.location='/india/preDrv'
    }  
});

////////// On Cline Clocated/////////
function clineLocated(indx,picklatlng){
    // var finishTime;
    // finishdelay(indx);
    // clearTimeout(finishTime);
    // finishTime=setTimeout(function(){
    //     //alert("rr")
    //     clineLocatedStart(indx);
    // },1000*12);
    var picuklatlng=picklatlng.split(",");
    // alert(picuklatlng[0])
    // alert(picuklatlng[1])
   
    $.post('/india/clinelocateDistance',{picklat:picuklatlng[0],picklng:picuklatlng[1]},function(respon){
       //alert(respon.distance) 
       if(Number(respon.distance) < 800){
        clineLocatedStart(indx);  
       }else{
           alert("You have not reach your destination");
       }
    })


};
function clineLocatedStart(indx){
    var CustID=$("#CustID"+indx+"").val(); 
    var bookingID=$("#bookingID"+indx+"").val();   
    $.post('/india/preRideClinelocated',{CustID:CustID,bookingID:bookingID},function(respon){
    console.log("respon",respon)
        if(respon){                    
            $("#clineLocated"+indx+"").css({"display":"none"});
            $("#startRide"+indx+"").css({"display":"block"});
            $("#listItem"+indx+"").css({"background-color":"#b0f1ee"})
            timeDisplay(bookingID,indx)
            $.post("/india/CarLoogbookClineLocate",{bookingID:bookingID},function(data){console.log(data)});
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
           $.post('/india/preRideStartRide',{CustID:CustID,bookingID:bookingID},function(responce){
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
function finishride(indx, droplatlng){
    $("#finishride"+indx+"").css({"display":"none"})
    // var finishTime;
    // finishdelay(indx);
    // clearTimeout(finishTime);
    // finishTime=setTimeout(function(){
    //     //alert("rr")
    //     finishrideabc(indx)
    // },1000*12);
    var picuklatlng=droplatlng.split(",");
    // alert(picuklatlng[0])
    // alert(picuklatlng[1])
    $.post('/india/clinelocateDistance',{picklat:picuklatlng[0],picklng:picuklatlng[1]},function(respon){
        //alert(respon.distance) 
      if(Number(respon.travelmod)>1){
        if(Number(respon.distance) < 4000){
            $("#finishride"+indx+"").css({"display":"none"})
            finishrideabc(indx);
        }else{
            alert("You have not reach your destination");
            $("#finishride"+indx+"").css({"display":"block"})
        }

      }else{
        if(Number(respon.distance) < 2000){
            $("#finishride"+indx+"").css({"display":"none"})
            finishrideabc(indx);
        }else{
            alert("You have not reach your destination");
            $("#finishride"+indx+"").css({"display":"block"})
        }
      }
       
     })
};


function finishrideabc(indx){
    var CustID=$("#CustID"+indx+"").val(); 
    var bookingID=$("#bookingID"+indx+"").val();
    var picuklatlng=$("#picuklatlng"+indx+"").val();
    picuklatlng=picuklatlng.split(",");
    
        $.post('/india/preRideFinish',{
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
                    var billAmount=Number(respon.billAmount).toFixed(0);
                    $("#amt").text(billAmount)
                    $("#bookingIDFinish").val(bookingID);
                }

            });
        
}

///////Pre Ride Cash Collection/////////////

///////Calcel Timer Watch//////
function timeDisplay(bookingID,indx){
    //alert(bookingID)
    var timer;
    var count = 60*5;
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
    $.post('/india/cancelOrderByPreDriver',{bookingID:bookingID},function(data){
        console.log(data);
        if(data=="ok"){
            $("#listItem"+indx+"").css({"display":"none"})
            $("#OrderCancelTimer"+indx+"").css({"display":"none"});
            $("#timeBtn"+indx+"").css({"display":"none"});
        }
    });
    }



    ///////Calcel Timer Watch//////
function finishdelay(indx){
    //alert(bookingID)
    var timer;
    var count = 13;
     //$("#finish-timer"+indx+"").css({"display":"none"});
     $("#finish-timer"+indx+"").css({"display":"block"}); 
    timer=setInterval(function(){
        count=count-1;
        var min=parseInt(count/60);
        var sec=(count % 60);
        if(sec < 10){
            sec='0'+sec+'';
        }
        $("#timer-text"+indx+"").html(''+sec+'')
        if(count < 0){
            $("#timer-text"+indx+"").html('10')
            clearInterval(timer);
            $("#finish-timer"+indx+"").css({"display":"none"});
        }
    },1000);

}
///////Preride Incentive ///////

function incentive(){

var month=new Date().getMonth();

$.post('/india/incentiveCalculation',{month:month},function(data){
if(data){
    $("#incentive-content").css({"display": "block"});
    $("#totalkm").html('<p class="text-center kmtext">Total Kilometer <br> '+Number(data.km).toFixed(2)+'</p>')
  
}
})

}


////////Free Movement Go to Demand Area/////
var socket = io('//'+document.location.hostname+':'+document.location.port);
socket.on("preRidegotodemandpktsend",function(data){
    var setSystem=getCookie("setSystem");
    console.log("test go to request",data) 
    console.log("setSystem",setSystem) 
    if(setSystem=="ONLINE"){    
        if(data.pilotID==getCookie("pilotID")){            
            $.post('/india//admin/sub/preRidegotodemandpktRetun',{
                pilotID: data.pilotID,
                lat: data.lat, 
                lng: data.lng, 
                subAdminID: data.subAdminID, 
                mode: "subadmin"
            },function(dd){
                var out='<div class="container-fluid">\
                <div class="row">\
                    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">\
                        <div style="background-color:#facb3d; height: 65vh; text-align: center; " class="thumbnail">\
                            <img style="width: 30%; margin-top: 30px;" src="/india/images/centerpin.png" alt="">\
                            <div  class="caption">\
                                <p>'+data.lat+' , '+data.lng+'</p>\
                                <h3>Your Demand Location</h3>\
                                <p>\
                                    <a onclick="openMap(\'' + dd.demandID + '\',\'' + data.lat + '\',\'' + data.lng + '\',\'' + data.pilotID + '\', \'' + data.subAdminID + '\')" class="btn btn-primary"><i class="fa fa-location-arrow" aria-hidden="true"></i></a>\
                                    <a id="inLocation" onclick="inLocation(\'' + data.pilotID + '\', \'' + dd.demandID + '\', \'' + data.subAdminID + '\')" class="btn btn-default">I am in Location</a>\
                                </p>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            </div>'                
                $("#driverFreetoMove").css({"display":"block"});
                $("#driverFreetoMove").html(out)
                Android.startRingtone();                
           })
            
        }
      }   
     
});


function openMap(demandID,lat,lng,pilotID,subAdminID){
    if
    ((navigator.platform.indexOf("iPhone") != -1) || 
    (navigator.platform.indexOf("iPad") != -1) || 
    (navigator.platform.indexOf("iPod") != -1)){
       window.open("maps://maps.google.com/maps?daddr="+lat+","+lng+", &amp;ll=");
    }else{
       window.open("https://maps.google.com/maps?daddr="+lat+","+lng+"&amp;ll=");
    } /* else use Google */
    //////Start Car LogBook Reding For PreRide//////
    $.post("/india/gotodemandkmstart",{pilotID:pilotID,demandID:demandID,subAdminID:subAdminID,lat:lat,lng:lng},function(data){
        $("#inLocation").css({"display": "block"})
        console.log(data)
    });
}


function inLocation(pilotID,demandID,subAdminID){
    $("#inLocation").css({"display": "none"})
    $.post("/india/gotodemandkmsfinish",{pilotID:pilotID,demandID:demandID,subAdminID:subAdminID},function(data){
        console.log(data)
        if(data){
            $("#driverFreetoMove").css({"display":"none"});
            alert('Fuelconsumption Rs. '+data.fuleConsumption+' added to your account')  
        }
    });
}

function closeincentive(){
$("#incentive-content").css({"display": "none"})  
}

/////PreRide Help Center///////////
function helpcenter(){
    $("#help-content").css({"display": "block"})

}
function gotoBack(){
    $("#help-content").css({"display": "none"})  
}

function emergencycall(){
    Android.urgentCall();
    
}




