define(['moment'], function(moment){	

	return function Alarm(input){
		this.time = moment().format('hh:mm');
		this.desc = "";
		var extended = extend(this, input);
		return extended;
	};

	function extend(defaults, options) {
		var extended = {};
		var prop;
		for (prop in defaults) {
			if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
				extended[prop] = defaults[prop];
			}
		}
		for (prop in options) {
			if (Object.prototype.hasOwnProperty.call(options, prop)) {
				extended[prop] = options[prop];
			}
		}
		return extended;
	};
});