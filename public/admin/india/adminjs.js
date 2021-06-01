function cityandprice(){  
    cityList(function(city){
        var out='<option value="">Select City</option>';
       if(city.length >0){ 
        city.forEach(function(val,key,ary){
            out+='<option value="'+val.CityName+','+val.CityGPS[0]+','+val.CityGPS[1]+'">'+val.CityName+'</option>'
            if(key===ary.length -1){
                $("#cityPriceModule").html('<div class="col-md-10  col-md-offset-1 ">\
                <div class="panel panel-success">\
                      <div class="panel-heading">\
                            <h3 class="panel-title">City And Price List</h3>\
                      </div>\
                      <div id="cityPriceList" class="panel-body">\
                        <div class="row">\
                            <div class=" col-md-4 col-lg-4 col-md-offset-4 col-lg-offset-4">\
                                <div class="form-group" style="width: 75%;">\
                                    <select name="" id="cityLatLng" class="form-control" onchange="getCityPriceList()" >\
                                      '+out+'\
                                    </select>\
                                </div>\
                                <button type="button" class="btn btn-primary" onclick="creatNewCityInit()">Create New City</button>\
                            </div>\
                        </div>\
                     </div>\
                </div>\
            </div>')
            }
        })
    }else{
        $("#cityPriceModule").html('<div class="col-md-10  col-md-offset-1 ">\
        <div class="panel panel-success">\
              <div class="panel-heading">\
                    <h3 class="panel-title">City And Price List</h3>\
              </div>\
              <div id="cityPriceList" class="panel-body">\
                <div class="row">\
                    <div class=" col-md-4 col-lg-4 col-md-offset-4 col-lg-offset-4">\
                        <div class="form-group" style="width: 75%;">\
                            <select name="" id="cityLatLng" class="form-control" onchange="getCityPriceList()" >\
                              '+out+'\
                            </select>\
                        </div>\
                        <button type="button" class="btn btn-primary" onclick="creatNewCityInit()">Create New City</button>\
                    </div>\
                </div>\
             </div>\
        </div>\
    </div>')
    }
    });

}

function creatallIndiaCityInit(){
    $("#cityPriceModule").html('<div class="col-md-10  col-md-offset-1 ">\
    <div class="panel panel-success">\
          <div class="panel-heading">\
                <h3 class="panel-title">All India City <span id="totalof"> [ 0/0 ]</span></h3>\
          </div>\
          <div id="cityPriceList" class="panel-body">\
            <p class="text-center"><button onclick="creatallIndiaCity(\''+1+'\', \''+1+'\')" type="button" class="btn btn-primary">Start</button></p>\
            <p id="resultof">Result: complete </p>\
            <ul class="pager">\
              <li class="previous disabled"><a href="#">Previous</a></li>\
              <li><a>0</a></li>\
              <li class="next disabled"><a href="#">Next</a></li>\
            </ul>\
         </div>\
    </div>\
</div>')
}

function creatallIndiaCity(page,limit){
    if (confirm('Are You sure Careate All India City It is effect Google Place API Bill')) {
        // Save it!
        $("#cityPriceList").html("Please Wait.....")
        $.post('/india/admin/allIndiaCityCreate',{page:page,limit:limit},function(data){
           if(data){
               if(data.nextPage){
                var nextPage='<li onclick="creatallIndiaCity(\''+data.nextPage+'\', \''+data.limit+'\')" class="next"><a href="#">Next</a></li>'
               }else{
                var nextPage='<li class="next disabled"><a href="#">Next</a></li>'
               }
               if(data.prvPage){
                 var prvPage='<li onclick="creatallIndiaCity(\''+data.prvPage+'\', \''+data.limit+'\')" class="previous"><a href="#">Previous</a></li>'  
                }else{
                 var prvPage='<li onclick="creatallIndiaCity(\''+data.prvPage+'\', \''+data.limit+'\')" class="previous disabled"><a href="#">Previous</a></li>'  
                }
            $("#cityPriceList").html('<p id="resultof">Result: '+data.msg+' </p>\
            <ul class="pager">\
             '+prvPage+'\
              <li><a>'+data.page+'</a></li>\
              '+nextPage+'\
            </ul>');

            $("#totalof").html('[ '+data.endIndex+' / '+data.total+' ]')

           } 
        })
      } else {
        // Do nothing! nextPage:nextPage,prvPage:prvPage,limit:limit,msg:ss,total:citylist.city.length,endIndex:endIndex
        
      }
}


