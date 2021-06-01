var express = require('express');
var request = require('request');
var router = express.Router();
var googleApi = require('../module/googleMap');
var citylist = require('../module/citylistofIndia');
var smsotp = require('../module/smsotp');
//var fuleapi = require('../module/fuleapi');
var database = require('../module/indatabase');
//const fileUpload = require('express-fileupload');
var aws = require('aws-sdk')
var multer = require('multer')
var multerS3 = require('multer-s3-transform')
const sharp = require('sharp');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const moment = require('moment');

const paytm = require('paytm-nodejs')
    /////Testing OTP credentials are as follows: 
    //Mobile Number: 7777777777. 
    //Password: Paytm12345. 
    ///OTP: 489871.///

const {S3_ENDPOINT, BUCKET_NAME}=process.env;

//console.log(S3_ENDPOINT, BUCKET_NAME);
var spaceEndpoint= new aws.Endpoint(S3_ENDPOINT)

var s3 = new aws.S3({ 
    endpoint:spaceEndpoint
})
//var storage = multer.memoryStorage()
var upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: BUCKET_NAME,
      acl: 'public-read',
      metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      shouldTransform: function (req, file, cb) {
        cb(null, /^image/i.test(file.mimetype))
      },
      transforms: [ {
        id: 'image',
        key: function (req, file, cb) {
          cb(null, Date.now().toString() + "-" + file.originalname)
        },
        transform: function (req, file, cb) {
          cb(null, sharp().resize(1200, 800,{ fit: sharp.fit.inside }))
        }
      }]
    })
  })


// router.use(fileUpload({

//   useTempFiles : true,
//     tempFileDir : '/tmp/'
// }));

///////////////SET COOKIES For javascript//////
router.post('/setCookies', function(req, res, next) {
    res.cookie(req.body.cname, req.body.cvalue, { maxAge: Number(req.body.expires) });

    res.send(req.body);
})

///////////////GET COOKIES For javascript//////
// router.post('/getCookies', function(req, res, next) {
// res.send(req.cookies.req.body.cName)  
// })
///////////////CLEAR COOKIES//////
router.post('/clerCookies', function(req, res, next) {
    res.clearCookie(req.body.cname);

    res.send(req.body);
})



///////////////////////////////////////
///* CUSTOMER LISTING. *///////////////
///////////////////////////////////////

router.get('/', function(req, res, next) {
    //res.clearCookie("CustID");
    var wallet = "";
    if (req.query.wallet) {
        wallet = req.query.wallet
    }
    if (req.cookies.CustID) {
        database.customer.findOne({ CustID: req.cookies.CustID }, function(err, data) {
            if (data) {
                if (data.status == "Active") {
                    //////Check Any Incomplete Order//////
                    if (data.orderStage == 'accept' || data.orderStage == 'startRide' || data.orderStage == 'finishRide') {
                        res.redirect('/india/ride')
                    } else {
                        var geocode = "";
                        if (req.query.geocode) {
                            geocode = req.query.geocode;
                        }
                        res.render('india/inCust', { YOUR_API_KEY: process.env.API_KEY, error: '', cust: data, geocode: geocode, wallet: wallet })


                    }

                } else {
                    res.render('india/inCust', { YOUR_API_KEY: process.env.API_KEY, error: 'Your Account is De-Active Contact Customer Care to Active your Account' })
                }

            } else {
                res.render('india/inCust', { YOUR_API_KEY: process.env.API_KEY, error: 'cookes' })
            }
        });

    } else {
        res.redirect('/india/login')
    }

});

////////// SELECT SERVICE MODE////////
router.get('/servecemode', function(req, res, next) {
    if (req.cookies.CustID) {
        res.render('india/servecemode')
    } else {
        res.redirect('/india/login')
    }
})

///////Login Customer listing////////
router.get('/login', function(req, res, next) {
    if (req.cookies.CustID) {

        res.redirect('/india')
    } else {
        res.render('india/inCustLogin', { msg: req.query.msg, lat: req.query.lat, lng: req.query.lng })
    }

});

///////Login Customer////////
router.post('/login', function(req, res, next) {
    database.customer.findOne({ mobileNumber: req.body.mobile, isdCode: '+91' }, function(err, user) {
        if (user) {
            bcrypt.compare(req.body.password, user.password, function(err, pass) {
                console.log(pass)
                if (pass) {
                    res.cookie("CustID", user.CustID, { maxAge: 30 * 24 * 60 * 60 * 1000 });
                    res.send('success');
                } else {
                    //////Worng Password//////
                    res.send('worngpassword')
                }
            });
        }
    });
});

///////Forget Customer password////////
router.get('/custforgetpsw', function(req, res, next) {
    if (!req.cookies.CustID) {
        res.render('india/inCustforgetpsw')
    } else {
        res.render('india/inCustLogin', { msg: req.query.msg, lat: req.query.lat, lng: req.query.lng })
    }
});

/////// Reset Password Customer////////
router.post('/setnewpassword', function(req, res, next) {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        database.customer.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: '+91' }, { $set: { password: hash } }, function(err, user) {
            if (user) {
                res.send("Success");
            }
        });
    })

});

///////////Check Mobile in our system////////////
router.post('/checkMobileExist', function(req, res, next) {
    console.log(req.body)
    database.customer.findOne({ mobileNumber: req.body.mobile, isdCode: '+91' }, function(err, data) {
        console.log("Test CUST Mobile", data)
        if (data) {
            res.send('exist');
        } else {
            res.send('notexist');
        }
    });

});



///////////OTP////////////
router.post('/otpSend', function(req, res, next) {
    smsotp.otpsend({
            apikey: process.env.OTP2KEY,
            mobileno: "+91" + req.body.mobile + "",
            otp: "" + req.body.otp + ""
        }, function(data) {
            console.log(data);
            res.send(data);
        })
        //res.send({Status:'Success'});
});

///////Register New Customer////////
router.post('/newcustreg', function(req, res, next) {
    console.log(req.body);
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        database.customer({
            name: req.body.name,
            email: req.body.email,
            password: hash,
            mobileNumber: req.body.mobile,
            custRating: '0',
            isdCode: '+91',
            status: "Active",
            generalMinimumKm: [2, 2, 2, 2],
            preRidePriceperKm: [4, 8, 10, 12],
            preRideperMinutCharge: [0.5, 0.75, 1, 1.25],
            GenarelPerMinutCharge: [0.5, 0.75, 1, 1.25],
            generalPriceperKm: [5, 10, 7, 10],
            generalMinimumprice: [8, 10, 15, 20],
            generalBasePrice: [0, 30, 90, 90],
            driverPayout: [6, 8, 9, 10],
            shareRide: [0, 0, 0, 0],
            shereRideCapacity: [0, 0, 0, 0],
            walletBalance: '0',
            BuyKM: '0',
            refType: req.body.reffrom,
            refBy: req.body.refBy
        }).save(function(err) {
            if (err) { console.log(err) }
            res.send({ status: "success" })
        })
    });

})

// router.post('/custReg', function(req, res, next) {
//   console.log(req.body); 
//   bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
//     database.customer({
//       name: req.body.name,
//       email :req.body.email,    
//       password: hash,    
//       mobileNumber:req.body.mobile,
//       custRating:'0',
//       isdCode:'+91',
//       generalMinimumKm:[2, 2, 2, 2],
//       preRidePriceperKm:[3, null, null, null],
//       preRideperMinutCharge:[0.5, 0.75, 1, 1.25 ],
//       GenarelPerMinutCharge:[0.5, 0.75, 1, 1.25],
//       generalPriceperKm:[8, 10, 15, 20],
//       generalMinimumprice:[13, 40, 90, 90],
//       generalBasePrice:[0, 30, 90, 90],
//       driverPayout:[6, 8, 9, 10],
//       shareRide:[0, 0, 0, 0],
//       shereRideCapacity:[0, 0, 0, 0],
//       walletBalance:'0',
//       BuyKM:'5',
//       location:{type:'Point',coordinates:[req.body.lng, req.body.lat]}
//       //location:{type:'Point',coordinates:[1.00001, 1.0001]}
//     }).save(function(err){

//       //res.redirect('/india/login?msg=Registration Success');
//       res.send("Registration Success");
//         }); 
//     }); 

//   });

////////Logout /////////////
router.get('/logout/cust', function(req, res, next) {
    res.clearCookie("CustID");
    res.redirect('../../cust')

});
///////Map Api Call//////////////

/////find Place By Lat Lng////////
router.post('/geoplace', function(req, res, next) { //
    googleApi.SearchGeoCodePlaceByLatLng({
        lat: Number(req.body.lat),
        lng: Number(req.body.lng),
        apik: process.env.API_KEY,
    }, function(data) {
        res.send(data)
            //console.log(data.results[0]);
            // data.results[0].address_components.forEach(function(val){
            //   //console.log(val.types[0]); 
            //   if(val.types[0]=='country'){
            //     console.log(val.long_name);
            //     res.send(val.long_name); 
            //   }
            //     })
    });
});

/////For Neareast One Calculation //////
router.post('/nearby', function(req, res, next) {
    console.log('myposition', req.body)
    database.index2Ddriver({}, function(ss) {
        database.driverlocation.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [Number(req.body.lng), Number(req.body.lat)]
                    },
                    $maxDistance: 5000
                }
            },
            accountStatus: 'Active',
            travelmod: req.body.travelmod
        }, function(e, data) {
            console.log('test nearby', JSON.stringify(data));
            res.send(data);
        })
    });

});

/////For Neareast One Calculation for All Driver //////
router.post('/nearbyalldriver', function(req, res, next) {
    console.log('myposition', req.body)
    database.index2Ddriver({}, function(ss) {
        database.driverlocation.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [Number(req.body.lng), Number(req.body.lat)]
                    },
                    $maxDistance: 5000
                }
            },
            accountStatus: 'Active',
            travelmod: req.body.travelmod
        }, function(e, data) {

            res.send({ driver: data, tm: req.body.travelmod });
        })
    });

});





////Save GeoCode Data for Future Use and cust data base////
router.post('/localstorageandgeocode', function(req, res, next) {
    console.log(req.body)
    if (req.body.type == "pickup") {
        database.customer.findOneAndUpdate({ CustID: req.cookies.CustID }, {
            $set: {
                pickuplatlong: [Number(req.body.lat), Number(req.body.lng)],
                picuplocation: req.body.pickupads
            }
        }, function(err, cust) {
            saveGeocode({ ads: req.body.pickupads, lat: Number(req.body.lat), lng: Number(req.body.lng), type: req.body.type });
        });
    } else {
        database.customer.findOneAndUpdate({ CustID: req.cookies.CustID }, {
            $set: {
                droplatlong: [Number(req.body.lat), Number(req.body.lng)],
                droplocation: req.body.dropads
            }
        }, function(err, cust) {
            saveGeocode({ ads: req.body.dropads, lat: Number(req.body.lat), lng: Number(req.body.lng), type: req.body.type });
        });
    }

    ///////Save Geocode data///////////////
    function saveGeocode(inp) {
        database.geocode.findOne({ formated_address: inp.ads }, function(err, data) {
            if (!data) {
                database.geocode({
                    formated_address: inp.ads,
                    type: inp.type,
                    CustID: req.cookies.CustID,
                    location: { type: 'Point', coordinates: [Number(inp.lng), Number(inp.lat)] }
                }).save(function(err) {
                    res.send("ok");
                })
            } else {
                res.send("ok");
            }
        })

    }


});


// /////GET TIME CHARGES //////
// router.post('/gettimecharges', function(req, res, next) {
//     console.log("aa bba cc", req.body)
//     database.customer.findOne({ CustID: req.body.CustID }, function(err, cust) {
//         var travelmod = Number(req.body.travelmod) - 1;
//         var preRideperMinutCharge = cust.preRideperMinutCharge[travelmod];
//         if (preRideperMinutCharge < 1) {
//             var perminitcost = '' + preRideperMinutCharge + ' Paisa';
//         } else {
//             var perminitcost = '&#8377;' + preRideperMinutCharge + ''
//         }
//         res.send({ perminitcost: perminitcost });
//     })
// })





/////For Neareast One Calculation //////
router.post('/nearbytime', function(req, res, next) {
    console.log('myposition', req.body)
    database.index2Ddriver({}, function(ss) {
        database.driverlocation.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [Number(req.body.lng), Number(req.body.lat)]
                    },
                    $maxDistance: 4000
                }
            },
            accountStatus: 'Active',
            travelmod: req.body.travelmod
        }, function(e, data) {
            console.log('test result', JSON.stringify(data));
            res.send({ data: data, count: req.body.travelmod });
        })
    });

});

/////////Place Search using Autocomplete/////

router.post('/placesearch', function(req, res, next) {
    googleApi.autocomplete({
        quary: req.body.quary,
        location: req.body.location,
        radius: '1000',
        apik: process.env.API_KEY
    }, function(result) {

        res.send(result)

    });

});

router.post('/previousplacesearch', function(req, res, next) {

    database.geocode.find({ CustID: req.body.CustID }, function(err, data) {
        res.send(data);
    }).sort({ date: -1 }).limit(20);
});


router.post('/placeidtogeocod', function(req, res, next) {
    googleApi.placeByplaceID({
        placeid: req.body.placeid,
        apik: process.env.API_KEY
    }, function(result) {
        console.log(JSON.stringify(result))
        res.send(result)
            //console.log(result.results[0])
    });

});

/////For Distance Calculation //////
router.post('/distbtwnActive', function(req, res, next) {
    googleApi.distance({
        origins: req.body.orig,
        destinations: req.body.diste,
        apik: process.env.API_KEY,
        travelmod: req.body.travelmod
    }, function(result) {
        //console.log(JSON.stringify(result) )
        res.send(result)
            //console.log(result)
    });

});

/////For Custome Time Calculation //////  
router.post('/customertime', function(req, res, next) {
    console.log("custome time ", req.body)
    googleApi.customeNerestTime({
        origin: [Number(req.body.origlat), Number(req.body.origlng)],
        dist: [Number(req.body.distelat), Number(req.body.distelng)]
    }, function(result) {
        console.log("custome time ", result)
        res.send(result)

    });

});

/////For Custome Time Calculation //////  
router.post('/customertimeforother', function(req, res, next) {
    console.log("custome time ", req.body)
    googleApi.customeNerestTime({
        origin: [Number(req.body.origlat), Number(req.body.origlng)],
        dist: [Number(req.body.distelat), Number(req.body.distelng)]
    }, function(result) {
        console.log("custome time ", result)
        res.send({ time: result, tmode: req.body.travelmod })

    });

});


router.post('/distbtwntime', function(req, res, next) {
    googleApi.distance({
        origins: req.body.orig,
        destinations: req.body.diste,
        apik: process.env.API_KEY,
        travelmod: req.body.travelmod
    }, function(result) {
        //console.log(JSON.stringify(result) )
        res.send({ data: result, count: req.body.count })
    });

});

///// distance and Price calculation //////
router.post('/getDistance', function(req, res, next) {
    console.log(req.body)
    googleApi.distance({
        origins: req.body.orig,
        destinations: req.body.diste,
        apik: process.env.API_KEY,
        travelmod: req.body.travelmod
    }, function(result) {
        //console.log(JSON.stringify(result) )
        res.send({ result: result, travelmod: req.body.travelmod })
            //console.log('Result',result.rows[0].elements[0].distance.value);

    });

});


router.post('/subAdminGetprice', function(req, res, next) {
    var key = Number(req.body.travelmod) - 1;
    var price = 0;
    var generalPrice = 0;
    //console.log("distance:", req.body.distance)
    database.customer.findOne({ mobileNumber: req.body.custMobile }, function(er, cust) {
        if(cust){
        var travelMode=req.body.travelmod;
        var CityName=cust.CityName;
       database.cityPrice.findOne({CityName:CityName,travelMode:travelMode},function(er,cityprice){  
        if(cityprice){
            ///////////Check For redious////////
            rediouscalculation({
                cityprice:cityprice,
                distance:req.body.distance
            },function(redius){
                //console.log("test multiplyer",redius);
                /////////////Check For Price Hikere/////////
                priceHickerCalculation({
                    cityprice:cityprice,
                    distance:req.body.distance,
                    mm:req.body.mm,
                    hour:req.body.hour
                },function(priceIncrimenBy){
                    //console.log("priceIncrimenBy",priceIncrimenBy);
                    ///////Price Calculetion/////////////////
                    var priceIncrimeter=(Number(priceIncrimenBy.priceIncrimenBy)/100)+1;
                    var generalPrice=Number(req.body.distance) * Number(redius.rediusMultiplyer) * Number(cityprice.PerKMPrice) * Number(priceIncrimeter);
                    var preRidePrice=Number(req.body.distance) * Number(redius.preRideRediusMultiplyer) * Number(cityprice.preRidekmprice) * Number(priceIncrimeter);
                    var generalTimeCost=Number(req.body.time)* Number(cityprice.GenarelPerMinutCharge);
                    var preRideTimeCost=Number(req.body.time)* Number(cityprice.preRideperMinutCharge);
                    //console.log("generalPrice:",generalPrice,"preRidePrice:",preRidePrice,"generalTimeCost:", generalTimeCost,"preRideTimeCost:",preRideTimeCost);  
                    //console.log("Total General Cost",generalTimeCost+ generalPrice , "Total pre Cost",  preRideTimeCost+preRidePrice);
                    if(generalPrice < cityprice.minimumPricePer){
                        generalPrice= Number(cityprice.minimumPricePer);
                    }
                    if(preRidePrice < cityprice.minimumPricePer){
                        preRidePrice= Number(cityprice.minimumPricePer);
                    }
                    res.send({ 
                        price: generalPrice,
                        generalTimeCost:generalTimeCost,
                        GenarelPerMinutCharge:cityprice.GenarelPerMinutCharge, 
                        travelmod: req.body.travelmod, 
                        preRidePrice: preRidePrice,
                        preRideTimeCost:preRideTimeCost, 
                        preRideperMinutCharge:cityprice.preRideperMinutCharge,
                        shereRideCapacity: cityprice.shereRideCapacity 
                    });
                });

            });
        }else{
            res.send({ 
                price: 0,
                generalTimeCost:0,
                GenarelPerMinutCharge:0, 
                travelmod: req.body.travelmod, 
                preRidePrice: 0,
                preRideTimeCost:0, 
                preRideperMinutCharge:0,
                shereRideCapacity: 0 ,
                errormsg:"This Travel Mode Price is Not Create yet. "
            });
        }
         

       }); 
    }else{
        res.send({ 
            price: 0,
            generalTimeCost:0,
            GenarelPerMinutCharge:0, 
            travelmod: req.body.travelmod, 
            preRidePrice: 0,
            preRideTimeCost:0, 
            preRideperMinutCharge:0,
            shereRideCapacity: 0 ,
            errormsg:"Customer Mobile Number Not Match"
        });

    }
    });
});

router.post('/getprice', function(req, res, next) {
    var key = Number(req.body.travelmod) - 1;
    var price = 0;
    var generalPrice = 0;
    //console.log("distance:", req.body.distance)
    database.customer.findOne({ CustID: req.cookies.CustID }, function(er, cust) {
        var travelMode=req.body.travelmod;
        var CityName=cust.CityName;

       // console.log("Get Price :",cust)
       database.cityPrice.findOne({CityName:CityName,travelMode:travelMode},function(er,cityprice){  
        if(cityprice){
            ///////////Check For redious////////
            rediouscalculation({
                cityprice:cityprice,
                distance:req.body.distance
            },function(redius){
                //console.log("test multiplyer",redius);
                /////////////Check For Price Hikere/////////
                priceHickerCalculation({
                    cityprice:cityprice,
                    distance:req.body.distance,
                    mm:req.body.mm,
                    hour:req.body.hour
                },function(priceIncrimenBy){
                    //console.log("priceIncrimenBy",priceIncrimenBy);
                    ///////Price Calculetion/////////////////
                    var priceIncrimeter=(Number(priceIncrimenBy.priceIncrimenBy)/100)+1;
                    var generalPrice=Number(req.body.distance) * Number(redius.rediusMultiplyer) * Number(cityprice.PerKMPrice) * Number(priceIncrimeter);
                    var preRidePrice=Number(req.body.distance) * Number(redius.preRideRediusMultiplyer) * Number(cityprice.preRidekmprice) * Number(priceIncrimeter);
                    var generalTimeCost=Number(req.body.time)* Number(cityprice.GenarelPerMinutCharge);
                    var preRideTimeCost=Number(req.body.time)* Number(cityprice.preRideperMinutCharge);
                    //console.log("generalPrice:",generalPrice,"preRidePrice:",preRidePrice,"generalTimeCost:", generalTimeCost,"preRideTimeCost:",preRideTimeCost);  
                    //console.log("Total General Cost",generalTimeCost+ generalPrice , "Total pre Cost",  preRideTimeCost+preRidePrice);
                    if(generalPrice < cityprice.minimumPricePer){
                        generalPrice= Number(cityprice.minimumPricePer);
                    }
                    if(preRidePrice < cityprice.minimumPricePer){
                        preRidePrice= Number(cityprice.minimumPricePer);
                    }
                    res.send({ 
                        price: generalPrice,
                        generalTimeCost:generalTimeCost,
                        GenarelPerMinutCharge:cityprice.GenarelPerMinutCharge, 
                        travelmod: req.body.travelmod, 
                        preRidePrice: preRidePrice,
                        preRideTimeCost:preRideTimeCost, 
                        preRideperMinutCharge:cityprice.preRideperMinutCharge,
                        shereRideCapacity: cityprice.shereRideCapacity 
                    });
                });

            });
        }else{
            res.send({ 
                price: 0,
                generalTimeCost:0,
                GenarelPerMinutCharge:0, 
                travelmod: req.body.travelmod, 
                preRidePrice: 0,
                preRideTimeCost:0, 
                preRideperMinutCharge:0,
                shereRideCapacity: 0 
            });
        }
         

       });   
        // if (Number(req.body.distance) <= Number(cust.generalMinimumKm[key])) {
        //     price = Number(cust.generalMinimumprice[key]) + Number(cust.generalBasePrice[key]);
        // } else {
        //     var dist = Number(req.body.distance) - Number(cust.generalMinimumKm[key]);
        //     price = (Number(dist) * Number(cust.generalPriceperKm[key])) + (Number(cust.generalMinimumprice[key]) + Number(cust.generalBasePrice[key]))
        // }
        // ///////Long Distance  Fare///////////
        // if (Number(req.body.distance) > 19) {
        //     price = price * 2;
        //     preRidePrice = Number(cust.preRidePriceperKm[key]) * 2;

        // } else {
        //     preRidePrice = Number(cust.preRidePriceperKm[key]);
        // }

        // res.send({ price: price, travelmod: req.body.travelmod, preRidePrice: preRidePrice, shereRideCapacity: cust.shereRideCapacity });
    });
});

function rediouscalculation(req,res){
    //////////// Check Redious Paramiter/////////////////
    console.log("distance: ",req.distance)
    if(req.cityprice.cityRediusMultiplyer.length>0){
        if(Number(req.distance)>0 && Number(req.distance)<=5){
            let rediousMulti = req.cityprice.cityRediusMultiplyer.find(el => el.redious === "5");
            rediusMultiplyer=rediousMulti["multiplyer"]
            if(rediousMulti){
                rediusMultiplyer=rediousMulti["multiplyer"]
                preRideRediusMultiplyer=Number(rediusMultiplyer)/2;
                res({rediusMultiplyer:rediusMultiplyer,preRideRediusMultiplyer:preRideRediusMultiplyer})
                }else{
                    res({rediusMultiplyer:1,preRideRediusMultiplyer:1});   
                }
    }else{
        if(Number(req.distance)>5 && Number(req.distance)<=10){
            let rediousMulti = req.cityprice.cityRediusMultiplyer.find(el => el.redious === "10");
            if(rediousMulti){
            rediusMultiplyer=rediousMulti["multiplyer"]
            preRideRediusMultiplyer=Number(rediusMultiplyer)/2;
            res({rediusMultiplyer:rediusMultiplyer,preRideRediusMultiplyer:preRideRediusMultiplyer})
                }else{
                    res({rediusMultiplyer:1,preRideRediusMultiplyer:1});   
                }

        }else{
            if(Number(req.distance)>10 && Number(req.distance)<=15){
                let rediousMulti = req.cityprice.cityRediusMultiplyer.find(el => el.redious === "15");
                if(rediousMulti){
                    rediusMultiplyer=rediousMulti["multiplyer"]
                    preRideRediusMultiplyer=Number(rediusMultiplyer)/2;
                    res({rediusMultiplyer:rediusMultiplyer,preRideRediusMultiplyer:preRideRediusMultiplyer})
                }else{
                    res({rediusMultiplyer:1,preRideRediusMultiplyer:1});   
                }
            }else{
                if(Number(req.distance)>15){
                ////////Return Fare Applicable////////////////
                res({rediusMultiplyer:2,preRideRediusMultiplyer:2});
                }
            }
        }
    }
    }else{
        if(Number(req.distance)>15){
            ////////Return Fare Applicable////////////////
            res({rediusMultiplyer:2,preRideRediusMultiplyer:2});
            }else{
                res({rediusMultiplyer:1,preRideRediusMultiplyer:1}); 
            }
        
    }
}

function priceHickerCalculation(req,res){
        /////////// Check  Holiday///////////////////////////
        if(req.cityprice.cityHolydayMultiplyer.length >0){

        }else{
            /////////// Check  Weekend///////////////////////////
            if(req.cityprice.cityWeakEndMultiplyer.length >0){

            }else{
                /////////// Check  pick Time/////////////////////////
                if(req.cityprice.cityPickTimeMultiplyer.length >0){
                    var priceIncrimenBy=0;
                req.cityprice.cityPickTimeMultiplyer.forEach(function(val,key,ar){
                    let pickTimeStart=val.pickTimeStart;
                    let pickTimeStop=val.pickTimeStop;
                        if(new Date ('1/1/1999 '+''+req.hour+':'+req.mm+'')>new Date ('1/1/1999 '+''+pickTimeStart+'') && new Date ('1/1/1999 '+''+req.hour+':'+req.mm+'')<new Date ('1/1/1999 '+''+pickTimeStop+'')){
                            priceIncrimenBy=val.picktimePriceIncreaseBy;
                            //console.log("priceIncrimenBy:",priceIncrimenBy)
                        }else{
                            if(Number(priceIncrimenBy)>0){

                            }else{
                                priceIncrimenBy=0;
                            }
                            
                        }
                        if(key === ar.length-1){
                            res({priceIncrimenBy:priceIncrimenBy});
                        }
                    })
                }else{
                    res({priceIncrimenBy:0}); 
                }
                    
            }
        }
}

/////For Neareast RideBooking//////
router.post('/nearbyRideBooking', function(req, res, next) {
    database.index2Ddriver({}, function(ss) {
        database.driverlocation.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [Number(req.body.lng), Number(req.body.lat)]
                    },
                    $maxDistance: 4000
                }
            },
            accountStatus: 'Active',
            travelmod: req.body.travelmod,
            DriverType: req.body.DriverType,
            driverBusy: "Free",
            ringtone: "0"
        }, function(e, generalDriver) {
            res.send({ drivers: generalDriver });
        });
    });

});

////////Call Driver Requiest notification/////
router.post('/CallDriver', function(req, res, next) {
    res.io.emit("inCommingCall", { pilotID: req.body.pilotID, CustID: req.body.CustID, pickuoAddress: req.body.pickuoAddress });
    res.send('ReqEmited');
});





///////Update Demand Location /////
router.post('/updateDemndLocation', function(req, res, next) {
    database.demandArea.findOne({ CustID: req.cookies.CustID }, function(e, data) {
        if (data) {
            database.demandArea.findOneAndUpdate({ CustID: req.cookies.CustID }, { $set: { location: { type: 'Point', coordinates: [req.body.lng, req.body.lat] } } }, function(e, d) {

                res.send("demand Update")

            });
        } else {
            database.demandArea({
                CustID: req.cookies.CustID,
                location: { type: 'Point', coordinates: [req.body.lng, req.body.lat] }
            }).save(function(er) {
                res.send("demand location save")
            });
        }
    });
});

//DELETE ALL DEMAND /////////
router.post('/cleardemandarea', function(req, res, next) {
    database.demandArea.deleteMany({ CustID: req.cookies.CustID }, function(e, d) {
        res.send("clear Demand")
    });
})

//Driver Not Found /////////
router.post('/cust/drivernotfound', function(req, res, next) {
    console.log(req.body);
    database.drivernotfound({
        originAds: req.body.originAds,
        distAds: req.body.distAds,
        originLat: req.body.originLat,
        originLng: req.body.originLng,
        distLat: req.body.distLat,
        distLng: req.body.distLng,
        travelmod: req.body.travelmod,
        CustID: req.body.CustID,
        DriverType: req.body.DriverType,
        totalAmt: req.body.totalAmt,
        totalDistance: req.body.totalDistance,
        travalTime: req.body.travalTime,
        payMode: req.body.payMode,
        status: "initiate",
    }).save(function(err) {
        res.io.emit("driverNotFount", { CustID: req.body.CustID });
        res.send(req.body);
    })
})


/////////Ride Details requiest//////////

router.post('/rideDetails', function(req, res, next) {
    database.ride.find({CustID:req.body.CustID},function(er,booking){
        res.send(booking)
    }).sort({ 'date': -1 }).limit(50)
});



///////////////////////////////////////
///* END CUSTOMER LISTING. *///////////
///////////////////////////////////////

///////////////////////////////////////
///* RIDE PAGE LISTING. *///////////
///////////////////////////////////////


/////Listin Cust Ride Conform//////    
router.get('/ride', function(req, res, next) {
    if (req.cookies.CustID) {
        database.customer.findOne({ CustID: req.cookies.CustID }, function(err, cust) {
            if (cust.bookingID) {
                res.render('india/inCustRideConfrm', { YOUR_API_KEY: process.env.API_KEY, orderStage: cust.orderStage, bookingID: cust.bookingID, cust: cust })
            } else {
                res.redirect('/india')
            }

        })
    } else {
        res.redirect('/india/login')
    }

});


////////Call Driver Requiest notification/////
router.post('/rideDriverBookingDetails', function(req, res, next) {
    database.ride.findOne({ bookingID: req.body.bookingID }, function(err, ride) {
        if (ride) {
            database.pilot.findOne({ pilotID: ride.pilotID }, function(err, driver) {
                res.send({ driver: driver, ride: ride });
            });
        }
    });
});

////////getDriverposition/////
router.post('/getDriverposition', function(req, res, next) {
    database.driverlocation.findOne({ pilotID: req.body.pilotID }, function(err, driver) {
        if (driver) {
            console.log(driver.location.coordinates);
            res.send(driver.location.coordinates);
        }

    });

});


////////// getFinalBooking For Billing //////
router.post('/getFinishBooking', function(req, res, next) {
    database.ride.findOne({ bookingID: req.body.bookingID }, function(e, data) {
        res.send(data);
    });
});

//////////setAllNormalandFinished //////
router.post('/setAllNormalandFinished', function(req, res, next) {
    database.customer.findOneAndUpdate({ CustID: req.cookies.CustID }, {
        $set: {
            orderStage: "",
            bookingID: "",
            pickuplatlong: [],
            picuplocation: "",
            droplatlong: [],
            droplocation: "",
        }
    }, function(er, data) {
        res.clearCookie("orderCreated");
        res.send("ok")
    });
});

