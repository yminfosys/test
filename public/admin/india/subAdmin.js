

function findDriverInit(){
    $("#content-2").css({"display":"none"});
    $("#mobile").val("");

    $("#content-1").html('<div class="col-xs-12 col-sm-12 col-md-4 col-lg-4 col-md-offset-4 col-lg-offset-4">\
    <div class="panel panel-success">\
        <div class="panel-heading">\
          <h3 class="panel-title">Enter Driver Mobile No / Driver ID:</h3>\
        </div>\
        <div class="panel-body">\
          <div class="form-group">\
            <div class="col-xs-9 col-sm-9">\
              <input type="text" class="form-control" id="mobile" placeholder="10 Digit Mobile Number">\
            </div>\
            <div class="col-xs-3  col-sm-3">\
              <button onclick="findDriver()" type="button" class="btn btn-default">Find</button>\
            </div>\
          </div>\
        </div>\
    </div>\
  </div>');
}

function findDriver(callUploadfile) {
      if(callUploadfile){
        var mobile = callUploadfile;
      }else{
        var mobile = $("#mobile").val();
      }
    var isd = '+91';
    $.post('/india/admin/findDriver', { mobile: mobile, isd: isd }, function(data) {
        if (data != 'worng') {
            var cilyList='<option value="">Select City</option>'
            cityList(function(city){
                if(city.length>0){
                    city.forEach(function(val,key,ary){
                        cilyList+='<option value="'+val+'">'+val+'</option>';
                    });
                }else{
                    alert("City Table Is Empty")
                }
                
                var d = (Number(data.dutyEnd) - Number(data.dutyStart) - (Number(data.BreakEnd) - Number(data.breakStart)));
                $("#content-2").css({"display":"none"});
                $("#content-1").html('<div  style="margin-top: 10px; border: 1px solid #000; border-radius: 10px; padding: 5px;" class="container">\
                <div class="row">\
                  <div   class="col-xs-5 col-sm-5 col-md-2 col-lg-2">\
                    <img style="height: 100px; width: 100px;" class="img-responsive img-circle" src="' + data.photo + '" onclick="window.open(this.src)" onerror="if (this.src != \'error.jpg\') this.src = \'/india/driverDocument/defult.png\';">\
                  </div>\
                  <div class="col-xs-7 col-sm-7 col-md-9 col-lg-9">\
                    <h2>' + data.name + '</h2>\
                    <span  class="post-label">Account ID : ' + data.mobileNumber + '</span><br>\
                    <input id="AccountID" type="hidden" value="' + data.mobileNumber + '">\
                    <input id="mobile" type="hidden" value="' + data.mobileNumber + '">\
                    <span class="post-label">Status : ' + data.accountStatus + '</span><br>\
                    <i class="fa fa-map-marker" aria-hidden="true"></i>  ' + data.address + '</p>\
                  </div>\
                  <div   class="col-md-1 col-lg-1">\
                  <button type="button" onclick="closeDriverFind()" class="btn btn-xs btn-danger">X</button>\
                  </div>\
                </div>\
                </div>\
                <div  style="margin-top: 10px; border: 1px solid #000; border-radius: 10px; padding: 5px;" class="container">\
                  <ul style="margin-top: 20px;" class="nav nav-tabs">\
                    <li class="active"><a data-toggle="tab" href="#basicDetals">Basic </a></li>\
                    <li><a data-toggle="tab" href="#bankDetails">Bank </a></li>\
                    <li><a data-toggle="tab" href="#document">Documents </a></li>\
                    <li><a data-toggle="tab" href="#dutyOvertome">Duty hours</a></li>\
                  </ul>\
                  <div class="tab-content">\
                    <div id="basicDetals" class="tab-pane  fade in active">\
                            <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">\
                              <div class="form-group">\
                                  <label>Engine Type : </label>\
                                  <select id="engintype" class="form-control">\
                                  <option value="Petrol">PETROL</option>\
                                  <option value="Diesel">DIESEL</option>\
                                  <option value="CNG">CNG</option>\
                                  </select>\
                                </div>\
                                <div class="form-group">\
                                    <label>Mileage (KM/LTR) :  </label>\
                                    <input type="text" id="milege" class="form-control">\
                                </div>\
                                <div class="form-group">\
                                  <label>Select Driver City : </label>\
                                  <select id="driverCity" class="form-control">\
                                    '+cilyList+'\
                                  </select>\
                                </div>\
                                <div class="form-group">\
                                    <label>Driver Travel Mode : </label>\
                                    <select id="travelmod" class="form-control">\
                                    <option value="">Select Travel Mode</option>\
                                    <option value="1">Bike</option>\
                                    <option value="2">Auto</option>\
                                    <option value="3">4 Seat Mini</option>\
                                    <option value="4">6 Seat Cab</option>\
                                    </select>\
                                </div>\
                                <div class="form-group">\
                                    <label>Driver Pay / KM : </label>\
                                    <input type="number" name="" id="driverpayout" class="form-control" value="min=" {6" min="{6"} max="" step="" required="required" title="">\
                                </div>\
                                <div class="form-group">\
                                  <label>Driver Category : </label>\
                                  <select id="driverCetegory" class="form-control">\
                                  <option value="">Select Driver Cetegory</option>\
                                  <option value="1">1</option>\
                                  <option value="2">2</option>\
                                  <option value="3">3</option>\
                                  </select>\
                                </div>\
                                <div class="form-group">\
                                  <label>Driver Incentive Mode : </label>\
                                  <select id="incentiveMode" class="form-control">\
                                  <option value="">Select Incentive Mode</option>\
                                  <option value="1">1</option>\
                                  <option value="2">2</option>\
                                  <option value="3">3</option>\
                                  </select>\
                                </div>\
                                  <button onclick="submitEngintype()" class="btn btn-primary">Submit</button>\
                                  <div id="mssg"></div>\
                            </div>\
                            <div  id="basi-cDetails" style="margin-top: 20px;" class="col-xs-12 col-sm-12 col-md-6 col-lg-6">\
                              <div class="thumbnail">\
                                <img data-src="#" alt="">\
                                <div class="caption">\
                                  <h5>Besic Details</h5>\
                                  <hr>\
                                    <p>Driver &quot;s City : ' + data.cityName + '</p>\
                                    <p>Engine Type : ' + data.vichelEnginType + '</p>\
                                    <p>Mileage (KM/LTR) : ' + data.enginMilege + '</p>\
                                    <p>Travel Mode  : ' + data.travelmod + '</p>\
                                    <p>Driver Pay / KM  : ' + data.driverpayout + '</p>\
                                    <p>Incentive Mode  : ' + data.incentiveMode + '</p>\
                                    <p>Driver Category  : ' + data.driverCetegory + '</p>\
                                </div>\
                              </div>\
                            </div>\
                    </div>\
                    <div id="bankDetails" class="tab-pane fade">\
                      <div class="row">\
                        <div id="bankacdtls" class="col-xs-12 col-sm-12 col-md-4 col-lg-4 col-md-offset-1 col-lg-offset-1 ">\
                          <h2><i class="fa fa-bank" aria-hidden="true"></i></h2>\
                          <p>Name: : ' + data.name + '</p>\
                          <p>Account No : ' + data.bankAccountNo + '</p>\
                          <p>IFSC Code : ' + data.ifsc + '</p>\
                        </div>\
                        <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4 ">\
                          <div class="form-group">\
                            <label>Account No :</label>\
                              <input type="number" name="" id="accountNumber" class="form-control" value="">\
                          </div>\
                          <div class="form-group">\
                            <label >IFSC Code :</label>\
                            <input type="text" name="" id="ifscCode" class="form-control" value="">\
                          </div>\
                          <div class="form-group">\
                            <button onclick="updateBankDetails()" class="btn btn-primary">Submit</button>\
                          </div>\
                        </div>\
                      </div>\
                    </div>\
                    <div id="document" class="tab-pane fade">\
                      <div class="row">\
                        <div id="docm" style="margin-top: 10px;" class="col-xs-12 col-sm-12 col-md-7 col-lg-7 col-md-offset-1 col-lg-offset-1">\
                            <div class="col-xs-6 col-sm-6 col-md-4 col-lg-4">\
                                <div class="thumbnail">\
                                <img  style="height: 200px; width: 100%;"  src="' + data.photo + '" onclick="zoompic(this.src)" onerror="if (this.src != \'error.jpg\') this.src = \'/india/driverDocument/defult.png\';">\
                                <div class="caption">\
                                    <label class="btn btn-default col-xs-12 col-sm-12">Selfie Photo &nbsp; <span id="img1" class="document"><i class="fa fa-camera" aria-hidden="true"></i></span>\
                                    <form action="/india/admin/sub/uploadfile" method="POST" enctype="multipart/form-data">\
                                    <input onchange="uploafdoc(1)" name="file1" type="file" accept="image/*;capture=camera" class="file">\
                                    <input name="driverMobile" type="hidden" value="' + data.mobileNumber + '">\
                                    <input style="display: none;" type="submit" id="uploadFile1">\
                                    </form>\
                                    </label>\
                                </div>\
                                </div>\
                            </div>\
                            <div class="col-xs-6 col-sm-6 col-md-4 col-lg-4">\
                                <div class="thumbnail">\
                                <img style="height: 200px; width: 100%;"  src="' + data.Idproof + '" onclick="zoompic(this.src)" onerror="if (this.src != \'error.jpg\') this.src = \'/india/driverDocument/defult.png\';">\
                                <div class="caption">\
                                <label class="btn btn-default col-xs-12 col-sm-12">ID Proof &nbsp; <span id="img1" class="document"><i class="fa fa-camera" aria-hidden="true"></i></span>\
                                    <form action="/india/admin/sub/uploadfile" method="POST" enctype="multipart/form-data">\
                                    <input onchange="uploafdoc(2)" name="file2" type="file" accept="image/*;capture=camera" class="file">\
                                    <input name="driverMobile" type="hidden" value="' + data.mobileNumber + '">\
                                    <input style="display: none;" type="submit" id="uploadFile2">\
                                    </form>\
                                    </label>\
                                </div>\
                                </div>\
                            </div>\
                            <div class="col-xs-6 col-sm-6 col-md-4 col-lg-4">\
                                <div class="thumbnail">\
                                <img style="height: 200px; width: 100%;"  src="' + data.dl + '" onclick="zoompic(this.src)" onerror="if (this.src != \'error.jpg\') this.src = \'/india/driverDocument/defult.png\';">\
                                <div class="caption">\
                                <label class="btn btn-default col-xs-12 col-sm-12">Diving Licence &nbsp; <span id="img1" class="document"><i class="fa fa-camera" aria-hidden="true"></i></span>\
                                <form action="/india/admin/sub/uploadfile" method="POST" enctype="multipart/form-data">\
                                <input onchange="uploafdoc(3)" name="file3" type="file" accept="image/*;capture=camera" class="file">\
                                <input name="driverMobile" type="hidden" value="' + data.mobileNumber + '">\
                                <input style="display: none;" type="submit" id="uploadFile3">\
                                </form>\
                                </label>\
                                </div>\
                                </div>\
                            </div>\
                            <div class="col-xs-6 col-sm-6 col-md-4 col-lg-4">\
                                <div class="thumbnail">\
                                <img style="height: 200px; width: 100%;"  src="' + data.rto + '" onclick="zoompic(this.src)" onerror="if (this.src != \'error.jpg\') this.src = \'/india/driverDocument/defult.png\';">\
                                <div class="caption">\
                                <label class="btn btn-default col-xs-12 col-sm-12">RTO/Blue Book &nbsp; <span id="img1" class="document"><i class="fa fa-camera" aria-hidden="true"></i></span>\
                                <form action="/india/admin/sub/uploadfile" method="POST" enctype="multipart/form-data">\
                                <input onchange="uploafdoc(4)" name="file4" type="file" accept="image/*;capture=camera" class="file">\
                                <input name="driverMobile" type="hidden" value="' + data.mobileNumber + '">\
                                <input style="display: none;" type="submit" id="uploadFile4">\
                                </form>\
                                </label>\
                                </div>\
                                </div>\
                            </div>\
                            <div class="col-xs-6 col-sm-6 col-md-4 col-lg-4">\
                                <div class="thumbnail">\
                                <img style="height: 200px; width: 100%;"  src="' + data.insurence + '" onclick="zoompic(this.src)" onerror="if (this.src != \'error.jpg\') this.src = \'/india/driverDocument/defult.png\';">\
                                <div class="caption">\
                                    <label class="btn btn-default col-xs-12 col-sm-12">Insurence &nbsp; <span id="img1" class="document"><i class="fa fa-camera" aria-hidden="true"></i></span>\
                                <form action="/india/admin/sub/uploadfile" method="POST" enctype="multipart/form-data">\
                                <input onchange="uploafdoc(5)" name="file5" type="file" accept="image/*;capture=camera" class="file">\
                                <input name="driverMobile" type="hidden" value="' + data.mobileNumber + '">\
                                <input style="display: none;" type="submit" id="uploadFile5">\
                                </form>\
                                </label>\
                                </div>\
                                </div>\
                            </div>\
                            <div class="col-xs-6 col-sm-6 col-md-4 col-lg-4">\
                                <div class="thumbnail">\
                                <img style="height: 200px; width: 100%;"  src="' + data.polution + '" onclick="zoompic(this.src)" onerror="if (this.src != \'error.jpg\') this.src = \'/india/driverDocument/defult.png\';">\
                                <div class="caption">\
                                <label class="btn btn-default col-xs-12 col-sm-12">Polution &nbsp; <span id="img1" class="document"><i class="fa fa-camera" aria-hidden="true"></i></span>\
                                <form action="/india/admin/sub/uploadfile" method="POST" enctype="multipart/form-data">\
                                <input onchange="uploafdoc(6)" name="file6" type="file" accept="image/*;capture=camera" class="file">\
                                <input name="driverMobile" type="hidden" value="' + data.mobileNumber + '">\
                                <input style="display: none;" type="submit" id="uploadFile6">\
                                </form>\
                                </label>\
                                </div>\
                                </div>\
                            </div>\
                      </div>\
                      <div  style="margin-top: 10px;"  class="col-xs-12 col-sm-12 col-md-4 col-lg-4">\
                        <button onclick="verifyDriver()" type="button" class="btn btn-large btn-block btn-success">Activate Account</button>\
                        <button onclick="deactivate()" type="button" class="btn btn-large btn-block btn-success">Deactive Account</button>\
                      </div>\
                    </div>\
                    </div>\
                    <div id="dutyOvertome" class="tab-pane fade">\
                      <div class="row">\
                        <div class="col-xs-12 col-sm-12 col-md-8 col-lg-8  col-md-offset-2 col-lg-offset-2">\
                          <div class="page-header">\
                            <h1>Duty<small>Schedule</small></h1>\
                          </div>\
                               <div class="form-group col-xs-6 col-sm-6 col-md-3 col-lg-3">\
                                 <label>Duty Start</label>\
                                 <input type="text" class="form-control" id="dutyStart" placeholder="ex: 0 to 23">\
                               </div>\
                               <div class="form-group col-xs-6 col-sm-6 col-md-3 col-lg-3">\
                                 <label>Break Start</label>\
                                 <input type="text" class="form-control" id="breakStart" placeholder="ex: 0 to 23">\
                               </div>\
                               <div class="form-group col-xs-6 col-sm-6 col-md-3 col-lg-3">\
                                 <label>Break End</label>\
                                 <input type="text" class="form-control" id="breakEnd" placeholder="ex: 0 to 23">\
                               </div>\
                               <div class="form-group col-xs-6 col-sm-6 col-md-3 col-lg-3">\
                                 <label>Duty End</label>\
                                 <input type="text" class="form-control" id="dutyEnd" placeholder="ex: 0 to 23">\
                               </div>\
                               <div class=" col-xs-12 col-sm-12 col-md-6 col-lg-6">\
                                 <button onclick="updateDutyShedule()" type="submit" class="btn btn-primary">Submit</button>\
                                 <button onclick="cancelDutyShedule()" type="submit" class="btn btn-primary">Clear Duty</button>\
                               </div>\
                               <div id="dutyDetalis" class=" col-xs-9 col-sm-9">\
                               Duty : ' + data.dutyStart + ' to ' + data.dutyEnd + ' hr and Break : ' + data.breakStart + ' to ' + data.BreakEnd + ' hr. Total Duty : ' + d + ' hr.\
                               </div>\
                               <div id="msout" class=" col-xs-3 col-sm-3">\
                               </div>\
                               <div id="duty-on-off-line" class=" col-xs-12 col-sm-12">\
                                 <div class="row">\
                                   <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">\
                                     <div class="page-header">\
                                       <h4>Driver Offline Online Control</h4>\
                                     </div>\
                                     <div id="off-on-control" class="col-xs-12 col-sm-12 col-md-12 col-lg-12">\
                                     <button onclick="offlinereqbyadmin(\'' + data.pilotID + '\')" type="button" class="btn btn-primary">Off-line</button>\
                                     <button onclick="onlinereqbyadmin(\'' + data.pilotID + '\')" type="button" class="btn btn-primary">On-line</button>\
                                     </div>\
                                   </div>\
                                 </div>\
                               </div>\
                        </div>\
                      </div>\
                    </div>\
                  </div>\
                </div>\
                </div>');


            })
           

        }else{
            $("#mobile").css({ "background-color": "#c44630", "color": "#FFF" });
        }
    });
}

