function regFromValidation(){
  var name=$("#name").val().trim();
  var email=$("#email").val().trim();
  var password=$("#password").val().trim();
  var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if(name.length < 2){
          alert('Enter Valid Name');
          $("#name").focus()
          return false
        }
        if(password.length < 6){
          alert('Password must be 6 to 18 character');
          $("#password").focus()
          return false
        }
        if (reg.test(email) == false) 
        {
            alert('Invalid Email Address');
            $("#email").focus();
            return false
        }
        
}

function refferenceCall(){  
    var ref=$("#reffrom").val();
    if(ref=="News" || ref=="1"){
      $("#ref-by-content").css({"display": "none"})
    }else{
      $("#ref-by-content").css({"display": "block"})
    }
  }