function creatNewCityInit(){
    var out='<option value="">Select Branch</option>';
    branchList(function(branch){
       if(branch.length >0){
        branch.forEach(function(val,key,ary){
            out+='<option value="'+val.branchName+'">'+val.branchName+'</option>'
            if(key===ary.length -1){
                $("#cityPriceList").html('<div class=" col-md-6 col-lg-6 col-md-offset-3 col-lg-offset-3">\
                <div class="col-sm-6">\
                    <label>City Latitude :</label>\
                    <input type="text"  id="cityLat" class="form-control" value="" placeholder="City Lat"  >\
                </div>\
                <div class="col-sm-6">\
                    <label>City Longitude :</label>\
                    <input type="text"  id="cityLng" class="form-control" value="" placeholder="City Lng" >\
                </div>\
                <div class="col-sm-6">\
                    <label>In Which Branch :<button type="button" class="btn btn-xs btn-success" onclick="creatNewBranchInit()">Create New Branch</button></label>\
                    <select name="" id="branch" class="form-control" >\
                        '+out+'\
                    </select>\
                </div>\
                <div class="col-sm-2" style="margin-top: 20px;">\
                <button type="button" class="btn btn-success" onclick="creatNewCity()">Create</button>\
                </div>\
            </div>');

            }
        });
       }else{
        $("#cityPriceList").html('<div class=" col-md-6 col-lg-6 col-md-offset-3 col-lg-offset-3">\
        <div class="col-sm-6">\
            <label>Create a Brunch: <button type="button" class="btn btn-xs btn-success" onclick="creatNewBranchInit()">Create New Branch</button></label>\
        </div>\
    </div>')

       }
       

    });

}

function creatNewBranchInit(){
    $("#cityPriceList").html('<div class=" col-md-6 col-lg-6 col-md-offset-3 col-lg-offset-3">\
                <div class="col-sm-6">\
                    <label>Branch Name :</label>\
                    <input type="text"  id="branchName" class="form-control" value="" placeholder="Branch Name"  >\
                </div>\
                <div class="col-sm-2" style="margin-top: 20px;">\
                <button type="button" class="btn btn-success" onclick="creatNewBranch()">Create</button>\
                </div>\
            </div>')
}

function creatNewBranch(){
    var branchName=$("#branchName").val().trim(); 
    if(branchName){
        $.post('/india/admin/addNewBranch',{branchName:branchName},function(data){
           if(data=="ok"){
            creatNewCityInit();
           }else{
               alert("Branch Exist")
           } 
        })
    }else{
        alert("Enter Branch")
    }
    
}

function branchList(cb){
    $.post('/india/admin/branchList',{},function(data){
        cb(data);
    })
}

function creatNewCity(){
    var cityLat=$("#cityLat").val().trim();
    var cityLng=$("#cityLng").val().trim(); 
    var branch=$("#branch").val(); 
    if(cityLat && cityLng && branch){
        $.post('/india/admin/createNewCity',{cityLat:cityLat,cityLng:cityLng,branch:branch},function(city){
            //alert(city)
            addNew(city,cityLat,cityLng,branch);
        });
    }else{
        alert("Enter Lat Lng And Select Branch");
    }


}

