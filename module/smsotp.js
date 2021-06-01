var https = require('https');
var request = require('request');

///////Api for send otp text local////////
function sendotp(int,cb){
  var qs = require("querystring");
var http = require("http");

var options = {
  "method": "GET",
  "hostname": "2factor.in",
  "port": null,
  "path": "/API/V1/"+int.apikey+"/SMS/"+int.mobileno+"/"+int.otp+"/paacab",
  "headers": {
    "content-type": "application/x-www-form-urlencoded"
  }
};

var req = http.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    var body = Buffer.concat(chunks);
   // console.log(body.toString());
    cb(JSON.parse(body));
  });
});

req.write(qs.stringify({}));
req.end();
  }

//+44 7454343910
  // sendotp({
  //   apikey:process.env.OTP2KEY,
  //   mobileno:"+447454343910",
  //   otp:"4499"  
  // },function(data){
  //     console.log(data);
  // })

  // sendotp({
  //   apikey:process.env.OTP2KEY,
  //   mobileno:"+918509239522",
  //   otp:"4499"  
  // },function(data){
  //     console.log(data);
  // })



///////Api for send otp text local////////
// function sendotp1(int,cb){
//     var url = 'https://api.textlocal.in/send/?apikey='+int.apikey+'&numbers='+int.mobileno+'&message='+int.message+'&sender='+int.sender+'';
//     var req = https.request(url, function (res) {
//     var str = "";  
//       res.on('data', function (chunk) {
//         str += chunk;      
//       });  
//       res.on('end', function () {
//         var aa=JSON.parse(str);
//         cb(aa);
//       });
//     });
//     req.on('error', function (err) {
//          console.log('Error message: ' + err);
//     });
//     req.end();
//   }

//////Snd OTP for Bangladesh//////
  function sendotpBD(int,cb){    
    var options = {
      'method': 'POST',
      'url': 'http://alphasms.biz/index.php?app=ws&u=paacabsgmail.com&h='+int.apikey+'&op=pv&to='+int.mobileno+'&msg='+int.otp+' is your one time password(OTP) for phone verification',
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    request(options, function (error, response) { 
      if (error){console.log(error)}
     // console.log(response.body);
      //console.log("output",JSON.parse(response.body))
      var dd=JSON.parse(response.body).data;      
      if(dd){
        if(dd[0].status=="OK"){
        cb({Status:"Success"});
        }

      }else{
        console.log("Error",JSON.parse(response.body))
      }
      
    });    
  }

  // sendotpBD({
  //   apikey:process.env.ALFA_HASH,
  //   mobileno:"+8801701045141",
  //   otp:"1234"  
  // },function(data){
  //     console.log(data);
  //     res.send(data); 
  // })

  module.exports.otpsend=sendotp;
  module.exports.otpsendBD=sendotpBD;