/* svg */
var now;
var alarms = []
var snoozeDuration = 5; //minutes
var sec, min, hour;

(function main(){

    sec = document.getElementById('sec');
    min = document.getElementById('min');
    hour = document.getElementById('hour');

    alarms.push({time: '12:29', desc: 'facebook live'});
    alarms.push({time: '12:13', desc: 'test'});
    alarms.push({time: '12:25', desc: 'test'});

    setInterval(function(){
        now = moment().format('h:mm:s.S A');
        window.document.title = now;
        document.getElementById('clockDigital').innerText = now;
        checkAlarms();
        drawClock();
    }, 50);
})();

function checkAlarms(){
    for (var i = 0; i < alarms.length; i++){
        var alarm = alarms[i];        
        if (alarm.date){ //remove old alarms (before today)
            if (moment(alarm.date).isBefore(moment().format("MM-DD-YYYY")) ||
                moment(alarm.date).isBefore(moment().format("YYYY-MM-DD"))
            ){
                alarms.splice(i, 1);
            }
        }
        var now = moment().format('h:mm');        
        if (alarm.time !== now){ continue; }
        var message = alarm.time + ": " + alarm.desc + "\n\n Cancel will snooze for " + snoozeDuration + " minutes";
        if(!confirm(message)){
            //snooze for 5 minutes
            var newTime = moment().minute() + 5;
            alarms.splice(i, 1);
            alarms.push({ time: newTime, desc: alarm.desc })
            continue;
        };        
        alarms.splice(i, 1);
    }
}

function drawClock(){
    function r(el, deg) {
        el.setAttribute('transform', 'rotate('+ deg +' 50 50)')
    }    
    var d = moment();
    r(sec, 6*d.second());
    r(min, 6*d.minute());
    r(hour, 30*(d.hour()%12) + d.minute()/2);
}

/* canvas

var now;
var alarms = []
var snoozeDuration = 5; //minutes

var canvas = document.getElementById("canvas");    
var radius = (canvas.height / 2) * 0.80;
var xcntr = canvas.width / 2;
var ycntr = canvas.height / 2;

(function main(){
    alarms.push({time: '12:29', desc: 'facebook live'});
    alarms.push({time: '12:13', desc: 'test'});
    alarms.push({time: '12:25', desc: 'test'});
})();

setInterval(function(){
    now = moment().format('h:mm:s.S A');
    window.document.title = now;
    document.getElementById('clock').innerText = now;
    checkAlarms();
    drawClock();
}, 50);

function checkAlarms(){
    for (var i = 0; i < alarms.length; i++){
        var alarm = alarms[i];        
        if (alarm.date){ //remove old alarms (before today)
            if (moment(alarm.date).isBefore(moment().format("MM-DD-YYYY")) ||
                moment(alarm.date).isBefore(moment().format("YYYY-MM-DD"))
            ){
                alarms.splice(i, 1);
            }
        }
        var now = moment().format('h:mm');        
        if (alarm.time !== now){ continue; }
        var message = alarm.time + ": " + alarm.desc + "\n\n Cancel will snooze for " + snoozeDuration + " minutes";
        if(!confirm(message)){
            //snooze for 5 minutes
            var newTime = moment().minute() + 5;
            alarms.splice(i, 1);
            alarms.push({ time: newTime, desc: alarm.desc })
            continue;
        };        
        alarms.splice(i, 1);
    }
}

function drawClock() {    
    var ctx = canvas.getContext("2d");
    drawFace(ctx, radius);    
    drawNumbers(ctx, radius);
    drawTime(ctx, radius);  
}

function drawFace(ctx, radius) {
  var grad;
  ctx.beginPath();
  ctx.arc(xcntr, ycntr, radius, 0, 2*Math.PI);  
  ctx.fillStyle = 'gray';
  ctx.fill();  
  grad = ctx.createRadialGradient(xcntr,ycntr,radius*0.30, xcntr,ycntr,radius*0.4);  
  grad.addColorStop(0, '#333');
  grad.addColorStop(0.5, 'white');
  grad.addColorStop(1, '#333');
  ctx.strokeStyle = grad;
  ctx.lineWidth = radius*0.05;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(xcntr, ycntr, radius*0.1, 0, 2*Math.PI);
  ctx.fillStyle = '#333';
  ctx.fill();    
}

function drawNumbers(ctx, radius) {
  var angle;
  var i;
  ctx.font = radius*0.15 + "px arial";
  ctx.textBaseline="middle";
  ctx.textAlign="center";
  for(i = 1; i <= 12; i++){
    angle = i * Math.PI / 6;
    ctx.rotate(angle);
    ctx.translate(0, -radius*0.85);
    ctx.rotate(-angle);
    ctx.fillText(i.toString(), xcntr, ycntr);
    ctx.rotate(angle);
    ctx.translate(0, radius*0.85);
    ctx.rotate(-angle);    
  }
}

function drawTime(ctx, radius){
    var now = moment();
    var hour = now.hour() <= 12 ? now.hour() : now.hour() - 12;
    var minute = now.minute();
    var second = now.second();

    // second hand
    var secondHandAngle = degreeToRadians(second * 6);
    drawHand(ctx, secondHandAngle, radius*0.9, radius*0.02);

    /*
    //hour    
    var hourHand =  (hour*Math.PI/6)+(minute*Math.PI/(6*60))+(second*Math.PI/(360*60));
    drawHand(ctx, hourHand, radius*0.5, radius*0.07);
    //minute    
    //minute=(minute*Math.PI/30)+(second*Math.PI/(30*60));
    drawHand(ctx, minute, radius*0.8, radius*0.07);    
    */
    /*
}

function drawHand(ctx, angle, length, width) {
    console.log("radius: ", radius, "length: ", length);
    
    ctx.resetTransform();
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.moveTo(xcntr,ycntr);
    ctx.rotate(angle);
    ctx.lineTo(xcntr, length);
    ctx.stroke();
    ctx.rotate(-angle);
}

function radianToDegrees(radian){
    //1 radian = 180 / Math.PI degrees (57.295779513082320876798154814105) 
    var degree = radian * 180.0 / Math.PI;
    return degree;
}

function degreeToRadians(degree){
    //1 degree = Math.PI / 180 radians (0.01745329251994329576923690768489)
    var radians = parseFloat(degree) *  (Math.PI / 180.0);
    return radians;
} */