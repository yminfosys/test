function cityandpriceUpdate(){  

    var out='<tr class="active">\
    <th class="success">City / Distric</th>\
    <th class="success">Per KM Price Commision Base</th>\
    <th class="success">Per KM Price Pre Ride</th>\
    <th class="success">Minimum Price</th>\
    <th class="success">Minimum KM</th>\
    <th class="success">Travel Mode</th>\
    <th class="success">Incentive</th>\
    <th class="success">Driver Pay Out</th>\
    </tr>';
   $.post('/bd/admin/getCityprice',{},function(data){
       if(data){
        
        data.forEach(function(val, key , arr){
            
        out+='<tr class="success">\
        <td class="success">'+val.CityName+'</td>\
        <td class="success">'+val.PerKMPrice+'</td>\
        <td class="success">'+val.preRidekmprice+'</td>\
        <td class="success">'+val.minimumPricePer+'</td>\
        <td class="success">'+val.minimumKM+'</td>\
        <th class="success">'+val.travelMode+'</th>\
        <th class="success">'+val.rideIncetiv+'</th>\
        <th class="success">'+val.driverpayout+'</th>\
        </tr>';  
           if(key===arr.length-1){
            
            $("#tablecontent").html(out)
            
           } 
        });
        
       }
   })
}


function driverWithdral(){
    $.post('/bd/admin/driverWithdral',{},function(data){
        var out='<ul class="list-group">\
        <li class="list-group-item active ">\
          <span style="font-size: medium; " class="badge">'+data.length+'</span>\
          TOtal Number of Withdral\
        </li>';
        if(data.length >0){
            data.forEach(function(val,key,ary){
                out+='<ul class="list-group">\
                <li class="list-group-item active ">\
                  <span style="font-size: medium; " class="badge">&#2547; 100 </span>\
                  Withdrawl Request\
                </li>\
                <li class=" list-group-item list-group-item-info ">\
                    <span class="badge text-success ">Initiate</span>\
                    <span class="badge">txnID:'+val.TransactionID+'</span>\
                    Status <br>\
                    Date:12-12-12<br>\
                    Name: Sukanta Sardar<br>\
                    A/c : 1232455 IFSC: 4525lkj\
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
    
    $.post('/bd/admin/driverWithdralcomplete',{txnid:txnid},function(data){
        if(data){
            driverWithdral();  
        }
    })

}