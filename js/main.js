require(['clock'], function main(Clock){
	

	var clock = new Clock();
	clock.addAlarm({ time:'12:29', desc:'facebook live'});
	clock.addAlarm({ time:'03:28', desc:'Winnebago'});
	clock.setTextDestinations([
		{ target: window.document, attr: 'title'}, 
		{ target: document.getElementById('clockText'), attr: 'innerHTML'}
	]);
	clock.setDrawDestinations([document.getElementById('clockAnim')]);
    clock.setAlarmDestionations(document.getElementsByClassName('alarm'));
	clock.start();
    
    document.getElementById('addAlarm').addEventListener('click', function(){
        clock.addAlarm();
    });
    window.addEventListener('blur', function(){ clock.stopReqAnimMode(); clock.startIntervalMode(); });
    window.addEventListener('focus', function(){ clock.stopIntervalMode(); clock.startReqAnimMode(); });    
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