function getCityPriceList(){
    var cityLatLng=$("#cityLatLng").val();
    var cityAry=cityLatLng.split(",");
    $.post('/india/admin/getCityprice',{CityName:cityAry[0]},function(data){
       console.log(data)
       var out="";
       data.forEach(function(val,key,ary){
        out+='<ul class="list-group">\
        <li class="list-group-item active ">\
          <span style="font-size: 12px" class="badge">Pre-Ride Price: &#8377;'+val.preRidekmprice+'</span>\
          <span style="font-size: 12px" class="badge">Pre-Ride Time Cgarge: &#8377;'+val.preRideperMinutCharge+'</span>\
          <span style="font-size: 12px" class="badge">Right-Now Price: &#8377;'+val.PerKMPrice+'</span>\
          <span style="font-size: 12px" class="badge">Right-Now Time Charge: &#8377;'+val.GenarelPerMinutCharge+'</span>\
          City: '+val.CityName+',   <span>\
             <button type="button" class="btn btn-info btn-xs" onclick="deleteCityPrice(\'' + val._id + '\')">Delete</button>\
             </span>\
        </li>\
        <li class=" list-group-item list-group-item-info ">\
            <span class="badge">Travel Mode: '+val.travelMode+'  </span>\
            Other Details:<br> Base Price:'+val.basePrice+' Driver PayOut:'+val.driverpayout+'\
            Minimum Km: '+val.minimumKM+' Minimum Price &#8377; '+val.minimumPricePer+' Ride Incentive: '+val.rideIncetiv+' Shere Ride: '+val.shareRide+'\
            Shere Ride Capacity: '+val.shereRideCapacity+'<br>Pick Time: '+JSON.stringify(val.cityPickTimeMultiplyer)+'<br>Redius:'+JSON.stringify(val.cityRediusMultiplyer)+'<br>Holiday: <br>WeekEnd: \
        </li>\
     </ul>';
     
//      CityGPS: (2) [22.39, 88.4]  

        if(key===ary.length-1){
            
            $("#cityPriceList").html('<input type="hidden"  id="cityLatLng" value="'+cityAry[0]+','+cityAry[1]+','+cityAry[2]+'">\
            '+out+'<button type="button" class="btn btn-info btn-xs" onclick="addNew(\'' + cityAry[0] + '\',\'' + cityAry[1] + '\',\'' + cityAry[2] + '\',\'' + data[0].branchName + '\')">Add New</button>\
            <button type="button" class="btn btn-info btn-xs" onclick="rediusManager(\'' + cityAry[0] + '\',\'' + cityAry[1] + '\',\'' + cityAry[2] + '\')">City Redius Manager</button>\
            <button type="button" class="btn btn-info btn-xs" onclick="pickTimeManager(\'' + cityAry[0] + '\',\'' + cityAry[1] + '\',\'' + cityAry[2] + '\')">City Pick Time Manager</button>\
            <button type="button" class="btn btn-info btn-xs" onclick="weekendManager(\'' + cityAry[0] + '\',\'' + cityAry[1] + '\',\'' + cityAry[2] + '\')">City Weekend Manager</button>\
            <button type="button" class="btn btn-info btn-xs" onclick="holudayManager(\'' + cityAry[0] + '\',\'' + cityAry[1] + '\',\'' + cityAry[2] + '\')">City holiday Manager</button>\
            <button type="button" class="btn btn-info btn-xs" onclick="cloceCity()">Close</button>');   
        } 
       })
    })
}

function rediusManager(city,lat,lng){
    $("#cityPriceList").html('<input type="hidden"  id="cityLatLng" value="'+city+','+lat+','+lng+'"><div class="row">\
    <div class=" col-md-4 col-lg-4 col-md-offset-4 col-lg-offset-4">\
        <div class="form-group" style="width: 75%;">\
            <select name="" id="travelTypemode" class="form-control" >\
            <option value="">Select Travel Mode</option>\
              <option value="1">Bike</option>\
              <option value="2">Auto</option>\
              <option value="3">4 seat Mini Cab</option>\
              <option value="4">6 seat Cab</option>\
            </select>\
        </div>\
    </div>\
    <div class=" col-md-8 col-lg-8 col-md-offset-2 col-lg-offset-2">\
      <div class="form-group">\
        <div class="col-sm-6">\
          <label>Set Redious:</label>\
          <input type="text"  id="setRedus" class="form-control" value="" >\
        </div>\
        <div class="col-sm-6">\
          <label>Set Price Multiplyer:</label>\
          <input type="text"  id="rediousMultiplyer" class="form-control" value=""  >\
        </div>\
      </div>\
      <div style="margin-top: 10px;" class="col-md-8 col-lg-8 col-md-offset-2 col-lg-offset-2">\
      <div class="col-sm-6">\
        <button type="button" class="btn btn-success" onclick="updateRedious(\'' + city + '\')">Submit</button>\
      </div>\
      <div class="col-sm-6">\
        <button type="button" class="btn btn-success" onclick="cloceCity()">Close</button>\
        <button type="button" class="btn btn-success" onclick="deleteRedious(\'' + city + '\')">Delete</button>\
      </div>\
      </div>\
   </div>\
</div>')
}