function zoompic(src){

$("#zooppic").css({"display":"block"});
$("#zooppic").html('<button style="float: right;" type="button" onclick="clocezoompic()" class="btn btn-xs btn-danger">X</button>\
<img src="'+src+'" class="img-responsive" alt="Image">');

}

function clocezoompic(){
  $("#zooppic").css({"display":"none"});
}

function closeDriverFind() {
  $("#content-1").html("");
  $("#content-2").css({"display":"block"});
  
}

function FindCustomerInit(){
  $("#content-2").css({"display":"none"});
  $("#mobile").val("");

  $("#content-1").html('<div class="col-xs-12 col-sm-12 col-md-4 col-lg-4 col-md-offset-4 col-lg-offset-4">\
  <div class="panel panel-success">\
      <div class="panel-heading">\
        <h3 class="panel-title">Enter Customer Mobile No:</h3>\
      </div>\
      <div class="panel-body">\
        <div class="form-group">\
          <div class="col-xs-9 col-sm-9">\
            <input type="text" class="form-control" id="mobile" placeholder="10 Digit Mobile Number">\
          </div>\
          <div class="col-xs-3  col-sm-3">\
            <button onclick="findCustomer()" type="button" class="btn btn-default">Find</button>\
          </div>\
        </div>\
      </div>\
  </div>\
</div>');
}

