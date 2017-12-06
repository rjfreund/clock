define(function(require){
    return function extend(src, dest) {
		var extended = {};
		var prop;
        for (prop in dest) {
			if (Object.prototype.hasOwnProperty.call(dest, prop)) {
				extended[prop] = dest[prop];
			}
		}
		for (prop in src) {
			if (Object.prototype.hasOwnProperty.call(src, prop)) {
				extended[prop] = src[prop];
			}
		}
		return extended;
	};
});