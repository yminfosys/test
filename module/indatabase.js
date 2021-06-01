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
      const db = mongojs('mongodb://127.0.0.1:27017/paacab', ['indriverlocationcollections'])
      db.indriverlocationcollections.createIndex({ "location" : "2dsphere" });
      cb({success:'1'});
    } 

  
  function index2Ddemand(int,cb){
    console.log()
      const db = mongojs('mongodb://127.0.0.1:27017/paacab', ['indemandcollections']);
      db.indemandcollections.createIndex({ "location" : "2dsphere" });
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
    CityName:String ,
    branchName:String,
    postcode:String,
    password: String,    
    mobileNumber:String, 
    isdCode:String,       
    CustID:String,
    status:String,
    walletBalance:String,
    BuyKM:String,   
    custRating:String,   
    userType:String,
    orderStage:String,
    bookingID:String,
    followupStatus:String,
    followupDate:{ type: Date },
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
    pickuplatlong:[],
    picuplocation:String,
    droplatlong:[],
    droplocation:String,
    loginCountry:String,
    loginLatLng:[],  
    location: [],
    refType:String,
    refBy:String,
    spacelDiscount:String,
    cityRediusMultiplyer:[],
    cityPickTimeMultiplyer:[],
    cityHolydayMultiplyer:[],
    cityWeakEndMultiplyer:[]
});

custSchema.plugin(autoIncrement.plugin, { model: 'incustcollections', field: 'CustID',startAt: 1000, incrementBy: 1 });

var custmodul = mongoose.model('incustcollections', custSchema);


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
   lastCheckTdriverEarning:Number,
   lastCheckPayment:Number,

    /////Driver Balance Ledger Check//
   driverLastCheckDate:{type:Date},
   driverLastCheckAccountBalance:Number,

   
       
  
  /////price per km 
  pilotGetperKm:String,
  accountStatus:String,
  verificationDate:{ type: Date },
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
  dutyStart:String,
  dutyEnd:String,
  breakStart:String,
  BreakEnd:String,
  ovretimeEnd:String,
  ovretimeStart:String,
  ovretimeDate:{ type: Date },
  salary:String,
  mapclick:String, 
  latlong:[], 
  dutyStatus:String,
  dutyCount: { type: Date },  

  autoVeryBy:String,
  autoVeryDate: { type: Date, default: Date.now },
  offlinePermission:String,
  driverCetegory:String,
  driverpayout:String,
  driverincentive:String,
  incentiveMode:String,

  /////Pre Ride Balance Ledger Check//
  lastpayoutCheckDate:{type:Date},
  lastpayoutAmount:Number,
 


  // location: {
  //   type: {
  //     type: String, // Don't do `{ location: { type: String } }`
  //     enum: ['Point'], // 'location.type' must be 'Point'
  //     required: true
  //   },
  //   coordinates: {
  //     type: [Number],
  //     required: true,
      
  //   }
  // }
});

pilotSchema.plugin(autoIncrement.plugin, { model: 'inpilotcollections', field: 'pilotID',startAt: 1000, incrementBy: 1 });

var pilotmodul = mongoose.model('inpilotcollections', pilotSchema);

///Driver Not Found/////
var drivernotfoundSchema = new mongoose.Schema({
 entryNo:Number, 
 originAds:String,
 distAds:String,
 originLat:String,
 originLng:String,
 distLat: String,
 distLng: String,
 travelmod: String,
 CustID: String,
 DriverType:String,
 totalAmt:String,
 totalDistance: String,
 travalTime: String,
 payMode: String,
 status:String,
date: { type: Date, default: Date.now },  
});
drivernotfoundSchema.plugin(autoIncrement.plugin, { model: 'indrivernotfoundcollections', field: 'entryNo',startAt: 1, incrementBy: 1 });
var drivernotfoundmodul = mongoose.model('indrivernotfoundcollections', drivernotfoundSchema);


///Driver Incentive
var IncentiveSchema = new mongoose.Schema({     
  pilotID:String, 
  travelmod:String,
  DriverType:String,
  incentiveAmount:String,
  incentiveKM:String,
  incentiveNoOfRide:String,
  
});