function findCustomer(mobile){
  if(mobile){
    var CustID=mobile;
  }else{
    var CustID=$("#mobile").val();
  }
  $.post('/india/admin/sub/findCustomer', { CustID: CustID }, function(data) {
    $("#content-2").css({"display":"none"});
    //$("#content-1").html(JSON.stringify(data));
    $("#content-1").html('<div style="margin-top: 20px;" class="container">\
    <div role="tabpanel" class="col-xs-12 col-sm-12 col-md-6 col-lg-6 col-md-offset-3 col-lg-offset-3">\
        <span class="label"><h2>Customer Details</h2></span>\
        <!-- Nav tabs -->\
        <ul class="nav nav-tabs" role="tablist">\
            <li role="presentation" class="active">\
                <a href="#profile" aria-controls="home" role="tab" data-toggle="tab">Profile</a>\
            </li>\
            <li role="presentation">\
                <a href="#seting" aria-controls="tab" role="tab" data-toggle="tab">Setings</a>\
            </li>\
        </ul>\
        <!-- Tab panes -->\
        <div  class="tab-content">\
            <div role="tabpanel" class="tab-pane fade in active" id="profile">\
              <div style="background-color: rgb(253, 253, 253);" class="col-xs-12 col-sm-12 col-md-12 col-lg-12">\
                  <div class="thumbnail">\
                    <button type="button" onclick="closeDriverFind()" class="btn btn-xs btn-danger">X</button>\
                      <img style="width: 50%;" class="img-responsive img-circle" src="/india/images/custLogo.png" alt="">\
                      <div class="caption text-center">\
                          <p>Rating: '+data.custRating+' <i class="fa fa-star" aria-hidden="true"></i></p>\
                          <h3>'+data.name+'</h3>\
                          <p>Wallet Balance: '+Number(data.walletBalance).toFixed(2)+'</p>\
                          <p>Mobile No: '+data.mobileNumber+'</p>\
                          <p>Email: '+data.email+'</p>\
                          <p>CustID: '+data.CustID+'</p>\
                          <p>Account Status: '+data.status+'</p>\
                          <p>Special Dicsount: '+Number(data.spacelDiscount).toFixed(2)+'</p>\
                          <p>Ref: '+data.refType+', RefBy: '+data.refBy+'</p>\
                          <p>City: '+data.CityName+'</p>\
                          <p>Branch: '+data.branchName+'</p>\
                      </div>\
                  </div>\
              </div>\
            </div>\
            <div role="tabpanel" class="tab-pane fade" id="seting">\
                <div style="background-color: rgb(253, 253, 253);" class="col-xs-12 col-sm-12 col-md-12 col-lg-12">\
                    <div class="thumbnail">\
                        <img src="#" alt="">\
                        <div class="caption text-center">\
                            <h3>'+data.name+'</h3>\
                            <p>CustID: '+data.CustID+'</p>\
                            <p>\
                                <input type="hidden" id="custMobileNo" value="'+data.mobileNumber+'">\
                                <a href="#" onclick="setActiveCust()"  class="btn btn-primary">Set-Active</a>\
                                <a href="#" onclick="setDeactiveCust()" class="btn btn-danger">Set-Deactive</a>\
                                <a href="#" onclick="resetCust()" class="btn btn-success">Re-set</a>\
                            </p>\
                            <p>\
                                <input id="custspaicleDiscount" type="text" class="form-control" placeholder="Special Discount">\
                                <button onclick="specialCustDiscount()" type="button" class="btn btn-sm btn-success">Submit</button>\
                            </p>\
                        </div>\
                    </div>\
                </div>\
            </div>\
        </div>\
    </div>\
</div>');
  });

}


function resetCust() {
  var custMobileNo = $("#custMobileNo").val();
  $.post('/india/admin/sub/resetCustomer', { custMobileNo: custMobileNo }, function(data) {
      alert(data)
      $("#content-1").html('');
  })
}

function specialCustDiscount() {
  var custMobileNo = $("#custMobileNo").val();
  var custspaicleDiscount = $("#custspaicleDiscount").val();
  if (Number(custspaicleDiscount) >= 0) {
      $.post('/india/admin/sub/specialCustDiscount', { custMobileNo: custMobileNo, custspaicleDiscount: custspaicleDiscount }, function(data) {
          alert(data);
          $("#content-1").html('');
      })
  } else {
      alert("Enter Amount")
  }

}

function setActiveCust() {
  var custMobileNo = $("#custMobileNo").val();
  $.post('/india/admin/sub/setActiveCust', { custMobileNo: custMobileNo }, function(data) {
      alert(data);
      $("#content-1").html('');
  })
}

function setDeactiveCust() {
  var custMobileNo = $("#custMobileNo").val();
  $.post('/india/admin/sub/setDeactiveCust', { custMobileNo: custMobileNo }, function(data) {
      alert(data);
      $("#content-1").html('');
  })
}



// function findDriver1() {
//     var mobile = $("#mobile").val();
//     var isd = '+91';
//     $.post('/india/admin/findDriver', { mobile: mobile, isd: isd }, function(data) {
//         if (data != 'worng') {
//             //alert(data) 
//             $("#Driver-search").css({ "display": "none" });
//             $("#otheContent").css({ "display": "none" });
//             $("#verify-driver").css({ "display": "block" });
//             $("#userImg").html('<img class="img-responsive img-circle" src="/india/' + data.photo + '" onclick="window.open(this.src)" onerror="if (this.src != \'error.jpg\') this.src = \'/india/driverDocument/defult.png\';">');
//             $("#user-data").html('<h2>' + data.name + '</h2>\
//           <span  class="post-label">Account ID : ' + data.mobileNumber + '</span><br>\
//           <input id="AccountID" type="hidden" value="' + data.mobileNumber + '">\
//           <span class="post-label">Status : ' + data.accountStatus + '</span><br>\
//           <i class="fa fa-map-marker" aria-hidden="true"></i>  ' + data.address + '</p>');
//             $("#docm").html('<div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">\
//             <div class="thumbnail">\
//               <img src="/india/' + data.photo + '" onclick="window.open(this.src)" onerror="if (this.src != \'error.jpg\') this.src = \'/india/driverDocument/defult.png\';">\
//               <div class="caption">\
//                 <label class="btn btn-default col-xs-12 col-sm-12">Passport Photo &nbsp; <span id="img1" class="document"><i class="fa fa-camera" aria-hidden="true"></i></span>\
//                 <form action="/india/admin/sub/uploadfile" method="POST" enctype="multipart/form-data">\
//                 <input onchange="uploafdoc(1)" name="file1" type="file" accept="image/*;capture=camera" class="file">\
//                 <input name="mobile" type="hidden" value="' + data.mobileNumber + '">\
//                 <input style="display: none;" type="submit" id="uploadFile1">\
//                 </form>\
//                 </label>\
//               </div>\
//             </div>\
//           </div>\
//           <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">\
//             <div class="thumbnail">\
//               <img src="/india/' + data.Idproof + '" onclick="window.open(this.src)" onerror="if (this.src != \'error.jpg\') this.src = \'/india/driverDocument/defult.png\';">\
//               <div class="caption">\
//               <label class="btn btn-default col-xs-12 col-sm-12">ID Proof &nbsp; <span id="img1" class="document"><i class="fa fa-camera" aria-hidden="true"></i></span>\
//                 <form action="/india/admin/sub/uploadfile" method="POST" enctype="multipart/form-data">\
//                 <input onchange="uploafdoc(2)" name="file2" type="file" accept="image/*;capture=camera" class="file">\
//                 <input name="mobile" type="hidden" value="' + data.mobileNumber + '">\
//                 <input style="display: none;" type="submit" id="uploadFile2">\
//                 </form>\
//                 </label>\
//               </div>\
//             </div>\
//           </div>\
//           <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">\
//             <div class="thumbnail">\
//               <img src="/india/' + data.dl + '" onclick="window.open(this.src)" onerror="if (this.src != \'error.jpg\') this.src = \'/india/driverDocument/defult.png\';">\
//               <div class="caption">\
//               <label class="btn btn-default col-xs-12 col-sm-12">Diving Licence &nbsp; <span id="img1" class="document"><i class="fa fa-camera" aria-hidden="true"></i></span>\
//               <form action="/india/admin/sub/uploadfile" method="POST" enctype="multipart/form-data">\
//               <input onchange="uploafdoc(3)" name="file3" type="file" accept="image/*;capture=camera" class="file">\
//               <input name="mobile" type="hidden" value="' + data.mobileNumber + '">\
//               <input style="display: none;" type="submit" id="uploadFile3">\
//               </form>\
//               </label>\
//               </div>\
//             </div>\
//           </div>\
//           <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">\
//             <div class="thumbnail">\
//               <img src="/india/' + data.rto + '" onclick="window.open(this.src)" onerror="if (this.src != \'error.jpg\') this.src = \'/india/driverDocument/defult.png\';">\
//               <div class="caption">\
//               <label class="btn btn-default col-xs-12 col-sm-12">RTO/Blue Book &nbsp; <span id="img1" class="document"><i class="fa fa-camera" aria-hidden="true"></i></span>\
//               <form action="/india/admin/sub/uploadfile" method="POST" enctype="multipart/form-data">\
//               <input onchange="uploafdoc(4)" name="file4" type="file" accept="image/*;capture=camera" class="file">\
//               <input name="mobile" type="hidden" value="' + data.mobileNumber + '">\
//               <input style="display: none;" type="submit" id="uploadFile4">\
//               </form>\
//               </label>\
//               </div>\
//             </div>\
//           </div>\
//           <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">\
//             <div class="thumbnail">\
//               <img src="/india/' + data.insurence + '" onclick="window.open(this.src)" onerror="if (this.src != \'error.jpg\') this.src = \'/india/driverDocument/defult.png\';">\
//               <div class="caption">\
//                 <label class="btn btn-default col-xs-12 col-sm-12">Insurence &nbsp; <span id="img1" class="document"><i class="fa fa-camera" aria-hidden="true"></i></span>\
//               <form action="/india/admin/sub/uploadfile" method="POST" enctype="multipart/form-data">\
//               <input onchange="uploafdoc(5)" name="file5" type="file" accept="image/*;capture=camera" class="file">\
//               <input name="mobile" type="hidden" value="' + data.mobileNumber + '">\
//               <input style="display: none;" type="submit" id="uploadFile5">\
//               </form>\
//               </label>\
//               </div>\
//             </div>\
//           </div>\
//           <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">\
//             <div class="thumbnail">\
//               <img src="/india/' + data.polution + '" onclick="window.open(this.src)" onerror="if (this.src != \'error.jpg\') this.src = \'/india/driverDocument/defult.png\';">\
//               <div class="caption">\
//               <label class="btn btn-default col-xs-12 col-sm-12">Polution &nbsp; <span id="img1" class="document"><i class="fa fa-camera" aria-hidden="true"></i></span>\
//               <form action="/india/admin/sub/uploadfile" method="POST" enctype="multipart/form-data">\
//               <input onchange="uploafdoc(6)" name="file6" type="file" accept="image/*;capture=camera" class="file">\
//               <input name="mobile" type="hidden" value="' + data.mobileNumber + '">\
//               <input style="display: none;" type="submit" id="uploadFile6">\
//               </form>\
//               </label>\
//               </div>\
//             </div>\
//           </div>\
//           <button onclick="verifyDriver()" type="button" class="btn btn-large btn-block btn-success">Verify</button>\
//           <button  type="button" class="btn btn-large btn-block btn-success">Submit</button>');