router.post('/CancelRideByCust', function(req, res, next) {
    database.ride.findOne({ bookingID: req.body.bookingID }, function(err, ride) {
        if (ride) {
            if (ride.callbookingStatus == "Accept") {
                database.ride.findOneAndUpdate({ bookingID: req.body.bookingID }, {
                    $set: {
                        callbookingStatus: "CalcelByCustomer",
                        driverBusy: "",
                        cancelCharge: req.body.cancelCost
                    }
                }, function(err, ride) {
                    ////////Deductted Wallet Balance///////
                    database.customer.findOne({ CustID: ride.CustID }, function(err, cust) {
                        if (req.body.cancelCost) {
                            var newWalletValue = Number(cust.walletBalance) - Number(req.body.cancelCost);
                        } else {
                            var newWalletValue = Number(cust.walletBalance);
                        }
                        database.customer.findOneAndUpdate({ CustID: ride.CustID }, {
                            $set: {
                                walletBalance: newWalletValue,
                                orderStage: "",
                                bookingID: "",
                                pickuplatlong: [],
                                picuplocation: "",
                                droplatlong: [],
                                droplocation: ""
                            }
                        }, function(err, cu) {
                            ///////Check Driver Type//////
                            if (ride.DriverType == "preRide") {
                                database.pilot.findOne({ pilotID: ride.pilotID }, function(re, driver) {
                                    if (driver) {
                                        var newTotaltime = Number(driver.preRideTotalTime) - Number(ride.travalTime);
                                        database.pilot.findOneAndUpdate({ pilotID: ride.pilotID }, {
                                            $set: {
                                                preRideTotalTime: newTotaltime
                                            }
                                        }, function(e, dddddd) {
                                            ///////Delete Car logbook record /////
                                            database.Carlogbook.deleteMany({ bookingID: req.body.bookingID }, function(e, d) {
                                                res.io.emit("OrderCancelByCustomer", { CustID: ride.CustID, pilotID: ride.pilotID });
                                                res.send("ok");
                                            })
                                        });
                                    }
                                });
                            } else {
                                /////////Tride Driver ///////////
                                if (ride.DriverType == "Tride") {
                                    database.pilot.findOneAndUpdate({ pilotID: ride.pilotID }, { $set: { orderStage: "", bookingID: "" } }, function(e, da) {
                                        database.driverlocation.findOneAndUpdate({ pilotID: ride.pilotID, DriverType: "Tride" }, { $set: { ringtone: "0", driverBusy: "Free" } }, function(er, df) {
                                            //////Need to clear from pilot side or device
                                            //res.clearCookie("driverBusy");
                                            res.io.emit("OrderCancelByCustomer", { CustID: ride.CustID, pilotID: ride.pilotID });
                                            res.send("ok")
                                        });
                                    });

                                } else {
                                    //////drivertype General////////
                                    database.pilot.findOneAndUpdate({ pilotID: ride.pilotID }, { $set: { orderStage: "", bookingID: "" } }, function(e, da) {
                                        database.driverlocation.findOneAndUpdate({ pilotID: ride.pilotID, DriverType: "General" }, { $set: { ringtone: "0", driverBusy: "Free" } }, function(er, df) {
                                            //////Need to clear from pilot side or device
                                            //res.clearCookie("driverBusy");
                                            res.io.emit("OrderCancelByCustomer", { CustID: ride.CustID, pilotID: ride.pilotID });
                                            res.send("ok")
                                        });
                                    });

                                }



                            }
                        });

                    });

                });

            } else {
                res.send("Not Ok")
            }
        }

    });
})


///////////////////////////////////////
///* END RIDE PAGE LISTING. *///////////
///////////////////////////////////////

///////////////////////////////////////
///* DELIVERY PAGE LISTING. *///////////
///////////////////////////////////////
router.get('/delivery', function(req, res, next) {
    if (req.cookies.CustID) {
        database.customer.findOne({ CustID: req.cookies.CustID }, function(err, cust) {
            res.render('india/inCustDelivey', { YOUR_API_KEY: process.env.API_KEY, cust: cust })
        })
    } else {
        res.redirect('/india/login')
    }
})

///////////////////////////////////////
///* END DELIVERY  PAGE LISTING. *///////////
///////////////////////////////////////


///////////////////////////////////////
///* DRIVER LISTING. *///////////////
///////////////////////////////////////
router.get('/drv', function(req, res, next) {
    //res.send('respond with a resource I am INDIA');
    //res.clearCookie("pilotID");
    var dd = "";
    if (req.cookies.pilotID) {
        database.pilot.findOne({ completereg: 'done', pilotID: req.cookies.pilotID }, function(err, data) {
            console.log(req.cookies.pilotID)
            if (data) {
                res.render('india/inDriver', { YOUR_API_KEY: process.env.API_KEY, driver: data });
            } else {
                database.pilot.findOne({ pilotID: req.cookies.pilotID }, function(err, driver) {
                    if (req.query.reg) {
                        dd = req.query.reg;
                    }
                    res.render('india/inDriverReg', { YOUR_API_KEY: process.env.API_KEY, driver: driver, submitvar: dd });
                });

            }

        });

    } else {
        res.redirect('/india/drv/login')
    }
})

router.get('/drv/login', function(req, res, next) {
    if (req.cookies.pilotID) {
        res.redirect('/india/drv')
    } else {
        res.render('india/inDriverLogin', { msg: req.query.msg, lat: req.query.lat, lng: req.query.lng })
    }
});

///////////Check Mobile in our system////////////
router.post('/drv/checkMobileExist', function(req, res, next) {
    console.log(req.body)
    database.pilot.findOne({ mobileNumber: req.body.mobile, isdCode: '+91' }, function(err, data) {
        console.log(data)

        if (data) {

            res.send('exist');
        } else {
            res.send('notexist');
        }
    });

});


///////Login Driver////////
router.post('/drv/login', function(req, res, next) {
    database.pilot.findOne({ mobileNumber: req.body.mobile, isdCode: '+91' }, function(err, user) {
        if (user) {
            bcrypt.compare(req.body.password, user.password, function(err, pass) {
                console.log(pass)
                if (pass) {
                    res.cookie("pilotID", user.pilotID, { maxAge: 30 * 24 * 60 * 60 * 1000 });
                    /////check Prise manager///////          
                    res.send('success');
                } else {
                    //////Worng Password//////
                    res.send('worngpassword')
                }
            });
        }
    });
});

////////Logout /////////////
router.get('/drv/logout', function(req, res, next) {
    res.clearCookie("pilotID");
    res.redirect('../../drive')

});

///////////OTP////////////
router.post('/drv/otpSend', function(req, res, next) {
    smsotp.otpsend({
        apikey: process.env.OTP2KEY,
        mobileno: "+91" + req.body.mobile + "",
        otp: "" + req.body.otp + ""
    }, function(data) {
        console.log(data);
        res.send(data);
    })
});



///////Register New Driver////////
router.post('/drv/driverReg', function(req, res, next) {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        database.pilot({
            name: req.body.name,
            email: req.body.email,
            password: hash,
            mobileNumber: req.body.mobile,
            isdCode: '+91',
            pilotRating: '0',
            preRideTotalTime: 0,
            latlong: [Number(req.body.lat), Number(req.body.lng)]
                //location:{type:'Point',coordinates:[req.body.lng, req.body.lat]}
                //location:{type:'Point',coordinates:[1.00001, 1.0001]}
        }).save(function(err) {

            res.redirect('/india/drv/login?msg=Registration Success');
        });
    });

});


///////Continue Registration process////////
router.post('/drv/completeReg', function(req, res, next) {
    console.log(req.body);
    ////upload files  ///////
    var photo = req.files.file1;
    if (photo.size > 0) {
        var urlphoto = 'driverDocument/photo' + req.body.mobile + '1' + photo.name + ''
        photo.mv('public/india/' + urlphoto + '', function(err) {
            if (err) { console.log(err) }
            database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
                $set: {
                    photo: urlphoto
                }
            }, function(e, d) {});

        });
    }
    var id = req.files.file2;
    if (id.size > 0) {
        var urlid = 'driverDocument/id' + req.body.mobile + '1' + id.name + ''
        id.mv('public/india/' + urlid + '', function(err) {
            if (err) { console.log(err) }
            database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
                $set: {
                    Idproof: urlid
                }
            }, function(e, d) {});
        });
    }
    var dl = req.files.file3;
    if (dl.size > 0) {
        var urldl = 'driverDocument/dl' + req.body.mobile + '1' + dl.name + ''
        dl.mv('public/india/' + urldl + '', function(err) {
            if (err) { console.log(err) }
            database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
                $set: {
                    dl: urldl
                }
            }, function(e, d) {});
        });
    }
    var rto = req.files.file4;
    if (rto.size > 0) {
        var urlrto = 'driverDocument/rto' + req.body.mobile + '1' + rto.name + ''
        rto.mv('public/india/' + urlrto + '', function(err) {
            if (err) { console.log(err) }
            database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
                $set: {
                    rto: urlrto
                }
            }, function(e, d) {});
        });
    }
    var insu = req.files.file5;
    if (insu.size > 0) {
        var urlinsu = 'driverDocument/insurance' + req.body.mobile + '1' + insu.name + ''
        insu.mv('public/india/' + urlinsu + '', function(err) {
            if (err) { console.log(err) }
            database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
                $set: {
                    insurence: urlinsu
                }
            }, function(e, d) {});
        });
    }
    var polu = req.files.file6;
    if (polu.size > 0) {
        var urlpolu = 'driverDocument/polution' + req.body.mobile + '1' + polu.name + ''
        polu.mv('public/india/' + urlpolu + '', function(err) {
            if (err) { console.log(err) }
            database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
                $set: {
                    polution: urlpolu
                }
            }, function(e, d) {});
        });
    }
    if (req.body.address) {
        database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
            $set: {
                address: req.body.address
            }
        }, function(e, d) {

        });
    }

    if (req.body.riderCheckbox || req.body.deliveryCheckbox || req.body.employeeCheckbox) {
        database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
            $set: {
                typeOfWork: [req.body.riderCheckbox, req.body.deliveryCheckbox, req.body.employeeCheckbox]
            }
        }, function(e, d) {

        });
    }

    if (req.body.employeeCheckbox) {
        database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
            $set: {
                jobCategory: req.body.jobcategory,
                jobSubCategory: req.body.jobSubcategory,
                ageGroup: req.body.ageGroup,
                experance: req.body.experance,
                panNumber: req.body.panNumber,
                gender: req.body.gender
            }
        }, function(e, d) {

        });
    }

    if (req.body.travelmod) {
        database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
            $set: {
                travelmod: req.body.travelmod,
                rtoRegno: req.body.RtoNo,
                carModel: req.body.carModel
            }
        }, function(e, d) {

        });
    }

    if (req.body.bankAc) {
        database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
            $set: {
                bankAccountNo: req.body.bankAc,
                ifsc: req.body.ifsc,
            }
        }, function(e, d) {

        });
    }
    res.redirect('/india/drv?reg=submit')

});


///////////Driver Account Ledger///////
router.get('/drv/account', function(req, res, next) {
    if (req.cookies.pilotID) {
        database.pilot.findOne({ pilotID: req.cookies.pilotID }, function(e, pilot) {
            pendingAccountBalance({ pilotID: pilot.pilotID, travelmod: pilot.travelmod }, function(accountBalance) {
                dailyAccountBalance({ pilotID: pilot.pilotID, travelmod: pilot.travelmod, day: new Date() }, function(daily) {
                    if (pilot.driverLastCheckAccountBalance) {
                        var driverLastCheckAccountBalance = pilot.driverLastCheckAccountBalance;
                    } else {
                        var driverLastCheckAccountBalance = 0;
                    }
                    var newAccountBalance = Number(driverLastCheckAccountBalance) + Number(accountBalance.accountBalance)
                    database.pilot.findOneAndUpdate({ pilotID: pilot.pilotID }, {
                        $set: {
                            driverLastCheckAccountBalance: newAccountBalance,
                            driverLastCheckDate: moment().startOf('day').utc().toDate()
                        }
                    }, function(er, fd) {
                        res.render('india/inDriverAccount', { accountBalance: Number(newAccountBalance) + Number(daily.accountBalance), dailyBalacne: daily, pilot: pilot });
                    });

                });

            })
        });


    } else {
        res.redirect('/india/drv/login')
    }
})

///////driverDatewiseLedger////////
router.post('/drv/driverDatewiseLedger', function(req, res, next) {
    database.pilot.findOne({ pilotID: req.cookies.pilotID }, function(e, pilot) {
        dailyAccountBalance({ pilotID: pilot.pilotID, travelmod: pilot.travelmod, day: req.body.day }, function(daily) {
            withdrawalDeposit({ pilotID: pilot.pilotID, travelmod: pilot.travelmod, day: req.body.day }, function(widthralDeposit) {
                res.send({ dailyBalacne: daily, widthralDeposit: widthralDeposit })
            });
        });
    })
});

function withdrawalDeposit(req, cb) {
    var StartTime;
    var EndTime;
    var Withdrawal = 0;
    var deposit = 0;
    StartTime = moment(req.day).startOf('day').utc();
    EndTime = moment(req.day).endOf('day').utc();
    database.DriverPayment.find({
        date: { $gte: StartTime.toDate(), $lte: EndTime.toDate() },
        pilotID: req.pilotID,
        travelmod: req.travelmod,
        DriverType: "General"
    }, function(er, balance) {
        if (balance.length > 0) {
            balance.forEach(function(val, indx, arry) {
                if (val.Withdrawal) {
                    Withdrawal += Number(val.Withdrawal)
                }
                if (val.deposit) {
                    deposit += Number(val.deposit)
                }

                if (indx === arry.length - 1) {
                    cb({ deposit: deposit, Withdrawal: Withdrawal });
                }
            });

        } else {
            cb({ deposit: 0, Withdrawal: 0 });
        }


    })

}


function dailyAccountBalance(req, cb) {
    var StartTime;
    var EndTime;
    var totalErning = 0;
    var driverCashCollectio = 0;
    var driverIncentiv = 0;
    StartTime = moment(req.day).startOf('day').utc();
    EndTime = moment(req.day).endOf('day').utc();
    database.ride.find({
        date: { $gte: StartTime.toDate(), $lte: EndTime.toDate() },
        pilotID: req.pilotID,
        travelmod: req.travelmod,
        callbookingStatus: "complete",
        DriverType: "General"
    }, function(er, balance) {
        if (balance.length > 0) {
            balance.forEach(function(val, indx, arry) {
                if (val.driverpayout) {
                    totalErning += Number(val.driverpayout)
                }
                if (val.driverCashCollectio) {
                    driverCashCollectio += Number(val.driverCashCollectio)
                }
                if (val.driverIncentiv) {
                    driverIncentiv += Number(val.driverIncentiv)
                }
                if (indx === arry.length - 1) {
                    cb({
                        accountBalance: Number(totalErning) + Number(driverIncentiv) - Number(driverCashCollectio),
                        totalErning: Number(totalErning),
                        driverIncentiv: Number(driverIncentiv),
                        driverCashCollectio: Number(driverCashCollectio)

                    });
                }
            });

        } else {
            cb({
                accountBalance: 0,
                totalErning: 0,
                driverIncentiv: 0,
                driverCashCollectio: 0

            });
        }
    });

}

function pendingAccountBalance(req, cb) {
    var StartTime = "";
    var EndTime = "";
    var totalErning = 0;
    var driverCashCollectio = 0;
    var driverIncentiv = 0;
    database.pilot.findOne({ pilotID: req.pilotID }, function(e, pilot) {
        if (pilot.driverLastCheckDate) {
            /////Check Balance From Last Check
            StartTime = moment(pilot.driverLastCheckDate).utc();
            EndTime = moment().startOf('day').utc();
            database.ride.find({
                date: { $gte: StartTime.toDate(), $lte: EndTime.toDate() },
                pilotID: req.pilotID,
                travelmod: req.travelmod,
                callbookingStatus: "complete",
                DriverType: "General"
            }, function(er, balance) {
                if (balance.length > 0) {
                    balance.forEach(function(val, indx, arry) {
                        if (val.driverpayout) {
                            totalErning += Number(val.driverpayout)
                        }
                        if (val.driverCashCollectio) {
                            driverCashCollectio += Number(val.driverCashCollectio)
                        }
                        if (val.driverIncentiv) {
                            driverIncentiv += Number(val.driverIncentiv)
                        }
                        if (indx === arry.length - 1) {
                            cb({ accountBalance: Number(totalErning) + Number(driverIncentiv) - Number(driverCashCollectio) });
                        }
                    });

                } else {
                    cb({ accountBalance: 0 });
                }
            });

        } else {
            /////Check Balance From Starting
            if (pilot.date.getDate() == new Date().getDate()) {
                dailyCashCollection({ pilotID: req.pilotID, travelmod: req.travelmod }, function(cash) {
                    cb({ accountBalance: 0 });
                });
            } else {
                StartTime = moment(pilot.date).utc();
                EndTime = moment().startOf('day').utc();
                database.ride.find({
                    date: { $gte: StartTime.toDate(), $lte: EndTime.toDate() },
                    pilotID: req.pilotID,
                    travelmod: req.travelmod,
                    callbookingStatus: "complete",
                    DriverType: "General"
                }, function(er, balance) {
                    if (balance.length > 0) {
                        balance.forEach(function(val, indx, arry) {
                            if (val.driverpayout) {
                                totalErning += Number(val.driverpayout)
                            }
                            if (val.driverCashCollectio) {
                                driverCashCollectio += Number(val.driverCashCollectio)
                            }
                            if (val.driverIncentiv) {
                                driverIncentiv += Number(val.driverIncentiv)
                            }
                            if (indx === arry.length - 1) {
                                cb({ accountBalance: Number(totalErning) + Number(driverIncentiv) - Number(driverCashCollectio) });
                            }
                        });

                    } else {
                        cb({ accountBalance: 0 });
                    }
                });
            }

        }
    });

}

//////////Update Driver Duty Offline and online//////
router.post('/drv/dutyUpdate', function(req, res, next) {
    if (req.body.duty == 'offline') {
        database.driverlocation.deleteMany({ pilotID: req.cookies.pilotID }, function(e, ddd) {
            if (ddd) {
                console.log("delete Driver Location")
                res.send(req.body.duty);
            } else {
                res.send(req.body.duty);
            }
        });
    }

});

////Randanm OTP/////////
function randamNumber() {
    var tex = "";
    for (var i = 0; i < 4; i++) {
        tex += '' + Math.floor(Math.random() * 10) + '';
    }
    return tex;

}

////////requiest Display Accept Window/////
router.post('/requiestDisplayAcceptWindow', function(req, res, next) {
    res.io.emit("openAcceptWindow", { CustID: req.body.CustID, pilotID: req.body.pilotID, pickuoAddress: req.body.pickuoAddress });
    res.cookie('openAcceptWindow', JSON.stringify({ CustID: req.body.CustID, pilotID: req.body.pilotID, pickuoAddress: req.body.pickuoAddress }), { maxAge: 15 * 1000 })
    database.driverlocation.findOneAndUpdate({ pilotID: req.body.pilotID, DriverType: "General" }, { $set: { ringtone: "1" } }, function(e, d) {
        res.send("emitopenAcceptWindow");
    })

});;

//////Reset Ringtone value to "0"////
router.post('/drv/resetRingtone', function(req, res, next) {
    database.driverlocation.findOneAndUpdate({ pilotID: req.body.pilotID, DriverType: "General" }, { $set: { ringtone: "0" } }, function(e, d) {
        res.send("ringtone Reset to 0");
    })
});



////////Call Driver accept notification/////
router.post('/AcceptCallByDriver', function(req, res, next) {
    res.io.emit("DriverAccepeCall", { CustID: req.body.CustID, pilotID: req.body.pilotID });
    res.send("emitDriverAccepeCall")
});

router.post('/saveDriverCallAndBooking', function(req, res, next) {
    ///////Create Bookinng////
    GenbookingID({}, function(NewBookinid) {
        database.ride({
            bookingID: NewBookinid.bookingID,
            CustID: req.body.CustID,
            pilotID: req.body.pilotID,
            DriverType: req.body.DriverType,
            picupaddress: req.body.originAds,
            picuklatlng: [req.body.originLat, req.body.originLng],
            dropaddress: req.body.distAds,
            droplatlng: [req.body.distLat, req.body.distLng],
            kmtravels: req.body.totalDistance,
            totalamount: req.body.totalAmt,
            paymentBy: req.body.payMode,
            callbookingStatus: "Accept",
            driverBusy: "busy",
            preRideOTP: randamNumber(),
        }).save(function(err) {
            //////CUST data////
            database.customer.findOneAndUpdate({ CustID: req.body.CustID }, {
                $set: {
                    orderStage: 'accept',
                    bookingID: NewBookinid.bookingID
                }
            }, function(er, cust) {
                database.pilot.findOneAndUpdate({ pilotID: req.body.pilotID }, {
                    $set: {
                        orderStage: 'accept',
                        bookingID: NewBookinid.bookingID
                    }
                }, function(e, d) {
                    res.io.emit("CallAcceptListDisplay", { pilotID: req.body.pilotID, CustID: req.body.CustID, bookingID: NewBookinid.bookingID });
                    res.send("Order Grnerate sucellfully");
                });

            });

        })
    });

});

/////// Driver Offline Permission///////
router.post('/offlinePermission', function(req, res, next) {
    database.pilot.findOne({ pilotID: req.cookies.pilotID, offlinePermission: "granted" }, function(err, pilot) {
        res.send(pilot);
    })
})

//////////Driver Cline Details //////
router.post('/drv/clineDetalls', function(req, res, next) {
    res.cookie("driverBusy", "busy", { maxAge: 1 * 24 * 60 * 60 * 1000 });
    database.customer.findOne({ CustID: req.body.CustID }, function(err, cust) {
        database.ride.findOne({ bookingID: req.body.bookingID }, function(e, ride) {

            res.send({ cust: cust, ride: ride });
        })
    });
});

////////Driver Page Initiate Data details///
router.post('/drv/getPageInitiateDetails', function(req, res, next) {
    database.ride.findOne({ bookingID: req.body.bookingID }, function(err, ride) {
        database.customer.findOne({ CustID: ride.CustID }, function(err, cust) {
            res.send({ cust: cust, ride: ride });
        });
    })
});


//////////Driver Cline Located //////
router.post('/drv/clinelocated', function(req, res, next) {
    res.io.emit("clinelocated", { CustID: req.body.CustID });
    res.send("emitClinelocated")
});


//////////Driver Cline Located //////
router.post('/drv/startRide', function(req, res, next) {
    database.customer.findOneAndUpdate({ CustID: req.body.CustID }, { $set: { orderStage: 'startRide' } }, function(er, cust) {
        database.pilot.findOneAndUpdate({ pilotID: req.cookies.pilotID }, { $set: { orderStage: 'startRide' } }, function(re, pilot) {
            database.ride.findOneAndUpdate({ bookingID: req.body.bookingID }, { $set: { startTime: new Date() } }, function(re, ride) {
                res.io.emit("StartRide", { CustID: req.body.CustID });
                res.send({ cust: cust, ride: ride });
            });

        });

    });


});

//////////Driver Finish Ride //////
router.post('/drv/finishRide', function(req, res, next) {
    database.customer.findOneAndUpdate({ CustID: req.body.CustID }, { $set: { orderStage: 'finishRide' } }, function(er, cust) {
        database.pilot.findOneAndUpdate({ pilotID: req.cookies.pilotID }, { $set: { orderStage: 'finishRide' } }, function(re, driver) {
            if (driver) {
                var endTime = new Date();
                database.ride.findOneAndUpdate({ bookingID: req.body.bookingID }, { $set: { callbookingStatus: "finishRide", endTime: endTime, travelmod: driver.travelmod } }, function(er, Booking) {

                    //// Calculate Distance Last positio driver///////
                    database.driverlocation.findOne({ pilotID: req.cookies.pilotID }, function(er, driverLoc) {
                        var finishLocation = driverLoc.location.coordinates;
                        var travelmod = driver.travelmod;
                        googleApi.distance({
                            origins: '' + Number(Booking.picuklatlng[0]) + ', ' + Number(Booking.picuklatlng[1]) + '',
                            destinations: '' + Number(finishLocation[1]) + ',' + Number(finishLocation[0]) + '',
                            apik: process.env.API_KEY,
                            travelmod: travelmod
                        }, function(result) {
                            var distance = result.rows[0].elements[0].distance.value;
                            var totalTime = endTime.getTime() - moment(Booking.startTime).utc().toDate().getTime();
                            totalTime = parseInt(totalTime / (1000 * 60)) + 1;
                            var travelm = Number(travelmod) - 1;
                            var timefare = Number(cust.GenarelPerMinutCharge[travelm]) * Number(totalTime);
                            timefare = timefare.toFixed(0);
                            distance = parseInt(distance / 1000) + 1;
                            var distancefare = Number(cust.generalPriceperKm[travelm]) * Number(distance);
                            var billAmount = 0;
                            var price = 0;
                            var driverpayout = 0;

                            if (Number(distance) <= Number(cust.generalMinimumKm[travelm])) {
                                price = Number(cust.generalMinimumprice[travelm]) + Number(cust.generalBasePrice[travelm]);
                                driverpayout = Number(cust.generalMinimumKm[travelm]) * Number(cust.driverPayout[travelm])
                            } else {
                                var dist = Number(distance) - Number(cust.generalMinimumKm[travelm]);
                                price = (Number(dist) * Number(cust.generalPriceperKm[travelm])) + (Number(cust.generalMinimumprice[travelm]) + Number(cust.generalBasePrice[travelm]))
                                driverpayout = Number(distance) * Number(cust.driverPayout[travelm])
                            }

                            if (price >= Booking.totalamount) {
                                billAmount = Number(price) + Number(timefare);

                            } else {
                                billAmount = Number(Booking.totalamount) + Number(timefare);
                            }
                            /////send  and update bill details/////
                            database.ride.findOneAndUpdate({ bookingID: req.body.bookingID }, { $set: { totalamount: billAmount, driverpayout: driverpayout, totalTime: totalTime, timefare: timefare, generalBasePrice: Number(cust.generalBasePrice[travelm]) } }, function(er, updatbooking) {
                                if (updatbooking) {
                                    //////Wallet Update ////
                                    if (Number(updatbooking.paymentBy) == 2) {
                                        var walletAmt = Number(cust.walletBalance) - billAmount;
                                        database.customer.findOneAndUpdate({ CustID: req.body.CustID }, { $set: { walletBalance: walletAmt } }, function(er, cu) {
                                            res.io.emit("finishRide", { CustID: req.body.CustID });
                                            res.send({ billAmount: 0 });
                                        });
                                    } else {
                                        if (Number(updatbooking.paymentBy) == 3) {
                                            var buykmAmt = Number(cust.walletBalance) - Number(distance);
                                            database.customer.findOneAndUpdate({ CustID: req.body.CustID }, { $set: { BuyKM: buykmAmt } }, function(er, n) {
                                                res.io.emit("finishRide", { CustID: req.body.CustID });
                                                res.send({ billAmount: 0 });
                                            });
                                        } else {
                                            database.ride.findOneAndUpdate({ bookingID: req.body.bookingID }, { $set: { driverCashCollectio: billAmount } }, function(er, cash) {
                                                res.io.emit("finishRide", { CustID: req.body.CustID });
                                                res.send({ billAmount: billAmount });
                                            });

                                        }
                                    }
                                }

                            });

                        })
                    });

                });
            }
        });
    });
});



//////////Driver finishEverythingAndSetNormal //////
router.post('/drv/finishEverythingAndSetNormal', function(req, res, next) {
    database.pilot.findOneAndUpdate({ pilotID: req.cookies.pilotID }, { $set: { orderStage: "", bookingID: "" } }, function(e, data) {
        database.customer.findOneAndUpdate({ CustID: req.body.CustID }, { $set: { orderStage: "", bookingID: "" } }, function(e, data) {
            database.ride.findOneAndUpdate({ bookingID: req.body.bookingID }, {
                $set: {
                    callbookingStatus: "complete",
                    driverBusy: ""
                }
            }, function(e, data) {
                database.driverlocation.findOneAndUpdate({ pilotID: req.cookies.pilotID, DriverType: "General" }, { $set: { ringtone: "0" } }, function(er, df) {
                    res.clearCookie("driverBusy");
                    res.send("ok")
                })

            });
        })

    });
});
//////////Orde Ride Cancel By Driver///////////
router.post('/drv/cancelOrderByDriver', function(req, res, next) {
    database.ride.findOne({ bookingID: req.body.bookingID }, function(err, ride) {
        database.pilot.findOneAndUpdate({ pilotID: ride.pilotID }, { $set: { orderStage: "", bookingID: "" } }, function(e, data) {
            database.customer.findOneAndUpdate({ CustID: ride.CustID }, {
                $set: {
                    orderStage: "",
                    bookingID: "",
                    pickuplatlong: [],
                    picuplocation: "",
                    droplatlong: [],
                    droplocation: ""
                }
            }, function(e, data) {
                database.ride.findOneAndUpdate({ bookingID: req.body.bookingID }, {
                    $set: {
                        callbookingStatus: "CalcelByDriver",
                        driverBusy: ""
                    }
                }, function(e, data) {
                    database.driverlocation.findOneAndUpdate({ pilotID: ride.pilotID, DriverType: "General" }, { $set: { ringtone: "0", driverBusy: "Free" } }, function(er, df) {
                        res.clearCookie("driverBusy");
                        res.io.emit("OrderCancelByDriver", { CustID: ride.CustID });
                        res.send("ok")
                    })

                });
            })

        });

    })
})

//////////Driver bookingIncentiveDetails  //////
router.post('/drv/bookingIncentiveDetails', function(req, res, next) {
    var totalErning = 0;
    var driverCashCollectio = 0;
    var todayStart = moment().startOf('day').utc();
    var todayend = moment().endOf('day').utc();
    database.pilot.findOne({ pilotID: req.cookies.pilotID }, function(err, pilot) {
        database.ride.find({
            date: { $gte: todayStart.toDate(), $lte: todayend.toDate() },
            pilotID: req.cookies.pilotID,
            travelmod: pilot.travelmod,
            callbookingStatus: "complete",
            DriverType: "General"
        }, function(er, data) {
            data.forEach(function(val, indx, arry) {
                if (val.driverpayout) {
                    totalErning += Number(val.driverpayout)
                }
                if (val.driverCashCollectio) {
                    driverCashCollectio += Number(val.driverCashCollectio)
                }
                if (indx === arry.length - 1) {
                    res.send({ noOfBooking: arry.length, totalErning: totalErning, driverCashCollectio: driverCashCollectio })
                }
            });

        });
    });

});

/////getDemadndArea count and find //////
router.post('/drv/getDemadndArea', function(req, res, next) {
    console.log('myposition', req.body)
    database.index2Ddemand({}, function(ss) {
        database.demandArea.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [Number(req.body.lng), Number(req.body.lat)]
                    },
                    $maxDistance: 10000
                }
            }
        }, function(e, data) {
            console.log('test result', JSON.stringify(data));
            res.send(data);
        })
    });

});

//////Driver withdrawal/////////
router.post('/drv/withdrawal', function(req, res, next) {
    database.pilot.findOne({ pilotID: req.body.pilotID }, function(er, pilot) {
        /////Find Old withdrawal/////////
        database.DriverPayment.find({ pilotID: pilot.pilotID, travelmod: pilot.travelmod, DriverType: "General", typeOfReqest: "driverWidthral" }, function(err, withdrawal) {
            database.DriverPayment({
                pilotID: pilot.pilotID,
                travelmod: pilot.travelmod,
                DriverType: "General",
                Withdrawal: Number(req.body.withdrawlAmount),
                WithdrawalReqestStatus: "Initiate",
                typeOfReqest: req.body.typeOfReqest,
                name: pilot.name,
                accountno: pilot.bankAccountNo,
                ifsc: pilot.ifsc
            }).save(function(err) {
                var driverLastCheckAccountBalance = Number(pilot.driverLastCheckAccountBalance) - Number(req.body.withdrawlAmount);
                database.pilot.findOneAndUpdate({ pilotID: pilot.pilotID }, { $set: { driverLastCheckAccountBalance: driverLastCheckAccountBalance } }, function(eerr, dd) {
                    res.render('india/inDriverWithdrawal', { oldwithdrawal: withdrawal, newReq: req.body, pilot: pilot })
                })



            });
        }).sort({ 'date': -1 }).limit(5);
    });


})



//////Tride  Driver withdrawal/////////
router.post('/tdrv/withdrawal', function(req, res, next) {
    database.pilot.findOne({ pilotID: req.body.pilotID }, function(er, pilot) {
        /////Find Old withdrawal/////////
        database.DriverPayment.find({ pilotID: pilot.pilotID, travelmod: pilot.travelmod, DriverType: "Tride", typeOfReqest: "driverWidthral" }, function(err, withdrawal) {
            database.DriverPayment({
                pilotID: pilot.pilotID,
                travelmod: pilot.travelmod,
                DriverType: "Tride",
                Withdrawal: Number(req.body.withdrawlAmount),
                WithdrawalReqestStatus: "Initiate",
                typeOfReqest: req.body.typeOfReqest,
                name: pilot.name,
                accountno: pilot.bankAccountNo,
                ifsc: pilot.ifsc
            }).save(function(err) {
                var driverLastCheckAccountBalance = Number(pilot.driverLastCheckAccountBalance) - Number(req.body.withdrawlAmount);
                database.pilot.findOneAndUpdate({ pilotID: pilot.pilotID }, { $set: { lastCheckCashCollcetion: 0, lastCheckFuleconsumption: 0, lastpayoutAmount: 0 } }, function(eerr, dd) {
                    res.render('india/inDriverWithdrawal', { oldwithdrawal: withdrawal, newReq: req.body, pilot: pilot })
                })



            });
        }).sort({ 'date': -1 }).limit(5);
    });


})



//////DriverType: "Tride"



// database.DriverPayment.find({pilotID:"1000",travelmod:"1",DriverType:"General"},function(err,withdrawal){
// console.log("withdrawal",withdrawal)
// })

///////////////////////////////////////
///* END DRIVER LISTING. */////////////
///////////////////////////////////////

