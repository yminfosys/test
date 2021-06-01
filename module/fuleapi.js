// var request = require('request');
// // var unirest = require("unirest");

// // var req = unirest("GET", "https://daily-fuel-prices-india.p.rapidapi.com/api/HP/allstates");

// // req.headers({
// // 	"x-rapidapi-key": "71d064f671msh2ef2f3d52c19a20p180da2jsnfbf8b6b30d2d",
// // 	"x-rapidapi-host": "daily-fuel-prices-india.p.rapidapi.com",
// // 	"useQueryString": true
// // });


// // req.end(function (res) {
// // 	if (res.error) throw new Error(res.error);

// // 	console.log(res.body);
// // });

// var options = {
//     method: 'GET',
//     url: 'https://daily-fuel-prices-india.p.rapidapi.com/api/HP/allstates',
//     headers: {
//         'content-type': 'application/json',
//         'x-rapidapi-key': '71d064f671msh2ef2f3d52c19a20p180da2jsnfbf8b6b30d2d'
//     },
//     // body: {
//     //     amount: Number(req.body.payAmount),
//     //     contact_number: req.body.mobileNumber,
//     //     email_id: req.body.email,
//     //     currency: "INR",
//     //     mtx: "PAA-" + OrderID + "",
//     //     udf: { CustID: req.body.CustID, PaymentType: req.body.typeOfReqest }
//     // },
//     json: true
// };

// request(options, function(error, response, body) {
//     if (error) throw new Error(error);

//     console.log(body);
    
// });