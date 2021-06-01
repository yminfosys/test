var socket = io('//'+document.location.hostname+':'+document.location.port);
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
    //var d = new Date();
   // d.setTime(d.getTime() + (exdays*24*60*60*1000));
     //var expires = "expires="+ d.toUTCString();
    // document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
   // console.log("cvalue.length",cvalue.length,"cvalue",cvalue)
        if(cvalue.length > 0){
         $.post('/india/setCookies',{cname:cname,cvalue:cvalue,expires:exdays*24*60*60*1000},function(data){
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
        //alert(otp)
        $("#mobile").css({"color":"green"});
        ////////Check Mobile No Exist in our System/////
        $.post('/india/drv/checkMobileExist',{mobile:mobile},function(data){
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
                ////Send OTP////
                $.post('/india/drv/otpSend',{mobile:mobile,otp:otp},function(data){
                    if(data.Status=='Success'){
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
    $.post('/india/drv/login',{password:password,mobile:mobile},function(data){
        if(data=='success'){
            window.location='/india/drv'
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
        window.location="../india/drv/logout"
    }
 }



 /////////Driver Page ////////////

 ///////Handel Socket io  parameter/////// 

        socket.on('openAcceptWindow', function (data) {
        console.log('openAcceptWindow',data);
        if(data.pilotID==getCookie("pilotID")){
        $("#ringtone").css({"display":"block"});
        $("#pickupFrom").text(data.pickuoAddress);
        $("#pilotID").val(data.pilotID);
        $("#CustID").val(data.CustID);
        setTimeout(function(){
            $("#ringtone").css({"display":"none"});
            $.post('/india/drv/resetRingtone',{pilotID:data.pilotID},function(dat){
                console.log(dat);
            });
        },14*1000)
        }       
        
        });

        ///////Display List Accept Call Details /////
        socket.on('CallAcceptListDisplay', function (resp) {
            
            ///////Genareate Driver Busy Coockes/////
            //setCookie("driverBusy","busy",30);
            if(resp.pilotID==getCookie("pilotID")){
                $.post('/india/drv/clineDetalls',{pilotID:resp.pilotID,CustID:resp.CustID,bookingID:resp.bookingID},function(data){
                    $("#pickDrop-Content").css({"display":"block"});
                    $("#orderNO").text(data.ride.bookingID);
                    $("#CustID").val(data.ride.CustID);
                    $("#OrderOTP").val(data.ride.preRideOTP);                    
                    $("#telsms").html('<a href="tel:'+data.cust.isdCode+data.cust.mobileNumber+'"><button type="button" class="btn btn-warning btn-xs"><i class="fa fa-phone" aria-hidden="true"></i></button></a>\
                    <a href="sms:'+data.cust.isdCode+data.cust.mobileNumber+'"><button type="button" class="btn btn-warning btn-xs"><i class="fa fa-comments" aria-hidden="true"></i></button></a>');
                    $("#address").html('<p>Pick up: <br> <strong>'+data.cust.name+'</strong> <br>'+data.ride.picupaddress+'</p>');
                    $("#mapBtn").html('<button onclick="googlemapbtn(\'' + 1 + '\',\'' + data.ride.picuklatlng + '\')" type="button" class="btn btn-info mybtn"><i class="fa fa-location-arrow" aria-hidden="true"></i></button>'); 

                    $("#clineLocated").css({"display":"block"});

                })

            }
        });


////////Cancel Order By Customer/////

socket.on("OrderCancelByCustomer",function(data){
    console.log("OrderCancelByCustomer",data)
    if(data.pilotID==getCookie("pilotID")){
        alert("Ride Calcel By Customer");
        window.location='/india/drv'
    }  
});

        

         //////////Driver Accept /////////
         function acceptRide(){                        
            var pilotID= $("#pilotID").val(); 
            var CustID= $("#CustID").val(); 
            $.post('/india/AcceptCallByDriver',{pilotID:pilotID,CustID:CustID},function(data){            
            if(data){ 
                $("#ringtone").css({"display":"none"});
                Android.stopRingtone();     
            }        
           
            });
        } 
  ///////Google Map BTN //////////
  function googlemapbtn(a,b){
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
            $.post('/india/drv/clinelocated',{CustID:$("#CustID").val()},function(respon){
            console.log("respon",respon)
                if(respon){                    
                    $("#clineLocated").css({"display":"none"});
                    $("#startRide").css({"display":"block"});
                    timeDisplay($("#orderNO").text());
                    
                }

            });

    }
            
     function otpinput(){        
         var valu=$("#otpp").val()
        if(valu.length >3){
            
            if($("#OrderOTP").val()==valu){
                $.post('/india/drv/startRide',{CustID:$("#CustID").val(),bookingID: $("#orderNO").text()},function(data){
                    
                        if(data){
                            $("#address").html('<p>Drop To: <br> <strong>'+data.cust.name+'</strong> <br>'+data.ride.dropaddress+'</p>');
                            $("#mapBtn").html('<button onclick="googlemapbtn(\'' + 2 + '\',\'' + data.ride.droplatlng + '\')" type="button" class="btn btn-info mybtn"><i class="fa fa-location-arrow" aria-hidden="true"></i></button>');
                            $("#OTP-Content").css({"display":"none"});
                            $("#startRide").css({"display":"none"});
                            $("#OrderCancelTimer").css({"display":"none"});
                            $("#finishride").css({"display":"block"});
                            $("#otpp").val("");                            
                            googlemapbtn( 2 , data.ride.droplatlng);    
                           
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
       
        $.post('/india/drv/finishRide',{
            CustID:$("#CustID").val(),
            bookingID: $("#orderNO").text()            
        },function(respon){
            console.log("respon",respon)
                if(respon){ 
                    
                    $("#pickDrop-Content").css({"display":"none"});
                    $("#billAndfeedback").css({"display":"block"});                  
                    $("#OTP-Content").css({"display":"none"});
                    $("#startRide").css({"display":"none"});
                    $("#finishride").css({"display":"none"});
                    $("#pickdropfooter").css({"display":"none"});
                    $("#pickdropHead").css({"display":"none"});
                    $("#amt").text(respon.billAmount)
                }

            });
        
}
function cancelOrderByDriver(bookingID){
$.post('/india/drv/cancelOrderByDriver',{bookingID:bookingID},function(data){
    console.log(data);
    if(data=="ok"){
        $("#pickDrop-Content").css({"display":"none"});
        $("#OTP-Content").css({"display":"none"});
        $("#startRide").css({"display":"none"});
        $("#finishride").css({"display":"none"});
        $("#pickdropfooter").css({"display":"none"});
        $("#pickdropHead").css({"display":"none"});
        $("#OrderCancelTimer").css({"display":"none"});
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