///////////////////////////////////////
///* PRE DRIVER LISTING. */////////////
///////////////////////////////////////
router.get('/preDrv', function(req, res, next) {
    // res.clearCookie("pilotID");
    //res.send('respond with a resource I am INDIA');
    if (req.cookies.pilotID) {
        database.pilot.findOne({ completereg: 'done', pilotID: req.cookies.pilotID }, function(err, data) {
            console.log(req.cookies.pilotID)
            if (data) {
                res.render('india/inPreDriver', { YOUR_API_KEY: process.env.API_KEY, driver: data });
            } else {
                database.pilot.findOne({ pilotID: req.cookies.pilotID }, function(err, driver) {
                    res.render('india/inPreDriverReg', { YOUR_API_KEY: process.env.API_KEY, driver: driver });
                });

            }

        });

    } else {
        res.redirect('/india/preDrv/login')
    }
});

router.get('/preDrv/login', function(req, res, next) {
    if (req.cookies.pilotID) {
        res.redirect('/india/preDrv')
    } else {
        res.render('india/inPreDriverLogin', { msg: req.query.msg, lat: req.query.lat, lng: req.query.lng })
    }
});

///////////Check Mobile in our system////////////
router.post('/preDrv/checkMobileExist', function(req, res, next) {
    console.log(req.body)

    database.pilot.findOne({ mobileNumber: req.body.mobile, isdCode: '+91' }, function(err, data) {
        console.log(data)

        if (data) {

            res.send('exist');
        } else {
            res.send('notexist');
        }
    });

});


///////Login Driver////////
router.post('/preDrv/login', function(req, res, next) {
    database.pilot.findOne({ mobileNumber: req.body.mobile, isdCode: '+91' }, function(err, user) {
        if (user) {
            bcrypt.compare(req.body.password, user.password, function(err, pass) {
                console.log(pass)
                if (pass) {
                    res.cookie("pilotID", user.pilotID, { maxAge: 30 * 24 * 60 * 60 * 1000 });
                    /////check Prise manager///////          
                    res.send('success');
                } else {
                    //////Worng Password//////
                    res.send('worngpassword')
                }
            });
        }
    });
});

////////Logout /////////////
router.get('/preDrv/logout', function(req, res, next) {
    res.clearCookie("pilotID");
    res.redirect('../../preDrive')

});

///////Register New Driver////////
router.post('/preDrv/driverReg', function(req, res, next) {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        database.pilot({
            name: req.body.name,
            email: req.body.email,
            password: hash,
            mobileNumber: req.body.mobile,
            isdCode: '+91',
            pilotRating: '0',
            location: { type: 'Point', coordinates: [req.body.lng, req.body.lat] }
            //location:{type:'Point',coordinates:[1.00001, 1.0001]}
        }).save(function(err) {

            res.redirect('/india/preDrv/login?msg=Registration Success');
        });
    });

});


///////Continue Registration process////////
router.post('/preDrv/completeReg', function(req, res, next) {
    console.log(req.body);
    ////upload files  ///////
    var photo = req.files.file1;
    if (photo.size > 0) {
        var urlphoto = 'driverDocument/photo' + req.body.mobile + '1' + photo.name + ''
        photo.mv('public/india/' + urlphoto + '', function(err) {
            if (err) { console.log(err) }
            database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
                $set: {
                    photo: urlphoto
                }
            }, function(e, d) {});

        });
    }
    var id = req.files.file2;
    if (id.size > 0) {
        var urlid = 'driverDocument/id' + req.body.mobile + '1' + id.name + ''
        id.mv('public/india/' + urlid + '', function(err) {
            if (err) { console.log(err) }
            database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
                $set: {
                    Idproof: urlid
                }
            }, function(e, d) {});
        });
    }
    var dl = req.files.file3;
    if (dl.size > 0) {
        var urldl = 'driverDocument/dl' + req.body.mobile + '1' + dl.name + ''
        dl.mv('public/india/' + urldl + '', function(err) {
            if (err) { console.log(err) }
            database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
                $set: {
                    dl: urldl
                }
            }, function(e, d) {});
        });
    }
    var rto = req.files.file4;
    if (rto.size > 0) {
        var urlrto = 'driverDocument/rto' + req.body.mobile + '1' + rto.name + ''
        rto.mv('public/india/' + urlrto + '', function(err) {
            if (err) { console.log(err) }
            database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
                $set: {
                    rto: urlrto
                }
            }, function(e, d) {});
        });
    }
    var insu = req.files.file5;
    if (insu.size > 0) {
        var urlinsu = 'driverDocument/insurance' + req.body.mobile + '1' + insu.name + ''
        insu.mv('public/india/' + urlinsu + '', function(err) {
            if (err) { console.log(err) }
            database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
                $set: {
                    insurence: urlinsu
                }
            }, function(e, d) {});
        });
    }
    var polu = req.files.file6;
    if (polu.size > 0) {
        var urlpolu = 'driverDocument/polution' + req.body.mobile + '1' + polu.name + ''
        polu.mv('public/india/' + urlpolu + '', function(err) {
            if (err) { console.log(err) }
            database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
                $set: {
                    polution: urlpolu
                }
            }, function(e, d) {});
        });
    }
    if (req.body.address) {
        database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
            $set: {
                address: req.body.address
            }
        }, function(e, d) {

        });
    }

    if (req.body.riderCheckbox || req.body.deliveryCheckbox || req.body.employeeCheckbox) {
        database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
            $set: {
                typeOfWork: [req.body.riderCheckbox, req.body.deliveryCheckbox, req.body.employeeCheckbox]
            }
        }, function(e, d) {

        });
    }

    if (req.body.employeeCheckbox) {
        database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
            $set: {
                jobCategory: req.body.jobcategory,
                jobSubCategory: req.body.jobSubcategory,
                ageGroup: req.body.ageGroup,
                experance: req.body.experance,
                panNumber: req.body.panNumber,
                gender: req.body.gender
            }
        }, function(e, d) {

        });
    }

    if (req.body.travelmod) {
        database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
            $set: {
                travelmod: req.body.travelmod,
                rtoRegno: req.body.RtoNo,
                carModel: req.body.carModel
            }
        }, function(e, d) {

        });
    }

    if (req.body.bankAc) {
        database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
            $set: {
                bankAccountNo: req.body.bankAc,
                ifsc: req.body.ifsc,
            }
        }, function(e, d) {

        });
    }
    res.redirect('/india/preDrv')

});

///////PreDriver Duty Hour ///////
router.get('/dutyhoursdetails', function(req, res, next) {
    if (req.cookies.pilotID) {
        database.pilot.findOne({ pilotID: req.cookies.pilotID }, function(er, pilot) {
            dailyDutyhour({ pilotID: pilot.pilotID, travelmod: pilot.travelmod }, function(dailyDuty) {
                var month = new Date().getMonth();
                monthliDutyhour({ pilotID: pilot.pilotID, travelmod: pilot.travelmod, month: month }, function(monthlyDuty) {
                    res.render('india/inPreDriverDutyHours', { dailyDuty: dailyDuty, monthlyDuty: monthlyDuty });
                })
            })
        });
    } else {
        res.redirect('/india/preDrv/login')
    }

});

/////PreDriver monthly Duty Hour//////
router.post('/monthlyhours', function(req, res, next) {
        if (req.cookies.pilotID) {
            database.pilot.findOne({ pilotID: req.cookies.pilotID }, function(er, pilot) {
                var month = Number(req.body.month);
                monthliDutyhour({ pilotID: pilot.pilotID, travelmod: pilot.travelmod, month: month }, function(monthlyDuty) {

                    res.send({ monthlyDuty: monthlyDuty })
                })
            });
        } else {
            res.redirect('/india/preDrv/login')
        }
    })
    // console.log(moment().month("February").startOf('month').utc());
    // console.log(moment().month("February").endOf('month').utc());
    // console.log(moment().month(0).startOf('month').utc());
    // console.log(moment().month(0).endOf('month').utc());
    //console.log(new Date().getMonth());
function dailyDutyhour(req, cb) {
    var StartTime = moment().startOf('day').utc();
    var EndTime = moment().endOf('day').utc();
    var totalhour = 0;
    var overtime = 0;
    database.DutyLog.find({
        date: { $gte: StartTime.toDate(), $lte: EndTime.toDate() },
        pilotID: req.pilotID,
        travelmod: req.travelmod,
        DriverType: "preRide"
    }, function(er, duty) {
        if (duty.length > 0) {
            duty.forEach(function(val, key, ary) {
                if (val.dutyHours) {
                    totalhour = Number(totalhour) + Number(val.dutyHours);
                }
                if (val.overtimeDutyHours) {
                    overtime = Number(overtime) + Number(val.overtimeDutyHours);
                }
                if (key === ary.length - 1) {
                    cb({ duty: totalhour, overtime: overtime });
                }
            })
        } else {
            cb({ duty: 0, overtime: 0 });
        }
    })
}

function monthliDutyhour(req, cb) {
    var StartTime = moment().month(req.month).startOf('month').utc();
    var EndTime = moment().month(req.month).endOf('month').utc();
    var totalhour = 0;
    var overtime = 0;
    database.DutyLog.find({
        date: { $gte: StartTime.toDate(), $lte: EndTime.toDate() },
        pilotID: req.pilotID,
        travelmod: req.travelmod,
        DriverType: "preRide"
    }, function(er, duty) {
        if (duty.length > 0) {
            duty.forEach(function(val, key, ary) {
                if (val.dutyHours) {
                    totalhour = Number(totalhour) + Number(val.dutyHours);
                }
                if (val.overtimeDutyHours) {
                    overtime = Number(overtime) + Number(val.overtimeDutyHours);
                }
                if (key === ary.length - 1) {
                    cb({ duty: totalhour, overtime: overtime });
                }
            })
        } else {
            cb({ duty: 0, overtime: 0 });
        }
    })
}


/////Sub Admin monthly Duty Hour//////
router.post('/subMonthlyhours', function(req, res, next) {
    database.pilot.findOne({ pilotID: req.body.pilotID }, function(er, pilot) {
        var month = Number(req.body.month);
        monthliDutyhour({ pilotID: pilot.pilotID, travelmod: pilot.travelmod, month: month }, function(monthlyDuty) {

            res.send({ monthlyDuty: monthlyDuty })
        })
    });

})

/////Sub Admin Due and Cash//////
router.post('/subdrivercashdue', function(req, res, next) {
    var newPreviousDue = 0;
    var newPendingConsumption = 0;
    database.pilot.findOne({ pilotID: req.body.pilotID }, function(e, pilot) {
        preRideCashDueCalculation({ pilotID: pilot.pilotID, travelmod: pilot.travelmod }, function(value) {
            if (pilot.lastCheckCashCollcetion) {
                var lastCheckCashCollcetion = pilot.lastCheckCashCollcetion;
            } else {
                var lastCheckCashCollcetion = 0;
            }

            newPreviousDue = Number(lastCheckCashCollcetion) + Number(value.previousDue);
            console.log(" newPreviousDue", newPreviousDue)
            fuleConsumptionCalculation({ pilotID: pilot.pilotID, travelmod: pilot.travelmod }, function(consum) {
                if (pilot.lastCheckFuleconsumption) {
                    var lastCheckFuleconsumption = pilot.lastCheckFuleconsumption;
                } else {
                    var lastCheckFuleconsumption = 0;
                }
                newPendingConsumption = Number(lastCheckFuleconsumption) + Number(consum.previousConsumption);
                database.pilot.findOneAndUpdate({ pilotID: req.body.pilotID }, {
                    $set: {
                        lastCheckDate: moment().startOf('day').utc().toDate(),
                        lastCheckCashCollcetion: newPreviousDue,
                        lastFuleCheckDate: moment().startOf('day').utc().toDate(),
                        lastCheckFuleconsumption: newPendingConsumption
                    }
                }, function(e, d) {
                    console.log(consum.dailyConsum)
                    res.send({
                        previousDue: newPreviousDue,
                        dailyCollection: value.dailyCollection,
                        PendingConsumption: newPendingConsumption,
                        dailyConsum: consum.dailyConsum,
                        pilot: d

                    })
                })
            })

        });
    })

});

router.get('/resetpilot', function(req, res, next) {
    if (req.cookies.pilotID) {
        database.pilot.findOneAndUpdate({ pilotID: req.cookies.pilotID }, { $set: { date: new Date() } }, function(e, d) {
            res.send("Reset" + req.cookies.pilotID)
        })
    }
})


///////PreDriver Cash Collection///////
router.get('/preDriverCash', function(req, res, next) {
    if (req.cookies.pilotID) {
        var exit = 0;
        if (req.query.offline) {
            exit = "exit";
        }
        var newPreviousDue = 0;
        var newPendingConsumption = 0;
        var newPendingPayout = 0;
        database.pilot.findOne({ pilotID: req.cookies.pilotID }, function(e, pilot) {
            preRideCashDueCalculation({ pilotID: pilot.pilotID, travelmod: pilot.travelmod }, function(value) {
                if (pilot.lastCheckCashCollcetion) {
                    var lastCheckCashCollcetion = pilot.lastCheckCashCollcetion;
                } else {
                    var lastCheckCashCollcetion = 0;
                }

                newPreviousDue = Number(lastCheckCashCollcetion) + Number(value.previousDue);
                console.log(" newPreviousDue", newPreviousDue)
                //if (pilot.driverCetegory) {
                    // if (pilot.driverCetegory == "1") {
                    //     preRidePayoutlculation({ pilotID: pilot.pilotID, travelmod: pilot.travelmod }, function(payout) {
                    //         if (pilot.lastpayoutAmount) {
                    //             var lastpayoutAmount = pilot.lastpayoutAmount;
                    //         } else {
                    //             var lastpayoutAmount = 0;
                    //         }
                    //         newPendingPayout = Number(lastpayoutAmount) + Number(payout.previousPayout);
                    //         database.pilot.findOneAndUpdate({ pilotID: req.cookies.pilotID }, {
                    //             $set: {
                    //                 lastCheckDate: moment().startOf('day').utc().toDate(),
                    //                 lastCheckCashCollcetion: newPreviousDue,
                    //                 lastpayoutCheckDate: moment().startOf('day').utc().toDate(),
                    //                 lastpayoutAmount: newPendingPayout
                    //             }
                    //         }, function(e, d) {
                    //             res.render('india/inPreDriverCashCollection', {
                    //                 previousDue: newPreviousDue,
                    //                 dailyCollection: value.dailyCollection,
                    //                 previousPayout: newPendingPayout,
                    //                 dailyPayout: payout,
                    //                 exit: exit,
                    //                 pilot: d,
                    //                 cetegory: "1"
                    //             })
                    //         })

                    //     });

                    // }

                //} else {
                    fuleConsumptionCalculation({ pilotID: pilot.pilotID, travelmod: pilot.travelmod }, function(consum) {
                        if (pilot.lastCheckFuleconsumption) {
                            var lastCheckFuleconsumption = pilot.lastCheckFuleconsumption;
                        } else {
                            var lastCheckFuleconsumption = 0;
                        }
                        newPendingConsumption = Number(lastCheckFuleconsumption) + Number(consum.previousConsumption);

                        database.pilot.findOneAndUpdate({ pilotID: req.cookies.pilotID }, {
                            $set: {
                                lastCheckDate: moment().startOf('day').utc().toDate(),
                                lastCheckCashCollcetion: newPreviousDue,
                                lastFuleCheckDate: moment().startOf('day').utc().toDate(),
                                lastCheckFuleconsumption: newPendingConsumption
                            }
                        }, function(e, d) {
                            console.log(consum.dailyConsum)
                            res.render('india/inPreDriverCashCollection', {
                                previousDue: newPreviousDue,
                                dailyCollection: value.dailyCollection,
                                PendingConsumption: newPendingConsumption,
                                dailyConsum: consum.dailyConsum,
                                exit: exit,
                                pilot: d,
                                cetegory: pilot.driverCetegory,
                                
                            })
                        })
                    })

                //}

            });
        })



    } else {
        res.redirect('/india/preDrv/login')
    }
});



function fuleConsumptionCalculation(req, cb) {
    var StartTime = "";
    var EndTime = "";
    var consumption = 0;
    var paidConsumption = 0;
    database.pilot.findOne({ pilotID: req.pilotID }, function(e, pilot) {
        if (pilot.lastFuleCheckDate) {
            /////Check From Last Checking Date/////
            StartTime = moment(pilot.lastFuleCheckDate).utc();
            EndTime = moment().startOf('day').utc();
            database.Carlogbook.find({
                date: { $gte: StartTime.toDate(), $lte: EndTime.toDate() },
                pilotID: req.pilotID,
                travelmod: req.travelmod,
                loogBookStatus: "complete",
                DriverType: "preRide"
            }, function(er, logbook) {
                if (logbook.length > 0) {
                    logbook.forEach(function(val, key, ary) {
                        if (val.fuleConsumption) {
                            var rrt = isNaN(Number(val.fuleConsumption));
                            if (!rrt) {
                                consumption = Number(consumption) + Number(val.fuleConsumption);
                            }

                        }
                        if (val.fuleConsumptionPaid) {
                            var rrtt = isNaN(Number(val.fuleConsumptionPaid));
                            if (!rrtt) {
                                paidConsumption = Number(paidConsumption) + Number(val.fuleConsumptionPaid)
                            }

                        }
                        if (key === ary.length - 1) {
                            var previousConsumption = Number(consumption) - Number(paidConsumption);

                            dailyConsumption({ pilotID: req.pilotID, travelmod: req.travelmod }, function(consum) {
                                cb({ previousConsumption: previousConsumption, dailyConsum: consum });
                            })
                        }
                    })
                } else {
                    dailyConsumption({ pilotID: req.pilotID, travelmod: req.travelmod }, function(consum) {
                        cb({ previousConsumption: 0, dailyConsum: consum });
                    })

                }
            });

        } else {
            //////Check From Begining//////
            if (pilot.date.getDate() == new Date().getDate()) {
                dailyConsumption({ pilotID: req.pilotID, travelmod: req.travelmod }, function(consum) {
                    cb({ previousConsumption: 0, dailyConsum: consum });
                })
            } else {
                StartTime = moment(pilot.date).utc();
                EndTime = moment().startOf('day').utc();
                database.Carlogbook.find({
                    date: { $gte: StartTime.toDate(), $lte: EndTime.toDate() },
                    pilotID: req.pilotID,
                    travelmod: req.travelmod,
                    loogBookStatus: "complete",
                    DriverType: "preRide"
                }, function(er, logbook) {
                    if (logbook.length > 0) {
                        logbook.forEach(function(val, key, ary) {
                            if (val.fuleConsumption) {
                                consumption = Number(consumption) + Number(val.fuleConsumption);
                            }
                            if (val.fuleConsumptionPaid) {
                                paidConsumption = Number(paidConsumption) + Number(val.fuleConsumptionPaid)
                            }
                            if (key === ary.length - 1) {
                                var previousConsumption = Number(consumption) - Number(paidConsumption);
                                previousConsumption.toFixed(0);
                                dailyConsumption({ pilotID: req.pilotID, travelmod: req.travelmod }, function(consum) {
                                    cb({ previousConsumption: previousConsumption, dailyConsum: consum });
                                })
                            }
                        })
                    } else {
                        dailyConsumption({ pilotID: req.pilotID, travelmod: req.travelmod }, function(consum) {
                            cb({ previousConsumption: 0, dailyConsum: consum });
                        })

                    }
                });

            }


        }

    });
}


function dailyConsumption(req, cb) {
    var consumption = 0;
    var paidConsumption = 0;
    var totalkm = 0;
    var mileage = 0;
    var fulePrice = 0;

    var StartTime = moment().startOf('day').utc();
    var EndTime = moment().endOf('day').utc();
    database.Carlogbook.find({
        date: { $gte: StartTime.toDate(), $lte: EndTime.toDate() },
        pilotID: req.pilotID,
        travelmod: req.travelmod,
        loogBookStatus: "complete",
        DriverType: "preRide"
    }, function(er, logbook) {
        if (logbook.length > 0) {
            logbook.forEach(function(val, key, ary) {
                if (val.fuleConsumption) {
                    if (isNaN(Number(val.fuleConsumption))) {} else {
                        consumption = Number(consumption) + Number(val.fuleConsumption);
                        if (isNaN(Number(val.kmTravels))) {} else {
                            totalkm = Number(totalkm) + Number(val.kmTravels);
                        }
                        mileage = val.enginMilege;
                        fulePrice = val.perltrFulePrice;
                    }
                }
                if (val.fuleConsumptionPaid) {
                    paidConsumption = Number(paidConsumption) + Number(val.fuleConsumptionPaid)
                }
                if (key === ary.length - 1) {
                    var previousConsumption = Number(consumption) - Number(paidConsumption);
                    previousConsumption = previousConsumption.toFixed(0);
                    cb({ dailyConsm: previousConsumption, totalkm: totalkm, mileage: mileage, fulePrice: fulePrice });
                }
            })
        } else {
            cb({ dailyConsm: 0, totalkm: 0, mileage: mileage, fulePrice: fulePrice });
        }
    });
}

function preRideCashDueCalculation(req, cb) {
    var StartTime = "";
    var EndTime = "";
    var CashCollection = 0;
    var payment = 0;
    database.pilot.findOne({ pilotID: req.pilotID }, function(e, pilot) {
        if (pilot.lastCheckDate) {
            /////Check Balance From Last Checking Date
            StartTime = moment(pilot.lastCheckDate).utc();
            EndTime = moment().startOf('day').utc();
            // var todayend = moment().endOf('day').utc();
            database.ride.find({
                date: { $gte: StartTime.toDate(), $lte: EndTime.toDate() },
                pilotID: req.pilotID,
                travelmod: req.travelmod,
                callbookingStatus: "complete",
                DriverType: "preRide"
            }, function(er, balance) {
                if (balance.length > 0) {
                    balance.forEach(function(val, key, ary) {
                        if (val.driverCashCollectio) {
                            CashCollection = Number(CashCollection) + Number(val.driverCashCollectio);
                        }
                        if (val.driverCashDeposit) {
                            payment = Number(payment) + Number(val.driverCashDeposit)
                        }
                        if (key === ary.length - 1) {
                            var previousDue = Number(CashCollection) - Number(payment);
                            dailyCashCollection({ pilotID: req.pilotID, travelmod: req.travelmod }, function(cash) {
                                cb({ previousDue: previousDue, dailyCollection: cash });
                            })
                        }
                    });
                } else {
                    dailyCashCollection({ pilotID: req.pilotID, travelmod: req.travelmod }, function(cash) {
                        cb({ previousDue: 0, dailyCollection: cash });
                    })
                }
            });
        } else {
            /////Check Balance From Starting
            if (pilot.date.getDate() == new Date().getDate()) {
                dailyCashCollection({ pilotID: req.pilotID, travelmod: req.travelmod }, function(cash) {
                    cb({ previousDue: 0, dailyCollection: cash });
                });
            } else {
                StartTime = moment(pilot.date).utc();
                EndTime = moment().startOf('day').utc();
                // var todayend = moment().endOf('day').utc();
                database.ride.find({
                    date: { $gte: StartTime.toDate(), $lte: EndTime.toDate() },
                    pilotID: req.pilotID,
                    travelmod: req.travelmod,
                    callbookingStatus: "complete",
                    DriverType: "preRide"
                }, function(er, balance) {
                    if (balance.length > 0) {
                        balance.forEach(function(val, key, ary) {
                            if (val.driverCashCollectio) {
                                CashCollection = Number(CashCollection) + Number(val.driverCashCollectio);
                            }
                            if (val.driverCashDeposit) {
                                payment = Number(payment) + Number(val.driverCashDeposit)
                            }

                            if (key === ary.length - 1) {
                                var previousDue = Number(CashCollection) - Number(payment);
                                dailyCashCollection({ pilotID: req.pilotID, travelmod: req.travelmod }, function(cash) {
                                    cb({ previousDue: previousDue, dailyCollection: cash });
                                })
                            }
                        });
                    } else {
                        dailyCashCollection({ pilotID: req.pilotID, travelmod: req.travelmod }, function(cash) {
                            cb({ previousDue: 0, dailyCollection: cash });
                        })
                    }

                });
            }

        } /////

    })
}

function dailyCashCollection(req, cb) {
    var CashCollection = 0;
    var payment = 0;
    var StartTime = moment().startOf('day').utc();
    var EndTime = moment().endOf('day').utc();
    database.ride.find({
        date: { $gte: StartTime.toDate(), $lte: EndTime.toDate() },
        pilotID: req.pilotID,
        travelmod: req.travelmod,
        callbookingStatus: "complete",
        DriverType: "preRide"
    }, function(er, balance) {
        if (balance.length > 0) {
            balance.forEach(function(val, key, ary) {
                if (val.driverCashCollectio) {
                    CashCollection = Number(CashCollection) + Number(val.driverCashCollectio);
                }
                if (val.driverCashDeposit) {
                    payment = Number(payment) + Number(val.driverCashDeposit)
                }

                if (key === ary.length - 1) {
                    var cash = Number(CashCollection) - Number(payment);
                    cb(cash);
                }
            });
        } else {
            cb(0);
        }


    });

}


///////PreRide Driver Categori Wise Driver Payout////////
function preRidePayoutlculation(req, cb) {
    var StartTime = "";
    var EndTime = "";
    var kmtravels = 0;
    var payment = 0;
    database.pilot.findOne({ pilotID: req.pilotID }, function(e, pilot) {
        if (pilot.lastpayoutCheckDate) {
            /////Check Balance From Last Checking Date
            StartTime = moment(pilot.lastpayoutCheckDate).utc();
            EndTime = moment().startOf('day').utc();
            // var todayend = moment().endOf('day').utc();
            database.ride.find({
                date: { $gte: StartTime.toDate(), $lte: EndTime.toDate() },
                pilotID: req.pilotID,
                travelmod: req.travelmod,
                callbookingStatus: "complete",
                DriverType: "preRide"
            }, function(er, balance) {
                if (balance.length > 0) {
                    balance.forEach(function(val, key, ary) {
                        if (val.kmtravels) {
                            if (Number(val.kmtravels) > 19) {
                                kmtravels = Number(kmtravels) + (Number(val.kmtravels) * 2);
                            } else {
                                kmtravels = Number(kmtravels) + Number(val.kmtravels);
                            }
                        }
                        if (key === ary.length - 1) {
                            var previousPayout = Number(kmtravels) * Number(pilot.driverpayout);
                            dailyPayout({ pilotID: req.pilotID, travelmod: req.travelmod }, function(km) {
                                var dp = Number(km) * Number(pilot.driverpayout);
                                cb({ previousPayout: previousPayout, dailyPayout: dp });
                            })
                        }
                    });
                } else {
                    dailyPayout({ pilotID: req.pilotID, travelmod: req.travelmod }, function(km) {
                        var dp = Number(km) * Number(pilot.driverpayout);
                        cb({ previousPayout: 0, dailyPayout: dp });
                    })
                }
            });
        } else {
            /////Check Balance From Starting
            if (pilot.date.getDate() == new Date().getDate()) {
                dailyPayout({ pilotID: req.pilotID, travelmod: req.travelmod }, function(km) {
                    var dp = Number(km) * Number(pilot.driverpayout);
                    cb({ previousPayout: 0, dailyPayout: dp });
                });
            } else {
                StartTime = moment(pilot.date).utc();
                EndTime = moment().startOf('day').utc();
                // var todayend = moment().endOf('day').utc();
                database.ride.find({
                    date: { $gte: StartTime.toDate(), $lte: EndTime.toDate() },
                    pilotID: req.pilotID,
                    travelmod: req.travelmod,
                    callbookingStatus: "complete",
                    DriverType: "preRide"
                }, function(er, balance) {
                    if (balance.length > 0) {
                        balance.forEach(function(val, key, ary) {
                            if (val.kmtravels) {
                                if (Number(val.kmtravels) > 19) {
                                    kmtravels = Number(kmtravels) + (Number(val.kmtravels) * 2);
                                } else {
                                    kmtravels = Number(kmtravels) + Number(val.kmtravels);
                                }
                            }
                            if (key === ary.length - 1) {
                                var previousPayout = Number(kmtravels) * Number(pilot.driverpayout);
                                dailyPayout({ pilotID: req.pilotID, travelmod: req.travelmod }, function(km) {
                                    var dp = Number(km) * Number(pilot.driverpayout);
                                    cb({ previousPayout: previousPayout, dailyPayout: dp });
                                })
                            }
                        });
                    } else {
                        dailyPayout({ pilotID: req.pilotID, travelmod: req.travelmod }, function(km) {
                            var dp = Number(km) * Number(pilot.driverpayout);
                            cb({ previousPayout: 0, dailyPayout: dp });
                        })
                    }

                });
            }

        } /////

    })
}

function dailyPayout(req, cb) {
    var kmtravels = 0;
    var StartTime = moment().startOf('day').utc();
    var EndTime = moment().endOf('day').utc();
    database.ride.find({
        date: { $gte: StartTime.toDate(), $lte: EndTime.toDate() },
        pilotID: req.pilotID,
        travelmod: req.travelmod,
        callbookingStatus: "complete",
        DriverType: "preRide"
    }, function(er, balance) {
        if (balance.length > 0) {
            balance.forEach(function(val, key, ary) {
                if (val.kmtravels) {
                    if (Number(val.kmtravels) > 19) {
                        kmtravels = Number(kmtravels) + (Number(val.kmtravels) * 2);
                    } else {
                        kmtravels = Number(kmtravels) + Number(val.kmtravels);
                    }

                }
                if (key === ary.length - 1) {
                    var km = Number(kmtravels);
                    cb(km);
                }
            });
        } else {
            cb(0);
        }


    });

}



/////Pre Ride Dutyh Logon LgoOff//////
router.post('/updateDutylogdetails', function(req, res, next) {
    var dutyhour = Number(req.body.dutyhour) / (1000 * 60 * 60);
    //console.log("dutyhour",dutyhour)
    var StartTime = moment().startOf('day').utc();
    var EndTime = moment().endOf('day').utc();
    database.pilot.findOne({ pilotID: req.body.pilotID }, function(err, pilot) {
        database.DutyLog.find({
            date: { $gte: StartTime.toDate(), $lte: EndTime.toDate() },
            pilotID: pilot.pilotID,
            travelmod: pilot.travelmod
        }, function(err, dutylog) {
            if (dutylog.length > 0) {
                var duty = 0;
                dutylog.forEach(function(val, indx, array) {
                    if (val.dutyHours) {
                        duty = Number(duty) + Number(val.dutyHours)
                    }
                    if (indx === array.length - 1) {
                        var totalduty = Number(duty) + Number(dutyhour);

                        if (Number(totalduty) < 8) {
                            //////save duty////
                            database.DutyLog({
                                pilotID: req.body.pilotID,
                                DriverType: "preRide",
                                travelmod: pilot.travelmod,
                                logonTime: new Date(req.body.loginTime),
                                logOutTime: new Date(req.body.logoutTime),
                                dutyHours: Number(dutyhour),
                                overtimeDutyHours: 0,
                                startlocation: [req.body.strtlat, req.body.strtlng],
                                stoplocation: [req.body.stoplat, req.body.stoplng],
                            }).save(function(err) {
                                res.clearCookie("dutyCount");
                                //console.log("Cookees duration",dutyhour)
                                res.send("update cookes")
                            });
                        } else {
                            ///overtime/////
                            var overt = Number(totalduty) - 8;
                            database.DutyLog({
                                pilotID: req.body.pilotID,
                                DriverType: "preRide",
                                travelmod: pilot.travelmod,
                                logonTime: new Date(req.body.loginTime),
                                logOutTime: new Date(req.body.logoutTime),
                                dutyHours: 0,
                                overtimeDutyHours: overt,
                                startlocation: [req.body.strtlat, req.body.strtlng],
                                stoplocation: [req.body.stoplat, req.body.stoplng],
                            }).save(function(err) {
                                res.clearCookie("dutyCount");
                                //console.log("Cookees duration",dutyhour)
                                res.send("update cookes")
                            });

                        }
                    }
                });
            } else {
                var totalduty = Number(dutyhour);
                if (Number(totalduty) < 8) {
                    //////save duty////
                    database.DutyLog({
                        pilotID: req.body.pilotID,
                        DriverType: "preRide",
                        travelmod: pilot.travelmod,
                        logonTime: new Date(req.body.loginTime),
                        logOutTime: new Date(req.body.logoutTime),
                        dutyHours: Number(dutyhour),
                        overtimeDutyHours: 0,
                        startlocation: [req.body.strtlat, req.body.strtlng],
                        stoplocation: [req.body.stoplat, req.body.stoplng],
                    }).save(function(err) {
                        res.clearCookie("dutyCount");
                        //console.log("Cookees duration",dutyhour)
                        res.send("update cookes")
                    });

                } else {
                    ///overtime/////
                    var overt = Number(totalduty) - 8;
                    database.DutyLog({
                        pilotID: req.body.pilotID,
                        DriverType: "preRide",
                        travelmod: pilot.travelmod,
                        logonTime: new Date(req.body.loginTime),
                        logOutTime: new Date(req.body.logoutTime),
                        dutyHours: 0,
                        overtimeDutyHours: overt,
                        startlocation: [req.body.strtlat, req.body.strtlng],
                        stoplocation: [req.body.stoplat, req.body.stoplng],
                    }).save(function(err) {
                        res.clearCookie("dutyCount");
                        // console.log("Cookees duration",dutyhour)
                        res.send("update cookes")
                    });
                }
            }

        })
    });
})












