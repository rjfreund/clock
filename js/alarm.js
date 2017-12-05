define(['moment', 'adler32'], function(moment, adler32StringToHash){	

	return function Alarm(input){
		var r = {};
		r.time = moment().add(30, "minutes").format('hh:mm');
		r.desc = "";
		r.dateCreated = moment().format();
		r.isActive = false;
		r = extend(r, input);
		r.id = adler32StringToHash(JSON.stringify(r));
		return r;
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