function updateRedious(city){
    var setRedus=$("#setRedus").val()
    var rediousMultiplyer=$("#rediousMultiplyer").val()
    if(setRedus && rediousMultiplyer){
    $.post('/india/admin/updateRedious',{
        CityName:city,
        travelMode:$("#travelTypemode").val(),
        setRedus:setRedus,
        rediousMultiplyer:rediousMultiplyer
    },function(data){
        if(data=="success"){
            getCityPriceList();
        }else{
            alert("This Travel Mode Not Exist in City List")
        }
    })
 }else{
     alert("Set Value")
 }
}

function deleteRedious(city){
    $.post('/india/admin/deleteRedious',{
        CityName:city,
        travelMode:$("#travelTypemode").val()
    },function(data){
        if(data=="success"){
            getCityPriceList();
        }else{
            alert("This Travel Mode Not Exist in City List")
        }
    });

}

function holudayManager(city,lat,lng){
    $("#cityPriceList").html('<input type="hidden"  id="cityLatLng" value="'+city+','+lat+','+lng+'"><div class="row">\
    <div class=" col-md-4 col-lg-4 col-md-offset-4 col-lg-offset-4">\
        <div class="form-group" style="width: 75%;">\
            <select name="" id="cityLatLng" class="form-control" >\
              <option value="1">Bike</option>\
              <option value="2">Auto</option>\
              <option value="3">4 seat Mini Cab</option>\
              <option value="4">6 seat Cab</option>\
            </select>\
        </div>\
    </div>\
    <div class=" col-md-8 col-lg-8 col-md-offset-2 col-lg-offset-2">\
      <div class="form-group">\
        <div class="col-sm-6">\
          <label>Set Holiday :</label>\
          <input type="date"  id="rediousPrice" class="form-control" value=""  >\
        </div>\
        <div class="col-sm-6">\
          <label>Set holiday Price in (%) :</label>\
          <input type="text"  id="setRedus" class="form-control" value="" >\
        </div>\
      </div>\
      <div style="margin-top: 10px;" class="col-md-8 col-lg-8 col-md-offset-2 col-lg-offset-2">\
      <div class="col-sm-6">\
        <button type="button" class="btn btn-success" onclick="updateHoliday()">Submit</button>\
      </div>\
      <div class="col-sm-6">\
        <button type="button" class="btn btn-success" onclick="cloceCity()">Close</button>\
      </div>\
      </div>\
   </div>\
</div>')
}
function pickTimeManager(city,lat,lng){
    $("#cityPriceList").html('<input type="hidden"  id="cityLatLng" value="'+city+','+lat+','+lng+'"><div class="row">\
    <div class=" col-md-4 col-lg-4 col-md-offset-4 col-lg-offset-4">\
        <div class="form-group" style="width: 75%;">\
            <select name="" id="travelTypemode" class="form-control" >\
            <option value="">Select Travel Mode</option>\
              <option value="1">Bike</option>\
              <option value="2">Auto</option>\
              <option value="3">4 seat Mini Cab</option>\
              <option value="4">6 seat Cab</option>\
            </select>\
        </div>\
    </div>\
    <div class=" col-md-8 col-lg-8 col-md-offset-2 col-lg-offset-2">\
      <div class="form-group">\
        <div class="col-sm-6">\
          <label>Set Pick time :</label>\
          <input type="time"  id="pickTimeStart" class="form-control" value=""  >\
          <label>End Pick time :</label>\
          <input type="time"  id="pickTimeStop" class="form-control" value=""  >\
        </div>\
        <div class="col-sm-6">\
          <label>Set Pick time Price in (%) :</label>\
          <input type="text"  id="setPickTimePrice" class="form-control" value="" >\
        </div>\
      </div>\
      <div style="margin-top: 10px;" class="col-md-8 col-lg-8 col-md-offset-2 col-lg-offset-2">\
      <div class="col-sm-6">\
        <button type="button" class="btn btn-success" onclick="updatePickTime(\'' + city + '\')">Submit</button>\
      </div>\
      <div class="col-sm-6">\
        <button type="button" class="btn btn-success" onclick="cloceCity()">Close</button>\
        <button type="button" class="btn btn-success" onclick="deletePickTime(\'' + city + '\')">Delete</button>\
      </div>\
      </div>\
   </div>\
</div>')
}

