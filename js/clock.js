define(function(require){
var moment = require('./moment');
var Alarm = require('./alarm');
var getIdByCodeLoc = require('./getIdByCodeLoc');
var extend = require('./extend');
var nodeRefs = require('./references');

return function Clock(){
    var framesPerSecond = 60;
    var degreesPerSecond = 360/60;
    var degreesPerMilli = 360/(60 * 1000); //1000 mili per second
    var alarmsStorageId = getIdByCodeLoc(this);
    var alarms = JSON.parse(localStorage.getItem(alarmsStorageId)) || [];
    var interval = null;
    var isIntervalMode;
    var areAlarmsDisplayed = false;
    var textDestinations = [];
    var displayDestinations = [];
    var alarmDestinations = [];
    var snoozeDuration = 5; //5 minutes
    var xCenter;
    var yCenter;

    function start(){
        if (isIntervalMode){
            startIntervalMode();
            return;
        }
        startReqAnimMode();
    }

    function stop(){
        clearTimeout(interval);
        isIntervalMode = false;
    }

    //TODO: rename this thing to something better
    function doWork(){ //not really sure what to name this?
        checkAlarms();
        displayText();
        displayDraw();
        displayAlarms();
    }

    function startIntervalMode(){
        stopReqAnimMode();
        isIntervalMode = true;
        var intervalTime = 5000; //to low of interval time can cause memory leak - canvas draw can't keep up
        if (isMobile()){ intervalTime =  5000; } //short interval time seems to be too much on mobile devices
        interval = setInterval(function(){
            doWork();
        }, intervalTime);
    }

    function stopIntervalMode(){
        isIntervalMode = false;
        clearInterval(interval);
    }

    function startReqAnimMode(prevTimeInMs){
        if (isIntervalMode){ return; }
        stopIntervalMode();
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

    function stopReqAnimMode(){
        isIntervalMode = true;
    }

    function isMobile(){
        return window.innerWidth <= 800;
    }

    function displayText(){
        for(var i = 0; i < textDestinations.length; i++){
            var dest = textDestinations[i];
            dest.target[dest.attr] = getTime();
        }
    }

    function displayDraw(){
        for(var k = 0; k < displayDestinations.length; k++){
            var ctx = displayDestinations[k].getContext("2d");
            setCanvasDim(ctx);
            drawClock(ctx);
            drawToFavicon(ctx);
        }
    }

    function displayAlarms(){
        if (alarmDestinations.length == 0){ return; }
        if (areAlarmsDisplayed){ return; }
        var templateNodeId = getIdByCodeLoc(this);
        var parentNodeId = getIdByCodeLoc(this);
        for (var i = 0; i < alarmDestinations.length; i++){
            var alarmDestination = alarmDestinations[i];
            if (!nodeRefs[templateNodeId]){ nodeRefs[templateNodeId] = alarmDestination.cloneNode(true); }
            if (!nodeRefs[parentNodeId]){ nodeRefs[parentNodeId] = alarmDestination.parentNode; }
            while (nodeRefs[parentNodeId].hasChildNodes()){ nodeRefs[parentNodeId].removeChild(nodeRefs[parentNodeId].lastChild); }
            for (var k = 0; k < alarms.length; k++){
                copyNode = nodeRefs[templateNodeId].cloneNode(true);
                copyNode.setAttribute('data-id', alarms[k].id);
                copyNode.getElementsByTagName('input')[0].value = alarms[k].time;
                copyNode.getElementsByTagName('input')[1].value = alarms[k].desc;
                nodeRefs[parentNodeId].appendChild(copyNode);
            }
        }
        areAlarmsDisplayed = true;
    }

    function setCanvasDim(ctx){
        var minWidth = 250;
        var maxWidth = 300;
        if (ctx.canvas.parentElement.clientWidth == maxWidth){ return; }
        if (ctx.canvas.parentElement.clientWidth > maxWidth){
            ctx.canvas.width = maxWidth;
            ctx.canvas.height = ctx.canvas.width;
            return;
        }
        ctx.canvas.width = ctx.canvas.parentElement.clientWidth;
        ctx.canvas.height = ctx.canvas.width;
    }

    function addAlarm(input){
        alarms.push(new Alarm(input));
        localStorage.setItem(alarmsStorageId, JSON.stringify(alarms));
        areAlarmsDisplayed = false;
        displayAlarms();
    };

    function updateAlarm(input, forceRefresh){
        for(var i = 0; i < alarms.length; i++){
            if (alarms[i].id != input.id){ continue; }
            alarms[i] = extend(input, alarms[i]);
        }
        localStorage.setItem(alarmsStorageId, JSON.stringify(alarms));
        if (!forceRefresh){ return; }
        areAlarmsDisplayed = false;
        displayAlarms();
    }

    function removeAlarm(id){
        for (var i = alarms.length-1; i > -1; i--){
            if (alarms[i].id != id){ continue; }
            alarms.splice(i, 1);
        }
        localStorage.setItem(alarmsStorageId, JSON.stringify(alarms));
        areAlarmsDisplayed = false;
        displayAlarms();
    };

    function checkAlarms(){
        for (var i = 0; i < alarms.length; i++){
            var alarm = alarms[i];
            var now = moment().format('hh:mm:ss');
            var alarmTime = moment(moment().format('YYYY-MM-DD') + " " + alarm.time).format('hh:mm:ss');
            if (alarmTime != now){ continue; }
            var message = alarm.time + ": " + alarm.desc + "\n\n Cancel will snooze for " + snoozeDuration + " minutes";
            if(confirm(message)){ continue; }
            //snooze for 5 minutes
            var newTime = moment().add(5, 'minutes').format('hh:mm');
            updateAlarm({id: alarm.id, time: newTime}, true);
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

    function setAlarmDestionations(inputAlarmDestinations){
        inputAlarmDestinations = [].slice.call(inputAlarmDestinations); // nodelist to array
        if(!Array.isArray(inputAlarmDestinations)){ console.error("Alarm destinations must be array;"); return; }
        for (var i = 0; i < inputAlarmDestinations.length; i++){
            alarmDestinations.push(inputAlarmDestinations[i]);
        }
    }

    function getTime(){ return moment().format('hh:mm:ss.S A'); };

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
        ctx.beginPath();
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
        setAlarmDestionations: setAlarmDestionations,
        addAlarm: addAlarm,
        updateAlarm: updateAlarm,
        removeAlarm: removeAlarm,
        getTime: getTime,
        drawClock: drawClock,
        startIntervalMode: startIntervalMode,
        stopIntervalMode: stopIntervalMode,
        startReqAnimMode: startReqAnimMode,
        stopReqAnimMode: stopReqAnimMode
    };

}

});