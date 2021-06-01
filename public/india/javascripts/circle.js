var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
var al=0;
var start=4.72;
var cw=context.canvas.width/2;
var ch=context.canvas.height/2;
var diff;
var count=0;
var t=0;
var bar;
 
function progressBar(){
    count++;
  if(count>15){
    clearInterval(bar);
    count=0;
    t=0;
    al=0;
  }  
diff=(al/15)*Math.PI*2;
context.clearRect(0,0,400,200);
context.beginPath();
context.arc(cw,ch,50,0,2*Math.PI,false);
context.fillStyle='#FFF';
context.fill();
context.strokeStyle='#e7f2ba';
context.stroke();
context.fillStyle='#000';
context.strokeStyle='#b3cf3c';
context.textAlign='center';
context.lineWidth=10;
context.font = '25pt Verdana';
context.beginPath();
context.arc(cw,ch,50,start,diff+start,false);
context.stroke();
//context.fillText(al+'%',cw+2,ch+6);
context.fillText(al,cw+2,ch+6);
if(al>=100){
clearTimeout(bar);
}
 
al++;
}

function circlebar(){
    t++
    if(t===1){
        bar=setInterval(progressBar,1000);
    }
}