var Incentivemodul = mongoose.model('inincentivecollections', IncentiveSchema);

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
DriverPaymentSchema.plugin(autoIncrement.plugin, { model: 'indriverpaymentcollections', field: 'TransactionID',startAt: 1, incrementBy: 1 });
var DriverPaymentmodul = mongoose.model('indriverpaymentcollections', DriverPaymentSchema);

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

var DutyLogmodul = mongoose.model('inDutyLogcollections', DutyLogSchema);

///Driver Car LogBook
var CarlogbookSchema = new mongoose.Schema({     
  bookingID:  String,
  pilotID :String,
  travelmod:String,
  DriverType:String, 
  driverCetegory:String, 
  startlatlng: [], 
  pickuplatlng: [],   
  droplatlng:[],
  pickupDistance:String,
  dropDistance:String,
  kmTravels:String,
  perltrFulePrice:String,
  enginMilege:String,
  fuleConsumption:String,
  fuleConsumptionPaid:String,
  fuleConsumptionPaidDate:{type:Date},
  loogBookStatus:String,
  CityName:String ,
  branchName:String,
  bookingType:String,
  pilotID:String,
  date: { type: Date, default: Date.now } 
  
});

var Carlogbookmodul = mongoose.model('inCarlogbookcollections', CarlogbookSchema);

/// Daily Prtrol Desel prise
var petroldeselSchema = new mongoose.Schema({     
  petrolPerLtr:String,
  deselPerLtr:String,
  cngPrice: String,
  cityName:String 
});

var petroldeselmodul = mongoose.model('inpetroldeselcollections', petroldeselSchema);


var deliverySchema = new mongoose.Schema({     
ModeofDelivery: String,
deliveryPrice: String,
deliveryType: String,
dropDirection: String,
dropMobile: String,
dropName: String,
droplat: String,
droplng: String,
droplocation: String,
pickupDirection: String,
pickupMobile: String,
pickupName: String,
pickuplat: String,
pickuplng: String,
pickuplocation: String,
bookingID:String,
CustID:String,
deliveryStatus:String,
ate: { type: Date, default: Date.now },

});

var deliverymodul = mongoose.model('indeliverycollections', deliverySchema);


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
  driverCetegory:String,
  driverFuelConsumtion:String,
  carManitenanceCost:String,
  callbookingStatus:String,
  driverBusy:String,
  preRideOTP:String,
  startTime:{ type: Date},
  endTime:{ type: Date},
  totalTime:String,
  timefare:String,
  holdingOverStayTime:String,
  holdingOverStayCharge:String,
  perMinuteCost:String,
  gstCharge:String,
  spacelDiscount:String,
  gotodemandarea:String,
  subAdminID:String,
  demandCall:String ,
  CityName:String ,
  branchName:String,

});


//rideSchema.plugin(autoIncrement.plugin, { model: 'ridecollections', field: 'bookingID',startAt: 1000, incrementBy: 1 });

var ridemodul = mongoose.model('inridecollections', rideSchema);
///Ride book Schema Counter
var rideCountSchema = new mongoose.Schema({ 
  bookingID:  String,   
});

//rideSchema.plugin(autoIncrement.plugin, { model: 'ridecollections', field: 'bookingID',startAt: 1000, incrementBy: 1 });

var rideCountmodul = mongoose.model('inrideCountcollections', rideCountSchema);

///Wallet Order Schema Counter
var paymentorderCountSchema = new mongoose.Schema({ 
  OrderID:Number,   
});

var paymentorderCountmodul = mongoose.model('inpaymentorderCountcollections', paymentorderCountSchema);



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
  iciciGetwayRes:[],
  iciciGetwayStatus:String,
  date: { type: Date, default: Date.now },   
});

var paygetwaymodul = mongoose.model('inpaygetwaycollections', paygetwaySchema);

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

priceandOfferSchema.plugin(autoIncrement.plugin, { model: 'inpriceandOffercollections', field: 'offerID',startAt: 1, incrementBy: 1 });
var priceandOffermodul = mongoose.model('inpriceandOffercollections', priceandOfferSchema);

