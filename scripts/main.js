require(['clock'], function main(Clock){
	

	var clock = new Clock();
	clock.addAlarm('12:29', 'facebook live');
	clock.addAlarm('12:13', 'test1');
	clock.addAlarm('12:25', 'test2');
	clock.addAlarm('03:28', 'Winnebago');
	clock.setTextDestinations([
		{ target: window.document, attr: 'title'}, 
		{ target: document.getElementById('clockText'), attr: 'innerHTML'}
	]);
	clock.setDrawDestinations([document.getElementById('canvas')]);
	clock.start();	
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