function updatePickTime(city){
    var pickTimeStart=$("#pickTimeStart").val();
    var pickTimeStop=$("#pickTimeStop").val();
    var setPickTimePrice=$("#setPickTimePrice").val();
    if(pickTimeStart && pickTimeStop && setPickTimePrice){
    $.post('/india/admin/updatePickTime',{
        CityName:city,
        travelMode:$("#travelTypemode").val(),
        pickTimeStart:pickTimeStart,
        pickTimeStop:pickTimeStop,
        setPickTimePrice:setPickTimePrice
    },function(data){
        if(data=="success"){
            getCityPriceList();
        }else{
            alert("This Travel Mode Not Exist in City List")
        }
    })
 }else{
     alert("Set Value")
 }

}

function deletePickTime(city){
    $.post('/india/admin/deletePickTime',{
        CityName:city,
        travelMode:$("#travelTypemode").val()
    },function(data){
        if(data=="success"){
            getCityPriceList();
        }else{
            alert("This Travel Mode Not Exist in City List")
        }
    });

}

function weekendManager(city,lat,lng){
    $("#cityPriceList").html('<input type="hidden"  id="cityLatLng" value="'+city+','+lat+','+lng+'"><div class="row">\
    <div class=" col-md-4 col-lg-4 col-md-offset-4 col-lg-offset-4">\
        <div class="form-group" style="width: 75%;">\
            <select name="" id="cityLatLng" class="form-control" >\
              <option value="1">Bike</option>\
              <option value="2">Auto</option>\
              <option value="3">4 seat Mini Cab</option>\
              <option value="4">6 seat Cab</option>\
            </select>\
        </div>\
    </div>\
    <div class=" col-md-8 col-lg-8 col-md-offset-2 col-lg-offset-2">\
      <div class="form-group">\
        <div class="col-sm-6">\
          <label>Set Week End :</label>\
          <input type="date"  id="rediousPrice" class="form-control" value=""  >\
        </div>\
        <div class="col-sm-6">\
          <label>Set Weakend Price in (%) :</label>\
          <input type="text"  id="setRedus" class="form-control" value="" >\
        </div>\
      </div>\
      <div style="margin-top: 10px;" class="col-md-8 col-lg-8 col-md-offset-2 col-lg-offset-2">\
      <div class="col-sm-6">\
        <button type="button" class="btn btn-success" onclick="updateHoliday(\'' + city + '\')">Submit</button>\
      </div>\
      <div class="col-sm-6">\
        <button type="button" class="btn btn-success" onclick="cloceCity()">Close</button>\
      </div>\
      </div>\
   </div>\
</div>')
}