/////For Neareast PreRide Driver//////
router.post('/nearbyPrerideDriver', function(req, res, next) {
    database.index2Ddriver({}, function(ss) {
        /////Check  Driver for 3KM //////
        database.driverlocation.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [Number(req.body.lng), Number(req.body.lat)]
                    },
                    $maxDistance: 2000
                }
            },
            accountStatus: 'Active',
            preRideAutoOffline: "online",
            travelmod: req.body.travelmod,
            DriverType: req.body.DriverType,
            preRideTotalTime: { $lt: 12 }
        }, function(e, driver3km) {
            if (driver3km.length > 0) {
                res.send({ drivers: driver3km });

            } else {
                /////Check  Driver for 10KM //////
                database.driverlocation.find({
                    location: {
                        $near: {
                            $geometry: {
                                type: "Point",
                                coordinates: [Number(req.body.lng), Number(req.body.lat)]
                            },
                            $maxDistance: 5000
                        }
                    },
                    accountStatus: 'Active',
                    preRideAutoOffline: "online",
                    travelmod: req.body.travelmod,
                    DriverType: req.body.DriverType,
                    preRideTotalTime: { $lt: 15 }
                }, function(e, driver10km) {
                    if (driver10km.length > 0) {
                        res.send({ drivers: driver10km });

                    } else {
                        res.send({ drivers: [] });
                    }
                });

            }
        });



    });

});

/////////Generate Booking ID///////
function GenbookingID(rq, cb) {
    database.rideCounter.findOne({}, function(e, d) {
        if (d) {
            var newId = Number(d.bookingID) + 1;
            database.rideCounter.findOneAndUpdate({ bookingID: d.bookingID }, { $set: { bookingID: newId } }, function(e, dd) {
                cb({ bookingID: newId });
            })
        } else {
            database.rideCounter({ bookingID: 1 }).save(function(er) {
                cb({ bookingID: 1 });
            });
        }
    });
}

////////Start Car LogBook Reading///////
router.post('/startCarLoogbook', function(req, res, next) {
    database.Carlogbook.findOne({ bookingID: req.body.bookingID }, function(er, carlock) {
        if (!carlock) {
            database.pilot.findOne({ pilotID: req.cookies.pilotID }, function(err, pilot) {
                ///var position=JSON.parse(req.cookies.position) ;
                database.driverlocation.findOne({ pilotID: pilot.pilotID }, function(er, driverLoc) {
                    if (driverLoc) {
                        var position = driverLoc.location.coordinates;
                        database.Carlogbook({
                            bookingID: req.body.bookingID,
                            pilotID: pilot.pilotID,
                            travelmod: pilot.travelmod,
                            DriverType: "preRide",
                            startlatlng: [Number(position[1]), Number(position[0])],
                            loogBookStatus: "start"
                        }).save(function(err) {
                            res.send("LoogBook Created");
                        });
                    }

                });
            });
        }
    });
})


router.post('/CarLoogbookClineLocate', function(req, res, next) {
    database.Carlogbook.findOne({ bookingID: req.body.bookingID }, function(er, carlock) {
        if (carlock) {
            database.driverlocation.findOne({ pilotID: req.cookies.pilotID }, function(er, driverLoc) {
                if (driverLoc) {
                    var position = driverLoc.location.coordinates;
                    googleApi.distance({
                        origins: '' + Number(carlock.startlatlng[0]) + ', ' + Number(carlock.startlatlng[1]) + '',
                        destinations: '' + Number(position[1]) + ',' + Number(position[0]) + '',
                        apik: process.env.API_KEY,
                        travelmod: "2"
                    }, function(result) {
                        var distance = result.rows[0].elements[0].distance.value;
                        distance = Number(distance) / 1000;
                        database.Carlogbook.findOneAndUpdate({ bookingID: req.body.bookingID }, {
                            $set: {
                                pickuplatlng: [Number(position[1]), Number(position[0])],
                                pickupDistance: distance
                            }
                        }, function(err, updat) {
                            res.send("ok");
                        });

                    });


                } else {
                    res.send("error")
                }

            });

        }
    });
})


////////Create New Pre Ride Booking/////
router.post('/savePreRideCallAndBooking', function(req, res, next) {
    console.log(req.body)

    ///////Create Bookinng////
    GenbookingID({}, function(NewBookinid) {
        database.ride({
            bookingID: NewBookinid.bookingID,
            CustID: req.body.CustID,
            pilotID: req.body.pilotID,
            DriverType: req.body.DriverType,
            picupaddress: req.body.originAds,
            picuklatlng: [req.body.originLat, req.body.originLng],
            dropaddress: req.body.distAds,
            droplatlng: [req.body.distLat, req.body.distLng],
            kmtravels: req.body.totalDistance,
            totalamount: req.body.totalAmt,
            timefare: req.body.timeFare,
            perMinuteCost: req.body.perMinuteTimeCost,
            paymentBy: req.body.payMode,
            travalTime: Number(req.body.travalTime) + 2,
            callbookingStatus: "Accept",
            driverBusy: "busy",
            preRideOTP: randamNumber(),
        }).save(function(err) {
            //////CUST data////
            database.customer.findOneAndUpdate({ CustID: req.body.CustID }, {
                $set: {
                    orderStage: 'accept',
                    bookingID: NewBookinid.bookingID
                }
            }, function(er, cust) {
                database.pilot.findOne({ pilotID: req.body.pilotID }, function(er, pilot) {
                    var newtotalTime = pilot.preRideTotalTime + Number(req.body.travalTime) + 2
                    database.pilot.findOneAndUpdate({ pilotID: req.body.pilotID }, {
                        $set: {
                            preRideTotalTime: newtotalTime
                        }
                    }, function(er, pil) {
                        ////Requiest for Preride  List refresh/////
                        res.io.emit("refreshPreRideList", { driverBusy: "busy", pilotID: req.body.pilotID });
                        res.io.emit("startRingtone", { play: "1" });
                        res.send("Final order Save");
                    });
                });
            });


        });
    })

});

////PreRide Driver Call Emit//////
router.post('/CallPreRideDriver', function(req, res, next) {
    res.io.emit("preRideinCommingCall", { pilotID: req.body.pilotID, CustID: req.body.CustID });
    res.send('ReqEmited');
});


////////Call Driver accept notification/////
router.post('/preRideAutoAccepeCall', function(req, res, next) {
    console.log('incomecalldetails', req.body)
    res.io.emit("PreRideDriverAccepeCall", { pilotID: req.body.pilotID, CustID: req.body.CustID });
    res.send("emited Call Accept by driver");
});

/////CHECK EXISTING PRE RIDE CALL DETAILS/////
router.post('/existingPrerideCall', function(req, res, next) {
    var Record = [];
    var count = 0;
    var countArray = [];
    console.log("req Body:", req.body)
    database.ride.find({ pilotID: req.body.pilotID, driverBusy: req.body.driverBusy, DriverType: "preRide" }, function(err, data) {
        console.log("data:", data)
        if (data.length < 1) {
            database.pilot.findOneAndUpdate({ pilotID: req.body.pilotID }, { $set: { preRideTotalTime: 0.01 } }, function(er, pi) {})
        }
        data.forEach(function(val, i, ar) {
            count++;
            gatherRecord({ val: val, count: count }, function(result) {
                Record.push(result.out);
                countArray.push(result.count);
                console.log("countArray.length", countArray.length)
                console.log("ar.length", ar.length)

                if (countArray.length == ar.length) {
                    res.send(Record);
                }
            })
        })
    });

    function gatherRecord(req, cb) {
        database.customer.findOne({ CustID: req.val.CustID }, function(er, cust) {
            var out = {
                CustID: cust.CustID,
                mobileNumber: cust.mobileNumber,
                isdCode: cust.isdCode,
                name: cust.name,
                picuklatlng: req.val.picuklatlng,
                droplatlng: req.val.droplatlng,
                picupaddress: req.val.picupaddress,
                dropaddress: req.val.dropaddress,
                callbookingStatus: req.val.callbookingStatus,
                pilotID: req.val.pilotID,
                preRideOTP: req.val.preRideOTP,
                bookingID: req.val.bookingID
            }
            cb({ out: out, count: req.count });

        })
    }

});


/////PRE RIDE FULE PRICE AND CITY UPDATE/////
router.post('/preRideCityFulepriceUpdate', function(req, res, next) {
    database.pilot.findOne({ pilotID: req.body.pilotID }, function(err, data) {
        if (data.cityName) {
            database.petroldesel.findOne({ cityName: data.cityName }, function(e, petrol) {
                if (data.vichelEnginType == "Petrol") {
                    var fulePrice = petrol.petrolPerLtr;
                } else {
                    if (data.vichelEnginType == "Diesel") {
                        var fulePrice = petrol.deselPerLtr;
                    } else {
                        /////cng///////
                        var fulePrice = petrol.cngPrice;
                    }
                }
                database.pilot.findOneAndUpdate({ pilotID: req.body.pilotID }, {
                    $set: {
                        fulePrice: fulePrice
                    }
                }, function(err, da) {
                    res.send("Fule Price Update");
                });


            })
        } else {
            res.send("0");
        }
    })

});

/////PRE RIDE PAGEDEMAND CALL INITIATE/////
router.post('/demandCallInitiate', function(req, res, next) {
    database.ride.findOne({
        pilotID: req.body.pilotID,
        driverBusy: req.body.driverBusy,
        DriverType: "preRide",
        demandCall: req.body.demandCall
    }, function(err, data) {
        res.send(data);
    })

})

/////PRE RIDE PAGE INITIATE/////
router.post('/preRidePageInitiate', function(req, res, next) {
    var Record = [];
    var count = 0;
    var countArray = [];
    console.log("req Body:", req.body)
    database.ride.find({ pilotID: req.body.pilotID, driverBusy: req.body.driverBusy, DriverType: "preRide" }, function(err, data) {
        console.log("data:", data)
        if (data.length < 1) {
            database.pilot.findOneAndUpdate({ pilotID: req.body.pilotID }, { $set: { preRideTotalTime: 0.01 } }, function(er, pi) {})
        }
        data.forEach(function(val, i, ar) {
            count++;
            gatherRecord({ val: val, count: count }, function(result) {
                Record.push(result.out);
                countArray.push(result.count);
                console.log("countArray.length", countArray.length)
                console.log("ar.length", ar.length)

                if (countArray.length == ar.length) {
                    res.send(Record);
                }
            })
        });
    });

    function gatherRecord(req, cb) {
        database.customer.findOne({ CustID: req.val.CustID }, function(er, cust) {
            var out = {
                CustID: cust.CustID,
                mobileNumber: cust.mobileNumber,
                isdCode: cust.isdCode,
                name: cust.name,
                picuklatlng: req.val.picuklatlng,
                droplatlng: req.val.droplatlng,
                picupaddress: req.val.picupaddress,
                dropaddress: req.val.dropaddress,
                callbookingStatus: req.val.callbookingStatus,
                pilotID: req.val.pilotID,
                preRideOTP: req.val.preRideOTP,
                bookingID: req.val.bookingID,
                driverCashCollectio: req.val.driverCashCollectio
            }
            cb({ out: out, count: req.count });

        })
    }

});




//////////Update Driver Duty initiate//////
// router.post('/preRideDutyInitiate', function(req, res, next) { 
//       database.driverlocation.deleteMany({pilotID:req.cookies.pilotID},function(e, ddd){
//         console.log("delete Driver Location")
//         res.send(req.body.duty);
//       });
// });

//////////Driver preRide Cline Located //////
router.post('/clinelocateDistance', function(req, res, next) {
    //console.log("Test location",req.body)
    database.driverlocation.findOne({ pilotID: req.cookies.pilotID }, function(err, driverLoc) {
        var dlocation = driverLoc.location.coordinates;
        googleApi.manualDistance({
            origin: [Number(dlocation[1]), Number(dlocation[0])],
            dist: [Number(req.body.picklat), Number(req.body.picklng)]
        }, function(data) {
            //console.log("test distance",data);
            res.send({ distance: data, travelmod: driverLoc.travelmod });
        });
    })

})




router.post('/preRideClinelocated', function(req, res, next) {
    database.ride.findOneAndUpdate({ bookingID: req.body.bookingID }, { $set: { callbookingStatus: 'clineLocate' } }, function(re, ou) {
        res.io.emit("clinelocated", { CustID: req.body.CustID });
        res.send("emitClinelocated")
    });

})



//////Start Pre Ride/////////////
router.post('/preRideStartRide', function(req, res, next) {
    database.customer.findOneAndUpdate({ CustID: req.body.CustID }, { $set: { orderStage: 'startRide' } }, function(er, cust) {
        database.ride.findOneAndUpdate({ bookingID: req.body.bookingID }, { $set: { callbookingStatus: 'startRide', startTime: new Date() } }, function(re, ou) {
            res.io.emit("StartRide", { CustID: req.body.CustID });
            res.send("emitStartRide")
        });

    });
    //res.send("emitStartRide") 

})




//////////Finish Pre Ride //////
//  var endTime=new Date();
//  var aa=moment().utc().toDate();
//  console.log("endTime",endTime);
//  console.log("moment",aa);
//  var dd=aa.getTime();
//  var cc=endTime.getTime();
// console.log("UTC",dd);
// console.log("enct",cc);
// console.log(dd-cc)

router.post('/preRideFinish', function(req, res, next) {
    database.pilot.findOne({ pilotID: req.cookies.pilotID }, function(re, driver) {
        database.customer.findOne({ CustID: req.body.CustID }, function(re, cust) {
            database.ride.findOne({ bookingID: req.body.bookingID }, function(re, booking) {
                database.Carlogbook.findOne({ bookingID: req.body.bookingID }, function(err, carlog) {
                    ///////Total Travel TimeFare//////
                    var endTime = new Date();
                    var travelmod = driver.travelmod;
                    var totalTime = endTime.getTime() - moment(booking.startTime).utc().toDate().getTime();
                    totalTime = parseInt(totalTime / (1000 * 60)) + 1;
                    var holdingOverStayCharge=0;
                    var holdingTime=0;
                    var holdingOverStayTime=Number(totalTime) - Number(booking.travalTime);
                    
                    if(holdingOverStayTime > 10 && holdingOverStayTime < 120){
                        holdingOverStayCharge= (Number(holdingOverStayTime)-10) * 1;
                        holdingTime=holdingOverStayTime;
                    }else{
                        if(holdingOverStayTime > 120){
                            holding= (Number(holdingOverStayTime)-120) * 3;
                            holdingOverStayCharge=110 + Number(holding);
                            holdingTime=holdingOverStayTime;
                        } 
                    }

                    holdingTime=Number(holdingTime).toFixed(2);
                    holdingOverStayCharge=Number(holdingOverStayCharge).toFixed(2);
                 
                    //////Total fuel Cost///////////
                    var fuleConsumption = 0;
                    var fuelDistance = 0
                    if (carlog.pickupDistance) {
                        fuelDistance = Number(carlog.pickupDistance) + Number(booking.kmtravels);
                    } else {
                        fuelDistance = Number(booking.kmtravels);
                    }

                    if (fuelDistance <= 0) {
                        fuelDistance = 1;
                    }
                    if (driver.enginMilege) {
                        fuleConsumption = (Number(driver.fulePrice) / Number(driver.enginMilege)) * Number(fuelDistance);
                    }

                    /////Update Carlog /////////             
                    database.Carlogbook.findOneAndUpdate({ bookingID: booking.bookingID }, {
                        $set: {
                            droplatlng: [Number(booking.droplatlng[0]), Number(booking.droplatlng[1])],
                            dropDistance: booking.kmtravels,
                            kmTravels: fuelDistance,
                            perltrFulePrice: driver.fulePrice,
                            enginMilege: driver.enginMilege,
                            fuleConsumption: fuleConsumption,
                            loogBookStatus: "complete",
                            DriverType:"preRide", 
                            driverCetegory:driver.driverCetegory,
                            CityName:cust.CityName,
                            branchName:cust.branchName,
                            pilotID:driver.pilotID
                        }
                    }, function(err, updat) {
                        console.log("logbook Update");
                    })
                    var spacelDiscount = 0;
                    if (cust.spacelDiscount) {
                        spacelDiscount = Number(cust.spacelDiscount);
                    }
                    var billAmount = Number(booking.totalamount) + Number(booking.timefare) + Number(holdingOverStayCharge) - Number(spacelDiscount);
                   
                    ////////Save and Update Finish////////
                    database.customer.findOneAndUpdate({ CustID: req.body.CustID }, { $set: { orderStage: 'finishRide' } }, function(er, cust) {
                        database.pilot.findOneAndUpdate({ pilotID: req.cookies.pilotID }, { $set: { orderStage: 'finishRide' } }, function(re, driver) {
                            database.ride.findOneAndUpdate({ bookingID: req.body.bookingID }, {
                                $set: {
                                    driverFuelConsumtion: fuleConsumption,
                                    totalTime: totalTime,
                                    spacelDiscount: spacelDiscount,
                                    travelmod: travelmod,
                                    holdingOverStayTime:holdingTime,
                                    holdingOverStayCharge:holdingOverStayCharge,
                                    CityName:cust.CityName,
                                    branchName:cust.branchName
                                }
                            }, function(er, updatbooking) {
                                if (updatbooking) {
                                    //////Wallet Update ////
                                    if (Number(updatbooking.paymentBy) == 2) {
                                        var walletAmt = Number(cust.walletBalance) - billAmount;
                                        database.customer.findOneAndUpdate({ CustID: req.body.CustID }, { $set: { walletBalance: walletAmt } }, function(er, cu) {
                                            res.io.emit("finishRide", { CustID: req.body.CustID });
                                            res.send({ billAmount: 0 });
                                        });
                                    } else {
                                        if (Number(updatbooking.paymentBy) == 3) {
                                            var buykmAmt = Number(cust.BuyKM) - Number(booking.kmtravels);
                                            database.customer.findOneAndUpdate({ CustID: req.body.CustID }, { $set: { BuyKM: buykmAmt } }, function(er, n) {
                                                res.io.emit("finishRide", { CustID: req.body.CustID });
                                                res.send({ billAmount: 0 });
                                            });
                                        } else {
                                            database.ride.findOneAndUpdate({ bookingID: req.body.bookingID }, { $set: { driverCashCollectio: billAmount } }, function(er, cash) {
                                                res.io.emit("finishRide", { CustID: req.body.CustID });
                                                res.send({ billAmount: billAmount });
                                            });
                                        }
                                    }

                                }
                            });
                        });
                    });
                });
            });
        });
    });

});
////////// GET PRE RIDE DRIVER LOCATION////////
router.post('/preRideGetDriverLocation', function(req, res, next) {
    database.driverlocation.findOne({ pilotID: req.cookies.pilotID }, function(er, driverLoc) {
        if (driverLoc) {
            var finishLocation = driverLoc.location.coordinates;
            res.send({ lat: Number(finishLocation[1]), lng: Number(finishLocation[0]), accuracy: driverLoc.accuracy });
        }

    })
});

router.post('/finishandUpdateRide', function(req, res, next) {
    database.ride.findOneAndUpdate({ bookingID: req.body.bookingID }, {
        $set: {
            callbookingStatus: "complete",
            driverBusy: ""
        }
    }, function(err, data) {
        console.log("test Log", data)
        res.send("kk");
        //database.pilot.findOne({pilotID:req.cookies.pilotID},function(e, driver){
        // database.Carlogbook.findOne({bookingID:req.body.bookingID},function(err,carLog){          
        //   var distance=Number(carLog.pickupDistance) + Number(carLog.dropDistance);
        //   if(distance <= 0){
        //     distance=1;
        //   }
        //   var fuleConsumption=0;
        //  if(driver.enginMilege){ 

        //         fuleConsumption=(Number(driver.fulePrice)/ Number(driver.enginMilege))*Number(distance);

        //     } 
        //  database.Carlogbook.findOneAndUpdate({bookingID:req.body.bookingID},{$set:{          
        //   kmTravels:distance,
        //   perltrFulePrice:driver.fulePrice,
        //   enginMilege:driver.enginMilege,
        //   fuleConsumption:fuleConsumption,          
        //   loogBookStatus:"complete",
        // }},function(e, d){
        //   res.send("kk");
        //  })

        // });
        //});
    });
});

///////Ride Cancle By Pre Ride Driver//////
router.post('/cancelOrderByPreDriver', function(req, res, next) {
    database.ride.findOneAndUpdate({ bookingID: req.body.bookingID }, {
        $set: {
            callbookingStatus: "CalcelByDriver",
            driverBusy: ""
        }
    }, function(err, ride) {
        database.pilot.findOne({ pilotID: ride.pilotID }, function(re, driver) {
            if (driver) {
                var newTotaltime = Number(driver.preRideTotalTime) - Number(ride.travalTime);
                database.pilot.findOneAndUpdate({ pilotID: ride.pilotID }, {
                    $set: {
                        preRideTotalTime: newTotaltime
                    }
                }, function(e, dddddd) {
                    ///////Delete Car logbook record /////
                    database.Carlogbook.deleteMany({ bookingID: req.body.bookingID }, function(e, d) {
                        database.customer.findOneAndUpdate({ CustID: ride.CustID }, {
                            $set: {
                                orderStage: "",
                                bookingID: "",
                                pickuplatlong: [],
                                picuplocation: "",
                                droplatlong: [],
                                droplocation: ""
                            }
                        }, function(e, data) {
                            res.io.emit("OrderCancelByDriver", { CustID: ride.CustID });
                            res.send("ok");
                        })

                    })
                });
            }

        });
    });
});


////// Update Customer City/////////////
router.post('/updateCustomerCityName', function(req, res, next) {
    googleApi.SearchGeoCodePlaceByLatLng({
        lat: Number(req.body.lat),
        lng: Number(req.body.lng),
        //lat:Number(22.8895),
        //lng:Number(88.4220),
        apik: process.env.API_KEY,
    }, function(data) {
        console.log(data)
        if(data.status=='OK'){
            var cityNameFind='';
            data.results[0].address_components.forEach(function(val,indx,ary){ 
                if (val.types[0] == 'administrative_area_level_2') {
                    cityNameFind=val.long_name;
                    //console.log("city Mame",val.long_name)
                }
                if(indx===ary.length - 1){
                    if(cityNameFind){
                        database.cityPrice.findOne({ CityName: cityNameFind }, function(er, city) {
                            if(city){
                                database.customer.findOneAndUpdate({ CustID: req.cookies.CustID },{
                                    CityName:cityNameFind,
                                    branchName:city.branchName
                                },function(er,data){
                                    res.send({msg:"ok",CityName:val.long_name})
                                });
                            }else{
                                database.customer.findOneAndUpdate({ CustID: req.cookies.CustID },{
                                    CityName:cityNameFind
                                },function(er,data){
                                    if(req.cookies.CustID==1003){

                                    }else{
                                        res.send({msg:"Right Now, Paa Cabs Service is not Available in this City"});
                                    }
                                    
                                });
                                
                               
                            }
        
                        })

                    }else{
                        ///////Due to Error put Default Value City////////// 
                        database.customer.findOneAndUpdate({ CustID: req.cookies.CustID },{
                            CityName:'Kolkata',
                            branchName:'West Bengal'
                        },function(er,data){
                            res.send({msg:"ok"})
                        });

                    }
                }
            });
        }else{
            ///////Due to Error put Default Value City////////// 
            database.customer.findOneAndUpdate({ CustID: req.cookies.CustID },{
                CityName:'Kolkata',
                branchName:'West Bengal'
            },function(er,data){
                res.send({msg:"ok"})
            });

        }
    });
})


//////////Update City Price/////////
// router.post('/preRideUpdateCitywisePrice', function(req, res, next) {
//     googleApi.SearchGeoCodePlaceByLatLng({
//         lat: Number(req.body.lat),
//         lng: Number(req.body.lng),
//         //lat:Number(22.8895),
//         //lng:Number(88.4220),
//         apik: process.env.API_KEY,
//     }, function(data) {
//         //console.log("City Name", data.results[0]);

//         data.results[0].address_components.forEach(function(val) {
//             if (val.types[0] == 'administrative_area_level_2') {
//                 database.cityPrice.find({ CityName: val.long_name }, function(er, city) {
//                     database.customer.findOne({ CustID: req.cookies.CustID }, function(ee, cust) {
//                         if (cust) {
//                             generalPriceperKm = cust.generalPriceperKm;
//                             generalMinimumprice = cust.generalMinimumprice;
//                             generalMinimumKm = cust.generalMinimumKm;
//                             generalBasePrice = cust.generalBasePrice;
//                             preRidePriceperKm = cust.preRidePriceperKm;
//                             preRideperMinutCharge = cust.preRideperMinutCharge;
//                             GenarelPerMinutCharge = cust.GenarelPerMinutCharge;
//                             shereRide = cust.shereRide;
//                             shereRideCapacity = cust.shereRideCapacity
//                             driverPayout = cust.driverPayout;

//                             city.forEach(function(value, kk, array) {
//                                 var key = Number(value.travelMode) - 1;
//                                 generalPriceperKm[key] = Number(value.PerKMPrice);
//                                 generalMinimumprice[key] = Number(value.minimumPricePer);
//                                 generalMinimumKm[key] = Number(value.minimumKM);
//                                 generalBasePrice[key] = Number(value.basePrice);
//                                 preRidePriceperKm[key] = Number(value.preRidekmprice);
//                                 preRideperMinutCharge[key] = Number(value.preRideperMinutCharge);
//                                 GenarelPerMinutCharge[key] = Number(value.GenarelPerMinutCharge);
//                                 shereRide[key] = Number(value.shareRide);
//                                 shereRideCapacity[key] = Number(value.shereRideCapacity)
//                                 driverPayout[key] = Number(value.driverpayout)

//                                 if (kk === array.length - 1) {
//                                     console.log("preRidePriceperKm", shereRide)
//                                     database.customer.findOneAndUpdate({ CustID: req.cookies.CustID }, {
//                                         $set: {
//                                             generalPriceperKm: generalPriceperKm,
//                                             generalMinimumprice: generalMinimumprice,
//                                             generalMinimumKm: generalMinimumKm,
//                                             generalBasePrice: generalBasePrice,
//                                             preRidePriceperKm: preRidePriceperKm,
//                                             preRideperMinutCharge: preRideperMinutCharge,
//                                             GenarelPerMinutCharge: GenarelPerMinutCharge,
//                                             shereRide: shereRide,
//                                             shereRideCapacity: shereRideCapacity,
//                                             driverPayout: driverPayout,
//                                             lastPriceCityCheckDate: new Date(),
//                                             CityName:val.long_name,
//                                         }
//                                     }, function(e, d) {
//                                         res.send("price Update")
//                                     });

//                                 }
//                             })

//                         }
//                     });

//                 });

//             }
//         });
//     });


// })




////////InDRIVER BACGROUND LOCATION UPDATE IN  NATIVE DEDICE////
router.get('/driverBacgroundService', function(req, res, next) {
    if (req.cookies.pilotID) {
        res.render('india/inDriverBackGroundService', { YOUR_API_KEY: process.env.API_KEY })
    }
});

////////PRE RIDE BACGROUND LOCATION UPDATE IN  NATIVE DEDICE////
router.get('/preRideBacgroundService', function(req, res, next) {
    if (req.cookies.pilotID) {
        res.render('india/inPreDriverBackGroundService', { YOUR_API_KEY: process.env.API_KEY })
    }
});

//////For ANDROID//////
router.post('/locationUpdate', function(req, res, next) {
    console.log("Android Respons", req.body);
    res.status(200).send();
});
router.post('/checkbooking', function(req, res, next) {
    console.log("Android Respons", req.body);
    database.ride.find({ pilotID: req.body.pilotid, driverBusy: "busy", DriverType: "preRide" }, function(err, data) {
        if (data.length > 0) {
            res.status(404).send();
        } else {
            database.pilot.findOne({ pilotID: req.body.pilotid }, function(err, pilot) {
                // if (pilot.driverCetegory) {
                //     if (pilot.driverCetegory == "1") {
                //         res.status(404).send();
                //     } else {
                //         res.status(200).send();
                //     }
                // } else {
                    res.status(200).send();

                //}
            });

        }
    });


});

////////DriverLocationUpdate/////////
router.post('/driverLocationUpdate', function(req, res, next) {
    res.cookie("position", JSON.stringify({ lat: req.body.lat, lng: req.body.lng, accuracy: req.body.accuracy }), { maxAge: 30 * 24 * 60 * 60 * 1000 });
    if (req.cookies.driverBusy) {
        var driverBusy = req.cookies.driverBusy;
    } else {
        var driverBusy = "Free";
    }
    //res.io.emit("testgps",{lat:req.body.lat, lng:req.body.lng, accuracy:req.body.accuracy});
    database.pilot.findOne({ pilotID: req.cookies.pilotID }, function(err, pilot) {
        if (pilot) {
            database.driverlocation.findOne({ pilotID: req.cookies.pilotID }, function(err, data) {
                if (data) {
                    database.driverlocation.findOneAndUpdate({ pilotID: req.cookies.pilotID }, {
                        $set: {
                            pilotID: req.cookies.pilotID,
                            DriverType: req.body.DriverType,
                            driverBusy: driverBusy,
                            rating: pilot.rating,
                            travelmod: pilot.travelmod,
                            accountStatus: pilot.accountStatus,
                            preRideTotalTime: pilot.preRideTotalTime,
                            accuracy: req.body.accuracy,
                            cityName: pilot.cityName,
                            location: { type: 'Point', coordinates: [req.body.lng, req.body.lat] },
                        }
                    }, function(er, dd) {

                        res.send(req.body)

                    });
                } else {
                    database.driverlocation({
                        pilotID: req.cookies.pilotID,
                        DriverType: req.body.DriverType,
                        driverBusy: driverBusy,
                        ringtone: "0",
                        preRideAutoOffline: "online",
                        rating: pilot.rating,
                        travelmod: pilot.travelmod,
                        accountStatus: pilot.accountStatus,
                        preRideTotalTime: pilot.preRideTotalTime,
                        accuracy: req.body.accuracy,
                        cityName: pilot.cityName,
                        location: { type: 'Point', coordinates: [req.body.lng, req.body.lat] },
                    }).save(function(err) {
                        res.send(req.body)
                    })
                }
            });

        }
    });

});

/////Pre ride withdrawal/////////
router.post('/withdrawal', function(req, res, next) {

    database.pilot.findOne({ pilotID: req.body.pilotID }, function(er, pilot) {
        /////Find Old withdrawal/////////
        database.DriverPayment.find({ pilotID: pilot.pilotID, travelmod: pilot.travelmod, DriverType: "preRide", typeOfReqest: "preDriverWidthral" }, function(err, withdrawal) {
            database.DriverPayment({
                pilotID: pilot.pilotID,
                travelmod: pilot.travelmod,
                DriverType: "preRide",
                Withdrawal: Number(req.body.withdrawlAmount),
                WithdrawalReqestStatus: "Initiate",
                typeOfReqest: req.body.typeOfReqest,
                name: pilot.name,
                accountno: pilot.bankAccountNo,
                ifsc: pilot.ifsc
            }).save(function(err) {
                //var lastCheckCashCollcetion= Number(pilot.lastCheckCashCollcetion) + Number(req.body.withdrawlAmount);
                database.pilot.findOneAndUpdate({ pilotID: pilot.pilotID }, { $set: { lastCheckCashCollcetion: 0, lastCheckFuleconsumption: 0, lastpayoutAmount: 0 } }, function(eerr, dd) {
                    res.render('india/inPreDriverWithdrawal', { oldwithdrawal: withdrawal, newReq: req.body, pilot: pilot })
                })
            });
        }).sort({ 'date': -1 }).limit(5);
    });

});