//             $("#basi-cDetails").html(' <div class="thumbnail">\
//           <img data-src="#" alt="">\
//           <div class="caption">\
//             <h5>Basic Details</h5>\
//             <hr>\
//             <p>Driver &quot;s City : ' + data.cityName + '</p>\
//             <p>Engine Type : ' + data.vichelEnginType + '</p>\
//             <p>Mileage (KM/LTR) : ' + data.enginMilege + '</p>\
//             <p>Travel Mode  : ' + data.travelmod + '</p>\
//             <p>Driver Pay / KM  : ' + data.driverpayout + '</p>\
//             <p>Incentive Mode  : ' + data.incentiveMode + '</p>\
//             <p>Driver Category  : ' + data.driverCetegory + '</p>\
//           </div>\
//         </div>');


//             $("#bankacdtls").html(' <div class="thumbnail">\
//           <img data-src="#" alt="">\
//           <div class="caption">\
//             <h5><i class="fa fa-bank" aria-hidden="true"></i>Bank Details</h5>\
//             <hr>\
//             <p>Name: : ' + data.name + '</p>\
//             <p>Account No : ' + data.bankAccountNo + '</p>\
//             <p>IFSC Code : ' + data.ifsc + '</p>\
//             </div>\
//         </div>');



//             $("#off-on-control").html('<button onclick="offlinereqbyadmin(\'' + data.pilotID + '\')" type="button" class="btn btn-primary">Off-line</button>\
//         <button onclick="onlinereqbyadmin(\'' + data.pilotID + '\')" type="button" class="btn btn-primary">On-line</button>');

//             var d = (Number(data.dutyEnd) - Number(data.dutyStart) - (Number(data.BreakEnd) - Number(data.breakStart)));

//             $("#dutyDetalis").html('Duty : ' + data.dutyStart + ' to ' + data.dutyEnd + ' hr and Break : ' + data.breakStart + ' to ' + data.BreakEnd + ' hr. Total Duty : ' + d + 'hr')

//         } else {
//             $("#mobile").css({ "background-color": "#c44630", "color": "#FFF" });
//         }
//     });
// }

function uploafdoc(a) {
    $("#uploadFile" + a + "").click();
}




function verifyDriver() {
    var mobile = $("#AccountID").val();
    var isd = '+91';
    $.post('/india/admin/verifyDriver', { mobile: mobile, isd: isd }, function(data) {
        if (data != 'worng') {
          findDriver();
            // //alert(data) 
            // $("#Driver-search").css({ "display": "none" });
            // $("#verify-driver").css({ "display": "block" });
            // $(".user-data").html('<h2>' + data.name + '</h2>\
            // <span id="AccountID" class="post-label">Account ID : ' + data.mobileNumber + '</span><br>\
            // <span class="post-label">Status : ' + data.accountStatus + '</span><br>\
            // <i class="fa fa-map-marker" aria-hidden="true"></i>  ' + data.address + '</p>')

        }else{
          alert("Worng Mobile or User")
        }
    })
}

function deactivate(){
  var mobile = $("#AccountID").val();
  var isd = '+91';
  $.post('/india/admin/deactivate', { mobile: mobile, isd: isd }, function(data) {
    if (data != 'worng') {
      findDriver();
    }
  });
}


function submitEngintype() {
    var engintype = $("#engintype").val();
    var milege = $("#milege").val();
    var mobile = $("#mobile").val();
    var driverCity = $("#driverCity").val();
    var travelmod = $("#travelmod").val();
    var isd = '+91';
    var driverpayout = $("#driverpayout").val();
    var incentiveMode = $("#incentiveMode").val();
    var driverCetegory = $("#driverCetegory").val();

    $.post('/india/admin/updateBasicDetails', {
        engintype: engintype,
        milege: milege,
        mobile: mobile,
        isd: isd,
        driverCity: driverCity,
        travelmod: travelmod,
        driverpayout: driverpayout,
        incentiveMode: incentiveMode,
        driverCetegory: driverCetegory
    }, function(data) {
        console.log(data);
        $("#mssg").html(data);
    });

}

function updateBankDetails() {
    var mobile = $("#mobile").val();
    var isd = '+91';
    var accountNumber = $("#accountNumber").val();
    var ifscCode = $("#ifscCode").val();
    $.post('/india/admin/updateBankDetails', {
        accountNumber: accountNumber,
        mobile: mobile,
        isd: isd,
        ifscCode: ifscCode
    }, function(data) {
        alert(data);
        findDriver();

    });

}




function updateDutyShedule() {
    var mobile = $("#mobile").val();
    var isd = '+91';
    var dutyStart = $("#dutyStart").val();
    var breakStart = $("#breakStart").val();
    var breakEnd = $("#breakEnd").val();
    var dutyEnd = $("#dutyEnd").val();
    $.post('/india/admin/updateDutyShedule', { dutyStart: dutyStart, breakStart: breakStart, breakEnd: breakEnd, dutyEnd: dutyEnd, mobile: mobile, isd: isd }, function(data) {

        $("#msout").html(data);
        findDriver();

    })
}

function cancelDutyShedule() {
    var mobile = $("#mobile").val();
    var isd = '+91';

    $.post('/india/admin/cancelDutyShedule', { mobile: mobile, isd: isd }, function(data) {

        $("#msout").html(data);
        findDriver();
    })
}


function offlinereqbyadmin(pilotID) {
    //alert(pilotID)
    $.post('/india/admin/onofflinebyadmin', { pilotID: pilotID, mode: "offline" }, function(data) {
        alert(data);

    });
}


function onlinereqbyadmin(pilotID) {
    $.post('/india/admin/onofflinebyadmin', { pilotID: pilotID, mode: "online" }, function(data) {
        alert(data);
    });
}

////////////Sub Admin Driver Duty Hours//////////
function searchDriver() {
    var mobile = $("#mobile").val();
    //alert(mobile);
    var isd = '+91';
    $.post('/india/admin/findDriver', { mobile: mobile, isd: isd }, function(data) {
        if (data != 'worng') {
            $("#driver-details").css({ "display": "block" })
            $("#page-head").html('<h1>' + data.name + '<small> Mobile: +91 ' + data.mobileNumber + ' ID: ' + data.pilotID + '</small></h1>')
            $("#pilotID").val(data.pilotID);
        }
    });
}