function addNew(city,lat,lng,branch){
    //alert(lat)  cityLatLng
    $("#cityPriceList").html('<input type="hidden"  id="cityLatLng" value="'+city+','+lat+','+lng+'"> <div class="form-group">\
    <div class="col-sm-3">\
        <label>City :</label>\
        <input type="text"  id="city" class="form-control" value="'+city+'"  disabled>\
    </div>\
    <div class="col-sm-3">\
        <label>Branch :</label>\
        <input type="text"  id="branchName" class="form-control" value="'+branch+'"  disabled>\
    </div>\
    <div class="col-sm-2">\
        <label>City :</label>\
        <input type="text"  id="cityLat" class="form-control" value="'+lat+'"  disabled>\
    </div>\
    <div class="col-sm-2">\
        <label>City :</label>\
        <input type="text"  id="cityLng" class="form-control" value="'+lng+'"  disabled>\
    </div>\
    <div class="col-sm-2">\
    <label>Travael Mode:</label>\
    <select name="" id="travelmode" class="form-control" >\
        <option value="">Select Travel Mode</option>\
        <option value="1">Bike</option>\
        <option value="2">Auto</option>\
        <option value="3">4 Seat Mini</option>\
        <option value="4">6 Seat Cab</option>\
    </select>\
</div>\
    <div class="col-sm-3">\
        <label>General km Price :</label>\
        <input type="text"  id="kmprice" class="form-control" value="" placeholder="Per KM General Price" >\
    </div>\
    <div class="col-sm-3">\
        <label>Pre-Ride km Price :</label>\
        <input type="text"  id="preRidekmprice" class="form-control" value="" placeholder="Pre-Ride Price" >\
    </div>\
    <div class="col-sm-3">\
        <label>General Minimum Price :</label>\
        <input type="text"  id="minimumprice" class="form-control" value="" placeholder="General Minimum Price" >\
    </div>\
    <div class="col-sm-3">\
        <label>General Minimum km :</label>\
        <input type="text"  id="minimumkm" class="form-control" value="" placeholder="General Minimum km" >\
    </div>\
    <div class="col-sm-3">\
        <label>Ride Incentive :</label>\
        <input type="text"  id="incentive" class="form-control" value="" placeholder="Ride Incentive General" >\
    </div>\
    <div class="col-sm-3">\
    <label>Driverpayout :</label>\
    <input type="text"  id="driverpayout" class="form-control" value="" placeholder="Driverpayout General" >\
    </div>\
    <div class="col-sm-3">\
    <label>General Base Price :</label>\
    <input type="text"  id="basePrice" class="form-control" value="" placeholder="General Base Price" >\
    </div>\
    <div class="col-sm-3">\
    <label>Pre Ride Munite Charge :</label>\
    <input type="text"  id="preRidePerminuteCharge" class="form-control" value="" placeholder="Pre Ride Per Munite Charge" >\
    </div>\
    <div class="col-sm-3">\
    <label>General Munite Charge :</label>\
    <input type="text"  id="gneralPreMuniteCharge" class="form-control" value="" placeholder="General Per Munite Charge" >\
    </div>\
    <div class="col-sm-3">\
    <label>Share Ride :</label>\
    <select id="shareride" class="form-control">\
        <option value="0">NO</option>\
            <option value="1">YES</option>\
    </select>\
    </div>\
    <div class="col-sm-3">\
    <label>Passenger Capacity :</label>\
    <input type="text"  id="passengerCapacity" class="form-control" value="" placeholder="Passenger Capacity" >\
    </div>\
    <div class="col-sm-3">\
        <label>*** All Field Requred **</label>\
        <button type="button" class="btn btn-success" onclick="submitCityPrice()">Submit</button>\
        <button type="button" class="btn btn-success" onclick="cloceCity()">Close</button>\
    </div>\
</div>')
}

function submitCityPrice(){
    $.post('/india/admin/addnewPrice',{
        city:$("#city").val(),
        branch:$("#branchName").val(),
        cityLat:$("#cityLat").val(),
        cityLng:$("#cityLng").val(),
        preRidekmprice:$("#preRidekmprice").val(),
        kmprice:$("#kmprice").val(),
        basePrice:$("#basePrice").val(),
        minimumprice:$("#minimumprice").val(),
        minimumkm:$("#minimumkm").val(),
        travelmode:$("#travelmode").val(),
        incentive:$("#incentive").val(),
        driverpayout:$("#driverpayout").val(),
        shareride:$("#shareride").val(),
        passengerCapacity:$("#passengerCapacity").val(),
        preRidePerminuteCharge:$("#preRidePerminuteCharge").val(),
        gneralPreMuniteCharge:$("#gneralPreMuniteCharge").val()
    },function(data){
        //console.log(data)
        getCityPriceList();
    });
}

function deleteCityPrice(id){
    
    $.post('/india/admin/deleteCityPrice',{id:id},function(data){
        getCityPriceList();
    })
}

function cloceCity(){
    $("#cityPriceModule").html(''); 
}

function driverWithdral(){
    $.post('/india/admin/driverWithdral',{},function(data){
        var out='<ul class="list-group">\
        <li class="list-group-item active ">\
          <span style="font-size: medium; " class="badge">'+data.length+'</span>\
          TOtal Number of Withdral\
        </li>';
        if(data.length >0){
            data.forEach(function(val,key,ary){
                out+='<ul class="list-group">\
                <li class="list-group-item active ">\
                  <span style="font-size: medium; " class="badge">&#8377; '+val.Withdrawal+' </span>\
                  Withdrawl Request\
                </li>\
                <li class=" list-group-item list-group-item-info ">\
                    <span class="badge text-success ">Initiate</span>\
                    <span class="badge">txnID:'+val.TransactionID+'</span>\
                    Status <br>\
                    Date:'+val.date+'<br>\
                    Name: '+val.name+'<br>\
                    A/c : '+val.accountno+' IFSC: '+val.ifsc+'\
                    <button onclick="completeWithdral('+val.TransactionID+')" type="button" class="btn btn-success">Complete</button>\
                </li>\
                </ul>'
              if(key===ary.length-1){
                  $("#withdral").html(out);
              }  
            })
        }else{
            $("#withdral").html(out);
        }
        

    })
}