/////Duty Hours Control////////////
router.post('/dutyhoursControl', function(req, res, next) {
    database.pilot.findOne({ pilotID: req.cookies.pilotID }, function(err, pilot) {
        if (pilot) {
            database.ride.find({ pilotID: pilot.pilotID, driverBusy: "busy", DriverType: "preRide" }, function(err, ride) {
                var timeHours = req.body.timeHours;

                console.log("timeHours", timeHours);
                console.log("pilot.dutyStart", pilot.dutyStart, "pilot.breakStart", pilot.breakStart)
                if (Number(timeHours) >= Number(pilot.dutyStart) && Number(timeHours) < Number(pilot.breakStart)) {
                    res.send({ Status: "online", noofBooking: ride.length });
                } else {
                    if (Number(timeHours) >= Number(pilot.BreakEnd) && Number(timeHours) < Number(pilot.dutyEnd)) {
                        res.send({ Status: "online", noofBooking: ride.length });
                    } else {
                        if (Number(timeHours) >= Number(pilot.dutyEnd) && Number(timeHours) < Number(pilot.ovretimeEnd)) {
                            res.send({ Status: "online", noofBooking: ride.length });
                        } else {
                            database.driverlocation.findOneAndUpdate({ pilotID: pilot.pilotID, DriverType: "preRide" }, { $set: { preRideAutoOffline: "offline" } }, function(err, ddd) {
                                res.send({ Status: "offline", noofBooking: ride.length });
                            })

                        }
                    }
                }
            });
        }
    });
});

///////Incentive Calculation///////
router.post('/incentiveCalculation', function(req, res, next) {
    database.pilot.findOne({ pilotID: req.cookies.pilotID }, function(err, pilot) {
        if (pilot) {
            totalKMofMonth({
                pilotID: pilot.pilotID,
                travelmod: pilot.travelmod,
                month: req.body.month
            }, function(km) {
                res.send({ km: km });
            })
        }
    });

});

function totalKMofMonth(req, cb) {
    var StartTime = moment().month(req.month).startOf('month').utc();
    var EndTime = moment().month(req.month).endOf('month').utc();
    var totalkm = 0;
    database.ride.find({
        date: { $gte: StartTime.toDate(), $lte: EndTime.toDate() },
        pilotID: req.pilotID,
        travelmod: req.travelmod,
        callbookingStatus: "complete",
        DriverType: "preRide"
    }, function(er, rideKM) {
        if (rideKM.length > 0) {
            rideKM.forEach(function(val, key, ary) {
                if (val.kmtravels) {
                    totalkm = Number(totalkm) + Number(val.kmtravels)
                }
                if (key === ary.length - 1) {
                    cb(totalkm);
                }
            })
        } else {
            cb(0);



        }

    })
}


///////////////////////////////////////
///* END PRE DRIVER LISTING. */////////
///////////////////////////////////////


///////////////////////////////////////
///* TIME INSENTIVE DRIVER PAGE . *//////
///////////////////////////////////////


router.get('/tdrv', function(req, res, next) {
    var dd = "";
    if (req.cookies.pilotID) {
        database.pilot.findOne({ completereg: 'done', pilotID: req.cookies.pilotID }, function(err, data) {
            console.log(req.cookies.pilotID)
            if (data) {
                res.render('india/inTdriver', { YOUR_API_KEY: process.env.API_KEY, driver: data });
            } else {
                database.pilot.findOne({ pilotID: req.cookies.pilotID }, function(err, driver) {
                    if (req.query.reg) {
                        dd = req.query.reg;
                    }
                    res.render('india/inTdriverRegContinue', { driver: driver, submitvar: dd });
                });

            }

        });

    } else {
        res.redirect('/india/tdrv/login')
    }
})

///////////Login//////////
router.get('/tdrv/login', function(req, res, next) {
    var d = "";
    if (req.query.reg) {
        d = req.query.reg;
    }

    if (req.cookies.pilotID) {
        res.redirect('/india/tdrv')
    } else {
        res.render('india/inTdriverLogin', { msg: "", reg: d });
    }
})

router.post('/tdrv/login', function(req, res, next) {
    database.pilot.findOne({ mobileNumber: req.body.mobile, isdCode: '+91' }, function(err, data) {
        if (data) {
            bcrypt.compare(req.body.password, data.password, function(err, pass) {
                console.log(pass)
                if (pass) {
                    res.cookie("pilotID", data.pilotID, { maxAge: 30 * 24 * 60 * 60 * 1000 });
                    /////check Prise manager///////          
                    res.redirect('/india/tdrv')
                } else {
                    //////Worng Password//////
                    res.render('india/inTdriverLogin', { msg: "Worng Password Not Match ", reg: "" });
                }
            });
        } else {
            res.render('india/inTdriverLogin', { msg: "Mobile Number not Exist Register Now", reg: "" });
        }
    });

})

////////Logout /////////////
router.get('/tdrv/logout', function(req, res, next) {
    res.clearCookie("pilotID");
    res.redirect('../../tdrive')

});
//////////New Driver Reg//////////
router.get('/tdrv/reg', function(req, res, next) {
    res.render('india/inTdriverReg', { msg: "", reg: "1" });
})

router.get('/tdrv/reg/otp', function(req, res, next) {
    res.redirect('/india/tdrv/reg')
})

router.post('/tdrv/reg/otp', function(req, res, next) {
    var otp = randamNumber();
    database.pilot.findOne({ mobileNumber: req.body.mobile, isdCode: '+91' }, function(err, pilot) {
        if (!pilot) {
            // console.log("OTP", otp)
            // res.render('india/inTdriverReg',{msg:"",reg:"2", otp:otp, mobile:req.body.mobile});
            smsotp.otpsend({
                apikey: process.env.OTP2KEY,
                mobileno: "+91" + req.body.mobile + "",
                otp: "" + otp + ""
            }, function(data) {
                // console.log(data);
                // res.send(data); 
                if (data.Status == 'Success') {
                    res.render('india/inTdriverReg', { msg: "", reg: "2", otp: otp, mobile: req.body.mobile });
                } else {
                    res.render('india/inTdriverReg', { msg: data.Details, reg: "1" });
                }
            })
        } else {
            res.render('india/inTdriverReg', { msg: "Driver Alredy Register With Us ", reg: "1" });
        }
    })
})

router.get('/tdrv/reg/otpverify', function(req, res, next) {
    res.redirect('/india/tdrv/reg')
})

router.post('/tdrv/reg/otpverify', function(req, res, next) {
    if (req.body.otp == req.body.otp1) {
        res.render('india/inTdriverReg', { msg: "", reg: "3", mobile: req.body.mobile, latlng: JSON.parse(req.cookies.reglatlng) });
    } else {
        res.render('india/inTdriverReg', { msg: "OTP Mismactch", reg: "2", otp: req.body.otp, mobile: req.body.mobile });
    }

})


router.post('/tdrv/driverReg', function(req, res, next) {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        database.pilot({
            name: req.body.name,
            email: req.body.email,
            password: hash,
            mobileNumber: req.body.mobile,
            isdCode: '+91',
            pilotRating: '0',
            preRideTotalTime: 0,
            latlong: [Number(req.body.lat), Number(req.body.lng)]
        }).save(function(err) {
            res.redirect('/india/tdrv/login?reg=regSuccess');
        });
    });

})



///////Continue Tdriver Registration process////////
async function imgresizer(file, url, w, h) {
    try {
        await sharp(file)
            .resize(Number(w), Number(h))
            .toFile(url, (err, info) => {
                if (err) {
                    console.log(err)
                }

            });
    } catch (err) {
        console.log(err);
    }
}

var cpUpload = upload.fields([
    { name: 'file1', maxCount: 1 },
    { name: 'file2', maxCount: 1 },
    { name: 'file3', maxCount: 1 },
    { name: 'file4', maxCount: 1 },
    { name: 'file5', maxCount: 1 },
    { name: 'file6', maxCount: 1 }
])
router.post('/tdrv/completeReg', cpUpload, async function(req, res, next) {
    
    if (req.files.file1) {
       // var urlphoto = 'driverDocument/photo' + req.body.mobile + '1' + req.files.file1[0].originalname + '';
        var url = req.files.file1[0].transforms[0].location;
        //var urlid='public/india/driverDocument/id'+req.body.mobile+'1'+id.name+'';
        // await imgresizer(req.files.file1[0].buffer, url, 720, 720)
        await database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
            $set: {
                photo: url
            }
        }, function(e, d) {
            //console.log("test ok",url)
            //console.log(req.body)
            //res.redirect('/india/tdrv?reg=submit')
            //res.send(JSON.stringify(req.files.file1[0].transforms[0].location))
        });
    }
    
    if (req.files.file2) {
        //var urlid = 'driverDocument/id' + req.body.mobile + '1' + req.files.file2[0].originalname + ''
        var url = req.files.file2[0].transforms[0].location;
        //var urlid='public/india/driverDocument/id'+req.body.mobile+'1'+id.name+'';
        //await imgresizer(req.files.file2[0].buffer, url, 1280, 720)
        await database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
            $set: {
                Idproof: url
            }
        }, function(e, d) {});
    }
    if (req.files.file3) {
        //var urldl = 'driverDocument/dl' + req.body.mobile + '1' + req.files.file3[0].originalname + ''
        var url = req.files.file3[0].transforms[0].location;
        //var urlid='public/india/driverDocument/id'+req.body.mobile+'1'+id.name+'';
        //await imgresizer(req.files.file3[0].buffer, url, 1280, 720)
        await database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
            $set: {
                dl: url
            }
        }, function(e, d) {});
    }

    if (req.files.file4) {
        //var urlrto = 'driverDocument/rto' + req.body.mobile + '1' + req.files.file4[0].originalname + ''
        var url = req.files.file4[0].transforms[0].location;
        //var urlid='public/india/driverDocument/id'+req.body.mobile+'1'+id.name+'';
        //await imgresizer(req.files.file4[0].buffer, url, 1280, 720)
        await database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
            $set: {
                rto: url
            }
        }, function(e, d) {});
    }

    if (req.files.file5) {
       // var urlinsu = 'driverDocument/insurance' + req.body.mobile + '1' + req.files.file5[0].originalname + ''
        var url = req.files.file5[0].transforms[0].location;
        //var urlid='public/india/driverDocument/id'+req.body.mobile+'1'+id.name+'';
        //await imgresizer(req.files.file5[0].buffer, url, 1280, 720)
        await database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
            $set: {
                insurence: url
            }
        }, function(e, d) {});
    }

    if (req.files.file6) {
        //var urlpolu = 'driverDocument/polution' + req.body.mobile + '1' + req.files.file6[0].originalname + ''
        var url = req.files.file6[0].transforms[0].location;
        //var urlid='public/india/driverDocument/id'+req.body.mobile+'1'+id.name+'';
        //await imgresizer(req.files.file6[0].buffer, url, 1280, 720)
        await database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
            $set: {
                polution: url
            }
        }, function(e, d) {});
    }




    if (req.body.address) {
        await database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
            $set: {
                address: req.body.address
            }
        }, function(e, d) {

        });
    }

    if (req.body.riderCheckbox || req.body.deliveryCheckbox || req.body.employeeCheckbox) {
        await database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
            $set: {
                typeOfWork: [req.body.riderCheckbox, req.body.deliveryCheckbox, req.body.employeeCheckbox]
            }
        }, function(e, d) {

        });
    }

    if (req.body.employeeCheckbox) {
        await database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
            $set: {
                jobCategory: req.body.jobcategory,
                jobSubCategory: req.body.jobSubcategory,
                ageGroup: req.body.ageGroup,
                experance: req.body.experance,
                panNumber: req.body.panNumber,
                gender: req.body.gender
            }
        }, function(e, d) {

        });
    }

    if (req.body.travelmod) {
        await database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
            $set: {
                travelmod: req.body.travelmod,
                rtoRegno: req.body.RtoNo,
                carModel: req.body.carModel
            }
        }, function(e, d) {

        });
    }

    if (req.body.bankAc) {
        await database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
            $set: {
                bankAccountNo: req.body.bankAc,
                ifsc: req.body.ifsc,
            }
        }, function(e, d) {

        });
    }

     res.redirect('/india/tdrv?reg=submit')

});





//////////Tdriver Forget Password //////////
router.get('/tdrv/forget', function(req, res, next) {
    res.render('india/inTdriverForgetpsw', { msg: "", fgp: "1" });
})

router.post('/tdrv/forget', function(req, res, next) {
    var otp = randamNumber();
    database.pilot.findOne({ mobileNumber: req.body.mobile, isdCode: '+91' }, function(err, pilot) {
        if (pilot) {
            // console.log("OTP", otp)
            // res.render('india/inTdriverForgetpsw',{msg:"",fgp:"2", otp:otp, mobile:req.body.mobile});
            smsotp.otpsend({
                apikey: process.env.OTP2KEY,
                mobileno: "+91" + req.body.mobile + "",
                otp: "" + otp + ""
            }, function(data) {
                // console.log(data);
                // res.send(data); 
                if (data.Status == 'Success') {
                    res.render('india/inTdriverForgetpsw', { msg: "", fgp: "2", otp: otp, mobile: req.body.mobile });
                } else {
                    res.render('india/inTdriverForgetpsw', { msg: data.Details, fgp: "1" });
                }
            })
        } else {
            res.render('india/inTdriverForgetpsw', { msg: "Mobile Number Not Register With us", fgp: "1" });
        }
    })

    //res.redirect('/india/tdrv/login?psw=Success');
})

router.post('/tdrv/forgetveryfyotp', function(req, res, next) {
    if (req.body.otp == req.body.otp1) {
        res.render('india/inTdriverForgetpsw', { msg: "", fgp: "3", mobile: req.body.mobile });
    } else {
        res.render('india/inTdriverForgetpsw', { msg: "OTP Mismactch", fgp: "2", otp: req.body.otp, mobile: req.body.mobile });
    }

})

router.post('/tdrv/resetPassword', function(req, res, next) {
    if (req.body.password == req.body.password1) {
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: '+91' }, { $set: { password: hash } }, function(err, user) {
                if (user) {
                    res.redirect('/india/tdrv/login?reg=resetPassword');
                }
            });
        })
    } else {
        res.render('india/inTdriverForgetpsw', { msg: "Password Not Match", fgp: "3", mobile: req.body.mobile });
    }


});

router.post('/tdrv/paymentBreakdown', function(req, res, next) {
    database.pilot.findOne({pilotID:req.cookies.pilotID},function(er,driver){
        tdriverPayout({
            driverpayout:driver.driverpayout,
            travelmod: driver.travelmod,
            city:driver.cityName,
            distance:req.body.distance
           },function(driverpayout){ 
               var dd=Number(driverpayout)/Number(req.body.distance);
              
            res.send({driverpayout:dd, distance:req.body.distance});
           }); 
    })
    

});

/////////// Tdrive Main Content/////

////////// GET T DRIVER LOCATION////////
router.post('/GetTdriverLocation', function(req, res, next) {
    database.driverlocation.findOne({ pilotID: req.cookies.pilotID }, function(er, driverLoc) {
        if (driverLoc) {
            var finishLocation = driverLoc.location.coordinates;
            res.send({ lat: Number(finishLocation[1]), lng: Number(finishLocation[0]), accuracy: driverLoc.accuracy });
        }

    })
});

//////driverCallingPro////////////

/////For Neareast TrideBooking//////
router.post('/nearbyTrideBooking', function(req, res, next) {
    database.index2Ddriver({}, function(ss) {
        database.driverlocation.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [Number(req.body.lng), Number(req.body.lat)]
                    },
                    $maxDistance: 3000
                }
            },
            accountStatus: 'Active',
            travelmod: req.body.travelmod,
            DriverType: req.body.DriverType,
            driverBusy: "Free",
            ringtone: "0"
        }, function(e, generalDriver) {
            res.send({ drivers: generalDriver });
        });
    });

});

////////Call Tdriver Requiest notification/////
router.post('/CallTdriver', function(req, res, next) {
    res.io.emit("TinCommingCall", { pilotID: req.body.pilotID, CustID: req.body.CustID, pickuoAddress: req.body.pickuoAddress });
    res.send('ReqEmited');
});
////////requiest Tdriver Display Accept Window/////
router.post('/requiestTdriverDisplayAcceptWindow', function(req, res, next) {
    res.io.emit("openAcceptWindow", { CustID: req.body.CustID, pilotID: req.body.pilotID, pickuoAddress: req.body.pickuoAddress });
    res.cookie('openAcceptWindow', JSON.stringify({ CustID: req.body.CustID, pilotID: req.body.pilotID, pickuoAddress: req.body.pickuoAddress }), { maxAge: 12 * 1000 })
    database.driverlocation.findOneAndUpdate({ pilotID: req.body.pilotID, DriverType: "Tride" }, { $set: { ringtone: "1" } }, function(e, d) {
        res.send("emitopenAcceptWindow");
    })

});

//////Reset Ringtone value to "0"////
router.post('/tdrv/resetRingtone', function(req, res, next) {
    database.driverlocation.findOneAndUpdate({ pilotID: req.body.pilotID, DriverType: "Tride" }, { $set: { ringtone: "0" } }, function(e, d) {
        res.send("ringtone Reset to 0");
    })
});


////////Call Driver accept notification/////
router.post('/tdrv/AcceptCallByTdriver', function(req, res, next) {
    res.io.emit("TdriverAccepeCall", { CustID: req.body.CustID, pilotID: req.body.pilotID });
    res.send("emitDriverAccepeCall")
});

////////Call Driver accept notification/////
router.post('/tdrv/confrmAcceptWindowOpenProperly', function(req, res, next) {
    res.io.emit("comfirmAcceptWindowOpen", {pilotID: req.body.pilotID });
    res.send("confrmAcceptWindowOpenProperly")
});

router.post('/savetdriverCallAndBooking', function(req, res, next) {
    ///////Create Bookinng////
    GenbookingID({}, function(NewBookinid) {
        database.ride({
            bookingID: NewBookinid.bookingID,
            travelmod: req.body.travelmod,
            CustID: req.body.CustID,
            pilotID: req.body.pilotID,
            DriverType: req.body.DriverType,
            picupaddress: req.body.originAds,
            picuklatlng: [req.body.originLat, req.body.originLng],
            dropaddress: req.body.distAds,
            droplatlng: [req.body.distLat, req.body.distLng],
            kmtravels: req.body.totalDistance,
            totalamount: req.body.totalAmt,
            timefare: req.body.timeFare,
            perMinuteCost: req.body.perMinuteTimeCost,
            travalTime: Number(req.body.travalTime) + 2,
            paymentBy: req.body.payMode,
            callbookingStatus: "Accept",
            driverBusy: "busy",
            preRideOTP: randamNumber(),
        }).save(function(err) {
            //////CUST data////
            database.customer.findOneAndUpdate({ CustID: req.body.CustID }, {
                $set: {
                    orderStage: 'accept',
                    bookingID: NewBookinid.bookingID
                }
            }, function(er, cust) {
                database.pilot.findOneAndUpdate({ pilotID: req.body.pilotID }, {
                    $set: {
                        orderStage: 'accept',
                        bookingID: NewBookinid.bookingID
                    }
                }, function(e, d) {
                    res.io.emit("CallAcceptListDisplay", { pilotID: req.body.pilotID, CustID: req.body.CustID, bookingID: NewBookinid.bookingID });
                    res.send("Order Grnerate sucellfully");
                });

            });

        })
    });

});

//////////TDriver Cline Details //////
router.post('/tdrv/clineDetalls', function(req, res, next) {
    res.cookie("driverBusy", "busy", { maxAge: 1 * 24 * 60 * 60 * 1000 });
    database.customer.findOne({ CustID: req.body.CustID }, function(err, cust) {
        database.ride.findOne({ bookingID: req.body.bookingID }, function(e, ride) {

            res.send({ cust: cust, ride: ride });
        })
    });
});

////////TDriver Page Initiate Data details///
router.post('/tdrv/getPageInitiateDetails', function(req, res, next) {
    database.ride.findOne({ bookingID: req.body.bookingID }, function(err, ride) {
        database.customer.findOne({ CustID: ride.CustID }, function(err, cust) {
            res.send({ cust: cust, ride: ride });
        });
    })
});



////////Start Car LogBook Reading///////
router.post('/tdrv/startCarLoogbook', function(req, res, next) {
    database.Carlogbook.findOne({ bookingID: req.body.bookingID }, function(er, carlock) {
        if (!carlock) {
            database.pilot.findOneAndUpdate({ pilotID: req.cookies.pilotID }, { $set: { mapclick: "clinelocat" } }, function(err, pilot) {
                ///var position=JSON.parse(req.cookies.position) ;
                database.driverlocation.findOne({ pilotID: pilot.pilotID }, function(er, driverLoc) {
                    if (driverLoc) {
                        var position = driverLoc.location.coordinates;
                        database.Carlogbook({
                            bookingID: req.body.bookingID,
                            pilotID: pilot.pilotID,
                            travelmod: pilot.travelmod,
                            DriverType: "Tride",
                            startlatlng: [Number(position[1]), Number(position[0])],
                            loogBookStatus: "start"
                        }).save(function(err) {
                            res.send("LoogBook Created");
                        });
                    }

                });
            });
        }
    });
});

//////////Driver Cline Located //////
router.post('/tdrv/clinelocatedCheckDistance', function(req, res, next) {
    database.ride.findOne({ bookingID: req.body.bookingID }, function(er, ride) {
        if (ride) {
            database.driverlocation.findOne({ pilotID: req.cookies.pilotID }, function(err, driverLoc) {
                if (driverLoc) {
                    var dlocation = driverLoc.location.coordinates;
                    googleApi.manualDistance({
                        origin: [Number(dlocation[1]), Number(dlocation[0])],
                        dist: [Number(ride.picuklatlng[0]), Number(ride.picuklatlng[1])]
                    }, function(data) {
                        res.send({ distance: data, status: "success" });
                    });
                } else {
                    res.send({ distance: 0, status: "error" });
                }

            })
        }
    })

});

router.post('/tdrv/CarLoogbookClineLocate', function(req, res, next) {
    database.Carlogbook.findOne({ bookingID: req.body.bookingID }, function(er, carlock) {
        if (carlock) {
            database.driverlocation.findOne({ pilotID: req.cookies.pilotID }, function(er, driverLoc) {
                if (driverLoc) {
                    var position = driverLoc.location.coordinates;
                    googleApi.distance({
                        origins: '' + Number(carlock.startlatlng[0]) + ', ' + Number(carlock.startlatlng[1]) + '',
                        destinations: '' + Number(position[1]) + ',' + Number(position[0]) + '',
                        apik: process.env.API_KEY,
                        travelmod: "2"
                    }, function(result) {
                        var distance = result.rows[0].elements[0].distance.value;
                        distance = Number(distance) / 1000;
                        database.Carlogbook.findOneAndUpdate({ bookingID: req.body.bookingID }, {
                            $set: {
                                pickuplatlng: [Number(position[1]), Number(position[0])],
                                pickupDistance: distance
                            }
                        }, function(err, updat) {
                            res.io.emit("clinelocated", { CustID: req.body.CustID });
                            res.send("ok");

                        });

                    });


                } else {
                    res.send("error")
                }

            });

        }
    });
})






//////////Driver Cline Located //////
router.post('/tdrv/startRide', function(req, res, next) {
    database.customer.findOneAndUpdate({ CustID: req.body.CustID }, { $set: { orderStage: 'startRide', mapclick: "" } }, function(er, cust) {
        database.pilot.findOneAndUpdate({ pilotID: req.cookies.pilotID }, { $set: { orderStage: 'startRide' } }, function(re, pilot) {
            database.ride.findOneAndUpdate({ bookingID: req.body.bookingID }, { $set: { startTime: new Date() } }, function(re, ride) {
                res.io.emit("StartRide", { CustID: req.body.CustID });
                res.send({ cust: cust, ride: ride });
            });

        });

    });


});





router.post('/tdrv/CarLoogbookClineLocate', function(req, res, next) {
    database.Carlogbook.findOne({ bookingID: req.body.bookingID }, function(er, carlock) {
        if (carlock) {
            database.driverlocation.findOne({ pilotID: req.cookies.pilotID }, function(er, driverLoc) {
                if (driverLoc) {
                    var position = driverLoc.location.coordinates;
                    googleApi.distance({
                        origins: '' + Number(carlock.startlatlng[0]) + ', ' + Number(carlock.startlatlng[1]) + '',
                        destinations: '' + Number(position[1]) + ',' + Number(position[0]) + '',
                        apik: process.env.API_KEY,
                        travelmod: "2"
                    }, function(result) {
                        var distance = result.rows[0].elements[0].distance.value;
                        distance = Number(distance) / 1000;
                        database.Carlogbook.findOneAndUpdate({ bookingID: req.body.bookingID }, {
                            $set: {
                                pickuplatlng: [Number(position[1]), Number(position[0])],
                                pickupDistance: distance
                            }
                        }, function(err, updat) {
                            res.send("ok");
                        });

                    });


                } else {
                    res.send("error")
                }

            });

        }
    });
})

//////////Driver Cline finish Located //////
router.post('/tdrv/finishCheckDistance', function(req, res, next) {
    database.ride.findOne({ bookingID: req.body.bookingID }, function(er, ride) {
        if (ride) {
            database.driverlocation.findOne({ pilotID: req.cookies.pilotID }, function(err, driverLoc) {
                if (driverLoc) {
                    var dlocation = driverLoc.location.coordinates;
                    googleApi.manualDistance({
                        origin: [Number(dlocation[1]), Number(dlocation[0])],
                        dist: [Number(ride.droplatlng[0]), Number(ride.droplatlng[1])]
                    }, function(data) {
                        res.send({ distance: data, status: "success" ,travelmod:driverLoc.travelmod});
                    });
                } else {
                    res.send({ distance: 0, status: "error" ,travelmod:driverLoc.travelmod});
                }

            })
        }
    })

});

//////////Driver Finish Ride //////
router.post('/tdrv/finishRide', function(req, res, next) {
    database.pilot.findOne({ pilotID: req.cookies.pilotID }, function(re, driver) {
        database.customer.findOne({ CustID: req.body.CustID }, function(re, cust) {
            database.ride.findOne({ bookingID: req.body.bookingID }, function(re, booking) {
                database.Carlogbook.findOne({ bookingID: req.body.bookingID }, function(err, carlog) {

                    ///////Total Travel TimeFare//////
                    var endTime = new Date();
                    var travelmod = driver.travelmod;
                    var totalTime = endTime.getTime() - moment(booking.startTime).utc().toDate().getTime();
                    totalTime = parseInt(totalTime / (1000 * 60)) + 1;
                    var holdingOverStayCharge=0;
                    var holdingTime=0;
                    var holdingOverStayTime=Number(totalTime) - Number(booking.travalTime);
                    
                    if(holdingOverStayTime > 10 && holdingOverStayTime < 120){
                        holdingOverStayCharge= (Number(holdingOverStayTime)-10) * 1;
                        holdingTime=holdingOverStayTime;
                    }else{
                        if(holdingOverStayTime > 120){
                            holding= (Number(holdingOverStayTime)-120) * 3;
                            holdingOverStayCharge=110 + Number(holding);
                            holdingTime=holdingOverStayTime;
                        } 
                    }

                    holdingTime=Number(holdingTime).toFixed(2);
                    holdingOverStayCharge=Number(holdingOverStayCharge).toFixed(2);

                    //////Total fuel Cost///////////
                    var fuleConsumption = 0;
                    var fuelDistance = Number(carlog.pickupDistance) + Number(booking.kmtravels);
                    if (fuelDistance <= 0) {
                        fuelDistance = 1;
                    }
                    if (driver.enginMilege) {
                        fuleConsumption = (Number(driver.fulePrice) / Number(driver.enginMilege)) * Number(fuelDistance);
                    }
                    /////Update Carlog /////////             
                    database.Carlogbook.findOneAndUpdate({ bookingID: booking.bookingID }, {
                            $set: {
                                droplatlng: [Number(booking.droplatlng[0]), Number(booking.droplatlng[1])],
                                dropDistance: booking.kmtravels,
                                perltrFulePrice: driver.fulePrice,
                                enginMilege: driver.enginMilege,
                                fuleConsumption: fuleConsumption,
                                loogBookStatus: "complete",
                                DriverType:"Tride", 
                                driverCetegory:driver.driverCetegory,
                                CityName:cust.CityName,
                                branchName:cust.branchName
                            }
                        }, function(err, updat) {
                            console.log("logbook Update");
                        })
                /////////Check Driver Cetegory//////////////
                if(Number(driver.driverCetegory)== 1){
                    console.log("Category Driver test" , 1)
                    /////// Driver Cetegory 1 //////
                    incentiveFn({
                        pilotID: driver.pilotID,
                        travelmod: driver.travelmod,
                        driverCetegory:driver.driverCetegory,
                        incetiveCategry:driver.incentiveMode,
                        city:driver.cityName
                    }, function(insentive){

                        tdriverPayout({
                         driverpayout:driver.driverpayout,
                         travelmod: driver.travelmod,
                         city:driver.cityName,
                         distance:booking.kmtravels
                        },function(driverpayout){
                        ////////Bill Amount/////
                        var spacelDiscount = 0;
                        if (cust.spacelDiscount) {
                            spacelDiscount = Number(cust.spacelDiscount);
                        }
                        var billAmount = Number(booking.totalamount) + Number(booking.timefare) + Number(holdingOverStayCharge) - Number(spacelDiscount);
                        
                        var TotalDriverpayout= Number(driverpayout) - Number(spacelDiscount)
                        ////////Save and Update Finish////////
                        database.customer.findOneAndUpdate({ CustID: req.body.CustID }, { $set: { orderStage: 'finishRide' } }, function(er, cust) {
                            database.pilot.findOneAndUpdate({ pilotID: req.cookies.pilotID }, { $set: { orderStage: 'finishRide' } }, function(re, driver) {
                                database.ride.findOneAndUpdate({ bookingID: req.body.bookingID }, {
                                    $set: {
                                        driverFuelConsumtion: 0,
                                        driverpayout: TotalDriverpayout,
                                        totalTime: totalTime,
                                        driverIncentiv: insentive,
                                        carManitenanceCost: 0,
                                        driverCetegory:driver.driverCetegory,
                                        spacelDiscount: spacelDiscount,
                                        travelmod: travelmod,
                                        holdingOverStayTime:holdingTime,
                                        holdingOverStayCharge:holdingOverStayCharge,
                                        CityName:cust.CityName,
                                        branchName:cust.branchName
                                    }
                                }, function(er, updatbooking) {
                                    if (updatbooking) {
                                        //////Wallet Update ////
                                        if (Number(updatbooking.paymentBy) == 2) {
                                            var walletAmt = Number(cust.walletBalance) - billAmount;
                                            database.customer.findOneAndUpdate({ CustID: req.body.CustID }, { $set: { walletBalance: walletAmt } }, function(er, cu) {
                                                res.io.emit("finishRide", { CustID: req.body.CustID });
                                                res.send({ billAmount: 0 });
                                            });
                                        } else {
                                            if (Number(updatbooking.paymentBy) == 3) {
                                                var buykmAmt = Number(cust.BuyKM) - Number(booking.kmtravels);
                                                database.customer.findOneAndUpdate({ CustID: req.body.CustID }, { $set: { BuyKM: buykmAmt } }, function(er, n) {
                                                    res.io.emit("finishRide", { CustID: req.body.CustID });
                                                    res.send({ billAmount: 0 });
                                                });
                                            } else {
                                                database.ride.findOneAndUpdate({ bookingID: req.body.bookingID }, { $set: { driverCashCollectio: billAmount } }, function(er, cash) {
                                                    res.io.emit("finishRide", { CustID: req.body.CustID });
                                                    res.send({ billAmount: billAmount });
                                                });

                                            }
                                        }

                                    }
                                });
                            })
                        })

                        });
                    })
                }else{
                    ////////Normal T Ride Driver////////

                    /////Driver Pay Out/////////////
                    var driverpayout = Number(totalTime) * Number(cust.driverPayout[travelm]);
                    ////////Bill Amount/////
                    var billAmount = Number(booking.totalamount) + Number(timefare);
                    var insentive = 0;
                    var carmaintenanceCost = 0;
                    if (Number(travelmod) == 1) {
                        insentive = Number(booking.kmtravels) * 0.4;
                        carmaintenanceCost = 0.25;
                    }
                    if (Number(travelmod) == 3) {
                        insentive = Number(booking.kmtravels) * 0.9
                        carmaintenanceCost = 1
                    }

                    if (Number(travelmod) == 2) {
                        insentive = Number(booking.kmtravels) * 0.4;
                        carmaintenanceCost = 0.25;
                    }

                    if (Number(travelmod) == 4) {
                        insentive = Number(booking.kmtravels) * 0.9
                        carmaintenanceCost = 1
                    }

                    ////////Save and Update Finish////////
                    database.customer.findOneAndUpdate({ CustID: req.body.CustID }, { $set: { orderStage: 'finishRide' } }, function(er, cust) {
                        database.pilot.findOneAndUpdate({ pilotID: req.cookies.pilotID }, { $set: { orderStage: 'finishRide' } }, function(re, driver) {
                            database.ride.findOneAndUpdate({ bookingID: req.body.bookingID }, {
                                $set: {
                                    driverFuelConsumtion: fuleConsumption,
                                    driverpayout: driverpayout,
                                    totalTime: totalTime,
                                    timefare: timefare,
                                    driverIncentiv: insentive,
                                    carManitenanceCost: carmaintenanceCost,
                                    CityName:cust.CityName,
                                    branchName:cust.branchName
                                }
                            }, function(er, updatbooking) {
                                if (updatbooking) {
                                    //////Wallet Update ////
                                    if (Number(updatbooking.paymentBy) == 2) {
                                        var walletAmt = Number(cust.walletBalance) - billAmount;
                                        database.customer.findOneAndUpdate({ CustID: req.body.CustID }, { $set: { walletBalance: walletAmt } }, function(er, cu) {
                                            res.io.emit("finishRide", { CustID: req.body.CustID });
                                            res.send({ billAmount: 0 });
                                        });
                                    } else {
                                        if (Number(updatbooking.paymentBy) == 3) {
                                            var buykmAmt = Number(cust.walletBalance) - Number(distance);
                                            database.customer.findOneAndUpdate({ CustID: req.body.CustID }, { $set: { BuyKM: buykmAmt } }, function(er, n) {
                                                res.io.emit("finishRide", { CustID: req.body.CustID });
                                                res.send({ billAmount: 0 });
                                            });
                                        } else {
                                            database.ride.findOneAndUpdate({ bookingID: req.body.bookingID }, { $set: { driverCashCollectio: billAmount } }, function(er, cash) {
                                                res.io.emit("finishRide", { CustID: req.body.CustID });
                                                res.send({ billAmount: billAmount });
                                            });

                                        }
                                    }

                                }
                            });
                        })
                    })

                    }



                });

            });
        });
    });

});