function subdrivermonthlyhour() {
    var month = $("#month").val();
    var pilotID = $("#pilotID").val();
    // alert(pilotID)
    $.post('/india/subMonthlyhours', { month: month, pilotID: pilotID }, function(data) {
        $("#dutyhr").html('<ul class="list-group">\
            <li class="list-group-item active ">\
                Total Hours of this Month\
            </li>\
            <li class=" list-group-item list-group-item-info ">\
                <span class="badge">' + data.monthlyDuty.overtime.toFixed(2) + '</span>\
                Over Time Duty Hour\
              </li>\
            <li class=" list-group-item list-group-item-info ">\
                <span class="badge">' + data.monthlyDuty.duty.toFixed(2) + '</span>\
                Duty Hour\
            </li>\
        </ul> ');
        $("#dutyhr").css({ "display": "block" });

    });
}

function subcashcollection() {
    var pilotID = $("#pilotID").val();
    $.post('/india/subdrivercashdue', { pilotID: pilotID }, function(data) {
        var cashColc = Number(data.previousDue);
        var fulecomsum = Number(data.PendingConsumption);
        var deposit = '<button type="submit" class="btn btn-success btn-block col-xs-12 col-sm-12">Due Amount &#8377;  0.00</button>';
        if (cashColc - fulecomsum > 0) {
            deposit = '<button type="submit" class="btn btn-success btn-block col-xs-12 col-sm-12">Due Amount &#8377;  ' + Math.abs(cashColc - fulecomsum).toFixed(2) + '</button>';

        }
        $("#cashdue").html('<ul class="list-group">\
      <li class="list-group-item active ">\
        <span style="font-size: medium;" class="badge">&#8377; ' + (Number(data.previousDue) + Number(data.dailyCollection)).toFixed(2) + '</span>\
        Total Cash Collection\
        </li>\
      <li class=" list-group-item list-group-item-info ">\
          <span class="badge">&#8377; ' + data.previousDue.toFixed(2) + '</span>\
          Previous Due\
        </li>\
        <li class=" list-group-item list-group-item-info ">\
          <span class="badge">&#8377; ' + data.dailyCollection.toFixed(2) + '</span>\
          Todays Collcetion\
        </li>\
    </ul>\
    <ul class="list-group">\
      <li class="list-group-item active ">\
        <span style="font-size: medium; " class="badge">&#8377; ' + (Number(data.PendingConsumption) + Number(data.dailyConsum.dailyConsm)).toFixed(2) + ' </span>\
        Fule Consumption\
      </li>\
      <li class=" list-group-item list-group-item-info ">\
          <span class="badge">&#8377; ' + Number(data.PendingConsumption).toFixed(2) + '</span>\
          Pending Consumption\
        </li>\
      <li class=" list-group-item list-group-item-info ">\
          <span class="badge">&#8377; ' + Number(data.dailyConsum.dailyConsm).toFixed(2) + '</span>\
          Todays KM Run ' + data.dailyConsum.totalkm + ' KM<br>\
          Fl Price :&#8377; ' + data.dailyConsum.fulePrice + '  Milege: ' + data.dailyConsum.mileage + '\
        </li>\
  </ul>' + deposit + '');
        $("#cashdue").css({ "display": "block" });


    })
}




function bookingManager(){
  $("#content-2").css({"display":"none"});
  $("#content-1").html('<div class="container">\
  <div id="newDrivers" class="col-xs-12 col-sm-12 col-md-6 col-lg-6 col-md-offset-3 col-lg-offset-3 ">\
      <div class="panel panel-success">\
          <div class="panel-heading">\
                <h3 class="panel-title"> Booking / Order Details </h3>\
          </div>\
          <div  class="panel-body">\
              <div class="form-group">\
                  <label for="inputorderID" class="col-sm-2 control-label ">OrderID:</label>\
                  <div class="col-sm-5">\
                      <input type="text" name="orderID" id="orderID" class="form-control" >\
                  </div>\
                  <div class="col-sm-5">\
                      <button onclick="getOrderDetailsByAdmin()" type="button" class="btn  btn-warning">Frech Order</button>\
                  </div>\
              </div>\
          </div>\
      </div>\
    </div>\
  </div>')

}

function getOrderDetailsByAdmin() {
    var cancelBookingID = $("#orderID").val();
    $.post('/india/admin/sub/getOrderDetailsbysubadmin', { cancelBookingID: cancelBookingID }, function(data) {
      var j=JSON.parse(data);
      $("#content-1").html(' <div class="container">\
      <div id="newDrivers" class="col-xs-12 col-sm-12 col-md-6 col-lg-6 col-md-offset-3 col-lg-offset-3 ">\
          <div class="panel panel-success">\
              <div class="panel-heading">\
                    <h3 class="panel-title"> Booking / Order Details </h3>\
              </div>\
              <div  class="panel-body">\
                 <div class="form-group">\
                     <label for="textareaOrder Details" class="col-sm-2 control-label">Details:</label>\
                     <div class="col-sm-10">\
                         <textarea  class="form-control" rows="10" >'+data+'</textarea>\
                     </div>\
                     <label style="margin-top: 5px;" for="textareaOrder Details" class="col-sm-2 control-label">Controls:</label>\
                     <div style="margin-top: 5px;"  class="col-sm-10">\
                      <input type="hidden"  id="orderID" value="" >\
                      <button onclick="cancelOrderByAdmin(\'' + j.bookingID + '\')" type="button" class="btn  btn-warning">Cencel Order</button>\
                      <button onclick="findCustomer(\'' + j.CustID + '\')" type="button" class="btn  btn-warning">Get Customer</button>\
                     </div>\
                 </div>\
              </div>\
         </div>\
      </div>\
    </div>');
     
    })
  
}

function cancelOrderByAdmin(cancelBookingID) {
  
    $.post('/india/admin/sub/orderCancelByAdmin', { cancelBookingID: cancelBookingID }, function(data) {
        alert(data)
    })
}


function refreshDemand() {
    $.post('/india/admin/sub/refreshdemand', {}, function(data) {
        alert(data)
    })
}







function activeDriver(page,noOfitem) {
  $("#content-2").css({"display":"none"});
    $.post('/india/admin/activeDriverTotalItem', {}, function(data) {
   
      $("#content-1").html('<div  class="container">\
  <div  class="col-xs-12 col-sm-12 col-md-12col-lg-12 ">\
      <div class="panel panel-success">\
          <div class="panel-heading">\
                <h3 class="panel-title">Active Driver List <span id="ActiveDricerCount" class="badge">'+Number(data.item)+'</span>\
                 <button style="float:right;" type="button" onclick="closeDriverFind()" class="btn btn-xs btn-danger float-right">X</button></h3>\
          </div>\
          <div id="activeDriverList" style="height: 80vh; overflow-y: auto;" class="panel-body">\
                <!-- <ul class="list-group">\
                    <li class="list-group-item active">\
                      <span style="color: red; cursor: pointer;" class="badge">Details</span>\
                        <span class="badge">Kolkata</span>\
                        Sukanta Sardar\
                    </li>\
                    <li class="list-group-item">\
                      <span class="badge"><i class="fa fa-whatsapp" aria-hidden="true"></i> Whatsapp</span>\
                        M:8509239522, <br>Date: 2021-03-25T18:31:23.896Z\
                    </li>\
                </ul> -->\
          </div>\
          <nav  aria-label="...">\
              <ul id="pagination" class="pager">\
                <!-- <li onclick="" class="previous disabled"><a href="#"><span aria-hidden="true">&larr;</span> Back</a></li>\
                <li ><a><input style="width: 50px;" type="text"  class="form-control text-center" value="999"></a></li>\
                <li onclick="" class="next"><a href="#">Next <span aria-hidden="true">&rarr;</span></a></li> -->\
              </ul>\
          </nav>\
    </div>\
   </div>\
  </div>');
  $("#activeDriverList").html('<img style="width: 25%; margin-top: 10%; margin-left: 35%;" src="/india/images/gif/circle.gif" class="img-responsive img-circle" alt="Image">')
      var out='';
      var totalItem = Number(data.item);
      //var totalItem = Number(55);
      if(totalItem<0){
        totalItem=0;
      }
      //var totalnoofpage = 100;
      var endindex=Number(page) * Number(noOfitem);
      var skip=(Number(page)-1) * Number(noOfitem);
       // alert("skip"+ skip)
      if(Number(skip)>0){
        /////Go to Previous Page//////
        var prPage=Number(page)-1
        var limit=Number(noOfitem);
        //alert("Go to Previous Page"+prPage)
        out+='<li onclick="activeDriver(\''+prPage+'\',\''+limit+'\')" class="previous"><a href="#"><span aria-hidden="true">&larr;</span> Back</a></li><li ><a>'+Number(page)+'</a></li>'
      }else{
        ///////Deseble Privious//////
        out+='<li class="previous disabled"><a href="#"><span aria-hidden="true">&larr;</span> Back</a></li><li ><a>'+Number(page)+'</a></li>'
      }
   
      if(Number(endindex) < Number(totalItem)){
        /////Go to Next Page///////////
        var NextPage=Number(page)+1
        var limit=Number(noOfitem);
        //alert("Go to Next Page"+NextPage)
        out+='<li onclick="activeDriver(\''+NextPage+'\',\''+limit+'\')" class="next"><a href="#">Next <span aria-hidden="true">&rarr;</span></a></li>'
      }else{
        //////////Deseble next//////
       // alert("deseble Next")
        out+='<li  class="next disabled"><a href="#">Next <span aria-hidden="true">&rarr;</span></a></li>'
      }

      $("#pagination").html(out)

      $("#activeDriverList").html('<img style="width: 25%; margin-top: 10%; margin-left: 35%;" src="/india/images/gif/circle.gif" class="img-responsive img-circle" alt="Image">')

      $.post('/india/admin/activeDriver', { skip: skip , limit:Number(noOfitem)}, function(driver) {
        if(driver.length > 0){
          $("#activeDriverList").html('')
          driver.forEach(function(val){
            var whatapptext='Hi, ' + val.name + ',  PAA CABS, Download drivers app https://kutt.it/FGqjyA\
                            We pay our drivers\
                            Bike = Rs. 5 to 7 per km (rate varies based on location)\
                            Car = Rs 18 to 24 per km (rate varies based on car size and manufacturer)\
                            Incentive: every 50 km= you will get 40 rupees\
                            Need helps: Whatsapp and telegram  +447500725687 / +918509239522. Please give us your number then one of the customer service representatives will call you a fixed your rate. Thanks for your co-operation\
                            Ride booking apps\
                            download our rides booking app and enjoy your 5km free ride.\
                            App link: https://bit.ly/3lSeiSR'
            $("#activeDriverList").append('<ul class="list-group">\
            <li class="list-group-item active">\
              <span  onclick="findDriver(\''+val.mobileNumber+'\')" style="color: red; cursor: pointer;" class="badge">Details</span>\
                <span class="badge">'+val.cityName+'</span>\
                '+val.name+'\
            </li>\
            <li class="list-group-item">\
              <span style=" cursor: pointer;" onclick="sendWhatsappSms(\''+val.mobileNumber+'\', \''+whatapptext+'\' )" class="badge"><i class="fa fa-whatsapp" aria-hidden="true"></i> Whatsapp</span>\
                M:'+val.mobileNumber+', <br>Email: '+val.email+'<br>Date: '+new Date(val.date)+'\
            </li>\
        </ul>')
          })
        }
      })
     
    })
}


