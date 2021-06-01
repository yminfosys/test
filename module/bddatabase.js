var mongoose = require('mongoose');

//mongoose.set('useFindAndModify', false);
autoIncrement = require('mongoose-auto-increment');
const config = {
  autoIndex: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  
};
const mongojs = require('mongojs');
// const db = mongojs('mongodb://127.0.0.1:27017/admin', ['pilotcollections'])
//var uri='mongodb://sukanta82:sukanta82@ds149138.mlab.com:49138/mws';
//var uri='mongodb://sukanta82:sukanta82@ds163517.mlab.com:63517/mws';
//var uri='mongodb://localhost:27017/paacab';
var uri='mongodb://127.0.0.1:27017/paacab';
//var uri='mongodb+srv://paacab:a1b1c3b4@paa-x8lgp.mongodb.net/paacab?retryWrites=true&w=majority';
///&connectTimeoutMS=1000&bufferCommands=false
///2dsphar indexing creat///////


  function index2Ddriver(int,cb){
    console.log()
      const db = mongojs('mongodb://127.0.0.1:27017/paacab', ['bddriverlocationcollections'])
      db.bddriverlocationcollections.createIndex({ "location" : "2dsphere" });
      cb({success:'1'});
    } 

  
  function index2Ddemand(int,cb){
    console.log()
      const db = mongojs('mongodb://127.0.0.1:27017/paacab', ['bddemandcollections']);
      db.bddemandcollections.createIndex({ "location" : "2dsphere" });
      cb({success:'1'})
    }

function mongCon(){
mongoose.connect(uri,config).
catch(error => handleError(error));
}
mongCon();
mongoose.connection.on('error', err => {
  //logError(err);
  console.log(err)
  setTimeout(mongCon,20000);
  
});
autoIncrement.initialize(mongoose.connection);

////customer Schema
var custSchema = new mongoose.Schema({ 
    name:  String,
    email :String,
    address:String,
    postcode:String,
    password: String,    
    mobileNumber:String, 
    isdCode:String,       
    CustID:String,
    walletBalance:String,
    BuyKM:String,   
    custRating:String,   
    userType:String,
    orderStage:String,
    bookingID:String,
    generalPriceperKm:[],
    generalMinimumprice:[],
    generalMinimumKm:[],
    generalBasePrice:[],
    preRidePriceperKm:[],
    preRideperMinutCharge:[],
    GenarelPerMinutCharge:[],
    driverPayout:[],
    shereRide:[],
    shereRideCapacity:[],
    regdate: { type: Date, default: Date.now },
    lastLogindate: { type: Date },
    date: { type: Date, default: Date.now },
    location: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'], // 'location.type' must be 'Point'
        required: true
      },
      coordinates: {
        type: [Number],
        required: true,
        
      }
    }
});

custSchema.plugin(autoIncrement.plugin, { model: 'bdcustcollections', field: 'CustID',startAt: 1000, incrementBy: 1 });

var custmodul = mongoose.model('bdcustcollections', custSchema);


///Pilot Schema
var pilotSchema = new mongoose.Schema({ 
  name:  String,
  email :String,
  address:String,
  city:String,
  postcode:String,
  password: String,    
  mobileNumber:String,
  isdCode:String,    
  pilotID:String,
  pilotRating:String,
  date: { type: Date, default: Date.now },
  ///////Fule////////
  lastFuleCheckDate:{type:Date},
  lastCheckFuleconsumption:Number,
  
  vichelEnginType:String,  
  enginMilege:String,
  fulePrice:String,
  cityName:String ,
  /////Pre Ride Balance Ledger Check//
   lastCheckDate:{type:Date},
   lastCheckCashCollcetion:Number,
   lastCheckPayment:Number,

    /////Driver Balance Ledger Check//
   driverLastCheckDate:{type:Date},
   driverLastCheckAccountBalance:Number,    
  
  /////price per km 
  pilotGetperKm:String,
  accountStatus:String,
  completereg:String,   
  userType:String,
  typeOfWork:[],
  travelmod:String,
  rtoRegno:String,
  carModel:String,
  duty:String, 
  bankAccountNo:String,
  ifsc:String,
  sortCode:String, 
  jobCategory:String,
  jobSubCategory:String,
  ageGroup:String,
  experance:String,
  panNumber:String,
  gender:String,
  photo:String,Idproof:String,dl:String,rto:String,insurence:String,polution:String,
  orderStage:String,
  bookingID:String,
  preRideTotalTime:Number,   
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      
    }
  }
});

pilotSchema.plugin(autoIncrement.plugin, { model: 'bdpilotcollections', field: 'pilotID',startAt: 1000, incrementBy: 1 });

var pilotmodul = mongoose.model('bdpilotcollections', pilotSchema);

