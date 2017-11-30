define(function(require){
    var moment = require('./moment');
    var Alarm = require('./alarm');

    return function Clock(){
        var framesPerSecond = 60;            
        var alarms = [];
        var timeout = null;
        var isTimeoutMode;
        var textDestinations = [];
        var displayDestinations = [];        
        var xcntr;
        var ycntr;
        var snoozeDuration = 5; //5 minutes
        var outerRingWidth;

    function start(){
        if (isTimeoutMode){
            startTimeoutMode();
        } else {
            startReqAnimMode();   
        }                     
    };

    function setTimeoutMode(){
        isTimeoutMode = true;
    }

    function stopTimeoutMode(){
        isTimeoutMode = false;
        clearTimeout(timeout);
        startReqAnimMode();
    }    

    function stop(){
      clearTimeout(timeout);
    };

    function doWork(){
        checkAlarms();
        for(var i = 0; i < textDestinations.length; i++){
            var dest = textDestinations[i];
            dest.target[dest.attr] = getTime();
        }
        for(var k = 0; k < displayDestinations.length; k++){              
            ctx = displayDestinations[k].getContext("2d");
            xcntr = (displayDestinations[k].width / 2)
            ycntr = (displayDestinations[k].height / 2);
            drawClock(ctx);
            drawToFavicon(ctx);
        }
    }

    function startTimeoutMode(){
        timeout = setTimeout(function updateTimes(){  
            doWork();
            startTimeoutMode();                   
        }, 16.75);
    }

    

    function startReqAnimMode(prevTimeInMs){
        if (isTimeoutMode){            
            startTimeoutMode();
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
    function getTime(){ return moment().format('h:mm:s.S A'); };    

    function drawClock(ctx) {
        //var radius = (canvas.height / 2) * 0.80;
        outerRingWidth = (canvas.height / 2)*0.1;
        var radius = (canvas.height / 2) - outerRingWidth;
        drawFace(ctx, radius);
        drawNumbers(ctx, radius);
        drawTime(ctx, radius);                 
    }

    function drawFace(ctx, radius) {
        var grad;
        ctx.beginPath();        
        ctx.arc(xcntr, ycntr, radius, 0, 2*Math.PI);  
        ctx.fillStyle = 'white';
        ctx.fill();  
        grad = ctx.createRadialGradient(xcntr,ycntr,radius*0.30, xcntr,ycntr,radius*0.4);  
        grad.addColorStop(0, '#333');
        grad.addColorStop(0.5, 'white');
        grad.addColorStop(1, '#333');
        ctx.strokeStyle = grad;
        ctx.lineWidth = radius*0.05;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(xcntr, ycntr, outerRingWidth, 0, 2*Math.PI);
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
            var xPoint = xcntr + (length * Math.cos(angle));//get dest x point from orig x = 0
            var yPoint = ycntr + (length * Math.sin(angle));//get dest y point from orig y = 0
            ctx.fillText(i.toString(), xPoint, yPoint);                                    
        }
    }

    function drawTime(ctx, radius){
        var now = moment();
        var hour = now.hour() <= 12 ? now.hour() : now.hour() - 12;
        var minute = now.minute();
        var second = now.second();                          
        var ms = now.millisecond(); //0.000
        var degreesPerSecond = 360/60;
        var degreesPerMilli = 360/(60 * 1000); //1000 mili per second
        var degreesPerMinute = 360/60;    
        var degreesPerHour = 360/12;
        var minutesSinceTwelve = 60 * hour + minute;

        // second hand
        var secondHandAngle = degreeToRadians(
            second * degreesPerSecond + 
            ms * degreesPerMilli
        ); //1000 ms per second
        drawHand(ctx, secondHandAngle, radius*0.85, radius*0.02, "red");  

        //minute    
        //var minuteHandAngle=(minute*Math.PI/30)+(second*Math.PI/(30*60));
        var minuteHandAngle= degreeToRadians(
            minute * degreesPerMinute + 
            second * degreesPerSecond / 60
        ); //move minute hand tiny 1 per second
        //drawHand(ctx, minuteHandAngle, radius*0.8, radius*0.07);
        drawHand(ctx, minuteHandAngle, radius*.85, radius*0.09, "black");

        //hour    
        //var hourHand =  (hour*Math.PI/6)+(minute*Math.PI/(6*60))+(second*Math.PI/(360*60));
        var hourHandAngle = degreeToRadians(0.5 * minutesSinceTwelve);
        /*
        var hourHandAngle1 = degreeToRadians(
            hour * degreesPerHour +
            minute * degreesPerMinute / 60 +
            second * degreesPerSecond / 3600
        );
        */
        //drawHand(ctx, hourHandAngle, radius*0.5, radius*0.07);                          
        drawHand(ctx, hourHandAngle, radius*.5, radius*0.09, "black");
    }

    function drawHand(ctx, angle, length, width, color) {   
        ctx.save();
        ctx.beginPath();
        ctx.translate(xcntr, ycntr);             
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

    function drawToFavicon(bigCtx){                
        setTimeout(function(){
            var favIconWidth = 150;
            var favIconHeight = 150;        
            var dx = 0;
            var dy = 0;     
            var favIconCanvas = document.getElementById('favIconCanvas');
            var img = document.getElementById('img');            
            //img.src = "empty_clock.png"
            var favIconCtx = favIconCanvas.getContext('2d');
            ctx.mozImageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;            
            ctx.imageSmoothingEnabled = false;
        
            var link = document.getElementById('favicon');            
            favIconCanvas.width = favIconWidth;
            favIconCanvas.height = favIconHeight;           
            //favIconCtx.drawImage(img, dx, dy, favIconWidth, favIconHeight); 
            favIconCtx.drawImage(bigCtx.canvas, dx, dy, favIconWidth, favIconHeight);               
            link.href = bigCtx.canvas.toDataURL('image/png');            
            drawToFavicon(bigCtx);
        }, 16);        
        
        

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
        setTimeoutMode: setTimeoutMode,
        stopTimeoutMode: stopTimeoutMode
    };
    
  };

});