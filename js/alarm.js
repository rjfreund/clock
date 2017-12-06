define(['moment', 'adler32', 'extend'], function(moment, adler32StringToHash, extend){

	return function Alarm(input){
		var r = {};
		r.time = moment().format('hh:mm');
		r.desc = "";
		r.dateCreated = moment().format();
		r.dateCreatedEpoch = moment().valueOf();
		r.isActive = true;
		r = extend(input, r);
		r.id = adler32StringToHash(JSON.stringify(r));
		return r;
	};
});