var https = require('https');
///Google Place Search API
function searchPlace(inp,cb){
  var url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query='+inp.quary+'&location='+inp.location+'&radius='+inp.radius+'&key='+inp.apik+'';
  var req = https.request(url, function (res) {
  var str = "";  
    res.on('data', function (chunk) {
      str += chunk;      
    });  
    res.on('end', function () {
      var aa=JSON.parse(str);
      //console.log(aa);      
        cb(aa.results,aa.status);     
      
    });
  });
  req.on('error', function (err) {
       console.log('Error message: ' + err);
  });
  req.end();
}



function autocomplete(inp,cb){
  var url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input='+inp.quary+'&location='+inp.location+'&radius='+inp.radius+'&key='+inp.apik+'';
  var req = https.request(url, function (res) {
  var str = "";  
    res.on('data', function (chunk) {
      str += chunk;      
    });  
    res.on('end', function () {
      var aa=JSON.parse(str);
      cb(aa);
    });
  });
  req.on('error', function (err) {
       console.log('Error message: ' + err);
  });
  req.end();
}
// autocomplete({
//   "quary":"dhdhkjh",
//   "apik":"AIzaSyBaHL_xr6DPd0f4-ypUtPzTf5-hMQTygRo",
//   location:'22.3675294,87.186966',
//   radius:'1000',
//   },
//   function(data){
//    //console.log(data) ;
//    if(data.status=='OK'){
//     console.log('test  near',data )
//    }

   
//    //console.log('',data )
//   });

function placeByplaceID(inp,cb){
  var url = 'https://maps.googleapis.com/maps/api/geocode/json?place_id='+inp.placeid+'&key='+inp.apik+'';
  
  var req = https.request(url, function (res) {
  var str = "";  
    res.on('data', function (chunk) {
      str += chunk;      
    });  
    res.on('end', function () {
      var aa=JSON.parse(str);
      if(aa.status=='OK'){
        cb(aa);        
      }else{
        console.log(aa.status);
        cb(aa.status);      
      }
    });
  });
  req.on('error', function (err) {
       console.log('Error message: ' + err);
  });
  req.end();
}

function placeByaddress(inp,cb){
  var url = 'https://maps.googleapis.com/maps/api/geocode/json?address='+inp.address+'&key='+inp.apik+'';
 // var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=ghoshpur%20southgaria%20&key='+inp.apik+''
  var req = https.request(url, function (res) {
  var str = "";  
    res.on('data', function (chunk) {
      str += chunk;      
    });  
    res.on('end', function () {
      var aa=JSON.parse(str);
      if(aa.status=='OK'){
        cb(aa);        
      }else{
        console.log(aa.status);
        cb(aa.status);      
      }
    });
  });
  req.on('error', function (err) {
       console.log('Error message: ' + err);
  });
  req.end();
}

function DistanceCalculation(inp,cb){
 // https://maps.googleapis.com/maps/api/distancematrix/json?units=METRIC&origins=40.6655101,-73.89188969999998&destinations=40.598566%2C-73.7527626&mode=driving&departure_time=now&traffic_model=optimistic&key=AIzaSyBaHL_xr6DPd0f4-ypUtPzTf5-hMQTygRo
 
 //var url = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=METRIC&origins='+inp.origins+'&destinations='+inp.destinations+'&mode=driving&departure_time=now&traffic_model=optimistic&key='+inp.apik+'';
 if(inp.travelmod=='1'){
  var url = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=METRIC&origins='+inp.origins+'&destinations='+inp.destinations+'&mode=walking&departure_time=now&key='+inp.apik+'';
 }else{
  var url = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=METRIC&origins='+inp.origins+'&destinations='+inp.destinations+'&mode=driving&departure_time=now&traffic_model=optimistic&key='+inp.apik+''; 
 }
 
 var req = https.request(url, function (res) {
 var str = "";  
   res.on('data', function (chunk) {
     str += chunk;      
   });  
   res.on('end', function () {
     var aa=JSON.parse(str);
     cb(aa);
   });
 });
 req.on('error', function (err) {
      console.log('Error message: ' + err);
 });
 req.end();

}

// placeByplaceID({
//   placeid:'ChIJxZC_zEZbHToRNMvqkMp88mc',
//   "apik":"AIzaSyBaHL_xr6DPd0f4-ypUtPzTf5-hMQTygRo",
// },function(data){
// console.log('Place id',data.results[0])
// })
// DistanceCalculation({
//   origins:'22.987072960889165,87.85789374340823',
//   destinations:'23.987072960889165,87.85789374340823',
//   apik:"AIzaSyBaHL_xr6DPd0f4-ypUtPzTf5-hMQTygRo",
//   },function(data){
//   console.log('Distance',data.rows[0].elements[0].distance)
//   console.log('time',data.rows[0].elements[0].duration)
//   console.log('duration_in_traffic:',data.rows[0].elements[0].duration_in_traffic)
//   })

