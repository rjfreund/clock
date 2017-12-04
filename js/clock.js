define(function(require){
    var moment = require('./moment');
    var Alarm = require('./alarm');

    return function Clock(){
        var framesPerSecond = 60;            
        var degreesPerSecond = 360/60;
        var degreesPerMilli = 360/(60 * 1000); //1000 mili per second
        var alarms = [];        
        var interval = null;
        var isIntervalMode;
        var textDestinations = [];
        var displayDestinations = [];        
        var snoozeDuration = 5; //5 minutes               
        var xCenter;
        var yCenter; 

    function start(){
        if (isIntervalMode){
            startIntervalMode();
        } else {
            startReqAnimMode();   
        }                     
    };

    function setIntervalMode(){
        isIntervalMode = true;
    }

    function stopIntervalMode(){
        isIntervalMode = false;
        //clearTimeout(timeout);
        clearInterval(interval);
        startReqAnimMode();
    }    

    function stop(){
      clearTimeout(interval);
    };

    //TODO: rename this thing to something better
    function doWork(){ //not really sure what to name this?
        checkAlarms();        
        for(var i = 0; i < textDestinations.length; i++){
            var dest = textDestinations[i];
            dest.target[dest.attr] = getTime();
        }
        for(var k = 0; k < displayDestinations.length; k++){              
            ctx = displayDestinations[k].getContext("2d");                             
            setCanvasDim(ctx);
            drawClock(ctx);
            drawToFavicon(ctx);
        }
    }

    function setCanvasDim(ctx){
        var container = document.getElementById("container");                   
        var clockText = document.getElementById("clockText");
        var allExceptCanvas = (document.body.clientHeight - ctx.canvas.height)
        var containerMinHeight = 250;
        var containerMaxHeight = 400;
        if (window.innerHeight >= containerMaxHeight){ //set max height in px
            ctx.canvas.height = containerMaxHeight - allExceptCanvas;
            ctx.canvas.height -= 10; //to prevent scrollbar flashing
            ctx.canvas.width = ctx.canvas.height;
        } else if (window.innerHeight <= containerMinHeight){ //set min height in px
            ctx.canvas.height = ctx.canvas.width;
            setVertScroll(container);
        } else if (ctx.canvas.width >= window.innerWidth){ //prevent canvas from being wider than window
            ctx.canvas.height = allExceptCanvas;
            ctx.canvas.height -= 10; //to prevent scrollbar flashing
            ctx.canvas.width = ctx.canvas.height;
        } else if (ctx.canvas.height >= (window.innerHeight - clockText.clientHeight //max-height: 100%  
            && ctx.canvas.height < window.innerWidth
        )){ 
            ctx.canvas.height = (window.innerHeight - clockText.clientHeight);
            ctx.canvas.height -= 10; //to prevent scrollbar flashing
            ctx.canvas.width = ctx.canvas.height;
            setNoScroll(container);
        } else if (ctx.canvas.height >= window.innerWidth){ //max-width: 100%
            ctx.canvas.height = window.innerWidth;
            ctx.canvas.height -= 10; //to prevent scrollbar flashing
            ctx.canvas.width = ctx.canvas.height;
            setNoScroll(container);
        } else { //scale to screen
            ctx.canvas.height = (window.innerHeight - clockText.clientHeight); 
            ctx.canvas.height -= 10; //to prevent scrollbar flashing
            ctx.canvas.width = ctx.canvas.height;
            setNoScroll(container);
        }          
    }

    function setNoScroll(element){
        element.className = "noScroll";
    }

    function setVertScroll(element){
        element.className = "vertScroll";
    }        

    function startIntervalMode(){
        setIntervalMode();
        interval = setInterval(function updateTimes(){  
            doWork();
        }, 16.75);
    }    

    function startReqAnimMode(prevTimeInMs){
        if (isIntervalMode){                        
            startIntervalMode();
            return; 
        }
        var nowInMs = performance.now();        
        /*  don't really need to track movement of characters in this program based on framerate or time,
            but I'm going to keep this here as a reference:
            - keep track of how many milliseconds since last requestAnimationFrame
            - animate character based off of how much time passed
        */
        var changeInMs = nowInMs - prevTimeInMs;                                       
        doWork();        
        requestAnimationFrame(startReqAnimMode);
    }

    function checkAlarms(){
        for (var i = 0; i < alarms.length; i++){
            var alarm = alarms[i];        
            if (alarm.date){ //remove old alarms (before today)
                if (moment(alarm.date).isBefore(moment().format("MM-DD-YYYY")) ||
                    moment(alarm.date).isBefore(moment().format("YYYY-MM-DD"))
                ){
                    removeAlarm(i);
                }
            }
            var now = moment().format('h:mm');        
            if (alarm.time !== now){ continue; }
            var message = alarm.time + ": " + alarm.desc + "\n\n Cancel will snooze for " + snoozeDuration + " minutes";
            if(!confirm(message)){
                //snooze for 5 minutes
                var newTime = moment().minute() + 5;
                removeAlarm(i);
                addAlarm(newTime, alarm.desc)
                continue;
            };
            removeAlarm(i);
        }
    };
    
    function setTextDestinations(inputTextDestinations){
      if (!Array.isArray(inputTextDestinations)){ console.error("Text destinations must be array;"); return; }
      for (var i = 0; i < inputTextDestinations.length; i++){
        textDestinations.push(inputTextDestinations[i]);
      }
    };
    function setDrawDestinations(inputDisplayDestinations){
      if (!Array.isArray(inputDisplayDestinations)){ console.error("Draw destinations must be array;"); return; }
      for (var i = 0; i < inputDisplayDestinations.length; i++){
        displayDestinations.push(inputDisplayDestinations[i]);
      }
    };
    function addAlarm(time, desc){ alarms.push(new Alarm(time, desc)); };
    function removeAlarm(i){ alarms.splice(i, 1); };
    function getTime(){ return moment().format('h:mm:ss.S A'); };    

    function drawClock(ctx) {        
        xCenter = ctx.canvas.width/2;
        yCenter = ctx.canvas.height/2;
        var outerRingWidth = (ctx.canvas.height/2)*0.1;
        var radius = (ctx.canvas.height - outerRingWidth)/2;
        drawFace(ctx, radius, outerRingWidth);
        drawNumbers(ctx, radius);
        drawTime(ctx, radius);                 
    }

    function drawFace(ctx, radius, outerRingWidth) {
        var grad;
        ctx.beginPath();        
        ctx.arc(xCenter, yCenter, radius, 0, 2*Math.PI);  
        ctx.fillStyle = 'white';
        ctx.fill();  
        grad = ctx.createRadialGradient(xCenter,yCenter,radius*0.30, xCenter,yCenter,radius*0.4);  
        grad.addColorStop(0, '#333');
        grad.addColorStop(0.5, 'white');
        grad.addColorStop(1, '#333');
        ctx.strokeStyle = grad;
        ctx.lineWidth = radius*0.05;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(xCenter, yCenter, outerRingWidth, 0, 2*Math.PI);
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
            var angle = degreeToRadians(i * 30 - 90); //have to subtract 90 degrees because the usual 0,0 starts at the 3 o'clock position stead of 12
            var degrees = radianToDegrees(angle);
            var length = radius*0.85;                                                                    
            var xPoint = xCenter + (length * Math.cos(angle));//get dest x point from orig x = 0
            var yPoint = yCenter + (length * Math.sin(angle));//get dest y point from orig y = 0
            ctx.fillText(i.toString(), xPoint, yPoint);                                    
        }
    }

    function drawTime(ctx, radius){
        var now = moment();                                   
        drawSecondHand(ctx, radius, now);
        drawMinuteHand(ctx, radius, now);
        drawHourHand(ctx, radius, now);        
    }

    function drawSecondHand(ctx, radius, now){
        var second = now.second();                          
        var ms = now.millisecond(); //0.000            

        var secondHandAngle = degreeToRadians(
            second * degreesPerSecond + 
            ms * degreesPerMilli
        );
        drawHand(ctx, secondHandAngle, radius*0.85, radius*0.02, "red"); 
    }

    function drawMinuteHand(ctx, radius, now){
        var minute = now.minute(); 
        var second = now.second();
        var degreesPerMinute = 360/60;
        
        //var minuteHandAngle=(minute*Math.PI/30)+(second*Math.PI/(30*60));
        var minuteHandAngle= degreeToRadians(
            minute * degreesPerMinute + 
            second * degreesPerSecond / 60
        ); //move minute hand tiny 1 per second        
        drawHand(ctx, minuteHandAngle, radius*.85, radius*0.09, "black");
    }

    function drawHourHand(ctx, radius, now){
        var hour = now.hour() <= 12 ? now.hour() : now.hour() - 12; 
        var minute = now.minute();                   
        var minutesSinceTwelve = 60 * hour + minute;

        //var hourHand =  (hour*Math.PI/6)+(minute*Math.PI/(6*60))+(second*Math.PI/(360*60));
        var hourHandAngle = degreeToRadians(0.5 * minutesSinceTwelve);
        drawHand(ctx, hourHandAngle, radius*.5, radius*0.09, "black");
    }

    function drawHand(ctx, angle, length, width, color) {   
        ctx.save();
        ctx.beginPath();
        ctx.translate(xCenter, yCenter);             
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.moveTo(0,0);
        ctx.rotate(angle);
        ctx.lineTo(0, -length); //have to set negative length here because of rotation or something
        ctx.strokeStyle=color;
        ctx.stroke();
        //ctx.rotate(-angle);
        ctx.restore();
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
    }

    function drawToFavicon(ctx){                
        var link = document.getElementById('favicon');
        link.href = ctx.canvas.toDataURL('image/png');                                                  
    }

    return {
        start: start,
        stop: stop,
        checkAlarms: checkAlarms,
        setTextDestinations: setTextDestinations,
        setDrawDestinations: setDrawDestinations,
        addAlarm: addAlarm,
        removeAlarm: removeAlarm,
        getTime: getTime,
        drawClock: drawClock,
        startIntervalMode: startIntervalMode,
        stopIntervalMode: stopIntervalMode
    };
    
  };

});
