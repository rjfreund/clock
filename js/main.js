require(['clock'], function main(Clock){

var clock = new Clock();
clock.setTextDestinations([
    { target: window.document, attr: 'title'},
    { target: document.getElementById('clockText'), attr: 'innerHTML'}
]);
clock.setDrawDestinations([document.getElementById('clockAnim')]);
clock.setAlarmDestionations(document.querySelectorAll('.alarm'));
clock.start();

//this will listen for events on dynamically created nodes
document.body.addEventListener('click', function(event){
    if (event.target.closest('#toggleAlarms')){
        var alarmLists = document.querySelectorAll('.alarms');
        for (var i = 0; i < alarmLists.length; i++){
            alarmLists[i].style.display = alarmLists[i].style.display == '' ? 'none' : '';
        }
    } else if (event.target.closest('#addAlarm')){ //this or ancestors have #addAlarm
        clock.addAlarm();
    } else if (event.target.closest('.removeAlarm')){
        clock.removeAlarm(event.target.closest('.alarm').getAttribute('data-id'));
    }
});

document.body.addEventListener('input', function(event){
    if (event.target.classList.contains('alarmTime')){
        var id = event.target.closest('.alarm').getAttribute('data-id');
        clock.updateAlarm({id: id, time: event.target.value});
    } else if (event.target.classList.contains('alarmDesc')){
        var id = event.target.closest('.alarm').getAttribute('data-id');
        clock.updateAlarm({id: id, desc: event.target.value});
    }
});

window.addEventListener('blur', function(){ clock.stopReqAnimMode(); clock.startTimeoutMode(); });
window.addEventListener('focus', function(){ clock.stopTimeoutMode(); clock.startReqAnimMode(); });

//to prevent empty templates showing up
var templates = document.querySelectorAll('.template');
for (var i = 0; i < templates.length; i++){
    templates[i].classList.remove('template');
    templates[i].classList.add('templateLoaded');
}


});









//Opera Engineer's Erik Möller's polyfill for requestAnimationFrame
(function requestAnimationFrameShim() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());