function dailyVerificationInit(){
$("#content-2").css({"display":"none"});
$("#content-1").html('<div style="margin-top: 50px;" class="col-sm-10 col-sm-offset-1  col-xs-10 col-xs-offset-1 ">\
<div class="panel panel-primary">\
      <div class="panel-heading">\
            <h3 class="panel-title">Daily Driver Verification <button style="float:right;" type="button" onclick="closeDriverFind()" class="btn btn-xs btn-danger float-right">X</button></h3>\
      </div>\
      <div id="verificationList" class="panel-body">\
                <div class="form-group">\
                    <div class="col-sm-12 col-sm-3 col-sm-offset-3">\
                    <input type="date" id="toDay" class="form-control" id="">\
                    </div>\
                    <div class="col-sm-12 col-sm-3">\
                    <button onclick="dailyVerificationList()" class="btn btn-primary">Submit</button>\
                    </div>\
                </div>\
      </div>\
</div>\
</div>')
}

function dailyVerificationList(){
  var today=$("#toDay").val();
  $.post('/india/admin/dailyVerification', {today:today}, function(data) {
    if(data.length > 0){
      $("#verificationList").html("")
      data.forEach(function(val){
        $("#verificationList").append('<ul class="list-group">\
        <li class="list-group-item">\
            <span class="badge">'+val.cityName+'</span>\
            <span class="badge">Travel Mode : '+val.travelmod+'</span>\
            '+val.name+' : <span><button onclick="findDriver(\''+val.pilotID+'\')" type="button" class="btn btn-xs btn-warning">Details</button></span>\
            <br>Varify Date: '+new Date(val.verificationDate)+'\
        </li>\
    </ul>')
      })
    }else{
      $("#verificationList").html("Driver List Not Found for the day")
    }
  })
  
}

function closeActiveDriverList() {
    $("#activeDriver").css({ "display": "none" });
}




function closeCustList() {
    $("#newCust").css({ "display": "none" });
}

function totalCustomer() {
    $.post('/india/admin/totalcust', {}, function(data) {
        if (data) {
            alert(data);
        }
    })
}


function dailyResolveCustInit(){
  $("#content-2").css({"display":"none"});
  $("#content-1").html('<div style="margin-top: 50px;" class="col-sm-10 col-sm-offset-1  col-xs-10 col-xs-offset-1 ">\
  <div class="panel panel-primary">\
        <div class="panel-heading">\
              <h3 class="panel-title">Daily Resolve Customer <span id="totalReslove">0</span> <button style="float:right;" type="button" onclick="closeDriverFind()" class="btn btn-xs btn-danger float-right">X</button></h3>\
        </div>\
        <div id="verificationList" class="panel-body">\
                  <div class="form-group">\
                      <div class="col-sm-12 col-sm-3 col-sm-offset-3">\
                      <input type="date" id="toDay" class="form-control" id="">\
                      </div>\
                      <div class="col-sm-12 col-sm-3">\
                      <button onclick="dailyResolveCustList()" class="btn btn-primary">Submit</button>\
                      </div>\
                  </div>\
        </div>\
  </div>\
  </div>')
  }

  function dailyResolveCustList(){
    var today=$("#toDay").val();
    $.post('/india/admin/dailyCustResolve', {today:today}, function(data) {
      if(data.length > 0){
        $("#totalReslove").html(' [ '+data.length+' ] ')
        $("#verificationList").html("")
        data.forEach(function(val){
          $("#verificationList").append('<ul class="list-group">\
          <li class="list-group-item">\
              <span class="badge">'+val.CityName+'</span>\
              <span class="badge">Status : '+val.followupStatus+'</span>\
              '+val.name+' : <span><button onclick="findCustomer(\''+val.CustID+'\')" type="button" class="btn btn-xs btn-warning">Details</button></span>\
              <br>Mobile No: '+val.mobileNumber+' <br>Resolve Date: '+new Date(val.followupDate)+'\
          </li>\
      </ul>')
        })
      }else{
        $("#verificationList").html("Customer List Not Found for the day")
      }
    })
    
  }


function whatsappmsginit(){
  $("#content-2").css({"display":"none"});
    //$("#content-1").html(JSON.stringify(data));
    $("#content-1").html('<div style="margin-top: 20px;"  id="whatappmsg">\
    <div  class="row">\
      <div style="background-color: silver; border-radius: 10px; border: 1px solid #000;" class="col-xs-12 col-sm-12 col-md-4 col-lg-4 col-md-offset-4 col-lg-offset-4">\
            <div class="form-group">\
              <legend>Send Whats App Massage</legend>\
            </div>\
            <div class="form-group">\
              <label>Entet Whats app Number :</label>\
              <input type="text"  id="whatsappNumber" class="form-control" placeholder="Entet Whats app Number">\
            </div>\
            <div class="form-group">\
              <label>Details Text :</label>\
              <textarea id="whatapptext" cols="20" rows="5" class="form-control"></textarea>\
            </div>\
            <div class="form-group">\
              <div class="col-sm-10 col-sm-offset-2">\
                <button  onclick="connectWhatsapp()" class="btn btn-primary">Submit</button>\
                <button  onclick="closeDriverFind()" class="btn btn-primary">Close</button>\
              </div>\
            </div>\
      </div>\
    </div>\
  </div>');
    
    
}

function connectWhatsapp(){
    var whatsappNumber=$("#whatsappNumber").val().trim();
    var isdCode="91"
    var whatapptext=$("#whatapptext").val().trim();
    var url='https://wa.me/'+isdCode+''+whatsappNumber+'/?text='+whatapptext+'';
    var UURL= encodeURI(url)
   
    window.open(UURL);
}





// function cityList(cb){
//     $.post('/india/admin/cityList',{},function(data){
//         cb(data);
//     })
// }

function cityList(cb){
  $.post('/india/admin/cityListDistinc',{},function(data){
      cb(data);
  })
}




///////DeshBoard////////


function fulePriceList(){
  //alert("ok")
  $("#cityFuelPrice").html('<img style="width: 25%; margin-top: 10%; margin-left: 35%;" src="/india/images/gif/circle.gif" class="img-responsive img-circle" alt="Image">')
  $.post('/india/admin/getFuelPriceList',{},function(data){
    $("#cityFuelPrice").html(JSON.stringify(data))
    if(data.length>0){
      $("#cityFuelPrice").html("");
      data.forEach(function(val){
        $("#cityFuelPrice").append('<ul class="list-group">\
        <li class="list-group-item active">\
            <span class="badge">'+val.cityName+'</span>\
            City : <span><button onclick="editFuelPrice(\'' + val.cityName + '\')" type="button" class="btn btn-xs btn-warning">Update</button></span>\
        </li>\
        <li class="list-group-item">\
            <span class="badge">&#8377; ' + val.petrolPerLtr + '</span>\
            Petrol/Ltr\
        </li>\
        <li class="list-group-item">\
            <span class="badge">&#8377; ' + val.deselPerLtr + '</span>\
            Desiel/Ltr\
        </li>\
        <li class="list-group-item">\
            <span class="badge">&#8377; ' + val.cngPrice + '</span>\
            CNG/kg\
        </li>\
      </ul>');
      })
    }else{
      $("#cityFuelPrice").html("Fuel Prices are not Set");
    }
  })
 
  
}