var DriverPaymentSchema = new mongoose.Schema({
  pilotID:String,
  travelmod:String,
  DriverType:String,
  date: { type: Date, default: Date.now },
  paymentAmount:Number,
  Withdrawal:Number,
  deposit:Number,
  payGetwayORDER_ID:String,
  WithdrawalReqestStatus:String,
  TransactionID:String,
  typeOfReqest:String,
  name:String,
  accountno:String,
  ifsc:String

});
DriverPaymentSchema.plugin(autoIncrement.plugin, { model: 'bddriverpaymentcollections', field: 'TransactionID',startAt: 1, incrementBy: 1 });
var DriverPaymentmodul = mongoose.model('bddriverpaymentcollections', DriverPaymentSchema);

///Driver Attendence
var DutyLogSchema = new mongoose.Schema({     
  pilotID:String, 
  travelmod:String,
  DriverType:String,
  logonTime:{ type: Date },
  logOutTime:{ type: Date },
  dutyHours:String,
  overtimeDutyHours:String,
  logOutPurpose:String,
  date: { type: Date, default: Date.now },  
  startlocation:[],
  stoplocation:[],
});

var DutyLogmodul = mongoose.model('bdDutyLogcollections', DutyLogSchema);

///Driver Car LogBook
var CarlogbookSchema = new mongoose.Schema({     
  bookingID:  String,
  pilotID :String,
  travelmod:String,
  DriverType:String,  
  startlatlng: [],    
  droplatlng:[],
  kmTravels:String,
  perltrFulePrice:String,
  enginMilege:String,
  fuleConsumption:String,
  fuleConsumptionPaid:String,
  fuleConsumptionPaidDate:{type:Date},
  loogBookStatus:String,
  date: { type: Date, default: Date.now } 
  
});

var Carlogbookmodul = mongoose.model('bdCarlogbookcollections', CarlogbookSchema);

/// Daily Prtrol Desel prise
var petroldeselSchema = new mongoose.Schema({     
  petrolPerLtr:String,
  deselPerLtr:String,
  cngPrice: String,
  cityName:String 
});

var petroldeselmodul = mongoose.model('bdpetroldeselcollections', petroldeselSchema);



///Ride book Schema
var rideSchema = new mongoose.Schema({ 
  bookingID:  String,
  pilotID :String,
  travelmod:String,
  DriverType:String,
  CustID:String,
  picupaddress:String,
  picuklatlng: [],    
  dropaddress:String, 
  travalTime:Number,    
  droplatlng:[],
  date: { type: Date, default: Date.now },
  startTime:String,   
  endTime:String,
  kmtravels:String,
  totalamount:String,
  cancelCharge:String,
  generalBasePrice:String,
  paymentBy:String,
  driverCashCollectio:String,
  driverCashDeposit:String,
  driverCashDepositDate:{type:Date},
  discount:String,
  driverpayout:String,
  driverIncentiv:String,
  callbookingStatus:String,
  driverBusy:String,
  preRideOTP:String,
  startTime:{ type: Date},
  endTime:{ type: Date},
  totalTime:String,
  timefare:String,
  gstCharge:String
  
});


//rideSchema.plugin(autoIncrement.plugin, { model: 'ridecollections', field: 'bookingID',startAt: 1000, incrementBy: 1 });

var ridemodul = mongoose.model('bdridecollections', rideSchema);
///Ride book Schema Counter
var rideCountSchema = new mongoose.Schema({ 
  bookingID:  String,   
});

//rideSchema.plugin(autoIncrement.plugin, { model: 'ridecollections', field: 'bookingID',startAt: 1000, incrementBy: 1 });

var rideCountmodul = mongoose.model('bdrideCountcollections', rideCountSchema);

///Wallet Order Schema Counter
var paymentorderCountSchema = new mongoose.Schema({ 
  OrderID:Number,   
});

var paymentorderCountmodul = mongoose.model('bdpaymentorderCountcollections', paymentorderCountSchema);



///Wallet and Buy KM Recharge Schema 
var paygetwaySchema = new mongoose.Schema({ 
  typeOfReqest:String,
  /////Input data////
  ORDER_ID:String,
  checksum:String,
  TXN_AMOUNT:String,
  CUST_ID:String,
  validate_stats:String,
  //////paytm Redirect//////
  CURRENCY:String,
  GATEWAYNAME:String,
  RESPMSG: String,
  BANKNAME: String,
  PAYMENTMODE: String,
  MID: String,
  RESPCODE:String,
  TXNID:String,
  TXNAMOUNT: String,
  ORDERID: String,
  STATUS: String,
  BANKTXNID: String,
  TXNDATE: String,
  CHECKSUMHASH:String,
  TxnCalculationStatus:String, 
  date: { type: Date, default: Date.now },   
});

