var express = require('express');
var router = express.Router();
var googleApi=require('../module/googleMap');
var database=require('../module/indatabase');



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/driver', function(req, res, next) {
  res.render('indexDriver', { title: 'Express' });
});

router.get('/rider', function(req, res, next) {
  res.render('indexRider', { title: 'Express' });
});

router.get('/cust', function(req, res, next) {
  if(req.cookies.CustID){
    res.redirect('../india/servecemode')
  }else{
    res.render('appCust', { title: 'Paacab',YOUR_API_KEY:process.env.API_KEY });
  }
  
});



router.get('/privacy', function(req, res, next) {

  res.render('privacy', { title: 'Paacab' });
});

router.get('/drive', function(req, res, next) {
res.redirect('/updatedrive')
  //res.render('appDriver', { title: 'Paacab',YOUR_API_KEY:process.env.API_KEY });
});

///////// General Driver Update Setting///////
router.get('/updatedrive', function(req, res, next) {
  res.clearCookie("countryCode");
  res.render('india/inDriverUpdate', { title: 'Paacab' });
});





router.get('/tdrive', function(req, res, next) {  
    res.render('appTdriverUpdate', { title: 'Paacab',YOUR_API_KEY:process.env.API_KEY });
});

router.get('/timedrive', function(req, res, next) {
  
  res.render('appTdriver', { title: 'Paacab',YOUR_API_KEY:process.env.API_KEY });

});


router.get('/preDrive', function(req, res, next) {
  if(req.cookies.pilotID){
    res.redirect('../india/preDrv')
  }else{
    res.render('appPreDriver', { title: 'Paacab',YOUR_API_KEY:process.env.API_KEY });
  }


});

router.post('/geoplace', function(req, res, next) { 
  googleApi.SearchGeoCodePlaceByLatLng({
    lat:Number(req.body.lat),
    lng:Number(req.body.lng),

    apik:process.env.API_KEY,
 },function(data){
//console.log(data.results[0].address_components);
data.results[0].address_components.forEach(function(val){
  //console.log(val.types[0]); 
  if(val.types[0]=='country'){
    console.log(val.long_name);
   
    res.send(val.long_name); 

  }
    })
 });
});

router.post('/countrycode', function(req, res, next) {
  res.cookie("countryCode",req.body.countryCode,{maxAge:1000*60*60*24*30});
  res.cookie("reglatlng",JSON.stringify({lat:req.body.lat, lng:req.body.lng}),{maxAge:1000*60*60*24*30});
  res.send("ok");
})



router.post('/checkcountryexist', function(req, res, next) {
  database.customer.findOne({},function(err, cust){
    if(cust){
      res.send({country:cust.loginCountry, lat:cust.loginLatLng[0], lng:cust.loginLatLng[1]});
    }else{
      res.send("error");
    }
   
    
  })
})




// googleApi.SearchGeoCodePlaceByLatLng({
//   lat:Number(23.8103),
//   lng:Number(90.4125),  
//   apik:process.env.API_KEY,
// },function(data){
// console.log(data.results[0].address_components);
// })

module.exports = router;