function addnewFuelprise(){
  var cilyList='<option value="">Select City</option>'
  cityList(function(city){
      if(city.length>0){
          city.forEach(function(val,key,ary){
              cilyList+='<option value="'+val+'">'+val+'</option>';
              if(key===ary.length-1){
                $("#cityFuelPrice").html('<div class="row">\
                    <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">\
                        <label>City:</label>\
                        <select id="city" class="form-control">\
                            '+cilyList+'\
                        </select>\
                    </div>\
                    <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">\
                        <label>Petrol/Ltr:</label>\
                        <input type="text" class="form-control" id="petrol" placeholder="Petrol">\
                    </div>\
                    <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">\
                        <label>Diesel/Ltr:</label>\
                        <input type="text" class="form-control" id="diesel" placeholder="Diesel">\
                    </div>\
                    <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">\
                        <label>CNG/kg:</label>\
                        <input type="text" class="form-control" id="cng" placeholder="CNG/kg">\
                    </div>\
                    <div style="margin-top: 20px;" class="col-xs-6 col-sm-6 col-md-6 col-lg-6">\
                        <button onclick="updatePetrolPrice()" type="button" class="btn btn-success">Update</button>\
                    </div>\
                  </div>')
              }
          });

      }else{
          alert("City Table Is Empty")
      }
    });
  
}

function editFuelPrice(city){
  $("#cityFuelPrice").html('<div class="row">\
  <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">\
      <label>City:</label>\
      <select id="city" class="form-control">\
      <option value="'+city+'">'+city+'</option>\
      </select>\
  </div>\
  <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">\
      <label>Petrol/Ltr:</label>\
      <input type="text" class="form-control" id="petrol" placeholder="Petrol">\
  </div>\
  <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">\
      <label>Diesel/Ltr:</label>\
      <input type="text" class="form-control" id="diesel" placeholder="Diesel">\
  </div>\
  <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">\
      <label>CNG/kg:</label>\
      <input type="text" class="form-control" id="cng" placeholder="CNG/kg">\
  </div>\
  <div style="margin-top: 20px;" class="col-xs-6 col-sm-6 col-md-6 col-lg-6">\
      <button onclick="updatePetrolPrice()" type="button" class="btn btn-success">Update</button>\
  </div>\
</div>')
}

function updatePetrolPrice() {

    var petrol = $("#petrol").val().trim();
    var diesel = $("#diesel").val().trim();
    var cng = $("#cng").val().trim();
    var city = $("#city").val().trim();
    if(!petrol){petrol=0}
    if(!diesel){diesel=0}
    if(!cng){cng=0}
  
  if(city){
    $.post('/india/admin/updatedisealPetrol', { petrol: petrol, diesel: diesel, cng: cng, city: city }, function(data) {
      if (data) {
        fulePriceList();
      }
  });
  }else{
    alert("Select City");
  }
 
}


function getNewDriveRegisterlist() {
  $("#newDriverRegList").html('<img style="width: 25%; margin-top: 10%; margin-left: 35%;" src="/india/images/gif/circle.gif" class="img-responsive img-circle" alt="Image">');
  $.post('/india/admin/sub/gatherNewDriver', {}, function(data) {
      if (data.length > 0) {
          $("#newDriverRegList").html('');
          $("#newDriveCount").html(data.length);
          data.forEach(function(val) {
            var whatapptext='Hi, ' + val.name + ',  We pay our drivers\
            Bike = Rs. 5 to 7 per km (rate varies based on location)\
            Car = Rs. 16 to 30 per km (rate varies based on car size and manufacturer)\
            Incentive:  up-to RS.  500 per day\
            Download drivers app from the link- https://kutt.it/FGqjyA\
            Please give us your contract Number then one of our driver support team will call you to fix your rate. Thanks for your co-operation\
            Need helps: Whatsapps and telegram +91 98839 23066/ +91-8509239522. Email: support@paacab.com Web: https://paacab.com/'
            
            $("#newDriverRegList").append('<ul class="list-group">\
            <li class="list-group-item active">\
                <span class="badge">New</span>\
                ' + val.name + '\
            </li>\
            <li class="list-group-item">\
                <span onclick="sendWhatsappSms(\''+val.mobileNumber+'\', \''+whatapptext+'\' )" class="badge"><i class="fa fa-whatsapp" aria-hidden="true"></i></span>\
                M:' + val.mobileNumber + ', <br>Date: ' + new Date(val.date) + ', <br>email: ' + val.email + '\
            </li>\
        </ul>')

          })
          
      }else{
        $("#newDriverRegList").html('<h3 class="text-center">Waiting for New Register Driver </h3>');
      }
  })
}

function getNewCustRegList(){
  $("#newCustList").html('<img style="width: 25%; margin-top: 10%; margin-left: 35%;" src="/india/images/gif/circle.gif" class="img-responsive img-circle" alt="Image">');
  ////Total New Customer///////////////
  $.post('/india/admin/totalNewCustomer', {}, function(data) {
    $("#newCustomerCount").html(data.item);
    $.post('/india/admin/gatherNewCustomer', {}, function(cust) {
      if (cust.length > 0) {
        $("#newCustList").html('');
       
          cust.forEach(function(val) {
            var whatapptext='Hi, ' + val.name + ',  Ride booking apps\
            Our bike ride start from Rs. 2.99 per km\
            Mini cab start from Rs. 6.99 per km\
            If you refer your friend and families you will receive free KM\
             Download our rides booking app\
            App link: https://play.google.com/store/apps/details?id=com.paacab.paacustomer&gl=GB\
            Need helps: Whatsapps and telegram +91 98839 23066/ +91-8509239522. Email: support@paacab.com Web: https://paacab.com/';
            $("#newCustList").append('<ul class="list-group">\
            <li class="list-group-item active">\
              <span onclick="custMarkasRead(\''+val.CustID+'\')" style="color: red; cursor: pointer; " class="badge">X</span>\
                <span class="badge">' + val.CityName + '</span>\
                ' + val.name + '\
            </li>\
            <li class="list-group-item">\
              <span onclick="sendWhatsappSms(\''+val.mobileNumber+'\',\''+whatapptext+'\' )" class="badge"><i class="fa fa-whatsapp" aria-hidden="true"></i></span>\
                M:' + val.mobileNumber + ', <br>email: ' + val.email + '<br>Date: ' + new Date(val.date) + '\
            </li>\
        </ul>');

          });
        }else{
          $("#newCustList").html('<h3 class="text-center">Waiting for New Register Customer </h3>');
        }
      });
  });
}

function custMarkasRead(id) {
  $.post('/india/admin/updatefollowupStatus', { id: id }, function(data) {
      if (data) {
        getNewCustRegList();
      }
  })

}


function demandDetailsInit(){
  $("#content-2").css({"display":"none"});
  $("#mobile").val("");
  $("#content-1").html('<div class="col-xs-12 col-sm-12 col-md-4 col-lg-4 col-md-offset-4 col-lg-offset-4">\
  <div class="panel panel-success">\
      <div class="panel-heading">\
        <h3 class="panel-title">Enter Driver ID:</h3>\
      </div>\
      <div class="panel-body">\
        <div class="form-group">\
          <div class="col-xs-9 col-sm-9">\
            <input type="text" class="form-control" id="driverID" placeholder="Driver ID">\
            <input type="date" class="form-control" id="todat">\
          </div>\
          <div class="col-xs-3  col-sm-3">\
            <button onclick="demandDetails()" type="button" class="btn btn-default">Find</button>\
          </div>\
        </div>\
      </div>\
  </div>\
</div>');
}