var paygetwaymodul = mongoose.model('bdpaygetwaycollections', paygetwaySchema);

///Price and Offer Mnager
var priceandOfferSchema = new mongoose.Schema({ 
  offerID:  String,
  area:String,
  CustID:String,
  travelmod:String,
  price:String,
  discount: String,    
  cupon:String,     
  distanceKM:String, 
  rideIncetiv:String 
});

priceandOfferSchema.plugin(autoIncrement.plugin, { model: 'bdpriceandOffercollections', field: 'offerID',startAt: 1, incrementBy: 1 });
var priceandOffermodul = mongoose.model('bdpriceandOffercollections', priceandOfferSchema);

///City Waise Price Variation
var cityPriceSchema = new mongoose.Schema({ 
  CityName:  String,
  preRidekmprice:String,
  PerKMPrice:String,
  basePrice:String,
  minimumPricePer:String,
  minimumKM:String,
  travelMode: String,    
  rideIncetiv:String,
  driverpayout:String,
  shareRide:String,
  shereRideCapacity:String,
  preRideperMinutCharge:String,
  GenarelPerMinutCharge:String
});

var cityPricemodul = mongoose.model('bdcitypricecollections', cityPriceSchema);

////Demand Area Schema
var demandSchema = new mongoose.Schema({ 
  CustID:String,
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      
    }
  }
});

var demandmodul = mongoose.model('bddemandcollections', demandSchema);

////Driver Location Schema
var driverlocationSchema = new mongoose.Schema({ 
  pilotID:String,
  DriverType:String,
  rating:String,
  travelmod:String,
  accountStatus:String,
  driverBusy:String,
  ringtone:String,
  preRideTotalTime:Number,
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      
    }
  } 
});
var driverlocationmodul = mongoose.model('bddriverlocationcollections', driverlocationSchema);



////Admin SubAdmin Schema
var adminSchema = new mongoose.Schema({ 
  adminID:String,
  adminType:String,
  Name:String,
  password:String,
  Address:String,
  mobile:String,
  email:String,
  subadmincitys:[],
  date: { type: Date, default: Date.now }
 
 
});
adminSchema.plugin(autoIncrement.plugin, { model: 'nadmincollections', field: 'adminID',startAt: 1, incrementBy: 1 });
var adminmodul = mongoose.model('bdadmincollections', adminSchema);






// custmodul({
//   name:'sukanta sardar',
//   location:{type:'Point',coordinates:[22.572646, 88.38389500000001]}
// }).save(function(r){
//   console.log("created");
// })
// db.mamacollections.find(function (err, docs) {
//   //docs is an array of all the documents in mycollection
//   console.log('mongojs test',docs);
// })
// db.dadacollections.createIndex({ "location" : "2dsphere" })
// sampleModule.find({
//   location: {
//     $near: {
//       $geometry: {
//          type: "Point" ,
//          coordinates: [ 87.8258247, 23.0101451 ]
//       },
//     }
//   }
// },function(e,data){
//   console.log('test result',JSON.stringify(data) );
// })

// index2Dpilot({},function(ss){
//   pilotmodul.find({
//     location: {
//       $near: {
//         $geometry: {
//            type: "Point" ,
//            coordinates: [ 87.2729185, 23.6662132 ]
//         },$maxDistance : 100000,
//       }
//     },pilottID:1000
//   },function(e,data){
//     console.log('test result',JSON.stringify(data) );
//   })
// })
// index2Dcust({},function(ss){
//   custmodul.find({
//     location: {
//       $near: {
//         $geometry: {
//            type: "Point" ,
//            coordinates: [ 87.8258247, 22.0101451 ]
//         },$maxDistance : 10000000,
//       }
//     },CustID:1000
//   },function(e,data){
//     console.log('test result',JSON.stringify(data) );
//   })
// })



module.exports.customer=custmodul;
module.exports.pilot=pilotmodul;
module.exports.DriverPayment=DriverPaymentmodul;
module.exports.petroldesel=petroldeselmodul;

module.exports.index2Ddriver=index2Ddriver;
module.exports.driverlocation=driverlocationmodul;

module.exports.index2Ddemand=index2Ddemand;



module.exports.ride=ridemodul;
module.exports.rideCounter=rideCountmodul;
module.exports.priceOffer=priceandOffermodul;
module.exports.cityPrice=cityPricemodul;
module.exports.demandArea=demandmodul;





module.exports.paygetway=paygetwaymodul
module.exports.paymentorderCount=paymentorderCountmodul

module.exports.DutyLog=DutyLogmodul;
module.exports.Carlogbook=Carlogbookmodul;

module.exports.admin=adminmodul;


