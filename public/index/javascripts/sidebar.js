
$( document ).ready(function() {
  var height3 = $( window ).width();
  if(height3>767){$("#main-content").width(height3-200);}
  
});
    function sidebartoggle(){
        var height3 = $( window ).width();
		var height1 = $('#sidebar-waper').width();     
       
        if(height1>0){
        $("#sidebar-waper").toggleClass('active')
        document.getElementById('main-content').classList.toggle('active');
        $("#main-content").width(height3);
        }else{
            $("#sidebar-waper").toggleClass('active')
        document.getElementById('main-content').classList.toggle('active');
        $("#main-content").width(height3-200);
        }
      
      
    }
    

    function sidebar(abc,active){
        //alert("ss")
        $("#"+abc+"").html(ss)
        $("."+active+"").css({"background": "cadetblue", "color": "cornsilk"});
        $("."+active+"> a").css({"color": "cornsilk"});
    }
    var ss='<div class="togle-btn" onclick="sidebartoggle()">\
    <span></span>\
    <span></span>\
    <span></span>\
</div>\
<ul class="sidebar-menue">\
<li class="Dashboard"><a href="/business"> <i class="fa fa-dashboard" aria-hidden="true"></i><span> Dashboard</span></a></li>\
<li class="Profile">\
  <a href="#ProfileSubmenu" data-toggle="collapse" aria-expanded="false" class="dropdown-toggle">\
      <i class="fa fa-cogs"></i>\
      <span>Profile</span>\
  </a>\
  <ul class="collapse " id="ProfileSubmenu">\
      <li><a href="/business/profile#ppi">Ppi Upload</a></li>\
      <li><a href="/business/profile#ppi">Return Address Update</a></li>\
      <li><a href="/business/profile#ppi">Add Balance</a></li>\
      <li><a href="/business/profile#ppi">Delivered Order</a></li>\
      <li><a href="/business/profile#ppi">Add Sale Channel</a></li>\
      </ul>\
</li>\
<li class="Account">\
<a href="#homeSubmenu" data-toggle="collapse" aria-expanded="false" class="dropdown-toggle">\
          <i class="fa fa-cogs"></i>\
          <span>Account Integration </span>\
      </a>\
      <ul class="collapse " id="homeSubmenu">\
          <li><a href="/business/amazonintegration">Amazon </a></li>\
          <li><a href="/business/ebayintegration">E-bay</a></li>\
          <li><a href="#">Wish</a></li>\
          <li><a href="#">Any 3rd. Party Website</a></li>\
      </ul>\
</li>\
<li class="Order">\
  <a href="#ordersubmenue" data-toggle="collapse" aria-expanded="false" class="dropdown-toggle">\
      <i class="fa fa-shopping-basket" aria-hidden="true"></i>\
      <span> Order Details</span>\
  </a>\
  <ul class="collapse " id="ordersubmenue">\
      <li><a href="/business/amazoChck">Amz Unshipped Order </a></li>\
      <li><a href="#">Amz Shipped Order</a></li>\
      <li><a href="/business/ebaycheck">eBay Unshipped Order </a></li>\
      <li><a href="#">eBay Shipped Order</a></li>\
      <li><a href="#">Any 3rd. Party Website</a></li>\
  </ul>\
</li>\
<li class="New-Listing"><a href="/business/product"> <i class="fa fa-dashboard" aria-hidden="true"></i><span> Create a New Listing</span></a></li>\
<li class="Inventory">\
<a href="#inventorysubmenue" data-toggle="collapse" aria-expanded="false" class="dropdown-toggle">\
 <i class="fa fa-address-card" aria-hidden="true"></i>\
  <span> Inventory</span>\
</a>\
<ul class="collapse " id="inventorysubmenue">\
<li><a href="/business/amzinventory">Amazon Inventory</a></li>\
<li><a href="/business/ebayinventory">eBay Inventory</a></li>\
<li><a href="#">Wish Inventory</a></li>\
</ul>\
</li>\
<li class="Oneclick-Fulfillment">\
<a href="#oneclicksubmenue" data-toggle="collapse" aria-expanded="false" class="dropdown-toggle">\
<i class="fa fa-address-card" aria-hidden="true"></i>\
<span> Oneclick Fulfillment</span>\
</a>\
<ul class="collapse " id="oneclicksubmenue">\
<li><a href="#">Oneclick Order </a></li>\
<li><a href="#">Oneclick Inventory</a></li>\
</ul>\
</li>\
<li class="Customer-email">\
<a href="#emailsub" data-toggle="collapse" aria-expanded="false" class="dropdown-toggle">\
<i class="fa fa-address-card" aria-hidden="true"></i>\
<span> Customer email</span>\
</a>\
<ul class="collapse " id="emailsub">\
<li><a href="#">Amazon email </a></li>\
<li><a href="#">eBay email </a></li>\
</ul>\
</li>\
<li class="Daily-Activitis">\
<a href="#dailyactivitysub" data-toggle="collapse" aria-expanded="false" class="dropdown-toggle">\
<i class="fa fa-address-card" aria-hidden="true"></i>\
<span> Daily Activitis</span>\
</a>\
<ul class="collapse " id="dailyactivitysub">\
<li><a href="#">Daily Ledger </a></li>\
</ul>\
</li>\
</ul>';
