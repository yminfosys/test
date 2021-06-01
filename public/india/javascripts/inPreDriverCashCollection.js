function icicipay(){      
    var payAmount=Number($("#payAmount").val());
    var CustID=$("#CustID").val();
    var typeOfReqest=$("#typeOfReqest").val();
    var mobileNumber=$("#mobileNumber").val();
    var email=$("#email").val();
    console.log("payAmount", payAmount , "")
    $.post('/india/icici/tokengen',{
      payAmount:payAmount,
      CustID:CustID,
      typeOfReqest:typeOfReqest,
      mobileNumber:mobileNumber,
      email:email
     },function(data){
     payCheckout(data); 
     })
    
   }
   

   function payCheckout(req){
     Layer.checkout({
       token: req.tokenID,
       accesskey: req.ACCESS_KEY,
       return_url: req.return_url,
       redirect: true
       },
       function(response) {
         console.log("response.status",response)
         if (response.status == "cancelled") {
           alert("Transection Calcel By User")            
           window.location.href="../india/preDrv"
         }
         $.post('/india/icici/paydetails',{payment_token_id:response.payment_token_id,status:response.status},function(data){
            console.log("Payment Details", data) 
            if(data){
                window.location.href='../india/preDriverCash';
             }

            });

            if (response.status == "created") {
                window.location.href='../india/preDriverCash';   
                } else if (response.status == "pending") {
                window.location.href='../india/preDriverCash';     
                } else if (response.status == "failed") {      
                    window.location.href='../india/preDriverCash';
                }
           
         
           // if (response.status == "captured") {                            
           //    // response.payment_token_id
           //    // response.payment_id
                 
           // } else if (response.status == "created") {
   
   
           // } else if (response.status == "pending") {
   
   
           // } else if (response.status == "failed") {
   
   
           // } else if (response.status == "cancelled") {
   
           // }
       },
       function(err) {
           //integration errors
           console.log("integration Error", err)
       }
   );
   } 