function completeWithdral(txnid){
    
    $.post('/india/admin/driverWithdralcomplete',{txnid:txnid},function(data){
        if(data){
            driverWithdral();  
        }
    })

}



function driverIncentiveModule(){
    cityListdistinc(function(city){
        var out='<option value="">Select Incetive City</option>';
        city.forEach(function(val,key,ary){
            out+='<option value="'+val+'">'+val+'</option>'
            if(key===ary.length -1){
                $("#incentivModule").html('<div class="row">\
                <div class=" col-md-4 col-lg-4 col-md-offset-4 col-lg-offset-4">\
                    <div class="form-group" style="width: 75%;">\
                        <select name="" id="incetiveCity" class="form-control" onchange="incentiveCategory()" >\
                        '+out+'\
                        </select>\
                    </div>\
                </div>\
            </div>')
            }
        })
    });
    
}

function incentiveCategory(){
    var incetiveCity=$("#incetiveCity").val();
   // alert(incetiveCity);
    $.post('/india/admin/incentiveModuleAdmin',{incetiveCity:incetiveCity},function(data){
        if(data.length >0){
            var out="";
            data.forEach(function(val,key,ary){
                out+='<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">\
                <ul class="list-group">\
                    <li class="list-group-item active ">\
                      <span style="font-size: medium;" class="badge">Category: '+val.incetiveCategry+'</span>\
                      <span style="font-size: medium;" class="badge">Travel Mode: '+val.travelmod+'</span>\
                      <span style="font-size: medium;" class="badge">Incetive Slot: '+val.incetiveSlot+'</span>\
                      <span style="font-size: medium;" class="badge">City: '+val.city+'</span>\
                      Incentive Module  <span>\
                         <button type="button" class="btn btn-info btn-xs" onclick="editIncentive('+val.enrtyID+')">Edit</button>\
                         <button type="button" class="btn btn-info btn-xs" onclick="deleteIncentiveModule('+val.enrtyID+')">Delete</button>\
                         </span>\
                    </li>\
                    <li class=" list-group-item list-group-item-info ">\
                        <span class="badge">Incentive &#8377; '+val.incetiveAmount+'</span>\
                        Order Count: '+val.numberOfBooking+', Travel Km : '+val.inctravelKM+'\
                      </li>\
                 </ul>\
             </div>'
                if(key===ary.length -1){
                    $("#incentivModule").html('<input type="hidden"  id="incetiveCity"  value="'+incetiveCity+'"/><div class="col-md-4 col-lg-4 col-md-offset-4 col-lg-offset-4">\
                    <button type="button" class="btn btn-primary" onclick="addIncentive()">Add Incetive</button>\
                    <button type="button" class="btn btn-danger" onclick="closeIncentiveModule()">Close</button>\
                    </div>'+out+'')
                } 
            })
        }else{
            $("#incentivModule").html('<input type="hidden"  id="incetiveCity"  value="'+incetiveCity+'"/><div class="col-md-4 col-lg-4 col-md-offset-4 col-lg-offset-4">\
            <button type="button" class="btn btn-primary" onclick="addIncentive()">Add Incetive</button>\
            <button type="button" class="btn btn-danger" onclick="closeIncentiveModule()">Close</button>\
            </div>\
            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">\
                <ul class="list-group">\
            <li class=" list-group-item list-group-item-info ">\
            No Incetive Module Found\
          </li>\
          </ul>\
             </div>') 
        }
        
    })
}

function deleteIncentiveModule(enrtyID){
    $.post('/india/admin/deleteIncentiveModule',{enrtyID:enrtyID},function(data){
        incentiveCategory();
    })
    
}

