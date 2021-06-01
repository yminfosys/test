$(document).ready(function(){
    $('ul.tabs li').click(function(){
      var tab_id = $(this).attr('data-tab');

      $('ul.tabs li').removeClass('current');
      $('.tab-content').removeClass('current');

      $(this).addClass('current');
      $("#"+tab_id).addClass('current');
    });
  });

  function findDriver(){
    var mobile=$("#mobile").val();
    var isd='+91';
    $.post('/bd/admin/findDriver',{mobile:mobile,isd:isd},function(data){
        if(data!='worng'){
          //alert(data) 
          $("#Driver-search").css({"display":"none"});
          $("#verify-driver").css({"display":"block"});
          $(".user-image").html('<img src="/bd/'+data.photo+'">')
          $(".user-data").html('<h2>'+data.name+'</h2>\
          <span  class="post-label">Account ID : '+data.mobileNumber+'</span><br>\
          <input id="AccountID" type="hidden" value="'+data.mobileNumber+'">\
          <span class="post-label">Status : '+data.accountStatus+'</span><br>\
          <i class="fa fa-map-marker" aria-hidden="true"></i>  '+data.address+'</p>');
          $("#document").html('<div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">\
            <div class="thumbnail">\
              <img src="/bd/'+data.photo+'" onclick="window.open(this.src)" onerror="if (this.src != \'error.jpg\') this.src = \'/bd/driverDocument/defult.png\';">\
              <div class="caption">\
                <p class="text-center">Self Photo</p>\
              </div>\
            </div>\
          </div>\
          <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">\
            <div class="thumbnail">\
              <img src="/bd/'+data.Idproof+'" onclick="window.open(this.src)" onerror="if (this.src != \'error.jpg\') this.src = \'/bd/driverDocument/defult.png\';">\
              <div class="caption">\
                <p class="text-center">Id Proof</p>\
              </div>\
            </div>\
          </div>\
          <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">\
            <div class="thumbnail">\
              <img src="/bd/'+data.dl+'" onclick="window.open(this.src)" onerror="if (this.src != \'error.jpg\') this.src = \'/bd/driverDocument/defult.png\';">\
              <div class="caption">\
                <p class="text-center">Driving Licence</p>\
              </div>\
            </div>\
          </div>\
          <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">\
            <div class="thumbnail">\
              <img src="/bd/'+data.rto+'" onclick="window.open(this.src)" onerror="if (this.src != \'error.jpg\') this.src = \'/bd/driverDocument/defult.png\';">\
              <div class="caption">\
                <p class="text-center">RTO / Blue Book</p>\
              </div>\
            </div>\
          </div>\
          <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">\
            <div class="thumbnail">\
              <img src="/bd/'+data.insurence+'" onclick="window.open(this.src)" onerror="if (this.src != \'error.jpg\') this.src = \'/bd/driverDocument/defult.png\';">\
              <div class="caption">\
                <p class="text-center">Insurence</p>\
              </div>\
            </div>\
          </div>\
          <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">\
            <div class="thumbnail">\
              <img src="/bd/'+data.polution+'" onclick="window.open(this.src)" onerror="if (this.src != \'error.jpg\') this.src = \'/bd/driverDocument/defult.png\';">\
              <div class="caption">\
                <p class="text-center">Polution</p>\
              </div>\
            </div>\
          </div>\
          <button onclick="verifyDriver()" type="button" class="btn btn-large btn-block btn-success">Verify</button>');

          $("#BacicDetals").html(' <div class="thumbnail">\
          <img data-src="#" alt="">\
          <div class="caption">\
            <h5>Basic Details</h5>\
            <hr>\
            <p>Driver &quot;s City : '+data.cityName+'</p>\
            <p>Engine Type : '+data.vichelEnginType+'</p>\
            <p>Mileage (KM/LTR) : '+data.enginMilege+'</p>\
            <p>Travel Mode  : '+data.travelmod+'</p>\
          </div>\
        </div>');
        }else{
            $("#mobile").css({"background-color": "#c44630","color":"#FFF"});
        }
    });
  }

  function verifyDriver(){
    var mobile=$("#AccountID").val();
    var isd='+91';
    $.post('/bd/admin/verifyDriver',{mobile:mobile,isd:isd},function(data){
        if(data!='worng'){
            //alert(data) 
            $("#Driver-search").css({"display":"none"});
            $("#verify-driver").css({"display":"block"});
            $(".user-data").html('<h2>'+data.name+'</h2>\
            <span id="AccountID" class="post-label">Account ID : '+data.mobileNumber+'</span><br>\
            <span class="post-label">Status : '+data.accountStatus+'</span><br>\
            <i class="fa fa-map-marker" aria-hidden="true"></i>  '+data.address+'</p>')
            
          }else{
              $("#mobile").css({"background-color": "#c44630","color":"#FFF"});
          }
    })   
  }


  function submitEngintype(){
    var engintype=$("#engintype").val();
    var milege=$("#milege").val();
    var mobile=$("#mobile").val();
    var driverCity=$("#driverCity").val();
    var travelmod=$("#travelmod").val();
    var isd='+91';
    $.post('/bd/admin/updateBasicDetails',{engintype:engintype,milege:milege,mobile:mobile,isd:isd,driverCity:driverCity,travelmod:travelmod},function(data){
      console.log(data);
      $("#mssg").html(data);
    });

  }

  function updatePetrolPrice(){
    var petrol=$("#petrol").val();
    var diesel=$("#diesel").val();
    var cng=$("#cng").val();
    var city=$("#city").val();
    $.post('/bd/admin/updatedisealPetrol',{petrol:petrol,diesel:diesel,cng:cng,city:city},function(data){
      if(data){
        window.location.href="../admin/sub"
      }
    });
  }

  