//////Call Back Function Incentive Calculation//////////

function incentiveFn(req,cb){
    var StartTime = moment().startOf('day').utc();
    var EndTime = moment().endOf('day').utc();
    var kmTravels=0;
    database.ride.find({
        date: { $gte: StartTime.toDate(), $lte: EndTime.toDate() },
        pilotID: req.pilotID,
        travelmod: req.travelmod,
        callbookingStatus: "complete",
        DriverType: "Tride",
        driverCetegory:req.driverCetegory,
        driverIncentiv:{$gte:0}
    }, function(er, incetSlot) {

        database.ride.find({
            date: { $gte: StartTime.toDate(), $lte: EndTime.toDate() },
            pilotID: req.pilotID,
            travelmod: req.travelmod,
            callbookingStatus: "complete",
            DriverType: "Tride",
           // driverCetegory:req.driverCetegory,
        }, function(er, orderCount) {
            if(orderCount.length>0){
            orderCount.forEach(function(val,key,ary){
                if (val.kmtravels) {
                    kmTravels = Number(kmTravels) + Number(val.kmtravels)
                }
                if(key===ary.length - 1){
                    ///////find incentive Module////////
                    ///incetiveCategry
                    database.pilotIncentiveModule.find({incetiveCategry:req.incetiveCategry,travelmod: req.travelmod,city:req.city},function(er, incModul){
                        if(incModul.length >0 ){
                        incModul.forEach(function(value,keyy,arry){
                         if(Number(value.incetiveSlot) == Number(incetSlot.length)+1){
                             if(Number(value.inctravelKM)>=Number(kmTravels) && Number(value.numberOfBooking)>=Number(orderCount.length+1)){
                                cb(value.incetiveAmount);
                             }else{
                                cb(0);
                             }

                         }
                     }) 
                    }else{
                        cb(0);
                    } 
                    })
                    
                }
            })
        }else{
            cb(0);
        }
            
        })
        
        
    })

}

function tdriverPayout(req,res){
    database.cityPrice.findOne({CityName:req.city,travelMode:req.travelmod},function(er,cityprice){
        //console.log("cityprice",cityprice)
        //////////// Check Redious Paramiter/////////////////
    if(cityprice.cityRediusMultiplyer.length>0){
        if(Number(req.distance)>0 && Number(req.distance)<=5){
            let rediousMulti = cityprice.cityRediusMultiplyer.find(el => el.redious === "5");
            rediusMultiplyer=rediousMulti["multiplyer"]
            if(rediousMulti){
                rediusMultiplyer=rediousMulti["multiplyer"];
                driveTotalPay=Number(req.driverpayout) * Number(req.distance) * Number(rediusMultiplyer) * 0.90;
                res(driveTotalPay)
                }else{
                    res(Number(req.driverpayout) * Number(req.distance));   
                }
    }else{
        if(Number(req.distance)>5 && Number(req.distance)<=10){
            let rediousMulti = cityprice.cityRediusMultiplyer.find(el => el.redious === "10");
            if(rediousMulti){
            rediusMultiplyer=rediousMulti["multiplyer"]
            driveTotalPay=Number(req.driverpayout) * Number(req.distance) * Number(rediusMultiplyer) * 0.90;
                res(driveTotalPay)
                }else{
                    res(Number(req.driverpayout) * Number(req.distance));   
                }

        }else{
            if(Number(req.distance)>10 && Number(req.distance)<=15){
                let rediousMulti = cityprice.cityRediusMultiplyer.find(el => el.redious === "15");
                if(rediousMulti){
                    rediusMultiplyer=rediousMulti["multiplyer"]
                    driveTotalPay=Number(req.driverpayout) * Number(req.distance) * Number(rediusMultiplyer) * 0.90;
                res(driveTotalPay)
                }else{
                    res(Number(req.driverpayout) * Number(req.distance));   
                }
            }else{
                if(Number(req.distance)>15){
                ////////Return Fare Applicable////////////////
                driveTotalPay=Number(req.driverpayout) * Number(req.distance) * 2 * 0.90;
                res(driveTotalPay)
                }
            }
        }
    }
    }else{
        if(Number(req.distance)>15){
            ////////Return Fare Applicable////////////////
            driveTotalPay=Number(req.driverpayout) * Number(req.distance) * 2 * 0.90;
                res(driveTotalPay)
            }else{
                res(Number(req.driverpayout) * Number(req.distance)); 
            }
        
    }
        
    })

}


//////////Driver finishEverythingAndSetNormal //////
router.post('/tdrv/finishEverythingAndSetNormal', function(req, res, next) {
    database.pilot.findOneAndUpdate({ pilotID: req.cookies.pilotID }, { $set: { orderStage: "", bookingID: "" } }, function(e, data) {
        database.customer.findOneAndUpdate({ CustID: req.body.CustID }, { $set: { orderStage: "", bookingID: "" } }, function(e, data) {
            database.ride.findOneAndUpdate({ bookingID: req.body.bookingID }, {
                $set: {
                    callbookingStatus: "complete",
                    driverBusy: ""
                }
            }, function(e, data) {
                database.driverlocation.findOneAndUpdate({ pilotID: req.cookies.pilotID, DriverType: "Tride" }, { $set: { ringtone: "0" } }, function(er, df) {
                    res.clearCookie("driverBusy");
                    res.send("ok")
                })

            });
        })

    });
});

////////Update Driver Duty initiate//////
router.post('/TrideDutyoffline', function(req, res, next) {
    database.driverlocation.deleteMany({ pilotID: req.cookies.pilotID }, function(e, ddd) {
        console.log("delete Driver Location")
        res.send("Offline");
    });
});




/////Tdrive FULE PRICE AND CITY UPDATE/////
router.post('/tdrv/CityFulepriceUpdate', function(req, res, next) {
    database.pilot.findOne({ pilotID: req.body.pilotID }, function(err, data) {
        if (data.cityName) {
            database.petroldesel.findOne({ cityName: data.cityName }, function(e, petrol) {
                if (data.vichelEnginType == "Petrol") {
                    var fulePrice = petrol.petrolPerLtr;
                } else {
                    if (data.vichelEnginType == "Diesel") {
                        var fulePrice = petrol.deselPerLtr;
                    } else {
                        /////cng///////
                        var fulePrice = petrol.cngPrice;
                    }
                }
                database.pilot.findOneAndUpdate({ pilotID: req.body.pilotID }, {
                    $set: {
                        fulePrice: fulePrice
                    }
                }, function(err, da) {
                    res.send("Fule Price Update");
                });


            })
        } else {
            res.send("0");
        }
    })

});


//////////Tdriver bookingIncentiveDetails  //////
router.post('/tdrv/bookingIncentiveDetails', function(req, res, next) {
    var totalErning = 0;
    var driverCashCollectio = 0;
    var todayStart = moment().startOf('day').utc();
    var todayend = moment().endOf('day').utc();
    database.pilot.findOne({ pilotID: req.cookies.pilotID }, function(err, pilot) {
        database.ride.find({
            date: { $gte: todayStart.toDate(), $lte: todayend.toDate() },
            pilotID: req.cookies.pilotID,
            travelmod: pilot.travelmod,
            callbookingStatus: "complete",
            DriverType: "Tride"
        }, function(er, data) {
            console.log("inst test dara", data)
            data.forEach(function(val, indx, arry) {
                if (val.driverpayout) {
                    totalErning += Number(val.driverpayout)
                    if (val.driverFuelConsumtion) {
                        totalErning += Number(val.driverFuelConsumtion)
                    }
                    if (val.driverIncentiv) {
                        totalErning += Number(val.driverIncentiv)
                    }
                    if (val.carManitenanceCost) {
                        totalErning += Number(val.carManitenanceCost)
                    }

                }
                if (val.driverCashCollectio) {
                    driverCashCollectio += Number(val.driverCashCollectio)
                }
                if (indx === arry.length - 1) {
                    res.send({ noOfBooking: arry.length, totalErning: totalErning, driverCashCollectio: driverCashCollectio })
                }
            });

        });
    });

});

///////Tride Ledger/////
router.post('/tdrv/ledger', function(req, res, next) {
    var newPreviousDue = 0;
    var newPreviousEarning = 0;
    database.pilot.findOne({ pilotID: req.cookies.pilotID }, function(e, pilot) {
        trideCashDueCalculation({ pilotID: pilot.pilotID, travelmod: pilot.travelmod }, function(value) {
            if (pilot.lastCheckCashCollcetion) {
                var lastCheckCashCollcetion = pilot.lastCheckCashCollcetion;
            } else {
                var lastCheckCashCollcetion = 0;
            }

            if (pilot.lastCheckTdriverEarning) {
                var lastCheckTdriverEarning = pilot.lastCheckTdriverEarning;
            } else {
                var lastCheckTdriverEarning = 0;
            }
            //console.log("value.dailyledger",value.dailyledger)        

            newPreviousEarning = Number(lastCheckTdriverEarning) + Number(value.priviousEarning);
            newPreviousDue = Number(lastCheckCashCollcetion) + Number(value.previousDue);

            //////Save Data/////////
            database.pilot.findOneAndUpdate({ pilotID: req.cookies.pilotID }, {
                $set: {
                    lastCheckDate: moment().startOf('day').utc().toDate(),
                    lastCheckCashCollcetion: newPreviousDue,
                    lastCheckTdriverEarning: newPreviousEarning,
                    //lastFuleCheckDate:moment().startOf('day').utc().toDate(),
                    //lastCheckFuleconsumption:newPendingConsumption       
                }
            }, function(e, d) {
                res.send({
                    previousEarning: newPreviousEarning,
                    previousDue: newPreviousDue,
                    dailyCollection: value,
                    driverCetegory:pilot.driverCetegory,
                    driverpayout:pilot.driverpayout,
                    pilot:pilot
                })

            })
        })
    })
});

function trideCashDueCalculation(req, cb) {
    var StartTime = "";
    var EndTime = "";
    var cashCollection = 0;
    var fuelCost=0;
    var incentive = 0;
    var maintenance = 0;
    var driverpayout = 0;
    database.pilot.findOne({ pilotID: req.pilotID }, function(e, pilot) {
        if (pilot.lastCheckDate) {
            /////Check Balance From Last Checking Date
            StartTime = moment(pilot.lastCheckDate).utc();
            EndTime = moment().startOf('day').utc();
            // var todayend = moment().endOf('day').utc();
            database.ride.find({
                date: { $gte: StartTime.toDate(), $lte: EndTime.toDate() },
                pilotID: req.pilotID,
                travelmod: req.travelmod,
                callbookingStatus: "complete",
                DriverType: "Tride"
            }, function(er, balance) {
                if (balance.length > 0) {
                    balance.forEach(function(val, key, ary) {
                        if (val.driverCashCollectio) {
                            cashCollection = Number(cashCollection) + Number(val.driverCashCollectio);
                        }
                        if (val.driverIncentiv) {
                            incentive = Number(incentive) + Number(val.driverIncentiv)
                        }

                        if (val.driverpayout) {
                            driverpayout = Number(driverpayout) + Number(val.driverpayout)
                        }

                        if (val.carManitenanceCost) {
                            maintenance = Number(maintenance) + Number(val.carManitenanceCost)
                        }

                        if (val.driverFuelConsumtion) {
                            fuelCost = Number(fuelCost) + Number(val.driverFuelConsumtion)
                        }

                        if (key === ary.length - 1) {
                            var priviousEarning = Number(driverpayout) + Number(incentive) + Number(fuelCost) + Number(maintenance);
                            var previousDue = Number(cashCollection) + Number(driverpayout) + Number(maintenance) + Number(fuelCost);
                            trideDailyLedgerCollection({ pilotID: req.pilotID, travelmod: req.travelmod }, function(dailyledger) {
                                cb({ previousDue: previousDue, dailyledger: dailyledger, priviousEarning: priviousEarning });
                            })
                        }
                    });
                } else {
                    trideDailyLedgerCollection({ pilotID: req.pilotID, travelmod: req.travelmod }, function(dailyledger) {
                        cb({ previousDue: 0, dailyledger: dailyledger, priviousEarning: 0 });
                    })
                }
            });
        } else {
            /////Check Balance From Starting
            if (pilot.date.getDate() == new Date().getDate()) {
                trideDailyLedgerCollection({ pilotID: req.pilotID, travelmod: req.travelmod }, function(dailyledger) {
                    cb({ previousDue: 0, dailyledger: dailyledger });
                });
            } else {
                StartTime = moment(pilot.date).utc();
                EndTime = moment().startOf('day').utc();
                // var todayend = moment().endOf('day').utc();
                database.ride.find({
                    date: { $gte: StartTime.toDate(), $lte: EndTime.toDate() },
                    pilotID: req.pilotID,
                    travelmod: req.travelmod,
                    callbookingStatus: "complete",
                    DriverType: "Tride"
                }, function(er, balance) {
                    if (balance.length > 0) {
                        balance.forEach(function(val, key, ary) {
                            if (val.driverCashCollectio) {
                                cashCollection = Number(cashCollection) + Number(val.driverCashCollectio);
                            }
                            if (val.driverIncentiv) {
                                incentive = Number(incentive) + Number(val.driverIncentiv)
                            }

                            if (val.driverpayout) {
                                driverpayout = Number(driverpayout) + Number(val.driverpayout)
                            }

                            if (val.carManitenanceCost) {
                                maintenance = Number(maintenance) + Number(val.carManitenanceCost)
                            }

                            if (val.driverFuelConsumtion) {
                                fuelCost = Number(fuelCost) + Number(val.driverFuelConsumtion)
                            }

                            if (key === ary.length - 1) {
                                var priviousEarning = Number(driverpayout) + Number(incentive) + Number(fuelCost) + Number(maintenance);
                                var previousDue = Number(cashCollection) + Number(driverpayout) + Number(maintenance) + Number(fuelCost);
                                trideDailyLedgerCollection({ pilotID: req.pilotID, travelmod: req.travelmod }, function(dailyledger) {
                                    cb({ previousDue: previousDue, dailyledger: dailyledger, priviousEarning: priviousEarning });
                                })
                            }
                        });
                    } else {
                        trideDailyLedgerCollection({ pilotID: req.pilotID, travelmod: req.travelmod }, function(dailyledger) {
                            cb({ previousDue: 0, dailyledger: dailyledger, priviousEarning: 0 });
                        })
                    }

                });
            }

        } /////

    })
}



function trideDailyLedgerCollection(req, cb) {
    var cashCollection = 0;
    var incentive = 0;
    var maintenance = 0;
    var driverpayout = 0;
    var fuelCost = 0;
    var kmTravels = 0;
    var StartTime = moment().startOf('day').utc();
    var EndTime = moment().endOf('day').utc();
    database.ride.find({
        date: { $gte: StartTime.toDate(), $lte: EndTime.toDate() },
        pilotID: req.pilotID,
        travelmod: req.travelmod,
        callbookingStatus: "complete",
        DriverType: "Tride"
    }, function(er, balance) {
        //console.log("test daily ledger",balance)
        if (balance.length > 0) {
            balance.forEach(function(val, key, ary) {
                if (val.driverCashCollectio) {
                    cashCollection = Number(cashCollection) + Number(val.driverCashCollectio);
                }
                if (val.driverIncentiv) {
                    incentive = Number(incentive) + Number(val.driverIncentiv)
                }

                if (val.driverpayout) {
                    driverpayout = Number(driverpayout) + Number(val.driverpayout)
                }

                if (val.carManitenanceCost) {
                    maintenance = Number(maintenance) + Number(val.carManitenanceCost)
                }

                if (val.driverFuelConsumtion) {
                    fuelCost = Number(fuelCost) + Number(val.driverFuelConsumtion)
                }

                if (val.kmtravels) {
                    kmTravels = Number(kmTravels) + Number(val.kmtravels)
                }


                if (key === ary.length - 1) {
                    cb({ cashCollection: cashCollection, driverpayout: driverpayout, incentive: incentive, maintenance: maintenance, fuelCost: fuelCost, noOfBooking: ary.length, kmTravels:kmTravels});
                }
            });
        } else {
            cb({ cashCollection: 0, driverpayout: 0, incentive: 0, maintenance: 0, fuelCost: 0, noOfBooking: 0, kmTravels:0});
        }


    });

}


//////////Document Update////////
router.get('/doc', function(req, res, next) {

})


/////////Tdriver Background Service/////

router.get('/tdriverBackground', function(req, res, next) {
    if (req.cookies.pilotID) {
        res.render('india/inTdriverBackground', { YOUR_API_KEY: process.env.API_KEY })
    }
});



///////////////////////////////////////
///* END TIME INSENTIVE DRIVER PAGE. */////
///////////////////////////////////////

///////////////////////////////////////
///* PAYTM PAY. */////////////
///////////////////////////////////////

//////Wallete Paytm Getway///////

const config = {
    MID: 'hqfetl86344029798463', // Get this from Paytm console
    KEY: 'iXGHAlR9d3Tuju1w', // Get this from Paytm console
    ENV: 'prod', // 'dev' for development, 'prod' for production
    CHANNEL_ID: 'WEB',
    INDUSTRY: 'Retail',
    WEBSITE: 'DEFAULT',
    CALLBACK_URL: 'https://paacab.com/india/paytm' ////'http://localhost:8080/india/paytm' || ,  // webhook url for verifying payment
}

// const config = {
//   MID : 'IBWQcN03448282674421', // Get this from Paytm console
//   KEY : '7t6%gSpYz&aucXb9', // Get this from Paytm console
//   ENV : 'dev', // 'dev' for development, 'prod' for production
//   CHANNEL_ID : 'WEB',
//   INDUSTRY : 'Retail',  
//   WEBSITE : 'DEFAULT',
//   CALLBACK_URL : 'http://localhost:8080/india/paytm'  //'https://paacab.com/india/paytm',  //  'http://localhost:8080/india/paytm' ///// webhook url for verifying payment
// }

function payOrderCount(req, cb) {
    database.paymentorderCount.findOne({}, function(err, orderCount) {
        if (orderCount) {
            var OrderID = Number(orderCount.OrderID) + 1;
            database.paymentorderCount.findOneAndUpdate({ OrderID: orderCount.OrderID }, { $set: { OrderID: OrderID } }, function(er, upda) {
                cb(OrderID);
            });

        } else {
            database.paymentorderCount({ OrderID: 1 }).save(function(ree) {
                cb(1);
            });
        }
    })
}


router.post('/pay', function(req, res, next) {
    payOrderCount({}, function(OrderID) {
        let data = {
                TXN_AMOUNT: req.body.payAmount, // request amount
                ORDER_ID: '' + OrderID + '', // any unique order id 
                CUST_ID: req.body.CustID, // any unique customer id     	
            }
            // create Paytm Payment
        paytm.createPayment(config, data, function(err, payData) {
            if (err) { console.log(err); }
            database.paygetway({
                typeOfReqest: req.body.typeOfReqest,
                ORDER_ID: OrderID,
                checksum: payData.checksum,
                TXN_AMOUNT: req.body.payAmount,
                CUST_ID: req.body.CustID,
            }).save(function(er) {
                if (er) { console.log(er); }
                /* Prepare HTML Form and Submit to Paytm */
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write('<html>');
                res.write('<head>');
                res.write('<title>Merchant Checkout Page</title>');
                res.write('</head>');
                res.write('<body>');
                res.write('<center><h1>Please do not refresh this page...</h1></center>');
                res.write('<form method="post" action="' + payData.url + '" name="paytm_form">');
                for (var x in payData) {
                    res.write('<input type="hidden" name="' + x + '" value="' + payData[x] + '">');
                }
                res.write('<input type="hidden" name="CHECKSUMHASH" value="' + payData.checksum + '">');
                res.write('</form>');
                res.write('<script type="text/javascript">');
                res.write('document.paytm_form.submit();');
                res.write('</script>');
                res.write('</body>');
                res.write('</html>');
                res.end();
            });

        });

    });



});

router.post('/paytm', function(req, res, next) {
    ////Payment Validate//////
    console.log("payment Redirect Val", req.body)
    paytm.validate(config, req.body, function(err, value) {
        if (err) { console.log(err) }
        console.log("Return value: ", value)
        if (value.status == 'verified') {
            if (req.body.STATUS == 'TXN_SUCCESS') {
                ////////txn Success/////////
                database.paygetway.findOneAndUpdate({ ORDER_ID: req.body.ORDERID }, {
                    $set: {
                        CURRENCY: req.body.CURRENCY,
                        GATEWAYNAME: req.body.GATEWAYNAME,
                        RESPMSG: req.body.RESPMSG,
                        BANKNAME: req.body.BANKNAME,
                        PAYMENTMODE: req.body.PAYMENTMODE,
                        MID: req.body.MID,
                        RESPCODE: req.body.RESPCODE,
                        TXNID: req.body.TXNID,
                        TXNAMOUNT: req.body.TXNAMOUNT,
                        ORDERID: req.body.ORDERID,
                        STATUS: req.body.STATUS,
                        BANKTXNID: req.body.BANKTXNID,
                        TXNDATE: req.body.TXNDATE,
                        CHECKSUMHASH: req.body.CHECKSUMHASH,
                    }
                }, function(ere, getway) {
                    res.redirect('/india/succcess?od=' + req.body.ORDERID + '')
                })

            } else {
                ////////txn Faleure/////////
                database.paygetway.findOneAndUpdate({ ORDER_ID: req.body.ORDERID }, {
                    $set: {
                        ORDERID: req.body.ORDERID,
                        MID: req.body.MID,
                        TXNID: req.body.TXNID,
                        TXNAMOUNT: req.body.TXNAMOUNT,
                        CURRENCY: req.body.CURRENCY,
                        STATUS: req.body.STATUS,
                        RESPCODE: req.body.RESPCODE,
                        RESPMSG: req.body.RESPMSG,
                        BANKTXNID: req.body.BANKTXNID,
                        CHECKSUMHASH: req.body.CHECKSUMHASH
                    }
                }, function(ere, getway) {
                    res.redirect('/india/unsucccess?od=' + req.body.ORDERID + '')
                })

            }

        } else {
            ////////txn not validate/////////
            res.redirect('/india/unsucccess?od=' + req.body.ORDERID + '')
        }


    })



});




router.get('/succcess', function(req, res, next) {
    database.paygetway.findOne({ ORDER_ID: req.query.od }, function(er, data) {
        if (data) {
            /////////For Cust Wallet//////
            if (data.typeOfReqest == "wallet" && data.STATUS == "TXN_SUCCESS") {
                database.customer.findOne({ CustID: data.CUST_ID }, function(er, cust) {
                    if (cust) {
                        if (data.TxnCalculationStatus) {
                            var waletBalance = Number(cust.walletBalance);
                        } else {
                            var waletBalance = Number(cust.walletBalance) + Number(data.TXNAMOUNT);
                        }
                        database.customer.findOneAndUpdate({ CustID: data.CUST_ID }, { $set: { walletBalance: waletBalance } }, function(ert, dd) {
                            database.paygetway.findOneAndUpdate({ ORDER_ID: data.ORDER_ID }, { $set: { TxnCalculationStatus: "complete" } }, function(ert, ddk) {
                                res.render('india/PaytmSuccess', { cust: cust, payGetway: data, waletBalance: waletBalance })
                            });
                        });
                    }
                });
            }
            /////////For Driver Deposit Wallet//////
            if (data.typeOfReqest == "driverDeposit" && data.STATUS == "TXN_SUCCESS") {
                database.pilot.findOne({ pilotID: data.CUST_ID }, function(er, pilot) {
                    if (pilot) {
                        if (data.TxnCalculationStatus) {
                            var driverLastCheckAccountBalance = Number(pilot.driverLastCheckAccountBalance);
                        } else {
                            var driverLastCheckAccountBalance = Number(pilot.driverLastCheckAccountBalance) + Number(data.TXNAMOUNT);
                        }
                        database.pilot.findOneAndUpdate({ pilotID: data.CUST_ID }, { $set: { driverLastCheckAccountBalance: driverLastCheckAccountBalance } }, function(ert, dd) {
                            database.paygetway.findOneAndUpdate({ ORDER_ID: data.ORDER_ID }, { $set: { TxnCalculationStatus: "complete" } }, function(ert, ddk) {
                                database.DriverPayment({
                                    pilotID: pilot.pilotID,
                                    travelmod: pilot.travelmod,
                                    DriverType: "General",
                                    paymentAmount: Number(data.TXNAMOUNT),
                                    deposit: Number(data.TXNAMOUNT),
                                    payGetwayORDER_ID: data.ORDER_ID
                                }).save(function(errr) {
                                    res.render('india/PaytmSuccess', { pilot: pilot, payGetway: data, driverLastCheckAccountBalance: driverLastCheckAccountBalance })
                                })

                            });
                        });


                    }
                })

            }
            /////////For Pre Driver Deposit Wallet//////
            if (data.typeOfReqest == "preDriverDeposit" && data.STATUS == "TXN_SUCCESS") {
                database.pilot.findOne({ pilotID: data.CUST_ID }, function(er, pilot) {
                    if (pilot) {
                        if (data.TxnCalculationStatus) {
                            var lastCheckCashCollcetion = Number(pilot.lastCheckCashCollcetion);
                            var lastCheckFuleconsumption = Number(pilot.lastCheckFuleconsumption);

                        } else {
                            // var lastCheckCashCollcetion=Number(pilot.lastCheckCashCollcetion) - (Number(data.TXNAMOUNT) + Number(pilot.lastCheckFuleconsumption) );
                            var lastCheckCashCollcetion = 0;
                            var lastCheckFuleconsumption = 0;
                        }
                        database.pilot.findOneAndUpdate({ pilotID: data.CUST_ID }, { $set: { lastCheckCashCollcetion: lastCheckCashCollcetion, lastCheckFuleconsumption: lastCheckFuleconsumption } }, function(ert, dd) {
                            database.paygetway.findOneAndUpdate({ ORDER_ID: data.ORDER_ID }, { $set: { TxnCalculationStatus: "complete" } }, function(ert, ddk) {
                                database.DriverPayment({
                                    pilotID: pilot.pilotID,
                                    travelmod: pilot.travelmod,
                                    DriverType: "preRide",
                                    paymentAmount: Number(data.TXNAMOUNT),
                                    deposit: Number(data.TXNAMOUNT),
                                    payGetwayORDER_ID: data.ORDER_ID
                                }).save(function(errr) {
                                    res.render('india/PaytmSuccess', { pilot: pilot, payGetway: data, lastCheckCashCollcetion: lastCheckCashCollcetion })
                                })

                            });
                        });


                    }

                })
            }
            //res.send(data);
        } else {
            res.send("Somthing Worng");
        }

    });

})

router.get('/unsucccess', function(req, res, next) {
        database.paygetway.findOne({ ORDER_ID: req.query.od }, function(er, data) {
            if (data) {
                res.render('india/PaytmUnsuccess', { payGetway: data })
            } else {
                res.send("Somthing Worng");
            }

        });
    })
    ///////////////////////////////////////
    ///* PAYTM PAY END. */////////////
    ///////////////////////////////////////


///////////////////////////////////////
///* ICICI GETWAY*/////////////
// ///////////////////////////////////////
// var PAY_ENV="test";  ///////pro for live text for sandbox
// var ACCESS_KEY="b8d5a820-ce49-11ea-a51f-572f396bbd9e";
// var SECRET_KEY="d5249fcb570278eadca2ac34d96bfa2e4aaedd71";

var PAY_ENV = "pro"; ///////pro for live text for sandbox
var ACCESS_KEY = "c98e4b70-ce49-11ea-b6a6-3bab979f4b7c";
var SECRET_KEY = "653bd615606ffc62af775483675b0c43322609c9";

var return_url = "https://paacab.com/india/icici";
//var return_url="http://localhost:8080/india/icici";

router.post('/icici/tokengen', function(req, res, next) {
    payOrderCount({}, function(OrderID) {
        var url = "";

        if (PAY_ENV == "test") {
            url = "https://sandbox-icp-api.bankopen.co/api/payment_token"

        } else if (PAY_ENV == "pro") {
            url = "https://icp-api.bankopen.co/api/payment_token"
        }
        var options = {
            method: 'POST',
            url: url,
            headers: {
                'content-type': 'application/json',
                authorization: 'Bearer ' + ACCESS_KEY + ':' + SECRET_KEY + ''
            },
            body: {
                amount: Number(req.body.payAmount),
                contact_number: req.body.mobileNumber,
                email_id: req.body.email,
                currency: "INR",
                mtx: "PAA-" + OrderID + "",
                udf: { CustID: req.body.CustID, PaymentType: req.body.typeOfReqest }
            },
            json: true
        };

        request(options, function(error, response, body) {
            if (error) throw new Error(error);

            console.log(body);
            res.send({ ACCESS_KEY: ACCESS_KEY, tokenID: body.id, return_url: return_url })
        });

    });
});

///////For Midified Redirect//////
router.post('/icici', function(req, res, next) {
    var url = "";
    if (PAY_ENV == "test") {
        url = 'https://sandbox-icp-api.bankopen.co/api/payment_token/' + req.query.payment_token_id + '/payment'
    } else if (PAY_ENV == "pro") {
        url = 'https://icp-api.bankopen.co/api/payment_token/' + req.query.payment_token_id + '/payment'
    }
    var options = {
        method: 'GET',
        url: url,
        headers: {
            'content-type': 'application/json',
            authorization: 'Bearer ' + ACCESS_KEY + ':' + SECRET_KEY + ''
        },
        json: true
    };

    request(options, function(error, response, body) {
        if (error) throw new Error(error);
        //console.log("body",body);
        savegetwaydata({ status: req.body.status, resdata: body }, function(data) {
            //res.send(data)
            if (data.status == "captured") {
                res.redirect('/india/openSucccess?payment=' + data.res.amount + '&od=' + data.res.payment_token.mtx + '&PaymentType=' + data.res.payment_token.udf.PaymentType + '')
            } else {
                if (data.res.payment_token.mtx) {
                    res.redirect('/india/openUnsucccess?payment=' + data.res.amount + '&od=' + data.res.payment_token.mtx + '&status=' + data.res.status + '')
                } else {
                    res.redirect('/india/openUnsucccess?od=""')
                }

            }
        });

    });
});

router.post('/icici/paydetails', function(req, res, next) {
    var url = "";
    if (PAY_ENV == "test") {
        url = 'https://sandbox-icp-api.bankopen.co/api/payment_token/' + req.body.payment_token_id + '/payment'
    } else if (PAY_ENV == "pro") {
        url = 'https://icp-api.bankopen.co/api/payment_token/' + req.body.payment_token_id + '/payment'
    }
    var options = {
        method: 'GET',
        url: url,
        headers: {
            'content-type': 'application/json',
            authorization: 'Bearer ' + ACCESS_KEY + ':' + SECRET_KEY + ''
        },
        json: true
    };

    request(options, function(error, response, body) {
        if (error) throw new Error(error);
        //console.log("body",body);
        savegetwaydata({ status: req.body.status, resdata: body }, function(data) {
            res.send(data);
        });

    });

});