///////Init Add Incentive////////
function addIncentive(){
    var incetiveCity=$("#incetiveCity").val();
    //alert(incetiveCity);
    $("#incentivModule").html(' <div class="row">\
    <div class="col-md-10  col-md-offset-1 ">\
        <div class="panel panel-danger">\
              <div class="panel-heading">\
                    <h3 class="panel-title">Add Incentive Module</h3>\
              </div>\
              <div class="panel-body">\
                    <div class="form-group">\
                        <div class="col-sm-3">\
                            <label>City :</label>\
                            <input type="text"  id="incentiveCity" class="form-control" value="'+incetiveCity+'" placeholder="Travel KM" disabled>\
                        </div>\
                        <div class="col-sm-3">\
                            <label>Incentive Slot :</label>\
                            <input type="number"  id="incentiveSlot" class="form-control" value="" placeholder="Incetive Slot eg: 1,2,3">\
                        </div>\
                        <div class="col-sm-3">\
                            <label>Incentive Category :</label>\
                            <select name="" id="incentiveCategory" class="form-control" >\
                                <option value="1">1</option>\
                                <option value="1">2</option>\
                                <option value="1">3</option>\
                                <option value="1">4</option>\
                             </select>\
                        </div>\
                        <div class="col-sm-3">\
                            <label>Travel KM :</label>\
                            <input type="number"  id="incentiveKM" class="form-control" value=""  placeholder="Incetive KM">\
                        </div>\
                        <div class="col-sm-3">\
                            <label>Number of Rides :</label>\
                            <input type="number"  id="incentiveRides" class="form-control" value="" placeholder="Number of Rides">\
                        </div>\
                        <div class="col-sm-3">\
                            <label>Incentive Amount :</label>\
                            <input type="number"  id="incentiveAmount" class="form-control" value="" placeholder="Incentive Amount">\
                        </div>\
                        <div class="col-sm-3">\
                            <label>Travel Mode :</label>\
                            <select name="" id="incentiveTravelmod" class="form-control" >\
                               <option value="1">1</option>\
                               <option value="2">2</option>\
                               <option value="3">3</option>\
                               <option value="4">4</option>\
                            </select>\
                        </div>\
                        <div class="col-sm-3">\
                            <label>*** All Field Requred **</label>\
                            <button type="button" class="btn btn-success" onclick="addIncentiveModule()">Submit</button>\
                            <button type="button" class="btn btn-success" onclick="closeIncentiveModule()">Close</button>\
                        </div>\
                    </div>\
              </div>\
        </div>\
    </div>\
</div>')
}

function addIncentiveModule(){
    var incentiveCity=$("#incentiveCity").val().trim();
    var incentiveSlot=$("#incentiveSlot").val().trim();
    var incenCategory=$("#incentiveCategory").val().trim();
    var incentiveKM=$("#incentiveKM").val().trim();
    var incentiveRides=$("#incentiveRides").val().trim();
    var incentiveAmount=$("#incentiveAmount").val().trim();
    var incentiveTravelmod=$("#incentiveTravelmod").val().trim();

 // alert(incentiveTravelmod);
    $.post('/india/admin/addIncentiveModule',{
        incentiveCity:incentiveCity,
        incentiveSlot:incentiveSlot,
        incenCategory:incenCategory,
        incentiveKM:incentiveKM,
        incentiveRides:incentiveRides,
        incentiveAmount:incentiveAmount,
        incentiveTravelmod:incentiveTravelmod
    },function(data){
        alert(data);
        cityListdistinc(function(city){
            var out='<option value="">Select Incetive City</option>';
            city.forEach(function(val,key,ary){
                out+='<option value="'+val+'">'+val+'</option>'
                if(key===ary.length -1){
                    $("#incentivModule").html('<div class="row">\
                    <div class=" col-md-4 col-lg-4 col-md-offset-4 col-lg-offset-4">\
                        <div class="form-group" style="width: 75%;">\
                            <select name="" id="incetiveCity" class="form-control" onchange="incentiveCategory()" >\
                            '+out+'\
                            </select>\
                        </div>\
                    </div>\
                </div>')
                }
            })
        });
    })
}


function closeIncentiveModule(){
    $("#incentivModule").html('') 
}

function cityListdistinc(cb){
    $.post('/india/admin/cityListDistinc',{},function(data){
        cb(data);
    })
}

function cityList(cb){
    $.post('/india/admin/cityList',{},function(data){
        cb(data);
    })
}

