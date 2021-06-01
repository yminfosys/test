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
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
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
        $.post('/bd/checkMobileExist',{mobile:mobile},function(data){
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
                $.post('/bd/otpSend',{mobile:mobile,otp:otp},function(data){
                  
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
    $.post('/bd/login',{password:password,mobile:mobile},function(data){
        if(data=='success'){
            window.location='/bd/servecemode'
        }else{
            $("#password").css({"background-color": "#c44630","color":"#FFF"});
            alert('Password dose not match')
        }
    });

}



 ///////End Login and Register///////
 
 
 ///////////////////////////////////////////////////
 ///////////////Main Customer Page/////////////////
 //////////////////////////////////////////////////
 function CloseAll(div){  
    $("#"+div+"").css({"display":"none"})
    CenterChange='Enable';
    }
////////CAll pickup placesearch content//////
    function pickupsearch(a){  
        $("#placesearch").css({"display":"Block"});        
        $("#searchPlace").focus()
        $("#searchPlace").val("")
        $("#placeList").html('<a onclick="CloseAll(\'placesearch\')" class="list-group-item active"><i class="fa fa-map-marker" aria-hidden="true"></i></span> &nbsp; Select From Map</a>');
        $(".searchGif").css({"display":"none"});
        
        }

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
              var origin=JSON.parse(getCookie("pickuplatlong")) ;
              var location=''+origin.lat+' ,'+origin.lng+'';
              out='<a onclick="CloseAll(\'placesearch\')" class="list-group-item active"><i class="fa fa-map-marker" aria-hidden="true"></i></span> &nbsp; Select From Map</a>'
              $.post('/bd/placesearch',{quary:quary,location:location},function(data){ 
                 
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
 
          
    // ////////// Travelmode time calculation///////
    function AlldrivingModeNearestTime(){ 
        var j=0;
        var travelmod=$("#ModeofTravel").val();
        var pickup=JSON.parse(getCookie("pickuplatlong")) ;
        $.each($(".modeImg"),function(i){
            j=i+1;
            if(travelmod!=j){
              $.post('/bd/nearbytime',{
                lat:pickup.lat,
                lng:pickup.lng,
                travelmod:j
               },function(resul){
                //alert(resul.data.length) 
               if(resul.data.length>0){
                //////// Call time distance/////
                var orig=''+Number(pickup.lat)+','+Number(pickup.lng)+'';
                var diste=''+Number(resul.data[0].location.coordinates[1])+','+Number( resul.data[0].location.coordinates[0])+'';
                $.post('/bd/distbtwntime',{travelmod:j,orig:orig,diste:diste,count:resul.count},function(outp){
                     //alert(outp.rows[0].elements[0].duration.text)
                  $("#timee"+outp.count+"").css({"display":"block"}); 
                  $("#timee"+outp.count+"").text(outp.data.rows[0].elements[0].duration.text)   
                  $("#gif"+outp.count+"").css({"display":"none"});
                    });        
               }else{
               ////////
               //alert(resul.count)
               $("#timee"+resul.count+"").css({"display":"none"});
               $("#gif"+resul.count+"").css({"display":"block"});
               
               }
              }); 
    
            }
            
        });
          
          
      }

          
  //////////Change Travel Mode//////
  function changeModeofTravel(tm){
    $("#ModeofTravel").val(tm);
    $("#modeImg"+tm+"").css({"border": "4px solid rgb(42, 204, 36)"});
    AlldrivingModeNearestTime(); 
    if($("#tmPrice"+tm+"").val()){
      //alert($("#tmPrice"+tm+"").val());
      //$("#totalAmt").text($("#tmPrice"+tm+"").val());
     // $("#booimg").html('<img class="tm-img" src="/bd/images/tm'+tm+'.png">')
        var totalprice=$("#tmPrice"+tm+"").val();
        $("#confrmBtn").html('Ride Now &#2547; '+totalprice+'')
        var tmPreRidePrice= $("#tmPreRidePrice"+tm+"").val();
        var distance=$("#totalDistance").val();
        if(Number(tmPreRidePrice)>0){
          $("#promoMsg").css({"display":"block"});
          $("#preRideBtn").css({"display":"block"});
          $("#confrmBtn").css({"width":"50%"})
          $("#promoMsg").html('<marquee>Reduce price @ &#2547;'+tmPreRidePrice+'/km Tab on Pre-Ride button</marquee>')
          $("#preRideBtn").html('Pre-Ride &#2547; '+ Number(distance) * Number(tmPreRidePrice)+'')
        }else{
          $("#promoMsg").css({"display":"none"});
          $("#preRideBtn").css({"display":"none"});
          $("#confrmBtn").css({"width":"100%"})
          
        }

        var tmShareRide= $("#tmShareRide"+tm+"").val();
                  if(Number(tmShareRide)>0){
                    $("#shareRideBtn").css({"display":"block"});
                    $("#shareRideBtn").html('Share-Ride &#2547; '+ Number(tmShareRide).toFixed(0)+'')
                    
                  }else{
                    $("#shareRideBtn").css({"display":"none"});
                    $("#shareRideBtn").html('Share-Ride')
                  }
    } 

    for(var i=0; i<10; i++){
      if(i!=tm){
        $("#modeImg"+i+"").css({"border": "1px solid #000"});
        
      }
    }
    };

    ///////Wallet Payment//////
    function walletReg(){
      $("#waletPayment").css({"display":"block"});   
      
    }

   ///////Confrim Booking/////
   function confirmBooking(){
    $('#confrmBtn').prop('disabled', true);
      //////check Wallet and BuyKM and Cash//////
      if($("#payBycash").prop("checked") == true){        
        continueBooking(1);      
        }else{
          var totalAmt= $("#totalAmt").text();
          var totalDistance= $("#totalDistance").val();
          var walletBalance= $("#walletBalance").val();
          var buyKM= $("#buyKM").val();
          
          if(Number(walletBalance)> 0){
            //alert("wellet accept")
            
            continueBooking(2);
          }else{
            //alert("wellet not accept");
            if(Number(buyKM)>Number(totalDistance) ){
              
              continueBooking(3);
            }else{
              alert("You Don't have available balance cover your jurny please Recharge your Wallet or BuyKM");
            }
          }
          
        }
   }

   function continueBooking(payMode){
    var originAds=getCookie("picuplocation") ;
    var distAds=getCookie("droplocation") ;
    var origin=JSON.parse(getCookie("pickuplatlong")) ;
    var dist=JSON.parse(getCookie("droplatlong")) ;
    var travelmod=$("#ModeofTravel").val();
    var CustID=getCookie("CustID")
    var totalAmt= $("#tmPrice"+travelmod+"").val();
    var totalDistance= $("#totalDistance").val();
    var timere; 
    /////Search Driver list/////
    $.post('/bd/nearbyRideBooking',{
      lat:origin.lat,
      lng:origin.lng,
      travelmod:travelmod,
      DriverType:"General"
     },function(data){
      console.log(data);
      $("#booking-process").css({"display":"block"});
      $("#footer-prebooking").css({"display":"none"});
      $("#traval-mod").css({"display":"none"});
      if(data.drivers.length > 0){
         ///// 
         console.log(data.drivers) 
         /////Call to Driver///
         var count=0; 
         $.post('/bd/CallDriver',{pilotID:data.drivers[count].pilotID,CustID:CustID,pickuoAddress:originAds},function(result){
            console.log(result);
          }); 
         count++;
         timere=setInterval(function(){ 
           if(count<data.drivers.length ){
            $.post('/bd/CallDriver',{pilotID:data.drivers[count].pilotID,CustID:CustID,pickuoAddress:originAds},function(result){
              console.log(result);
            }); 
           count++;
         }else{
           clearInterval(timere);
           ////////feedbace to customer/////
           console.log("Driver Busy")
           alert("All Drivers Are Busy with other Cline Please try again");        

          window.location='/bd/'

         }

         },15000);

         ///Handle Socket/////
         var tttt;
         socket.on('DriverAccepeCall', function (incomdata) {
          if(CustID==incomdata.CustID){
            console.log("Order Gen")
            clearTimeout(tttt);

            tttt=setTimeout(function(){
              ///////Grnerate Order/////

              $.post('/bd/saveDriverCallAndBooking',{
                originAds:originAds,
                distAds:distAds,
                originLat:origin.lat,
                originLng:origin.lng,
                distLat:dist.lat,
                distLng:dist.lng,
                travelmod:travelmod,
                CustID:CustID,
                pilotID:incomdata.pilotID,
                DriverType:"General",
                totalAmt:Number(totalAmt) ,
                totalDistance:totalDistance,
                payMode:payMode,
              },function(result){
              console.log(result);
              if(result){
                //alert(resp)
                window.location='../bd/ride'
              }
            }); 
            },500)
          }
         })


      }else{

        alert("Driver Not Avaible");
        window.location='../bd/'
        ///////Search Pre Ride Driver //////
      }

     });
   } 

    
   /////Pre-Ride Booking///////
   function preRideBooking(){
 
    var travelmod=$("#ModeofTravel").val();
    var totalAmt= $("#tmPreRidePrice"+travelmod+"").val();   /////Pre KM Price  
    var totalDistance= $("#totalDistance").val();    
    $("#footer-preRide").css({"display":"block"});
    $("#preRideAmount").html('Aprox Pre-Ride Cost &#2547; '+totalAmt*totalDistance+'');
    $("#prerideCnfBtn").css({"display":"block"});
    $("#preridesBackbtn").css({"display":"block"});

    $("#prebooking-process").css({"display":"none"});


   }


    //////////Confram Pre-Ride//////
   function conframPreride(){
    $('#conframPreridebtn').prop('disabled', true);
    //////check Wallet and BuyKM and Cash//////
    if($("#payBycash").prop("checked") == true){        
      continuePreBooking(1);      
      }else{
        var totalAmt= $("#totalAmt").text();
        var totalDistance= $("#totalDistance").val();
        var walletBalance= $("#walletBalance").val();
        var buyKM= $("#buyKM").val();
        
        if(Number(walletBalance)> 0){
          //alert("wellet accept")
          
          continuePreBooking(2);
        }else{
          //alert("wellet not accept");
          if(Number(buyKM)>Number(totalDistance) ){
            
          continuePreBooking(3);
          }else{
            alert("You Don't have available balance cover your jurny please Recharge your Wallet or BuyKM");
          }
        }
        
      }

   }

 
   
   function continuePreBooking(payMode){   
        var originAds=getCookie("picuplocation") ;
        var distAds=getCookie("droplocation") ;
        var origin=JSON.parse(getCookie("pickuplatlong")) ;
        var dist=JSON.parse(getCookie("droplatlong")) ;
        var CustID=getCookie("CustID");
        var travalTime=getCookie("travalTime");
        var travelmod=$("#ModeofTravel").val();
        var totalAmt= $("#tmPreRidePrice"+travelmod+"").val();
        var totalDistance= $("#totalDistance").val();
        var timere;
        $("#prebooking-process").css({"display":"block"});
        $("#prerideCnfBtn").css({"display":"none"});
        $("#preridesBackbtn").css({"display":"none"});
        console.log(dist);
        var preRideTimer;
      /////Search Pre-ride list/////
        $.post('/bd/nearbyPrerideDriver',{
          lat:origin.lat,
          lng:origin.lng,
          travelmod:travelmod,
          DriverType:"preRide"
        },function(data){
          console.log("Filter Driver",data);
          if(data.drivers.length > 0){
           /////Call to Driver///
           var count=0; 
           $.post('/bd/CallPreRideDriver',{pilotID:data.drivers[count].pilotID,CustID:CustID},function(result){
              console.log(result);
            }); 
           count++;
           timere=setInterval(function(){ 
             if(count<data.drivers.length ){
              $.post('/bd/CallPreRideDriver',{pilotID:data.drivers[count].pilotID,CustID:CustID},function(result){
                console.log(result);
              }); 
             count++;
           }else{
             clearInterval(timere);
             ////////feedbace to customer/////
             console.log("Driver Busy")
             alert("All Drivers Are Busy with other Cline Please try again");
             window.location='/bd/'
           }
           },10000);
   
             ///Check Socket For Driver Accepttance////
            // var socket = io('//'+document.location.hostname+':'+document.location.port);
            var tt;
             socket.on('PreRideDriverAccepeCall', function (incomdata) {
               if(CustID==incomdata.CustID){
                 clearInterval(timere);

                 clearTimeout(tt);
                 tt=setTimeout(function(){
                 console.log("PreRideDriverAccepeCall",incomdata)
                 //////Save and Generate Booking////
                 $.post('/bd/savePreRideCallAndBooking',{
                  pilotID:incomdata.pilotID,
                  CustID:incomdata.CustID,
                  /////For create booking////                   
                  originAds:originAds,
                  distAds:distAds,
                  originLat:origin.lat,
                  originLng:origin.lng,
                  distLat:dist.lat,
                  distLng:dist.lng,
                  travelmod:travelmod,
                  CustID:CustID,
                  DriverType:"preRide",
                  totalAmt:Number(totalAmt) * Number(totalDistance),
                  totalDistance:totalDistance,
                  travalTime:travalTime,
                  payMode:payMode,
                  
                 },function(resp){
                  if(resp){
                    //alert(resp)
                    window.location='../bd/ride'
                  }
                 });

                },500);
                
                
               }
             });


          }else{
            ///////Driver ot Found
            alert("Driver Not Found Try Again");
            $("#footer-preRide").css({"display":"none"});
          }
        });
  }


 

  ////// await for loop testing//////
// var ary=[1,2,3,4,5,6,7,8,9]
//   const forLoop = async _ => {
//     console.log('Start') 
//     Loop:                   
//     for (let index = 0; index < ary.length; index++) {
     
//       const numFruit =  driverBookingsAndTime( ary[index]);

//       await numFruit
     
     
       
     
//     }
  
//     console.log('End')
//   }
//   forLoop();


//  async function driverBookingsAndTime (pilotID){
//    await $.post('/bd/trstloop',{pilotID:pilotID}, function(data){
//      console.log(data)
//       if(data.bookings =="2"){
//         forLoop.close();        
//      }
//     });
    
//   }


    function backPreride(){
    $("#footer-preRide").css({"display":"none"});
    $('#conframPreridebtn').prop('disabled', false); 
   }



        
 
            
        
  ///////////////////////////////////////////////////
 ///////////////End Main Customer Page/////////////////
 //////////////////////////////////////////////////