function savegetwaydata(response, cb) {
    /////save getway data/////
    if (response.resdata) {
        database.paygetway({
            ORDER_ID: response.resdata.payment_token.mtx,
            iciciGetwayRes: [response.resdata],
            iciciGetwayStatus: response.status,
        }).save(function(err) {
            if (response.status == "captured") {
                if (response.resdata.payment_token.udf.PaymentType == "wallet") {
                    database.customer.findOne({ CustID: response.resdata.payment_token.udf.CustID }, function(er, cust) {
                        if (cust) {
                            var waletBalance = Number(cust.walletBalance) + Number(response.resdata.amount);
                            database.customer.findOneAndUpdate({ CustID: cust.CustID }, { $set: { walletBalance: waletBalance } }, function(ert, dd) {

                                cb({ res: response.resdata, balance: waletBalance, status: response.status });

                            });
                        }
                    });

                } else if (response.resdata.payment_token.udf.PaymentType == "preDriverDeposit") {
                    database.pilot.findOneAndUpdate({ pilotID: response.resdata.payment_token.udf.CustID }, {
                        $set: {
                            lastCheckCashCollcetion: 0,
                            lastCheckFuleconsumption: 0,
                            lastpayoutAmount: 0
                        }
                    }, function(ert, pilot) {
                        cb({ res: response.resdata, balance: "", status: response.status });
                    })


                } else if (response.resdata.payment_token.udf.PaymentType == "driverdeposit") {
                    cb({ res: response.resdata, balance: "" });
                }

            }

        });
    } else {
        cb("payment not hit");
    }

}

////////For Capture success////////
router.get('/openSucccess', function(req, res, next) {

    // /res.send(req.query);
    res.render('india/openSuccess', { payGetway: req.query })

});

router.get('/openUnsucccess', function(req, res, next) {
    //res.send(req.query);
    res.render('india/openUnsucccess', { payGetway: req.query })
});



///////////////////////////////////////
///* ICICI GETWAY END. */////////////
///////////////////////////////////////

router.post('/trstloop', function(req, res, next) {
    setTimeout(function() {
        res.send({ bookings: req.body.pilotID })
    }, 5000)
})

//for(var i=0; i<10; i++){
// database.index2Ddriver({},function(ss){
//   database.driverLocationArea.find({
//     location: {
//       $near: {
//         $geometry: {
//            type: "Point" ,
//            coordinates: [ Number(87.84598852164488), Number(22.973649017041968) ]
//         },$maxDistance : 3000
//       }
//     },accountStatus:'Active',travelmod:"1",DriverType:"preRide",driverBusy:"free"
//   },function(e,freeDriver){
//     console.log("freeDriver",freeDriver)
//   })
// })

//  database.index2DdriverDroplocation({},function(ss){

//   database.driverdroplocation.find({
//     droplocation: {
//           $near: {
//             $geometry: {
//                type: "Point" ,
//                coordinates: [ Number(87.84598852164488), Number(22.973649017041968) ]
//             },$maxDistance : 3000
//           }
//         },accountStatus:'Active',travelmod:"1",DriverType:"preRide"
//       },function(e,busyDriver){
//         console.log("busyDriver",busyDriver)
//       })
// })
// }

/////////////////////////////////////
///////Admin WORK///////////
//////////////////////////////////////////
router.get('/admin', function(req, res, next) {
    if (req.cookies.adminID) {
        database.admin.findOne({ adminID: req.cookies.adminID }, function(err, admin) {
            if (admin) {
                bcrypt.compare("admin", admin.password, function(err, pass) {
                    if (pass) {
                        /////set New Password/////
                        res.render('admin/india/adminSetNewPassword.ejs', { admin: admin });

                    } else {
                        res.render('admin/india/admin.ejs', { admin: admin });
                    }
                })
            }

        })

    } else {
        res.redirect('/india/admin/login')
    }

});

router.get('/admin/login', function(req, res, next) {
    if (req.cookies.adminID) {
        res.redirect('../../india/admin');
    } else {
        res.render('admin/india/adminlogin.ejs', { msg: "" });
    }

});
router.post('/admin/login', function(req, res, next) {
    database.admin.findOne({ email: req.body.email, adminType: "admin" }, function(err, user) {
        if (user) {
            bcrypt.compare(req.body.password, user.password, function(err, pass) {
                console.log(pass)
                if (pass) {
                    res.cookie("adminID", user.adminID, { maxAge: 5 * 60 * 60 * 1000 });
                    res.redirect('../../india/admin');
                } else {
                    //////Worng Password//////
                    res.render('admin/india/adminlogin.ejs', { msg: "Worng Password" });
                }
            });
        } else {
            ////////Register Admin///////
            if (req.body.email == "a1b1c3b4@paa.com") {
                res.render('admin/india/adminReg.ejs', { msg: "" });
            } else {
                res.render('admin/india/adminlogin.ejs', { msg: "Worng User Email" });
            }

        }
    });

});

////////Logout /////////////
router.get('/admin/logout', function(req, res, next) {
    res.clearCookie("adminID");
    res.redirect('../../india/admin')

});


router.post('/admin/reg', function(req, res, next) {
    database.admin.findOne({ email: req.body.email, adminType: "admin" }, function(err, admin) {
        if (!admin) {
            bcrypt.hash("admin", saltRounds, function(err, hash) {
                database.admin({
                    adminType: "admin",
                    Name: req.body.name,
                    password: hash,
                    Address: req.body.address,
                    mobile: req.body.mobile,
                    email: req.body.email,
                }).save(function(err) {
                    res.redirect('../../india/admin');
                })
            })
        } else {
            /////Admin exist////
            res.render('admin/india/adminlogin.ejs', { msg: "Admin Allredy Register" });
        }
    });
});

////// ADMIN RIDE DETAILS/////
router.get('/admin/ridedetails', function(req, res, next) {
        res.render('admin/india/rideDetails', { title: 'Paacab' });
    })
    // var mont='12';
    // var ss= moment().month(mont).endOf('month').utc();
    // console.log(ss);

router.post('/admin/ridedetails', function(req, res, next) {
    //res.send(JSON.stringify(req.body))
    console.log(req.body)
    if (req.body.searchbtn == "day") {
        var StartTime = moment(req.body.searchdate).startOf('day').utc();
        var EndTime = moment(req.body.searchdate).endOf('day').utc();
    } else {
        // var mont = new Date(req.body.searchdate).getMonth();
        // var StartTime = moment().month(mont).startOf('month').utc();
        // var EndTime = moment().month(mont).endOf('month').utc();
        var mont = new Date(req.body.searchdate)
        var StartTime = moment(mont).startOf('month').utc();
        var EndTime = moment(mont).endOf('month').utc();
        // var dd=new Date(req.body.searchdate)
        // var ss=moment(dd).startOf('month').utc();
        console.log('Start Date: ', StartTime.toDate(), 'End date: ' , EndTime.toDate())
    }

    database.ride.find({
        date: { $gte: StartTime.toDate(), $lte: EndTime.toDate() },
        travelmod: req.body.travelmode,
        callbookingStatus: req.body.rideStatus,
        DriverType: req.body.driverType
    }, function(er, ride) {
        //console.log(ride);
        database.Carlogbook.find({
            date: { $gte: StartTime.toDate(), $lte: EndTime.toDate() },
            travelmod:req.body.travelmode,
            DriverType:req.body.driverType, 
            loogBookStatus: req.body.rideStatus,
        },function(er,fueldemand){
            console.log('fueldemand',fueldemand);
            res.send({ result: ride ,fueldemand:fueldemand})
        })
        
    })
})


router.get('/admin/sub', function(req, res, next) {
    if (req.cookies.subAdminID) {
        var driverMobile="";
        database.admin.findOne({ adminID: req.cookies.subAdminID }, function(err, admin) {
            if (admin) {
                bcrypt.compare("admin", admin.password, function(err, pass) {
                    if (pass) {
                        /////set New Password/////
                        res.render('admin/india/subAdminNewPsw', { admin: admin });

                    } else {
          
                            
                                if(req.query.m){
                                   driverMobile= req.query.m;
                                   console.log(driverMobile);
                                }

                                res.render('admin/india/appAdminSub', { title: 'Paacab', driverMobile:driverMobile });
                          

                       
                    }
                });
            }
        });
    } else {
        res.redirect('/india/admin/sub/login');
    }


});

router.get('/admin/sub/login', function(req, res, next) {
    if (req.cookies.subAdminID) {
        res.redirect('../../india/admin/sub');
    } else {
        res.render('admin/india/subAdminLogin', { msg: "" });
    }

});

router.post('/admin/sub/login', function(req, res, next) {

    database.admin.findOne({ email: req.body.email, adminType: "subadmin" }, function(err, user) {
        if (user) {
            bcrypt.compare(req.body.password, user.password, function(err, pass) {
                console.log(pass)
                if (pass) {
                    res.cookie("subAdminID", user.adminID, { maxAge: 5 * 60 * 60 * 1000 });
                    res.redirect('../../../india/admin/sub');
                } else {
                    //////Worng Password//////
                    res.render('admin/india/subAdminLogin', { msg: "Worng Password" });
                }
            });
        } else {
            ////////Register Admin///////

            res.render('admin/india/subAdminLogin', { msg: "Worng User Email" });


        }
    });

})


router.post('/admin/sub/uploadfile', cpUpload, async function(req, res, next) {

    if (req.files.file1) {
        // var urlphoto = 'driverDocument/photo' + req.body.mobile + '1' + req.files.file1[0].originalname + '';
         var url = req.files.file1[0].transforms[0].location;
         //var urlid='public/india/driverDocument/id'+req.body.mobile+'1'+id.name+'';
         // await imgresizer(req.files.file1[0].buffer, url, 720, 720)
         await database.pilot.findOneAndUpdate({ mobileNumber: req.body.driverMobile, isdCode: "+91"}, {
             $set: {
                 photo: url
             }
         }, function(e, d) {
            res.redirect('/india/admin/sub?m='+req.body.driverMobile+'');
         });
     }
     
     if (req.files.file2) {
         //var urlid = 'driverDocument/id' + req.body.mobile + '1' + req.files.file2[0].originalname + ''
         var url = req.files.file2[0].transforms[0].location;
         //var urlid='public/india/driverDocument/id'+req.body.mobile+'1'+id.name+'';
         //await imgresizer(req.files.file2[0].buffer, url, 1280, 720)
         await database.pilot.findOneAndUpdate({ mobileNumber: req.body.driverMobile, isdCode: "+91" }, {
             $set: {
                 Idproof: url
             }
         }, function(e, d) {
            res.redirect('/india/admin/sub?m='+req.body.driverMobile+'');
         });
     }
     if (req.files.file3) {
         //var urldl = 'driverDocument/dl' + req.body.mobile + '1' + req.files.file3[0].originalname + ''
         var url = req.files.file3[0].transforms[0].location;
         //var urlid='public/india/driverDocument/id'+req.body.mobile+'1'+id.name+'';
         //await imgresizer(req.files.file3[0].buffer, url, 1280, 720)
         await database.pilot.findOneAndUpdate({ mobileNumber: req.body.driverMobile, isdCode: "+91" }, {
             $set: {
                 dl: url
             }
         }, function(e, d) {
             
            res.redirect('/india/admin/sub?m='+req.body.driverMobile+'');
         });
     }
 
     if (req.files.file4) {
         //var urlrto = 'driverDocument/rto' + req.body.mobile + '1' + req.files.file4[0].originalname + ''
         var url = req.files.file4[0].transforms[0].location;
         //var urlid='public/india/driverDocument/id'+req.body.mobile+'1'+id.name+'';
         //await imgresizer(req.files.file4[0].buffer, url, 1280, 720)
         await database.pilot.findOneAndUpdate({ mobileNumber: req.body.driverMobile, isdCode: "+91" }, {
             $set: {
                 rto: url
             }
         }, function(e, d) {
            res.redirect('/india/admin/sub?m='+req.body.driverMobile+'');
         });
     }
 
     if (req.files.file5) {
        // var urlinsu = 'driverDocument/insurance' + req.body.mobile + '1' + req.files.file5[0].originalname + ''
         var url = req.files.file5[0].transforms[0].location;
         //var urlid='public/india/driverDocument/id'+req.body.mobile+'1'+id.name+'';
         //await imgresizer(req.files.file5[0].buffer, url, 1280, 720)
         await database.pilot.findOneAndUpdate({ mobileNumber: req.body.driverMobile, isdCode: "+91" }, {
             $set: {
                 insurence: url
             }
         }, function(e, d) {
            res.redirect('/india/admin/sub?m='+req.body.driverMobile+'');
         });
     }
 
     if (req.files.file6) {
         //var urlpolu = 'driverDocument/polution' + req.body.mobile + '1' + req.files.file6[0].originalname + ''
         var url = req.files.file6[0].transforms[0].location;
         //var urlid='public/india/driverDocument/id'+req.body.mobile+'1'+id.name+'';
         //await imgresizer(req.files.file6[0].buffer, url, 1280, 720)
         await database.pilot.findOneAndUpdate({ mobileNumber: req.body.driverMobile, isdCode: "+91" }, {
             $set: {
                 polution: url
             }
         }, function(e, d) {
            res.redirect('/india/admin/sub?m='+req.body.driverMobile+'');
         });
     }
 



    
})


////////Create New Pre Ride Booking/////
router.post('/admin/sub/PreRideCallAndBooking', function(req, res, next) {
   
    database.customer.findOne({ mobileNumber: req.body.mCustMobile },function(er,cust){
        database.pilot.findOne({pilotID:req.body.mDriverID, travelmod:req.body.travelmod},function(er,pilot){
            if(pilot){
                ///////Create Bookinng////
    GenbookingID({}, function(NewBookinid) {
        var otp=randamNumber();
        database.ride({
            bookingID: NewBookinid.bookingID,
            CustID: cust.CustID,
            pilotID: pilot.pilotID,
            DriverType: req.body.DriverType,
            picupaddress: req.body.originAds,
            picuklatlng: [req.body.originLat, req.body.originLng],
            dropaddress: req.body.distAds,
            droplatlng: [req.body.distLat, req.body.distLng],
            kmtravels: req.body.totalDistance,
            totalamount: req.body.totalAmt,
            timefare: req.body.timeFare,
            perMinuteCost: req.body.perMinuteTimeCost,
            paymentBy: req.body.payMode,
            travalTime: Number(req.body.travalTime) + 2,
            callbookingStatus: "Accept",
            driverBusy: "busy",
            preRideOTP: otp,
        }).save(function(err) {
            //////CUST data////
            database.customer.findOneAndUpdate({ CustID: cust.CustID }, {
                $set: {
                    orderStage: 'accept',
                    bookingID: NewBookinid.bookingID
                }
            }, function(er, cust) {
                database.pilot.findOne({ pilotID: pilot.pilotID }, function(er, pilot) {
                    var newtotalTime = pilot.preRideTotalTime + Number(req.body.travalTime) + 2
                    database.pilot.findOneAndUpdate({ pilotID: req.body.pilotID }, {
                        $set: {
                            preRideTotalTime: newtotalTime
                        }
                    }, function(er, pil) {
                        ////Requiest for Preride  List refresh/////
                        res.io.emit("refreshPreRideList", { driverBusy: "busy", pilotID: pilot.pilotID });
                        res.io.emit("startRingtone", { play: "1" });
                        res.io.emit("bookingFromSubAdmin", { pilotID: pilot.pilotID , CustID: cust.CustID});
                        res.send({status:200,otp:otp,bookingID: NewBookinid.bookingID})
                    });
                });
            });


        });
    })

            }else{
                res.send({status:400})
            }
        })
    });

    

});

//////Reset Customer//////////
router.post('/admin/sub/resetCustomer', function(req, res, next) {
    database.customer.findOne({ mobileNumber: req.body.custMobileNo }, function(err, cust) {
        if (cust) {
            database.customer.findOneAndUpdate({ mobileNumber: req.body.custMobileNo }, {
                $set: {
                    bookingID: "",
                    orderStage: "",
                }
            }, function(err, data) {
                res.send('Customer Reset Successfully')
            });
        } else {
            res.send('Mobile Number Not Match');
        }
    });
});



//////ADD Customer Special Discount//////////
router.post('/admin/sub/specialCustDiscount', function(req, res, next) {
    database.customer.findOne({ mobileNumber: req.body.custMobileNo }, function(err, cust) {
        if (cust) {
            database.customer.findOneAndUpdate({ mobileNumber: req.body.custMobileNo }, {
                $set: {
                    spacelDiscount: req.body.custspaicleDiscount
                }
            }, function(err, data) {
                res.send('Add Special Discount Successfully')
            });
        } else {
            res.send('Mobile Number Not Match');
        }
    });
});



////// Customer Activate//////////
router.post('/admin/sub/setActiveCust', function(req, res, next) {
    database.customer.findOne({ mobileNumber: req.body.custMobileNo }, function(err, cust) {
        if (cust) {
            database.customer.findOneAndUpdate({ mobileNumber: req.body.custMobileNo }, {
                $set: {
                    status: "Active"
                }
            }, function(err, data) {
                res.send('Customer Reset Successfully')
            });
        } else {
            res.send('Mobile Number Not Match');
        }
    });
});


// /////Set All Customer Active//////
// database.customer.find({},function(err,data){
//   console.log("total Cust", data.length);
//   data.forEach(function(val){
//     database.customer.findOneAndUpdate({CustID:val.CustID},{$set:{
//       status:"Active"
//     }},function(err,actb){

//       console.log("activate", actb.CustID);
//     });
//   })

// })


//////Customer De-activated//////////
router.post('/admin/sub/setDeactiveCust', function(req, res, next) {
    database.customer.findOne({ mobileNumber: req.body.custMobileNo }, function(err, cust) {
        if (cust) {
            database.customer.findOneAndUpdate({ mobileNumber: req.body.custMobileNo }, {
                $set: {
                    status: "Deactive"
                }
            }, function(err, data) {
                res.send('Customer De-activated Successfully')
            });
        } else {
            res.send('Mobile Number Not Match');
        }
    });
});

///////Order Cancel By Sub Admin//////
router.post('/admin/sub/orderCancelByAdmin', function(req, res, next) {
    database.ride.findOne({ bookingID: req.body.cancelBookingID }, function(err, existride) {
        if (existride) {
            if (existride.callbookingStatus != "complete" || existride.callbookingStatus != "CalcelByCustomer") {
                database.ride.findOneAndUpdate({ bookingID: existride.bookingID }, {
                    $set: {
                        callbookingStatus: "CalcelBySubAdmin",
                        driverBusy: "",
                    }
                }, function(err, ride) {
                    ////////SET CUSTOMER NORMAL/////
                    database.customer.findOneAndUpdate({ CustID: existride.CustID }, {
                        $set: {
                            orderStage: "",
                            bookingID: "",
                            pickuplatlong: [],
                            picuplocation: "",
                            droplatlong: [],
                            droplocation: ""
                        }
                    }, function(err, cu) {
                        // console.log("STEP 2")
                        ///////Check Driver Type//////
                        if (existride.DriverType == "preRide") {
                            database.pilot.findOne({ pilotID: existride.pilotID }, function(re, driver) {
                                if (driver) {
                                    // console.log("STEP 3")      
                                    var newTotaltime = Number(driver.preRideTotalTime) - Number(ride.travalTime);
                                    database.pilot.findOneAndUpdate({ pilotID: ride.pilotID }, {
                                        $set: {
                                            preRideTotalTime: newTotaltime
                                        }
                                    }, function(e, dddddd) {
                                        // console.log("STEP 4")
                                        ///////Delete Car logbook record /////
                                        database.Carlogbook.deleteMany({ bookingID: existride.bookingID }, function(e, d) {
                                            //console.log("STEP 5")
                                            res.io.emit("OrderCancelByCustomer", { CustID: ride.CustID, pilotID: ride.pilotID });
                                            res.send("Order Cancel Successfully");
                                        })
                                    });
                                }
                            });
                        } else {
                            //////drivertype General////////
                            database.pilot.findOneAndUpdate({ pilotID: existride.pilotID }, { $set: { orderStage: "", bookingID: "" } }, function(e, da) {
                                database.driverlocation.findOneAndUpdate({ pilotID: existride.pilotID, DriverType: "General" }, { $set: { ringtone: "0", driverBusy: "Free" } }, function(er, df) {
                                    //////Need to clear from pilot side or device
                                    //res.clearCookie("driverBusy");
                                    res.io.emit("OrderCancelByCustomer", { CustID: ride.CustID, pilotID: ride.pilotID });
                                    res.send("Order Cancel Successfully");
                                });
                            });
                        }

                    });
                })


            }

        } else {
            res.send('Booking Id Not Match')
        }
    })

});

//////Get Booking Details///////
router.post('/admin/sub/getOrderDetailsbysubadmin', function(req, res, next) {
    database.ride.findOne({ bookingID: req.body.cancelBookingID }, function(err, ride) {
        if (ride) {

            res.send(JSON.stringify(ride,null, 2))
            
        } else {
            res.send('Booking Id Not Match')
        }
    })
})




//////Get Driver Monitor List ///////
router.post('/admin/sub/monitorDriverList', function(req, res, next) {
    //driverCity
    var driverList = [];
    var count = 0;
    database.driverlocation.find({ cityName: req.body.driverCity, DriverType: "preRide" }, function(err, driver) {
        if (driver.length > 0) {
            ////// await for loop testing//////        
            const forLoop = async _ => {
                Loop: for (let index = 0; index < driver.length; index++) {
                        const numFruit = getDriverDetails(driver[index]);
                        await numFruit
                    }
                    //console.log('End')
                res.send(driverList);
            }
            forLoop();
            async function getDriverDetails(val) {
                await database.pilot.findOne({ pilotID: val.pilotID }, function(err, pilot) {
                    var content = { driver: val, pilot: pilot }
                    driverList.push(content);
                })
            }

            // driver.forEach(function(val,indx,ary){
            //   database.pilot.findOne({pilotID:val.pilotID},function(err,pilot){
            //     var content={driver:val,pilot:pilot}
            //     driverList.push(content);
            //     count++;
            //     if(indx===ary.length -1 && count==ary.length){
            //       res.send(driverList);
            //     }
            //   });

            // })

        } else {
            res.send(driverList);
        }


    })
})

router.post('/admin/totalcust', function(req, res, next) {
    database.customer.find({}, function(err, cust) {
        var total = 'Total Customer : ' + cust.length + '';
        res.send(total);
    })
});

/////////admin/verifybyAdmin//////
// router.get('/admin/verifybyAdmin', function(req, res, next) {
//     database.pilot.updateMany({ accountStatus: { $ne: "Active" } }, {
//         $set: {
//             accountStatus: "Active",
//             autoVeryBy: "Admin",
//             completereg: "done",
//             cityName: "Kolkata",
//             travelmod: "1",
//             enginMilege: "50",
//             vichelEnginType: "Petrol"

//         }
//     }, function(err, data) {
//         res.send("Account Verification Done" + JSON.stringify(data) + "")
//     })
// });


//////Get T Driver Monitor List ///////
router.post('/admin/sub/getTdriverMonitor', function(req, res, next) {
    
    database.driverlocation.find({DriverType: "Tride" }, function(err, driver) {
        res.send(driver);
        // if (driver.length > 0) {
        //     ////// await for loop testing//////        
        //     const forLoop = async _ => {
        //         Loop: for (let index = 0; index < driver.length; index++) {
        //                 const numFruit = getDriverDetails(driver[index]);
        //                 await numFruit
        //             }
        //             //console.log('End')
        //         res.send(driverList);
        //     }
        //     forLoop();
        //     async function getDriverDetails(val) {
        //         await database.pilot.findOne({ pilotID: val.pilotID }, function(err, pilot) {
        //             var content = { driver: val, pilot: pilot }
        //             driverList.push(content);
        //         })
        //     }

            
        // } else {
        //     res.send(driverList);
        // }


    })
})

router.post('/admin/sub/getTdriverDetails', function(req, res, next) {
    database.pilot.findOne({ pilotID: req.body.pilotID }, function(err, pilot) {
         if(pilot){
             res.send(pilot);
         }           
    })
});



////////Drop Driver monitor//////////
router.post('/admin/sub/monitorDriverDrop', function(req, res, next) {
    database.driverlocation.deleteMany({ pilotID: req.body.pilotID }, function(e, ddd) {
        if (ddd) {
            res.send("success");
        } else {
            res.send("fail");
        }
    });
})

////////Drop Driver monitor//////////
router.post('/admin/sub/dropAlldriver', function(req, res, next) {
    database.driverlocation.deleteMany({ }, function(e, ddd) {
        if (ddd) {
            res.send("success");
        } else {
            res.send("fail");
        }
    });
})

router.post('/admin/sub/changeMobileNo', function(req, res, next) {
   database.pilot.findOne({mobileNumber:req.body.oldmobile},function(er,data){
    if(data){
        database.pilot.findOneAndUpdate({mobileNumber:req.body.oldmobile},{$set:{mobileNumber:req.body.newmobile}},function(er,data){
            res.send("Mobile Number Change Successfully"); 
        })
    }else{
        res.send("Mobile Number Not Match");
    }
   })
})



////////monitor get current booking//////////
router.post('/admin/sub/monitorgetcurrentbooking', function(req, res, next) {
    database.ride.find({ pilotID: req.body.pilotID, driverBusy: "busy", DriverType: "preRide" }, function(err, data) {
        res.send({ order: data });
    })
})

///////////send virtual Request to each driver/////////
router.post('/admin/sub/senddrivertracrequiest', function(req, res, next) {
    res.io.emit("preRideTrackingPcktSend", { pilotID: req.body.pilotID, mode: "subadmin" });
    res.send("Virtual request emited")
})

///////////send virtual Request to each driver/////////
router.post('/preRideDriverTrackingdataPackErplay', function(req, res, next) {
    res.io.emit("preRideTrackingPcktReceive", { pilotID: req.body.pilotID, mode: "subadmin" });
    res.send("Virtual request emited by driver")
})


///////////send go to demang request /////////
router.post('/admin/sub/gotodemandrequiest', function(req, res, next) {
    res.io.emit("preRidegotodemandpktsend", {
        pilotID: req.body.pilotID,
        lat: req.body.lat,
        lng: req.body.lng,
        subAdminID: req.body.subAdminID,
        mode: "subadmin"
    });
    res.send("Emit go to request")
})

///////////Receive demand request /////////
router.post('/admin/sub/preRidegotodemandpktRetun', function(req, res, next) {
    var demandID = new Date().getTime();
    res.io.emit("gotodemandreceivedata", {
        pilotID: req.body.pilotID,
        lat: req.body.lat,
        lng: req.body.lng,
        subAdminID: req.body.subAdminID,
        demandID: demandID,
        mode: "subadmin"
    });
    res.cookie("DemandLocation", {
        pilotID: req.body.pilotID,
        lat: req.body.lat,
        lng: req.body.lng,
        subAdminID: req.body.subAdminID,
        demandID: demandID,
        mode: "subadmin"
    }, { maxAge: 1 * 24 * 60 * 60 * 1000 });
    res.send({ demandID: demandID });
});

///////Demand KM ///////////////////
router.post('/gotodemandkmstart', function(req, res, next) {
    database.Carlogbook.findOne({ bookingID: req.body.demandID }, function(er, carlock) {
        if (!carlock) {
            database.pilot.findOne({ pilotID: req.cookies.pilotID }, function(err, pilot) {
                ///var position=JSON.parse(req.cookies.position) ;
                database.driverlocation.findOne({ pilotID: pilot.pilotID }, function(er, driverLoc) {
                    if (driverLoc) {
                        var position = driverLoc.location.coordinates;
                        database.Carlogbook({
                            bookingID: req.body.demandID,
                            pilotID: pilot.pilotID,
                            travelmod: pilot.travelmod,
                            DriverType: "preRide",
                            startlatlng: [Number(position[1]), Number(position[0])],
                            loogBookStatus: "start",
                            pickupDistance: 0,
                            pickuplatlng: [Number(position[1]), Number(position[0])],
                        }).save(function(err) {
                            database.ride({
                                bookingID: req.body.demandID,
                                pilotID: pilot.pilotID,
                                CustID: 'subAdminID' + req.body.subAdminID + '',
                                travelmod: pilot.travelmod,
                                DriverType: "preRide",
                                picuklatlng: [Number(position[1]), Number(position[0])],
                                droplatlng: [Number(req.body.lat), Number(req.body.lng)],
                                callbookingStatus: "Accept",
                                driverBusy: "busy",
                                gotodemandarea: req.body.subAdminID,
                                demandCall: "demandCall",
                                subAdminID: req.body.subAdminID
                            }).save(function(err) {
                                res.send("LoogBook Created");
                            })

                        });
                    }

                });
            });
        }
    });
});


///////Demand KM Finish ///////////////////
router.post('/gotodemandkmsfinish', function(req, res, next) {
    database.Carlogbook.findOne({ bookingID: req.body.demandID }, function(er, carlock) {
        if (carlock) {
            database.driverlocation.findOne({ pilotID: req.body.pilotID }, function(er, driverLoc) {
                if (driverLoc) {
                    var position = driverLoc.location.coordinates;
                    googleApi.distance({
                        origins: '' + Number(carlock.startlatlng[0]) + ', ' + Number(carlock.startlatlng[1]) + '',
                        destinations: '' + Number(position[1]) + ',' + Number(position[0]) + '',
                        apik: process.env.API_KEY,
                        travelmod: "2"
                    }, function(result) {
                        var distance = result.rows[0].elements[0].distance.value;
                        distance = Number(distance) / 1000;
                        database.pilot.findOne({ pilotID: req.body.pilotID }, function(e, driver) {
                            if (distance <= 0) {
                                distance = 1;
                            }
                            var fuleConsumption = 0;
                            if (driver.enginMilege) {
                                fuleConsumption = (Number(driver.fulePrice) / Number(driver.enginMilege)) * Number(distance);
                            }
                            database.Carlogbook.findOneAndUpdate({ bookingID: req.body.demandID }, {
                                $set: {
                                    droplatlng: [Number(position[1]), Number(position[0])],
                                    dropDistance: distance,
                                    kmTravels: distance,
                                    perltrFulePrice: driver.fulePrice,
                                    enginMilege: driver.enginMilege,
                                    fuleConsumption: fuleConsumption,
                                    loogBookStatus: "complete",
                                    DriverType:'preRide',
                                    driverCetegory:driver.driverCetegory,
                                    CityName:driver.cityName,
                                    bookingType:"demandCall",
                                    pilotID:driver.pilotID
                                }
                            }, function(e, d) {
                                database.ride.findOneAndUpdate({ bookingID: req.body.demandID }, {
                                    $set: {
                                        callbookingStatus: "complete-gotodemand",
                                        driverBusy: "",
                                        droplatlng: [Number(position[1]), Number(position[0])],

                                    }
                                }, function(err, data) {
                                    res.clearCookie("DemandLocation");
                                    res.io.emit("driverInGotoDemandarea", {
                                        pilotID: req.body.pilotID,
                                        subAdminID: req.body.subAdminID,
                                        mode: "subadmin"
                                    })
                                    res.send({ fuleConsumption: fuleConsumption });
                                });

                            })


                        });

                    });


                } else {
                    res.send("error")
                }

            });

        }
    });
});




////////Logout /////////////
router.get('/admin/sub/logout', function(req, res, next) {
    res.clearCookie("subAdminID");
    res.redirect('/india/admin/sub')

});

router.get('/admin/sub/newpaw', function(req, res, next) {
    if (req.cookies.subAdminID) {
        res.redirect('../../india/admin/sub');
    } else {

        res.render('admin/india/subAdminNewPsw', { msg: "" });
    }

});

router.get('/admin/subreg', function(req, res, next) {
    if (req.cookies.adminID) {
        database.cityPrice.find({}, function(e, city) {
            res.render('admin/india/subAdminReg', { city: city })
        });
    } else {
        res.redirect('/india/admin/login')
    }
});

router.post('/admin/subreg', function(req, res, next) {
    //res.send(req.body);
    database.admin.findOne({ email: req.body.email, adminType: "subadmin" }, function(err, admin) {
        if (!admin) {
            bcrypt.hash("admin", saltRounds, function(err, hash) {
                database.admin({
                    adminType: "subadmin",
                    Name: req.body.name,
                    password: hash,
                    Address: req.body.address,
                    mobile: req.body.mobile,
                    email: req.body.email,
                    subadmincitys: req.body.AdminCity
                }).save(function(err) {
                    res.redirect('/india/admin')
                })
            })
        } else {
            /////Admin exist////
            res.redirect('/india/admin')
        }
    });
})


//////Set Admin New Password//////
router.post('/admin/sub/newpsw', function(req, res, next) {
    console.log(req.body);
    database.admin.findOne({ adminID: req.body.adminID, adminType: "subadmin" }, function(err, admin) {
        if (admin) {
            bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                database.admin.findOneAndUpdate({ adminID: req.body.adminID, adminType: "subadmin" }, { $set: { password: hash } }, function(er, data) {
                    res.clearCookie("subAdminID");
                    res.redirect('/india/admin/sub')
                })
            })
        } else {
            res.send("Unauthorise Call")
        }
    })
});