//////SearchPlace GeoCode By Lat Lng///////

function SearchPlaceGeoCodeByLatLng(inp,cb){
  var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+inp.lat+','+inp.lng+'&key='+inp.apik+'';
  var req = https.request(url, function (res) {
  var str = "";  
    res.on('data', function (chunk) {
      str += chunk;      
    });  
    res.on('end', function () {
      var aa=JSON.parse(str);
      cb(aa);
    });
  });
  req.on('error', function (err) {
       console.log('Error message: ' + err);
  });
  req.end();
 
 }
//  SearchPlaceGeoCodeByLatLng({
//     lat:22.336,
//     lng:78.589,
//     apik:"AIzaSyBaHL_xr6DPd0f4-ypUtPzTf5-hMQTygRo",
//  },function(data){
// //console.log(data.results[0].address_components);
// data.results[0].address_components.forEach(function(val){
//   //console.log(val.types[0]); 
//   if(val.types[0]=='country'){
//     console.log(val.long_name); 
//   }
//     })
//  })


///////Api for send otp text local////////
function sendotp(int,cb){
  var url = 'https://api.textlocal.in/send/?apikey='+int.apikey+'&numbers='+int.numbers+'&message='+int.message+'&sender='+int.sender+'';
  var req = https.request(url, function (res) {
  var str = "";  
    res.on('data', function (chunk) {
      str += chunk;      
    });  
    res.on('end', function () {
      var aa=JSON.parse(str);
      cb(aa);
    });
  });
  req.on('error', function (err) {
       console.log('Error message: ' + err);
  });
  req.end();
}

// sendotp({
//   apikey : 'mWdlAOiE5nY-dlNUZ6linXXcgKhTCMq1MzoQJPAerf',
//   message : 'Confram your OTP is 6359',
//   numbers : '8509239522',
//   sender : 'TXTLCL'
// },function(data){
// console.log(data);
// })

/////text local////
// apikey = "yourapikey"
// 		address = "https://api.textlocal.in/send/?"
// 		message = "This is your message"
// 		message = Server.urlencode(message)
// 		numbers = "918123456789"
// 		sender = "TXTLCL"
// 		url = address & "apikey=" & apikey & "&numbers=" & numbers & "&message=" & message & "&sender=" & sender 



//////Normal Distance And Time Calculation using Lat Lng /////

function nearestDriverTime(inp,cb){
  console.log("custome time call")
var lat1=Number(inp.origin[0]);
var lat2=Number(inp.dist[0]);
var lon1=Number(inp.origin[1]) ;
var lon2=Number(inp.dist[1]) ;
if ((lat1 == lat2) && (lon1 == lon2)) {  
  cb("1mins");
}else{
  var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		// if (unit=="K") { dist = dist * 1.609344 }
    // if (unit=="N") { dist = dist * 0.8684 }
    distance=dist * 1.609344
    var time=distance * 60/20;
    time=parseInt(time) + 1;

    cb(""+time+"mins");
}


}



///////Distance Manual Calculation//////////
function manualDistance(inp,cb){
  console.log("Manual Distance Calculation")
var lat1=Number(inp.origin[0]);
var lat2=Number(inp.dist[0]);
var lon1=Number(inp.origin[1]) ;
var lon2=Number(inp.dist[1]) ;
if ((lat1 == lat2) && (lon1 == lon2)) {  
  cb(0);
}else{
  var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		// if (unit=="K") { dist = dist * 1.609344 }
    // if (unit=="N") { dist = dist * 0.8684 }
    distance=dist * 1.609344 *1000
    // var time=distance * 60/20;
    // time=parseInt(time) + 1;

    cb(distance);
}


}



module.exports.customeNerestTime=nearestDriverTime;
module.exports.manualDistance=manualDistance;

module.exports.searchPlace=searchPlace;
module.exports.placeByplaceID=placeByplaceID;
module.exports.placeByadds=placeByaddress;
module.exports.autocomplete=autocomplete;
module.exports.distance=DistanceCalculation;
module.exports.SearchGeoCodePlaceByLatLng=SearchPlaceGeoCodeByLatLng;
module.exports.otpsend=sendotp;


// searchPlace({
//   quary:'durgapur barage',
//   location:'42.3675294,-71.186966',
//   radius:'1000',
//   apik:'AIzaSyBaHL_xr6DPd0f4-ypUtPzTf5-hMQTygRo'
// },function(res){
//   console.log(res); 
// })