function demandDetails(){
  var pilotID=$("#driverID").val().trim();
  var today=$("#todat").val();
  if(pilotID && today){
    $("#content-1").html('<div  class="container">\
    <div  class="col-xs-12 col-sm-12 col-md-12col-lg-12 ">\
        <div class="panel panel-success">\
            <div class="panel-heading">\
                  <h3 id="demandName" class="panel-title">Daily Driver Demand Count @ Driver ID : '+pilotID+'\
                   <button style="float:right;" type="button" onclick="closeDriverFind()" class="btn btn-xs btn-danger float-right">X</button></h3>\
            </div>\
            <div id="dailyDemandList"  class="panel-body">\
            <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">\
            <ul id="BookingDetails" class="list-group">\
            <img style="width: 25%; margin-top: 10%; margin-left: 35%;" src="/india/images/gif/circle.gif" class="img-responsive img-circle" alt="Image">\
            </ul>\
        </div>\
        <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">\
            <ul id="demandDetails" class="list-group">\
            <img style="width: 25%; margin-top: 10%; margin-left: 35%;" src="/india/images/gif/circle.gif" class="img-responsive img-circle" alt="Image">\
            </ul>\
        </div>\
            </div>\
      </div>\
     </div>\
    </div>');

    $.post('/india/admin/getBookingDemandDetails', {today:today,pilotID:pilotID}, function(data) {
      var totalBookAmt=0;
      var totaBooklKM=0;
      var fuelcost=0;
      if(data.ride.length > 0){
        $("#BookingDetails").html('<li class="list-group-item active">\
        <span id="totalBookAmt" class="badge">Total &#8377; 0</span>\
        <span id="totalFuelAmt" class="badge">Fuel &#8377; 0</span>\
        <span id="totaBooklKM" class="badge">Total  0 KM</span>\
        <span class="badge">Total : '+data.ride.length+' </span>\
        Daily Booking Details \
    </li>')
        //$("#demandName").html('Daily Driver Demand Count @ Driver ID : '+pilotID+' Name: '+data.pilot.name+'')
      data.ride.forEach(function(val){
        totaBooklKM=Number(totaBooklKM)+Number(val.kmtravels);
        totalBookAmt=Number(totalBookAmt) + Number(val.totalamount) + Number(val.timefare) + Number(val.holdingOverStayCharge);
        var amt=Number(val.totalamount) + Number(val.timefare) + Number(val.holdingOverStayCharge);
        fuelcost=Number(fuelcost) + Number(val.driverFuelConsumtion);
        $("#totaBooklKM").html('Total:  '+Number(totaBooklKM).toFixed(2)+' KM')
        $("#totalBookAmt").html('Total &#8377; '+Number(totalBookAmt).toFixed(2)+'');
        $("#totalFuelAmt").html('Fuel &#8377; '+Number(fuelcost).toFixed(2)+'')
          $("#BookingDetails").append(' <li class="list-group-item">\
          <span class="badge">&#8377;  '+Number(amt).toFixed(2)+'</span>\
          <span class="badge">'+Number(val.kmtravels).toFixed(2)+' KM</span>\
          Order No : '+val.bookingID+'\
          <br>Date: '+new Date(val.date)+'\
      </li>')
        })
      }else{
        $("#BookingDetails").html('<li class="list-group-item active">\
        <span id="totalBookAmt" class="badge">Total &#8377; 0</span>\
        <span id="totaBooklKM" class="badge">Total  0 KM</span>\
        <span class="badge">Total : '+data.ride.length+' </span>\
        Daily Booking Details\
    </li>\
    <li class="list-group-item">\
    No Booking For This Day \
    </li>')
      }
        ///////For Demand Calll//////
        if(data.demand.length > 0){
          var totalDemandAmt=0;
          var totaDemandlKM=0;
          $("#demandDetails").html('<li class="list-group-item active">\
                <span id="totalDemandAmt" class="badge">Total &#8377; 0</span>\
                <span id="totaDemandlKM" class="badge">Total  0KM</span>\
                <span class="badge">Total : '+data.demand.length+' </span>\
                Daily Demand Details\
                </li>')
              data.demand.forEach(function(val){
              totalDemandAmt=Number(totalDemandAmt)+Number(val.fuleConsumption);
              totaDemandlKM=Number(totaDemandlKM) + Number(val.kmTravels);
              $("#totaDemandlKM").html('Total:  '+Number(totaDemandlKM).toFixed(2)+' KM');
              $("#totalDemandAmt").html('Total &#8377; '+Number(totalDemandAmt).toFixed(2)+'');
              $("#demandDetails").append('<li class="list-group-item">\
              <span class="badge">&#8377; '+Number(val.fuleConsumption).toFixed(2)+'</span>\
              <span class="badge">'+Number(val.kmTravels).toFixed(2)+' KM</span>\
              Demand ID : '+val.bookingID+'\
              <br>Date: '+new Date(val.date)+'\
          </li>')
            })

        }else{
          $("#demandDetails").html('<li class="list-group-item active">\
                <span class="badge">Total &#8377; 0</span>\
                <span class="badge">Total  0KM</span>\
                <span class="badge">Total : '+data.demand.length+' </span>\
                Daily Demand Details\
                </li><li class="list-group-item">\
                No Demand For This Day \
            </li>')

        }

    });

  }else{
    alert("Enter value")
  }



}


function sendWhatsappSms(whatsappNumber,whatapptext){
  var isdCode="91"
  var url='https://wa.me/'+isdCode+''+whatsappNumber+'/?text='+whatapptext+'';
  var UURL= encodeURI(url);
  window.open(UURL);
}



function driverResetInit(){
  $("#content-2").css({"display":"none"});
  $("#mobile").val("");

  $("#content-1").html('<div class="col-xs-12 col-sm-12 col-md-4 col-lg-4 col-md-offset-4 col-lg-offset-4">\
  <div class="panel panel-success">\
      <div class="panel-heading">\
        <h3 class="panel-title">Enter Driver  Driver ID:</h3>\
      </div>\
      <div class="panel-body">\
        <div class="form-group">\
          <div class="col-xs-7 col-sm-7">\
            <input type="text" class="form-control" id="pilotID" placeholder="10 Digit Mobile Number">\
          </div>\
          <div class="col-xs-5  col-sm-5">\
            <button onclick="driverReset()" type="button" class="btn btn-primary">Re-Set Driver</button>\
          </div>\
        </div>\
      </div>\
  </div>\
</div>');
}
function driverReset(){
  var pilotID=$("#pilotID").val().trim();
  $.post('/india/admin/resetDriver', { pilotID: pilotID }, function(data) {
    if (data) {
      alert(data);
    }
})
}

function tDriverMonitor(){
  $.post('/india/admin/sub/getTdriverMonitor', {}, function(data) {
    if(data.length > 0){
      $("#content-2").css({"display":"none"})
      $("#content-1").html('<div class="container">\
      <div class="panel panel-success">\
            <div class="panel-heading">\
                  <h3 class="panel-title">T-Ride Monitor  [ '+data.length+' ]\
                      <span><button type="button" class="btn btn-warning">Drop All</button></span>\
                      <span><button onclick="closeDriverFind()" style="float: right; color: rgb(199, 241, 8);" type="button" class="btn btn-danger">X</button></span>\
                  </h3>\
            </div>\
            <div id="TdriverList" class="panel-body">\
            </div>\
      </div>\
  </div>')
      data.forEach(function(val){
        $.post('/india/admin/sub/getTdriverDetails', {pilotID:val.pilotID}, function(pilot) {
          console.log(pilot)
          $("#TdriverList").append('<div class="col-xs-6 col-sm-6 col-md-2 col-lg-2">\
          <div style="height: 250px; overflow-y: auto;" class="thumbnail text-center">\
              <img style="width: 60px; height: 60px;" src="'+pilot.photo+'" alt="">\
              <div class="caption">\
                  <p>'+pilot.name+'<br>'+pilot.mobileNumber+'</p>\
                  <p><img style="width: 50px; height: 20px;" src="/india/images/DriverMarker'+pilot.travelmod+'.png"><br>[ '+pilot.cityName+' ]</p>\
                  <p>\
                      <a onclick="dropdriver(\''+pilot.pilotID+'\')" href="#" class="btn btn-primary btn-xs">Drop</a>\
                      <a onclick="findDriver(\''+pilot.pilotID+'\')" href="#" class="btn btn-primary btn-xs">Details</a>\
                  </p>\
              </div>\
          </div>\
      </div>');
        });
      });
    }else{
      $("#content-1").html('<div class="container">\
      <div class="panel panel-success">\
            <div class="panel-heading">\
                  <h3 class="panel-title">T-Ride Monitor  [ '+data.length+' ]\
                      <span><button type="button" class="btn btn-warning">Drop All</button></span>\
                      <span><button onclick="closeDriverFind()" style="float: right; color: rgb(199, 241, 8);" type="button" class="btn btn-danger">X</button></span>\
                  </h3>\
            </div>\
            <div id="TdriverList" class="panel-body">\
            No Drivers Found\
            </div>\
      </div>\
  </div>')
    }
  });
}

function dropdriver(pilotID){
  $.post('/india/admin/sub/monitorDriverDrop',{pilotID:pilotID},function(data){
    if(data=="success"){
      tDriverMonitor();
    }  
  })
  }

  function dropAllDriver(){
    $.post('/india/admin/sub/dropAlldriver',{pilotID:pilotID},function(data){
      if(data=="success"){
        tDriverMonitor();
      }  
    })
  }

  function changeMobileNoInit(){

    $("#content-2").css({"display":"none"});
  
    $("#content-1").html('<div class="col-xs-12 col-sm-12 col-md-4 col-lg-4 col-md-offset-4 col-lg-offset-4">\
    <div class="panel panel-success">\
        <div class="panel-heading">\
          <h3 class="panel-title">Change Mobile Number:</h3>\
        </div>\
        <div class="panel-body">\
          <div class="form-group">\
            <div class="col-xs-12 col-sm-12">\
              <input type="text" class="form-control" id="oldmobile" placeholder="Privious Mobile Number">\
            </div>\
            <div class="col-xs-12 col-sm-12">\
              <input type="text" class="form-control" id="newmobile" placeholder="New Mobile Number">\
            </div>\
            <div class="col-xs-12 col-sm-12">\
              <button onclick="changeMobileNo()" type="button" class="btn btn-default">Change</button>\
            </div>\
          </div>\
        </div>\
    </div>\
  </div>');

  }
  function changeMobileNo(){
    var oldmobile=$("#oldmobile").val().trim();
    var newmobile=$("#newmobile").val().trim();
    if(oldmobile && newmobile){
      $.post('/india/admin/sub/changeMobileNo',{oldmobile:oldmobile,newmobile:newmobile},function(data){
        alert(data)  ;
      })
    }else{
      alert("enter Value");
    }
    
  }