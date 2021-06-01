var express = require('express');
var router = express.Router();
var googleApi=require('../module/googleMap');



router.get('/', function(req, res, next) {
   
    res.render('admin/adminindex')
 })



  
  

module.exports = router;