///City Waise Price Variation
var cityPriceSchema = new mongoose.Schema({ 
  CityName:  String,
  branchName:String,
  CityGPS:[],
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
  GenarelPerMinutCharge:String,
  cityRediusMultiplyer:[],
  cityPickTimeMultiplyer:[],
  cityHolydayMultiplyer:[],
  cityWeakEndMultiplyer:[]

});

var cityPricemodul = mongoose.model('incitypricecollections', cityPriceSchema);

/////Branch Schema//////////
var branchSchema = new mongoose.Schema({ 
  branchID:  String,
  branchName:String,
  branchAddress:String
});

branchSchema.plugin(autoIncrement.plugin, { model: 'inbranchcollections', field: 'branchID',startAt: 1, incrementBy: 1 });
var branchmodul = mongoose.model('inbranchcollections', branchSchema);

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

var demandmodul = mongoose.model('indemandcollections', demandSchema);

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
  preRideAutoOffline:String,
  accuracy:String,
  cityName:String,
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
var driverlocationmodul = mongoose.model('indriverlocationcollections', driverlocationSchema);



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
adminSchema.plugin(autoIncrement.plugin, { model: 'inadmincollections', field: 'adminID',startAt: 1, incrementBy: 1 });
var adminmodul = mongoose.model('inadmincollections', adminSchema);

////Share Ride Booking Schema
var shareBookingSchema = new mongoose.Schema({ 
  travelMode:String,
  shereRideCapacity:String,
  seatPosition:String,
  bookingStatus:String,
  totalAmount:String,
  TravalDistance:String,
  CustID:String, 
  pickupLocation:String,
  pickupLatLng:[],
  dropLocation:String,
  dropLatLng:[], 
  date: { type: Date, default: Date.now }
 
 
});

var shareBookingmodul = mongoose.model('insharebookingcollections', shareBookingSchema);

////Database Cookies Schema//////
var localstorageSchema = new mongoose.Schema({ 
  pickuplatlong:[],
  picuplocation:String,
  droplatlong:[],
  droplocation:String,
  CustID:String
});

var localstoragemodul = mongoose.model('inlocalstoragecollections', localstorageSchema);

////Database Cookies Schema//////
var geocodeSchema = new mongoose.Schema({ 
  latlong:[],
  formated_address:String, 
  type:String,
  CustID:String,
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

var geocodemodul = mongoose.model('ingeocodecollections', geocodeSchema);




//////// Driver Incentive Modul//////
var incentiveCategorySchema = new mongoose.Schema({
  enrtyID:Number,   
  numberOfBooking:String,
  inctravelKM:String,
  incetiveAmount:String,
  incetiveSlot:String,
  incetiveCategry:String,
  travelmod:String,
  city:String
  });
  incentiveCategorySchema.plugin(autoIncrement.plugin, { model: 'incentivecategorycollections', field: 'enrtyID',startAt: 1, incrementBy: 1 });
  var incentiveCategorymodul = mongoose.model('incentivecategorycollections', incentiveCategorySchema);



module.exports.pilotIncentiveModule=incentiveCategorymodul;

module.exports.customer=custmodul;
module.exports.pilot=pilotmodul;
module.exports.Incentive=Incentivemodul;
module.exports.DriverPayment=DriverPaymentmodul;
module.exports.petroldesel=petroldeselmodul;

module.exports.index2Ddriver=index2Ddriver;
module.exports.driverlocation=driverlocationmodul;

module.exports.index2Ddemand=index2Ddemand;



module.exports.ride=ridemodul;
module.exports.rideCounter=rideCountmodul;
module.exports.priceOffer=priceandOffermodul;
module.exports.cityPrice=cityPricemodul;
module.exports.branch=branchmodul;
module.exports.demandArea=demandmodul;

module.exports.delivery=deliverymodul;





module.exports.paygetway=paygetwaymodul
module.exports.paymentorderCount=paymentorderCountmodul

module.exports.DutyLog=DutyLogmodul;
module.exports.Carlogbook=Carlogbookmodul;

module.exports.drivernotfound=drivernotfoundmodul;

module.exports.admin=adminmodul;

module.exports.shareBooking=shareBookingmodul;
module.exports.localstorage=localstoragemodul;
module.exports.geocode=geocodemodul;