////Grather New Customer List
router.post('/admin/gatherNewCustomer', function(req, res, next) {
    database.customer.find({ followupStatus: { $ne: "Read" } }, function(err, cust) {
        res.send(cust);
    }).sort({ 'date': -1 }).limit(20); 
});

////Active Driver List 
router.post('/admin/activeDriverTotalItem', function(req, res, next) {
    database.pilot.countDocuments({accountStatus: "Active"}, function(err, count) {
        //console.log("count",count)
    res.send({item:count});
});

});
router.post('/admin/activeDriver', function(req, res, next) {
    var skip = Number(req.body.skip);
    var limit=Number(req.body.limit);
        database.pilot.find({ accountStatus: "Active" }, function(err, driverList) {
            res.send(driverList);
        }).skip(skip).limit(limit);
});

//// 
router.post('/admin/totalNewCustomer', function(req, res, next) {
    database.customer.countDocuments({ followupStatus: { $ne: "Read" } }, function(err, count) {
        res.send({item:count});
    });
});


////Grather Driver Not Found//////
router.post('/admin/sub/gatherDriverNF', function(req, res, next) {
    database.drivernotfound.find({ status: "initiate" }, function(err, drive) {
        res.send(drive);
    }).sort({ 'date': -1 }).limit(20);

});

router.post('/admin/sub/driverNFresolve', function(req, res, next) {
    database.drivernotfound.findOneAndUpdate({ entryNo: req.body.entryNo }, { $set: { status: "resolve" } }, function(err, drive) {
        res.send(drive);
    });

});

router.post('/admin/sub/driverNFcust', function(req, res, next) {
    database.customer.findOne({CustID: req.body.CustID}, function(err, cust) {
        res.send(cust);
    });

});

router.post('/admin/sub/findCustomer', function(req, res, next) {
    database.customer.findOne({ $or:[ {CustID: req.body.CustID}, {mobileNumber:req.body.CustID}] }, function(err, cust) {
        res.send(cust);
    });

});

router.post('/admin/sub/driverNFtotal', function(req, res, next) {
    database.drivernotfound.find({ status: "initiate" }, function(err, drive) {
        res.send(drive);
    })

});

router.post('/admin/dailyVerification', function(req, res, next) {
   var StartTime = moment(req.body.today).startOf('day').utc();
   var EndTime = moment(req.body.today).endOf('day').utc();
    database.pilot.find({
        verificationDate: { $gte: StartTime.toDate(), $lte: EndTime.toDate() }
    }, function(er, pilot) {
        res.send(pilot);
    })
});

router.post('/admin/dailyCustResolve', function(req, res, next) {
    var StartTime = moment(req.body.today).startOf('day').utc();
    var EndTime = moment(req.body.today).endOf('day').utc();
     database.customer.find({
        followupDate: { $gte: StartTime.toDate(), $lte: EndTime.toDate() }
     }, function(er, cust) {
         res.send(cust);
     })
 });

 router.post('/admin/resetDriver', function(req, res, next) {
    database.pilot.findOne({pilotID:req.body.pilotID},function(er,pilot){
        if(pilot){
            database.pilot.findOneAndUpdate({pilotID:req.body.pilotID},{$set:{
                orderStage:"",
                bookingID:"",
                preRideTotalTime:0
            }},function(er,data){
                database.ride.deleteMany({
                    pilotID:req.body.pilotID,
                    demandCall: "demandCall",
                    callbookingStatus: "Accept"
                }, function(e, d) {
                    res.send("Driver Reset Successfully");
                });
                
            })

        }else{
            res.send("Worng Driver ID");
        }
    })
 });


 router.post('/admin/getBookingDemandDetails', function(req, res, next) {
    var StartTime = moment(req.body.today).startOf('day').utc();
    var EndTime = moment(req.body.today).endOf('day').utc();
 
    database.pilot.findOne({pilotID:req.body.pilotID},function(er,pilot){
        if(pilot){
        database.ride.find({
            pilotID:pilot.pilotID,
            date:{ $gte: StartTime.toDate(), $lte: EndTime.toDate() },
            callbookingStatus: "complete"
        },function(err,ride){
            database.Carlogbook.find({
                pilotID:pilot.pilotID,
                date:{ $gte: StartTime.toDate(), $lte: EndTime.toDate() } ,
                bookingType:"demandCall",
                DriverType:'preRide',
            },function(err,demand){
                res.send({ride:ride,demand:demand,pilot:pilot})

            })
        })
    }else{
        res.send({ride:[],demand:[],pilot:pilot}) 
    }

    })
 });



router.post('/admin/updatefollowupStatus', function(req, res, next) {
    database.customer.findOneAndUpdate({ CustID: req.body.id }, { $set: { followupStatus: "Read", followupDate:new Date() } }, function(err, cust) {
        console.log(cust.followupStatus)
        res.send({ CustID: cust.CustID });
    });
});



//accountStatus:'Active'
////Grather New Driver List
router.post('/admin/sub/gatherNewDriver', function(req, res, next) {
    database.pilot.find({ accountStatus: { $ne: "Active" } }, function(err, Driver) {
        res.send(Driver);

    }).sort({ date: -1 });
});


//////Set Admin New Password//////
router.post('/admin/newpsw', function(req, res, next) {
    database.admin.findOne({ adminID: req.body.adminID, adminType: "admin" }, function(err, admin) {
        if (admin) {
            bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                database.admin.findOneAndUpdate({ adminID: req.body.adminID, adminType: "admin" }, { $set: { password: hash } }, function(er, data) {
                    res.clearCookie("adminID");
                    res.redirect('../../india/admin')
                })
            })
        } else {
            res.send("Unauthorise Call")
        }
    })
});

router.post('/admin/addnewPrice', function(req, res, next) {
   //console.log(req.body);
    database.cityPrice.findOne({ CityName: req.body.city, travelMode: req.body.travelmode }, function(err, city) {
        if (city) {
            database.cityPrice.findOneAndUpdate({ CityName: req.body.city, travelMode: req.body.travelmode }, {
                $set: {
                    CityName: req.body.city,
                    branchName:req.body.branch,
                    CityGPS: [Number(req.body.cityLat), Number(req.body.cityLng)],
                    preRidekmprice: req.body.preRidekmprice,
                    PerKMPrice: req.body.kmprice,
                    basePrice: req.body.basePrice,
                    minimumPricePer: req.body.minimumprice,
                    minimumKM: req.body.minimumkm,
                    travelMode: req.body.travelmode,
                    rideIncetiv: req.body.incentive,
                    driverpayout: req.body.driverpayout,
                    shareRide: req.body.shareride,
                    shereRideCapacity: req.body.passengerCapacity,
                    preRideperMinutCharge: req.body.preRidePerminuteCharge,
                    GenarelPerMinutCharge: req.body.gneralPreMuniteCharge
                }
            }, function(er, data) {
                res.send("ok");
            });

        } else {
            database.cityPrice({
                CityName: req.body.city,
                branchName:req.body.branch,
                CityGPS: [Number(req.body.cityLat), Number(req.body.cityLng)],
                preRidekmprice: req.body.preRidekmprice,
                PerKMPrice: req.body.kmprice,
                basePrice: req.body.basePrice,
                minimumPricePer: req.body.minimumprice,
                minimumKM: req.body.minimumkm,
                travelMode: req.body.travelmode,
                rideIncetiv: req.body.incentive,
                driverpayout: req.body.driverpayout,
                shareRide: req.body.shareride,
                shereRideCapacity: req.body.passengerCapacity,
                preRideperMinutCharge: req.body.preRidePerminuteCharge,
                GenarelPerMinutCharge: req.body.gneralPreMuniteCharge
            }).save(function(err) {
                res.send("ok");
            })

        }

    })







});



router.post('/admin/deleteCityPrice', function(req, res, next) {
    database.cityPrice.deleteMany({ _id: req.body.id }, function(e, d) {
        res.send("deleteCity")
    });
})

router.post('/admin/getCityprice', function(req, res, next) {
    database.cityPrice.find({CityName:req.body.CityName}, function(err, data) {
        //console.log(data)
        res.send(data);
    })
})

router.post('/admin/updateRedious', function(req, res, next) {
    database.cityPrice.findOne({CityName:req.body.CityName,travelMode:req.body.travelMode}, function(err, data) {
       // console.log(data);
        if(data){
            var newData={redious:req.body.setRedus,multiplyer:req.body.rediousMultiplyer};
            cityRediusMultiplyer=data.cityRediusMultiplyer;
            cityRediusMultiplyer.push(newData);
            database.cityPrice.findOneAndUpdate({CityName:req.body.CityName,travelMode:req.body.travelMode},{$set:{
                cityRediusMultiplyer:cityRediusMultiplyer
            }},function(er,data){
                res.send("success");
            })
        
        }else{
         res.send("fail");
        }
        
    })
})

router.post('/admin/deleteRedious', function(req, res, next) {
    database.cityPrice.findOne({CityName:req.body.CityName,travelMode:req.body.travelMode}, function(err, data) {
       // console.log(data);
        if(data){
            database.cityPrice.findOneAndUpdate({CityName:req.body.CityName,travelMode:req.body.travelMode},{$set:{
                cityRediusMultiplyer:[]
            }},function(er,data){
                res.send("success");
            })
        
        }else{
         res.send("fail");
        }
        
    })
})

router.post('/admin/updatePickTime', function(req, res, next) {
    database.cityPrice.findOne({CityName:req.body.CityName,travelMode:req.body.travelMode}, function(err, data) {
        //console.log(data);
        if(data){
            var newData={
                pickTimeStart:req.body.pickTimeStart,
                pickTimeStop:req.body.pickTimeStop,
                picktimePriceIncreaseBy:req.body.setPickTimePrice
            };
            cityPickTimeMultiplyer=data.cityPickTimeMultiplyer;
            cityPickTimeMultiplyer.push(newData);
            database.cityPrice.findOneAndUpdate({CityName:req.body.CityName,travelMode:req.body.travelMode},{$set:{
                cityPickTimeMultiplyer:cityPickTimeMultiplyer
            }},function(er,data){
                res.send("success");
            })
        
        }else{
         res.send("fail");
        }
        
    })
})

router.post('/admin/deletePickTime', function(req, res, next) {
    database.cityPrice.findOne({CityName:req.body.CityName,travelMode:req.body.travelMode}, function(err, data) {
        //console.log(data);
        if(data){
            database.cityPrice.findOneAndUpdate({CityName:req.body.CityName,travelMode:req.body.travelMode},{$set:{
                cityPickTimeMultiplyer:[]
            }},function(er,data){
                res.send("success");
            })
        
        }else{
         res.send("fail");
        }
        
    })
})


router.post('/admin/driverWithdral', function(req, res, next) {
    database.DriverPayment.find({ WithdrawalReqestStatus: 'Initiate' }, function(err, data) {
        res.send(data);
    });
});


router.post('/admin/driverWithdralcomplete', function(req, res, next) {
    database.DriverPayment.findOneAndUpdate({ TransactionID: req.body.txnid }, { $set: { WithdrawalReqestStatus: 'Success' } }, function(err, data) {
        res.send("Success");
    });
});

router.post('/admin/incentiveModule', function(req, res, next) {
    database.pilotIncentiveModule.find({city:req.body.incetiveCity,travelmod:req.body.incentiveTravelMode},function(er,data){
        res.send(data);
    })
 });

 
 router.post('/admin/incentiveModuleAdmin', function(req, res, next) {
    database.pilotIncentiveModule.find({city:req.body.incetiveCity},function(er,data){
        res.send(data);
    })
 });

 
 router.post('/admin/addIncentiveModule', function(req, res, next) {
    database.pilotIncentiveModule.findOne({
        city:req.body.incentiveCity,
        incetiveSlot:req.body.incentiveSlot,
        incetiveCategry:req.body.incenCategory,
        travelmod:req.body.incentiveTravelmod,
    },function(er,data){
        if(data){
            ///////Update//////
            database.pilotIncentiveModule.findOneAndUpdate({enrtyID:data.enrtyID},{$set:{
                numberOfBooking:req.body.incentiveRides,
                inctravelKM:req.body.incentiveKM,
                incetiveAmount:req.body.incentiveAmount,
                incetiveSlot:req.body.incentiveSlot,
                incetiveCategry:req.body.incenCategory,
                travelmod:req.body.incentiveTravelmod,
                city:req.body.incentiveCity
            }},function(er,rest){
                res.send("Add Successfully");
            })
        }else{
            //////Add New//////
            database.pilotIncentiveModule({
                numberOfBooking:req.body.incentiveRides,
                inctravelKM:req.body.incentiveKM,
                incetiveAmount:req.body.incentiveAmount,
                incetiveSlot:req.body.incentiveSlot,
                incetiveCategry:req.body.incenCategory,
                travelmod:req.body.incentiveTravelmod,
                city:req.body.incentiveCity
            }).save(function(err){
                res.send("Add Successfully");
            })
        }
        
    })
 });

 router.post('/admin/deleteIncentiveModule', function(req, res, next) {
    database.pilotIncentiveModule.deleteMany({ enrtyID: req.body.enrtyID }, function(e, d) {
        res.send("deleteModule")
    });
 });

router.post('/admin/cityList', function(req, res, next) {
   database.cityPrice.find({},function(er,data){
       res.send(data)
   })
});

/////Distinct////////
router.post('/admin/cityListDistinc', function(req, res, next) {
    database.cityPrice.distinct('CityName',function(er,data){
        res.send(data)
    })
 });



router.post('/admin/getFuelPriceList', function(req, res, next) {
    database.petroldesel.find({}, function(e, petrol) {
      res.send(petrol);
       })
 });

router.post('/admin/branchList', function(req, res, next) {
    database.branch.find({},function(er,data){
        res.send(data);
    })
 });
 router.post('/admin/addNewBranch', function(req, res, next) {
     console.log(req.body)
    database.branch.findOne({branchName:req.body.branchName},function(er,data){
        if(!data){
            database.branch({
                branchName:req.body.branchName 
            }).save(function(er){
                res.send("ok")
            })
        }else{
                res.send("fail")
        }
    })
 });
 


router.post('/admin/findDriver', function(req, res, next) {
    database.pilot.findOne({$or:[ {pilotID: req.body.mobile}, {mobileNumber: req.body.mobile, isdCode: req.body.isd}] }, function(err, data) {
        if (data) {
            res.send(data);
        } else {
            res.send('worng');
        }

    });

});
router.post('/admin/verifyDriver', function(req, res, next) {
    console.log(req.body)
    database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, { $set: { completereg: 'done', accountStatus: 'Active', verificationDate:new Date() } }, function(err, data) {
        if (data) {
            res.send('veryfied');
            console.log(data)
        } else {
            res.send('worng');
        }

    });

});


router.post('/admin/deactivate', function(req, res, next) {
    console.log(req.body)
    database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, { $set: { completereg: '', accountStatus: '' } }, function(err, data) {
        if (data) {
            res.send('veryfied');
            console.log(data)
        } else {
            res.send('worng');
        }

    });

});


router.post('/admin/updateBasicDetails', function(req, res, next) {
    database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
        $set: {
            vichelEnginType: req.body.engintype,
            enginMilege: req.body.milege,
            cityName: req.body.driverCity,
            travelmod: req.body.travelmod,
            driverpayout: req.body.driverpayout,
            driverCetegory: req.body.driverCetegory,
            incentiveMode: req.body.incentiveMode
        }
    }, function(err, data) {
        res.send("Update Successfull");
    });

});


router.post('/admin/updateBankDetails', function(req, res, next) {
    database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
        $set: {
            bankAccountNo: req.body.accountNumber,
            ifsc: req.body.ifscCode
        }
    }, function(err, data) {
        res.send("Account IFSC Updated");
    });

});

router.post('/admin/updatedisealPetrol', function(req, res, next) {
    database.petroldesel.findOne({ cityName: req.body.city }, function(e, dd) {
        if (dd) {
            database.petroldesel.findOneAndUpdate({ cityName: req.body.city }, {
                $set: {
                    petrolPerLtr: req.body.petrol,
                    deselPerLtr: req.body.diesel,
                    cngPrice: req.body.cng,
                    cityName: req.body.city
                }
            }, function(e, data) {
                res.send("ok")
            })
        } else {
            database.petroldesel({
                petrolPerLtr: req.body.petrol,
                deselPerLtr: req.body.diesel,
                cngPrice: req.body.cng,
                cityName: req.body.city
            }).save(function(er) {
                res.send("ok")
            })
        }
    })
})

router.post('/admin/updateDutyShedule', function(req, res, next) {
    console.log(req.body)
    database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
        $set: {
            dutyStart: req.body.dutyStart,
            dutyEnd: req.body.dutyEnd,
            breakStart: req.body.breakStart,
            BreakEnd: req.body.breakEnd,
        }
    }, function(err, data) {
        res.send("value Update");
    });

})

router.post('/admin/cancelDutyShedule', function(req, res, next) {

    database.pilot.findOneAndUpdate({ mobileNumber: req.body.mobile, isdCode: req.body.isd }, {
        $set: {
            dutyStart: null,
            dutyEnd: null,
            breakStart: null,
            BreakEnd: null,
        }
    }, function(err, data) {
        res.send("value Update Clear All Duty");
    });

})

router.post('/admin/onofflinebyadmin', function(req, res, next) {
    if (req.body.mode == "offline") {
        res.io.emit("offlinereqbyadmin", { pilotID: req.body.pilotID, mode: "offline" });
        res.send("Offline Request Initiate")
    }
    if (req.body.mode == "online") {
        res.io.emit("onlinereqbyadmin", { pilotID: req.body.pilotID, mode: "online" });
        res.send("Online Request Initiate")
    }


})

router.get('/admin/sub/dutyhours', function(req, res, next) {
    if (req.cookies.subAdminID) {
        res.render('admin/india/subAdminDriverSalary')
    } else {
        res.redirect('/india/admin/sub/login');
    }
});

router.get('/admin/sub/monitor', function(req, res, next) {
    if (req.cookies.subAdminID) {
        database.admin.findOne({ adminID: req.cookies.subAdminID }, function(err, subAdmin) {
            //console.log("SubAdmin",subAdmin)
            database.cityPrice.findOne({ CityName: subAdmin.subadmincitys[0] }, function(err, city) {
                // console.log("City PRice",city)
                res.render('admin/india/subAdminMonitor', { subAdmin: subAdmin, YOUR_API_KEY: process.env.API_KEY, CityGPS: city.CityGPS })
            })

        })

    } else {
        res.redirect('/india/admin/sub/login');
    }
});

/////////////Clear Demand Area///////
router.post('/admin/sub/refreshdemand', function(req, res, next) {
    database.demandArea.deleteMany({}, function(e, d) {
        res.send("demand refresh")
    })
})



/////////////////////////////////////////////
///////END ADMIN WORK/////////
//////////////////////////////////////  

/////////Check internet Connection and Data//////
router.post('/checkInternetData', function(req, res, next) {
    res.send("internetDataSuccess")
})

/////////////////////////////////////////////
///////START SHARE RIDE START////////////////
//////////////////////////////////////  
router.post('/share/booking', function(req, res, next) {
    database.customer.findOne({ CustID: req.body.CustID }, function(er, cust) {
        database.shareBooking.find({ travelMode: req.body.travelmod, bookingStatus: "queue" }, function(err, data) {
            var shareCapacity = cust.shereRideCapacity[Number(req.body.travelmod) - 1];
            if (data.length < Number(shareCapacity)) {
                ///Process Share Queiue////     

                database.shareBooking({
                    travelMode: req.body.travelmod,
                    shereRideCapacity: shareCapacity,
                    seatPosition: Number(data.length) + 1,
                    bookingStatus: "queue",
                    totalAmount: req.body.totalAmt,
                    TravalDistance: req.body.totalDistance,
                    CustID: cust.CustID,
                    pickupLocation: req.body.originAds,
                    pickupLatLng: [],
                    dropLocation: req.body.distAds,
                    dropLatLng: []
                }).save(function(err) {
                    res.send("Success");
                })

            } else {
                //////Try Again///////
                res.send("driver Busy");

            }
        });
    })

});




/////////////////////////////////////////////
///////END SHARE RIDE START/////////
//////////////////////////////////////  


//createNewCity

router.post('/admin/createNewCity', function(req, res, next) {
    var lat=req.body.cityLat;
    var lng=req.body.cityLng
    if(lat && lng){
        googleApi.SearchGeoCodePlaceByLatLng({
            lat:Number(req.body.cityLat),
            lng:Number(req.body.cityLng),
            apik:process.env.API_KEY,
        },function(data){
          // console.log("City Name",JSON.stringify(data.results[0].address_components) );
           //console.log("City Name",data.results[0].address_components);
          data.results[0].address_components.forEach(function(val){           
            if(val.types[0]=='administrative_area_level_2'){
                //console.log("city Name" ,val.long_name )
                res.send(val.long_name);
            }
          })
        })
    }
    
})

/////////////////////All India City Create////////

router.post('/admin/allIndiaCityCreate', function(req, res, next) {
    console.log(citylist.city.length)
    var startIndex=(Number(req.body.page)-1) * Number(req.body.limit);
    var endIndex=Number(req.body.page) * Number(req.body.limit);
    
    var nextPage;
    var prvPage;

    if(startIndex > 0){
        prvPage=Number(req.body.page)-1
        limit=Number(req.body.limit)
    }
    if(endIndex< citylist.city.length){
        nextPage=Number(req.body.page)+1
        limit=Number(req.body.limit)
    }

    var lista=citylist.city.slice(startIndex,endIndex);
    console.log(lista.length)
    lista.forEach(function(val,indx,ary){

        realcityName({
            cityLat:val.lat,
            cityLng:val.lng,
            branch:val.StateName,
            indx:indx,
            ary:ary.length-1
        },function(relName){
            console.log(relName)
            if(!relName.err){
                CityPriceControl({
                    cityName:relName.cityName,
                    branch:relName.branch,
                    lat:relName.lat,
                    lng:relName.lng,
                    indx:relName.indx,
                    ary:relName.ary
                    },function(ss){
                        console.log(ss);
                        res.send({nextPage:nextPage,prvPage:prvPage,limit:limit,msg:ss,total:citylist.city.length,endIndex:endIndex,page:req.body.page});
                        
                    })
            }else{
                res.send({nextPage:nextPage,prvPage:prvPage,limit:limit,msg:'Error ',total:citylist.city.length,endIndex:endIndex,page:req.body.page});
            }
           
        })
    })
})






function CityPriceControl(req,cb){
    saveBranch(req.branch);
   for(var i=1; i<5; i++){
           switch(i){
               case 1:
                   database.cityPrice.findOne({CityName: req.cityName,travelMode: 1},function(er,data){
                    if(!data){
                        database.cityPrice({
                            CityName: req.cityName,
                            branchName:req.branch,
                            CityGPS: [Number(req.lat), Number(req.lng)],
                            preRidekmprice: 4,
                            PerKMPrice: 7,
                            basePrice: 0,
                            minimumPricePer: 10,
                            minimumKM: 2,
                            travelMode: 1,
                            rideIncetiv: 0,
                            driverpayout: 0,
                            shareRide: 0,
                            shereRideCapacity: 0,
                            preRideperMinutCharge: 0.75,
                            GenarelPerMinutCharge: 0.75,
                            cityRediusMultiplyer:[],
                            cityPickTimeMultiplyer:[{"pickTimeStart":"08:00","pickTimeStop":"11:00","picktimePriceIncreaseBy":"10"},{"pickTimeStart":"18:00","pickTimeStop":"21:00","picktimePriceIncreaseBy":"15"},{"pickTimeStart":"22:00","pickTimeStop":"23:59","picktimePriceIncreaseBy":"30"},{"pickTimeStart":"00:00","pickTimeStop":"04:00","picktimePriceIncreaseBy":"50"}]
                        }).save(function(err) {
                            console.log("Save City TraverMode", 1, "cityName",req.cityName);
                            
                        })
                    }
                   })
                 
               break;

               case 2:
                
                
                database.cityPrice.findOne({CityName: req.cityName,travelMode: 2},function(er,data){
                 if(!data){
                     database.cityPrice({
                         CityName: req.cityName,
                         branchName:req.branch,
                         CityGPS: [Number(req.lat), Number(req.lng)],
                         preRidekmprice: 6,
                         PerKMPrice: 6,
                         basePrice: 0,
                         minimumPricePer: 10,
                         minimumKM: 2,
                         travelMode: 2,
                         rideIncetiv: 0,
                         driverpayout: 0,
                         shareRide: 0,
                         shereRideCapacity: 0,
                         preRideperMinutCharge: 1.50,
                         GenarelPerMinutCharge: 1.50,
                         cityRediusMultiplyer:[{"redious":"5","multiplyer":"4"},{"redious":"10","multiplyer":"3.75"},{"redious":"15","multiplyer":"3"}],
                         cityPickTimeMultiplyer:[{"pickTimeStart":"06:00","pickTimeStop":"11:00","picktimePriceIncreaseBy":"15"},{"pickTimeStart":"17:00","pickTimeStop":"20:00","picktimePriceIncreaseBy":"20"},{"pickTimeStart":"22:00","pickTimeStop":"23:59","picktimePriceIncreaseBy":"30"},{"pickTimeStart":"00:00","pickTimeStop":"04:00","picktimePriceIncreaseBy":"50"}]
                     }).save(function(err) {
                         console.log("Save City TraverMode", 2);
                     })
                 }
                })
               break;

               case 3:
                database.cityPrice.findOne({CityName: req.cityName,travelMode: 3},function(er,data){
                 if(!data){
                     database.cityPrice({
                         CityName: req.cityName,
                         branchName:req.branch,
                         CityGPS: [Number(req.lat), Number(req.lng)],
                         preRidekmprice: 8,
                         PerKMPrice: 8,
                         basePrice: 0,
                         minimumPricePer: 10,
                         minimumKM: 2,
                         travelMode: 3,
                         rideIncetiv: 0,
                         driverpayout: 0,
                         shareRide: 0,
                         shereRideCapacity: 0,
                         preRideperMinutCharge: 1,
                         GenarelPerMinutCharge: 1,
                         cityRediusMultiplyer:[{"redious":"5","multiplyer":"4.3"},{"redious":"10","multiplyer":"3.5"},{"redious":"15","multiplyer":"2.7"}],
                         cityPickTimeMultiplyer:[{"pickTimeStart":"06:00","pickTimeStop":"11:00","picktimePriceIncreaseBy":"15"},{"pickTimeStart":"17:00","pickTimeStop":"20:00","picktimePriceIncreaseBy":"20"},{"pickTimeStart":"22:00","pickTimeStop":"23:59","picktimePriceIncreaseBy":"30"},{"pickTimeStart":"00:00","pickTimeStop":"04:00","picktimePriceIncreaseBy":"50"}]
                     }).save(function(err) {
                         console.log("Save City TraverMode", 3);
                     })
                 }
                })
               break;

               case 4:
                
                
                database.cityPrice.findOne({CityName: req.cityName,travelMode: 4},function(er,data){
                 if(!data){
                     database.cityPrice({
                         CityName: req.cityName,
                         branchName:req.branch,
                         CityGPS: [Number(req.lat), Number(req.lng)],
                         preRidekmprice: 12,
                         PerKMPrice: 13,
                         basePrice: 0,
                         minimumPricePer: 100,
                         minimumKM: 2,
                         travelMode: 4,
                         rideIncetiv: 0,
                         driverpayout: 0,
                         shareRide: 0,
                         shereRideCapacity: 0,
                         preRideperMinutCharge: 1.50,
                         GenarelPerMinutCharge: 1.50,
                         cityRediusMultiplyer:[{"redious":"5","multiplyer":"4.3"},{"redious":"10","multiplyer":"3.5"},{"redious":"15","multiplyer":"2.7"}],
                         cityPickTimeMultiplyer:[{"pickTimeStart":"06:00","pickTimeStop":"11:00","picktimePriceIncreaseBy":"15"},{"pickTimeStart":"17:00","pickTimeStop":"20:00","picktimePriceIncreaseBy":"20"},{"pickTimeStart":"22:00","pickTimeStop":"23:59","picktimePriceIncreaseBy":"30"},{"pickTimeStart":"00:00","pickTimeStop":"04:00","picktimePriceIncreaseBy":"50"}]
                     }).save(function(err) {
                         console.log("Save City TraverMode", 4);
                         if(req.indx===req.ary){
                            cb("loop complete")
                        }
                     })
                 }else{
                    if(req.indx===req.ary){
                        cb("loop complete")
                    }
                }
                })
               break;
           }
       }

   }

function saveBranch(branch){
database.branch.findOne({branchName:branch},function(er,data){
    if(!data){
        database.branch({
            branchName:branch 
        }).save(function(er){
            console.log("Branch Create",branch)
        })
    }
})

}

function realcityName(req,res){
    var lat=req.cityLat;
    var lng=req.cityLng
    if(lat && lng){
        googleApi.SearchGeoCodePlaceByLatLng({
            lat:Number(lat),
            lng:Number(lng),
            apik:process.env.API_KEY,
        },function(data){
          // console.log("City Name",JSON.stringify(data.results[0].address_components) );
           console.log("City Name",data.status);
           console.log("LAT LNG", lat,"-",lng);
           
           if(data.status=='OK'){
            console.log("data", data.results[0].address_components);
            var cityNameFind='';
            data.results[0].address_components.forEach(function(val,indx,ary){           
                if(val.types[0]=='administrative_area_level_2'){
                    //console.log("city Name  w:" ,val.long_name )
                    cityNameFind=val.long_name;
                }
                if(indx===ary.length - 1){
                    if(cityNameFind){
                    res({
                        cityName:cityNameFind,
                        branch:req.branch,
                        lat:lat,
                        lng:lng,
                        indx:req.indx,
                        ary:req.ary
                    });
                    }else{
                        res({
                            err: "city Undifind",
                            branch:req.branch,
                            lat:lat,
                            lng:lng,
                            indx:req.indx,
                            ary:req.ary
                        });
                    }
                }
              })
           }else{
            res({
                err: "city Undifind",
                branch:req.branch,
                lat:lat,
                lng:lng,
                indx:req.indx,
                ary:req.ary
            }); 
           }
         
        })
    }
}


///////Confram Delivery///////////
router.post('/conframDelivery', function(req, res, next) {
    GenbookingID({}, function(NewBookinid) {
        console.log("test Delivery",req.body);
        database.delivery({
            ModeofDelivery: req.body.ModeofDelivery,
            deliveryPrice: req.body.deliveryPrice,
            deliveryType: req.body.deliveryType,
            dropDirection: req.body.dropDirection,
            dropMobile: req.body.dropMobile,
            dropName: req.body.dropName,
            droplat: req.body.droplat,
            droplng: req.body.droplng,
            droplocation: req.body.droplocation,
            pickupDirection: req.body.pickupDirection,
            pickupMobile: req.body.pickupMobile,
            pickupName: req.body.pickupName,
            pickuplat: req.body.pickuplat,
            pickuplng: req.body.pickuplng,
            pickuplocation: req.body.pickuplocation,
            bookingID:NewBookinid.bookingID,
            CustID:req.cookies.CustID,
            date: { type: Date, default: Date.now },
            deliveryStatus:"confram"

        }).save(function(err){
            if(err){console.log(err)}
            res.send({data:req.body,NewBookinid:NewBookinid.bookingID, CustID:req.cookies.CustID});
        })

        
    })

})


router.post('/admin/sub/getDeliveryList', function(req, res, next) {
    database.delivery.find({deliveryStatus:"confram"},function(er,data){
        res.send(data)
    })

})



// googleApi.manualDistance({
// origin:[Number(23.8105),Number(90.3372)],
// dist:[Number(90.3472), Number(90.3472)]
// },function(data){
// console.log("test distance",data);
// });

//   googleApi.SearchGeoCodePlaceByLatLng({

//     lat:Number(14.4673),
//     lng:Number(78.8242),
//     apik:process.env.API_KEY,
// },function(data){
//   // console.log("City Name",JSON.stringify(data.results[0].address_components) );
//    console.log("City Name",data.results[0].address_components);
//   data.results[0].address_components.forEach(function(val){           
//     if(val.types[0]=='administrative_area_level_2'){

//         console.log("city Name" ,val.long_name )
//     }
//   })
// })

// googleApi.SearchGeoCodePlaceByLatLng({
//   //lat:Number(req.body.lat),
//   //lng:Number(req.body.lng),
//   lat:Number(22.8895),
//   lng:Number(88.4220),
//   apik:process.env.API_KEY,
// },function(data){
// console.log("City Name",data.results[0]);
// })


//console.log(moment().format('LT'))

//console.log(new Date().getHours());



module.exports = router;